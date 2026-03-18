'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Loader2, CheckCircle, ChevronRight, Trophy } from 'lucide-react'
import { submitAnswers } from '@/app/actions/quiz'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface QuizPlayProps {
  quiz: {
    id: string
    title: string
    status: string
    duration_seconds: number
    clubs: { name: string }
    quiz_questions: QuizQuestion[]
  }
  participation: {
    id: string
    student_id: string
    score: number | null
    finished_at: string | null
  } | null
}

export default function StudentQuizPlay({ quiz, participation }: QuizPlayProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  const [studentRank, setStudentRank] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  const [status, setStatus] = useState(quiz.status)
  const [timeLeft, setTimeLeft] = useState(quiz.duration_seconds)
  
  const [currQIdx, setCurrQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  const [finalScore, setFinalScore] = useState<number | null>(participation?.score || null)

  // Real-time status update
  useEffect(() => {
    if (status === 'finished') return

    const channel = supabase
      .channel('quiz-status-student-' + quiz.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'quizzes',
        filter: `id=eq.${quiz.id}`
      }, (payload: any) => {
        if (payload.new.status === 'active' && status === 'waiting') {
          setStatus('active')
          toast({ title: 'Test boshlandi! Omad!' })
        }
        if (payload.new.status === 'finished' && status === 'submitting') {
          setStatus('finished')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [quiz.id, status, supabase, toast])

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/quiz/${quiz.id}/participants`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.participants || [])
        const pId = participation?.student_id || (await supabase.auth.getUser()).data.user?.id
        const rankIndex = data.participants.findIndex((p: any) => p.student_id === pId)
        if (rankIndex !== -1) setStudentRank(rankIndex + 1)
      }
    } catch(e) {}
  }

  useEffect(() => {
    if (finalScore !== null || status === 'finished') {
      fetchLeaderboard()
    }
  }, [finalScore, status, quiz.id])

  // Timer logic for active test
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (status === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (status === 'active' && timeLeft === 0) {
      handleSubmit() // Auto submit when time is up
    }
    return () => clearInterval(timer)
  }, [status, timeLeft])

  function handleSelect(opt: string) {
    const qId = quiz.quiz_questions[currQIdx].id
    setAnswers(prev => ({ ...prev, [qId]: opt }))
  }

  // handleNext is no longer used for auto-advance as user stays on question unless they use explicit navigation

  async function handleSubmit() {
    if (status === 'submitting' || status === 'finished') return
    setStatus('submitting')
    startTransition(async () => {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans as 'A' | 'B' | 'C' | 'D'
      }))
      const res = await submitAnswers(quiz.id, formattedAnswers)
      if (res.success) {
        setFinalScore(res.score || 0)
        toast({ title: 'Javoblar qabul qilindi' })
        fetchLeaderboard()
        // status remains submitting or we change it depending on our UI flow...
        // actually we can change it back to active, finalScore !== null will handle the view.
        setStatus('active')
      } else {
        toast({ title: res.error || 'Tarmoq xatosi', variant: 'destructive' })
        setStatus('active') // let them try again
      }
    })
  }

  const m = Math.floor(timeLeft / 60)
  const s = timeLeft % 60
  const timeString = `${m}:${s.toString().padStart(2, '0')}`
  const totalQ = quiz.quiz_questions?.length || 0

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      
      <AnimatePresence mode="wait">
        
        {/* ================= WAITING ROOM ================= */}
        {status === 'waiting' && (
          <motion.div key="waiting" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="text-center space-y-8 max-w-lg w-full bg-white p-10 rounded-3xl border shadow-sm">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={48} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{quiz.title}</h2>
              <p className="font-medium text-gray-500">{quiz.clubs?.name}</p>
            </div>
            <div className="bg-gray-50 border rounded-2xl p-6">
              <p className="text-lg font-bold text-gray-800 animate-pulse">
                O&apos;qituvchi testni boshlashini kuting...
              </p>
              <p className="text-sm text-gray-500 mt-2">Barcha o&apos;quvchilar qo&apos;shilgach, test boshlanadi.</p>
            </div>
          </motion.div>
        )}

        {/* ================= ACTIVE PLAY ================= */}
        {status === 'active' && finalScore === null && quiz.quiz_questions.length > 0 && (
          <motion.div key="active" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="w-full max-w-4xl space-y-6">
            
            {/* Header / Timer & Nav */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border shadow-sm">
              <div className="flex flex-wrap gap-2 justify-center flex-1">
                {quiz.quiz_questions.map((q, idx) => {
                  const isCurrent = idx === currQIdx;
                  const isAnswered = !!answers[q.id];
                  let btnClass = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ";
                  if (isCurrent) {
                    btnClass += "bg-indigo-600 text-white ring-4 ring-indigo-200";
                  } else if (isAnswered) {
                    btnClass += "bg-indigo-100 text-indigo-700 border-2 border-indigo-400";
                  } else {
                    btnClass += "bg-gray-100 text-gray-500 hover:bg-gray-200";
                  }
                  
                  return (
                    <button key={q.id} onClick={() => setCurrQIdx(idx)} className={btnClass}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 font-bold font-mono text-xl rounded-2xl border border-amber-100 shrink-0">
                <Clock size={20}/> {timeString}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white p-6 sm:p-10 rounded-3xl border shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed flex-1">
                  <span className="text-indigo-500 mr-2">{currQIdx + 1}.</span>
                  {quiz.quiz_questions[currQIdx].question}
                </h3>
              </div>
              
              <div className="space-y-3">
                {['A','B','C','D'].map(opt => {
                  const valKey = `option_${opt.toLowerCase()}` as keyof QuizQuestion
                  const optText = quiz.quiz_questions[currQIdx][valKey] as string
                  const isSelected = answers[quiz.quiz_questions[currQIdx].id] === opt

                  return (
                    <button 
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-[1.01]' : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                        {opt}
                      </div>
                      <span className={`font-semibold text-lg ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {optText}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    disabled={currQIdx === 0} 
                    onClick={() => setCurrQIdx(prev => prev - 1)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Oldingi
                  </button>
                  <button 
                    disabled={currQIdx === totalQ - 1} 
                    onClick={() => setCurrQIdx(prev => prev + 1)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Keyingi
                  </button>
                </div>

                <button 
                  onClick={() => {
                    const answeredCount = Object.keys(answers).length;
                    const unansweredCount = totalQ - answeredCount;
                    if(confirm(`Barcha savollar: ${answeredCount} ta javob berildi, ${unansweredCount} ta javob berilmadi. Yakunlashni tasdiqlaysizmi?`)) {
                      handleSubmit();
                    }
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Testni yakunlash
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= SUBMITTING / WAITING RESULTS ================= */}
        {((status === 'submitting') || (status === 'active' && finalScore !== null)) && (
           <motion.div key="submitting" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.05}} className="text-center space-y-8 max-w-lg w-full bg-white p-10 rounded-3xl border shadow-sm">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className={finalScore !== null ? "" : "animate-bounce"} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">✅ Test yakunlandi!</h2>
              {finalScore !== null && (
                <div className="my-6">
                  <p className="text-2xl font-bold text-indigo-600">
                    Siz {finalScore}/{totalQ} to&apos;g&apos;ri javob berdingiz
                  </p>
                  <p className="text-xl font-bold text-indigo-400 mt-2">
                    {Math.round((finalScore/totalQ)*100)}%
                  </p>
                </div>
              )}

              {studentRank !== null && (
                <div className="my-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  {studentRank <= 5 ? (
                    <div className="text-indigo-700 font-bold text-lg leading-relaxed">
                      🎉 Tabriklaymiz! Siz <span className="font-black text-2xl">{studentRank}</span>-o&apos;rinni egalladingiz! <br/>
                      <span className="text-xl font-black bg-indigo-200 px-3 py-1 rounded-full mt-2 inline-block">+{studentRank === 1 ? 15 : studentRank === 2 ? 12 : studentRank === 3 ? 9 : studentRank === 4 ? 6 : studentRank === 5 ? 3 : 0} ball</span> olasiz!
                    </div>
                  ) : (
                    <div className="text-indigo-700 font-bold text-lg">
                      Yaxshi harakat! <span className="font-black text-2xl">{studentRank}</span>-o&apos;rin
                    </div>
                  )}
                </div>
              )}

            </div>
            <div className="bg-gray-50 border rounded-2xl p-6 mt-6">
              <Loader2 size={24} className="animate-spin text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">
                O&apos;qituvchi testni yakunlagandan keyin umumiy natijalar e&apos;lon qilinadi
              </p>
            </div>
           </motion.div>
        )}

        {/* ================= FINAL RESULTS ================= */}
        {status === 'finished' && (
          <motion.div key="finished" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-8 w-full max-w-2xl bg-white p-10 rounded-3xl border shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Test To&apos;liq Yakunlandi!</h2>
              <p className="text-gray-500 font-medium">Barcha o&apos;quvchilar natijalari va ballar ro&apos;yxati</p>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">O&apos;rin</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">O&apos;quvchi</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Natija</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ball</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((p, i) => {
                    const isMe = p.student_id === (participation?.student_id || '')
                    const points = i === 0 ? 15 : i === 1 ? 12 : i === 2 ? 9 : i === 3 ? 6 : i === 4 ? 3 : 0
                    return (
                      <tr key={p.student_id} className={`transition-colors ${isMe ? 'bg-indigo-50/80 hover:bg-indigo-50' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4 font-bold text-gray-800 text-lg">
                           {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : (i + 1)}
                        </td>
                        <td className={`px-6 py-4 font-bold ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>
                          {p.full_name} {isMe && <span className="ml-2 text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Siz</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-600">
                          {p.score}/{totalQ} <span className="text-xs text-gray-400">({Math.round((p.score/totalQ)*100)}%)</span>
                        </td>
                        <td className="px-6 py-4 font-black text-right">
                          <span className={points > 0 ? 'text-emerald-600' : 'text-gray-400'}>
                             {points > 0 ? `+${points}` : '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <button onClick={() => router.push('/student/quiz')} className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-all">
              Testlar ro&apos;yxatiga qaytish
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
