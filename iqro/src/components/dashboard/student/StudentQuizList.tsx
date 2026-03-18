'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, HelpCircle, Clock, Play, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { joinQuiz } from '@/app/actions/quiz'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Quiz {
  id: string
  title: string
  status: string
  club_id: string
  duration_seconds: number
  clubs: { name: string }
  profiles: { full_name: string }
  quiz_questions: { id: string }[]
}

interface Participation {
  quiz_id: string
  score: number | null
  finished_at: string | null
}

interface StudentQuizListProps {
  quizzes: Quiz[]
  participations: Participation[]
}

export default function StudentQuizList({ quizzes, participations }: StudentQuizListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [selectedClub, setSelectedClub] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const uniqueClubs = Array.from(new Map(quizzes.map(q => [q.club_id, q.clubs?.name])).entries()).map(([id, name]) => ({ id, name }))

  async function handleJoin(quizId: string) {
    startTransition(async () => {
      const res = await joinQuiz(quizId)
      if (res.success) {
        toast({ title: 'Testga qo\'shildingiz' })
        router.push(`/student/quiz/${quizId}/play`)
      } else {
        toast({ title: res.error || 'Qo\'shilishda xatolik', variant: 'destructive' })
      }
    })
  }

  const renderQuizCard = (q: Quiz) => {
    const part = participations.find(p => p.quiz_id === q.id)
    const isJoined = !!part
    const isFinished = !!part?.finished_at
    const qCount = q.quiz_questions?.length || 0

    return (
      <motion.div 
        key={q.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider
              ${q.status === 'waiting' ? 'bg-blue-100 text-blue-700' : ''}
              ${q.status === 'active' ? 'bg-amber-100 text-amber-700' : ''}
              ${q.status === 'finished' ? 'bg-emerald-100 text-emerald-700' : ''}
            `}>
              {q.status === 'waiting' && 'Boshlanishi kutilmoqda...'}
              {q.status === 'active' && 'Jarayonda!'}
              {q.status === 'finished' && 'Test yakunlangan'}
            </span>
            {isFinished && <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider bg-gray-100 text-gray-600">Siz ishlagansiz</span>}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{q.title}</h3>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{q.clubs?.name}</span>
            <span>O&apos;qituvchi: {q.profiles?.full_name}</span>
          </p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border">
              <HelpCircle size={16} className="text-indigo-500" /> {qCount} savol
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border">
              <Clock size={16} className="text-amber-500" /> {Math.round(q.duration_seconds / 60)} daqiqa
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col items-end gap-3">
          {q.status === 'waiting' && (
            <button 
              disabled={isPending || isJoined} 
              onClick={() => handleJoin(q.id)} 
              className={`w-full md:w-auto px-6 py-3 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${isJoined ? 'bg-blue-50 text-blue-600 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isPending ? <Loader2 size={18} className="animate-spin"/> : <Play size={18} fill={isJoined ? 'none' : 'currentColor'} />}
              {isJoined ? 'Qo\'shildingiz (Kutilmoqda...)' : 'Testga qo\'shilish'}
            </button>
          )}

          {q.status === 'active' && !isFinished && (
            <button 
              disabled={isPending} 
              onClick={() => isJoined ? router.push(`/student/quiz/${q.id}/play`) : handleJoin(q.id)} 
              className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all animate-pulse flex items-center justify-center gap-2"
            >
              {isJoined ? 'Davom etish' : 'Hoziroq testga kirish'} <ArrowRight size={18} />
            </button>
          )}

          {(q.status === 'finished' || isFinished) && (
            <div className="w-full md:w-64 bg-gray-50 rounded-xl p-4 border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Natijangiz</p>
                <div className="flex items-end gap-1">
                  <span className={`text-2xl font-black ${part?.score && part.score > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>{part?.score || 0}</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">/ {qCount} to&apos;g&apos;ri</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Trophy size={24} className={part?.score && part.score > 0 ? "text-amber-500" : "text-gray-300"} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const filtered = quizzes.filter(q => {
    const clubMatch = selectedClub === 'all' || q.club_id === selectedClub
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'finished' 
        ? participations.some(p => p.quiz_id === q.id && p.finished_at)
        : q.status === selectedStatus)
    return clubMatch && statusMatch
  })

  // Group filtered results
  const waiting = filtered.filter(q => q.status === 'waiting')
  const active = filtered.filter(q => q.status === 'active')
  const finished = filtered.filter(q => q.status === 'finished')

  return (
    <div className="space-y-8">
      {/* FILTERS */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4">
        <select 
          value={selectedClub} 
          onChange={e => setSelectedClub(e.target.value)}
          className="px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm font-medium"
        >
          <option value="all">Barcha to&apos;garaklar</option>
          {uniqueClubs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
           {[
             { id: 'all', label: 'Barchasi' },
             { id: 'waiting', label: 'Kutilmoqda' },
             { id: 'active', label: 'Jarayonda' },
             { id: 'finished', label: 'Bajarilgan' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setSelectedStatus(tab.id)}
               className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${selectedStatus === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <AlertCircle size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Hozircha faol testlar yo&apos;q</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">O&apos;qituvchilaringiz test boshlasa, shu yerda ko&apos;rinadi</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-amber-600 flex items-center gap-2"><Play fill="currentColor" size={20}/> Jarayondagi Testlar! (Hoziroq kiring)</h2>
          <div className="grid gap-4">
            {active.map(renderQuizCard)}
          </div>
        </div>
      )}

      {waiting.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-blue-600 flex items-center gap-2"><Clock size={20}/> Boshlanishi Kutilayotgan Testlar</h2>
          <div className="grid gap-4">
            {waiting.map(renderQuizCard)}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-500 flex items-center gap-2"><Trophy size={20}/> Yakunlangan Testlar va Natijalar</h2>
          <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
            {finished.map(renderQuizCard)}
          </div>
        </div>
      )}
    </div>
  )
}
