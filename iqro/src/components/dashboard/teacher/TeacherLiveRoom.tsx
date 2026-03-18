'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Play, Square, Loader2, CheckCircle, Clock } from 'lucide-react'
import { startQuiz, finishQuiz } from '@/app/actions/quiz'
import { useToast } from '@/hooks/use-toast'
import QuizResults from '@/components/dashboard/teacher/QuizResults'

interface Participant {
  id: string
  student_id: string
  score: number | null
  finished_at: string | null
  profiles: {
    full_name: string
  }
}

interface TeacherLiveRoomProps {
  quiz: {
    id: string
    title: string
    status: string
    duration_seconds: number
    clubs: { name: string }
    quiz_questions: any[]
  }
  initialParticipants: Participant[]
}

export default function TeacherLiveRoom({ quiz, initialParticipants }: TeacherLiveRoomProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [status, setStatus] = useState(quiz.status)
  const [timeLeft, setTimeLeft] = useState(quiz.duration_seconds)
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to participant additions/updates
    const pChannel = supabase
      .channel('quiz-participants-' + quiz.id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_participants',
        filter: `quiz_id=eq.${quiz.id}`
      }, async (payload: any) => {
        // Fetch fresh profile data since join doesn't include it
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const { data } = await supabase
            .from('quiz_participants')
            .select('*, profiles!student_id(full_name)')
            .eq('id', payload.new.id)
            .single()
            
          if (data) {
            setParticipants(prev => {
              const exists = prev.find(p => p.id === data.id)
              if (exists) return prev.map(p => p.id === data.id ? data as any : p)
              return [...prev, data as any]
            })
          }
        }
      })
      .subscribe()

    // Subscribe to quiz status (in case it changes elsewhere)
    const qChannel = supabase
      .channel('quiz-status-' + quiz.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quizzes',
        filter: `id=eq.${quiz.id}`
      }, (payload: any) => {
        setStatus(payload.new.status)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(pChannel)
      supabase.removeChannel(qChannel)
    }
  }, [quiz.id, supabase])

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (status === 'active' && timeLeft === 0) {
      // Auto-finish if time's up
      handleFinish()
    }
    return () => clearInterval(timer)
  }, [status, timeLeft])

  async function handleStart() {
    setIsPending(true)
    const res = await startQuiz(quiz.id)
    if (res.success) {
      setStatus('active')
      toast({ title: 'Test boshlandi' })
    } else {
      toast({ title: res.error || 'Xatolik', variant: 'destructive' })
    }
    setIsPending(false)
  }

  async function handleFinish() {
    if (!confirm('Testni yakunlab, barchaga ballar taqsimlansinmi?')) return
    setIsPending(true)
    const res = await finishQuiz(quiz.id)
    if (res.success) {
      setStatus('finished')
      toast({ title: 'Test yakunlandi va ballar taqsimlandi!' })
    } else {
      toast({ title: res.error || 'Xatolik', variant: 'destructive' })
    }
    setIsPending(false)
  }

  const finishedCount = participants.filter(p => p.finished_at).length
  const totalCount = participants.length

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60
  const timeString = `${m}:${s.toString().padStart(2, '0')}`

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500 font-medium mt-1">{quiz.clubs?.name}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-wider mb-1">Savollar</p>
            <p className="text-xl font-black">{quiz.quiz_questions?.length}</p>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-wider mb-1">O&apos;quvchilar</p>
            <p className="text-xl font-black">{totalCount}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= WAITING ROOM ================= */}
        {status === 'waiting' && (
          <motion.div key="waiting" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="flex items-center gap-3 text-blue-800 font-medium">
                <Loader2 size={20} className="animate-spin" />
                O&apos;quvchilar testga qo&apos;shilishi kutilmoqda...
              </div>
              <button disabled={isPending || totalCount === 0} onClick={handleStart} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all">
                <Play size={18} /> Testni Boshlash
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {participants.map(p => (
                  <motion.div key={p.id} initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-3">
                      {p.profiles?.full_name?.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-800 text-sm line-clamp-1">{p.profiles?.full_name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {totalCount === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 font-medium border-2 border-dashed rounded-xl">
                  Hozircha hech kim qo&apos;shilmadi
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= ACTIVE STATE ================= */}
        {status === 'active' && (
          <motion.div key="active" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1">Qolgan vaqt</p>
                  <p className="text-4xl font-black text-amber-600 font-mono tracking-tight">{timeString}</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Jarayon</p>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${totalCount > 0 ? (finishedCount/totalCount)*100 : 0}%` }} />
                  </div>
                  <span className="font-bold text-gray-700">{finishedCount} / {totalCount}</span>
                </div>
              </div>
              
              <button disabled={isPending} onClick={handleFinish} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">
                <Square fill="currentColor" size={16} /> Yakunlash
              </button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">O&apos;quvchi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {p.profiles?.full_name?.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{p.profiles?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.finished_at ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <CheckCircle size={14}/> Yakunladi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            <Loader2 size={14} className="animate-spin" /> Ishlayapti
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= FINISHED RESULTS ================= */}
        {status === 'finished' && (
          <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <QuizResults 
              participants={participants.map(p => ({
                student_id: p.student_id,
                full_name: p.profiles?.full_name,
                score: p.score || 0,
                total_questions: quiz.quiz_questions?.length || 0
              }))} 
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
