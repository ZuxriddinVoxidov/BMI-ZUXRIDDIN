'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Participant {
  student_id: string
  score: number
  full_name: string
  total_questions: number
}

interface QuizResultsProps {
  participants: Participant[]
}

export default function QuizResults({ participants }: QuizResultsProps) {
  const router = useRouter()
  const [showResults, setShowResults] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setShowResults(true)
    }
  }, [countdown])

  // Sort by score descending
  const sorted = [...participants].sort((a, b) => b.score - a.score)
  const top5 = sorted.slice(0, 5)
  const rest = sorted.slice(5)

  const getMedalColor = (index: number) => {
    switch(index) {
      case 0: return 'bg-yellow-100 text-yellow-600 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
      case 1: return 'bg-slate-100 text-slate-500 border-slate-300'
      case 2: return 'bg-amber-100 text-amber-700 border-amber-300'
      default: return 'bg-white border-gray-200 text-gray-700'
    }
  }

  const getPointsInfo = (index: number) => {
    switch(index) {
      case 0: return '+50 ball 🎉'
      case 1: return '+40 ball'
      case 2: return '+30 ball'
      case 3: return '+20 ball'
      case 4: return '+10 ball'
      default: return null
    }
  }

  if (!showResults) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <motion.div 
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-8xl font-black text-indigo-600"
        >
          {countdown}
        </motion.div>
        <p className="text-xl font-bold text-gray-500 dark:text-gray-400 animate-pulse">Natijalar hisoblanmoqda...</p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full mb-4"
        >
          <Trophy size={40} />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Test Yakunlandi!</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Barcha o&apos;quvchilar natijalari hisoblandi va ballar taqsimlandi.</p>
      </div>

      {/* Unified Leaderboard Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar pb-2">
          <table className="w-full text-left text-sm md:text-base min-w-[400px]">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-20 text-center">O&apos;rin</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Natija</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-24 text-right">Ball</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map((p, i) => {
              let points = 3; // Base 3 points
              if (p.score > 0 && i < 6) {
                points += i === 0 ? 15 : i === 1 ? 12 : i === 2 ? 9 : i === 3 ? 6 : i === 4 ? 3 : i === 5 ? 1 : 0;
              }
              
              return (
                <tr key={p.student_id} className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${i < 3 ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                  <td className="px-6 py-4 text-center text-lg">
                    {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">{p.full_name}</td>
                  <td className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 text-right">
                    <span className="text-indigo-600 dark:text-indigo-400">{p.score}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">/{p.total_questions}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({Math.round((p.score / p.total_questions) * 100) || 0}%)</span>
                  </td>
                  <td className="px-6 py-4 font-black text-right">
                    <span className={points > 0 ? "text-emerald-600" : "text-gray-400"}>
                      {points > 0 ? `+${points}` : '-'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                  Hech kim testda ishtirok etmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="pt-4 pb-8 flex justify-center">
        <button 
          onClick={() => router.push('/teacher/quiz')}
          className="flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <ChevronLeft size={20} /> Testlar ro&apos;yxatiga qaytish
        </button>
      </div>
    </motion.div>
  )
}
