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

export default function StudentQuizList({ quizzes, participations, studentId, allParticipants }: { quizzes: any[], participations: any[], studentId?: string, allParticipants?: any[] }) {
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
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider
              ${q.status === 'waiting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
              ${q.status === 'active' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
              ${q.status === 'finished' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
            `}>
              {q.status === 'waiting' && 'Boshlanishi kutilmoqda...'}
              {q.status === 'active' && 'Jarayonda!'}
              {q.status === 'finished' && 'Test yakunlangan'}
            </span>
            {isFinished && <span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Siz ishlagansiz</span>}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{q.title}</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{q.clubs?.name}</span>
            <span>O&apos;qituvchi: {q.profiles?.full_name}</span>
          </p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <HelpCircle size={16} className="text-indigo-500" /> {qCount} savol
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
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

          {(q.status === 'finished' || isFinished) && (() => {
            let rankText = '--'
            let totalP = 0
            let pointsText = '0'
            let pointsColor = 'text-gray-400'
            if (q.status === 'finished' && allParticipants && studentId) {
              const quizParts = allParticipants.filter(p => p.quiz_id === q.id).sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
              totalP = quizParts.length
              const rankIndex = quizParts.findIndex(p => p.student_id === studentId)
              if (rankIndex !== -1) {
                const r = rankIndex + 1
                rankText = r.toString()
                const pts = r === 1 ? 15 : r === 2 ? 12 : r === 3 ? 9 : r === 4 ? 6 : r === 5 ? 3 : 0
                if (pts > 0) {
                  pointsText = `+${pts}`
                  pointsColor = 'text-emerald-600'
                }
              }
            }

            return (
            <div className="w-full mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider mb-0.5">O&apos;rningiz</p>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{rankText}</span>
                    <span className="text-xs font-bold text-indigo-400 dark:text-indigo-500 mb-1">/ {totalP} o&apos;quvchi</span>
                  </div>
                </div>
                <Trophy size={20} className="text-indigo-300" />
              </div>
              
              <div className="flex-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Natija</p>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-black text-amber-700 dark:text-amber-400">{part?.score || 0}</span>
                    <span className="text-xs font-bold text-amber-500 mb-1">/ {qCount}</span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ball</p>
                   <span className={`text-lg font-black ${pointsColor}`}>{pointsText}</span>
                </div>
              </div>
            </div>
          )
          })()}
        </div>
      </motion.div>
    )
  }

  const filtered = quizzes.filter(q => {
    const clubMatch = selectedClub === 'all' || q.club_id === selectedClub
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'finished' 
        ? (q.status === 'finished' && participations.some(p => p.quiz_id === q.id && p.finished_at))
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
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4">
        <select 
          value={selectedClub} 
          onChange={e => setSelectedClub(e.target.value)}
          className="px-4 py-2.5 w-full md:w-auto border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white text-[16px] md:text-sm font-medium"
        >
          <option value="all">Barcha to&apos;garaklar</option>
          {uniqueClubs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
           {[
             { id: 'all', label: 'Barchasi' },
             { id: 'waiting', label: 'Kutilmoqda' },
             { id: 'finished', label: 'Bajarilgan' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setSelectedStatus(tab.id)}
               className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${selectedStatus === tab.id ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <AlertCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hozircha faol testlar yo&apos;q</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">O&apos;qituvchilaringiz test boshlasa, shu yerda ko&apos;rinadi</p>
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
