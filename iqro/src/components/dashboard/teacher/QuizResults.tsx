'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Participant {
  student_id: string
  score: number
  full_name: string
  avatar_url?: string | null
  total_questions: number
  finished_at?: string
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

  // Sort by score descending, then finish time ascending
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const tA = a.finished_at ? new Date(a.finished_at).getTime() : Infinity
    const tB = b.finished_at ? new Date(b.finished_at).getTime() : Infinity
    return tA - tB
  })

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
          <table className="w-full text-left text-sm md:text-base min-w-[500px]">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-20 text-center">O&apos;rin</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Natija</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-center">Ball</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Vaqt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map((p, i) => {
              const rankBonusMap = [15, 12, 10, 8, 6, 4, 3] // 1st to 7th
              const rankBonus = (i < 7) ? rankBonusMap[i] : 1
              const points = rankBonus + 2 // +2 participation bonus

              const formatTime = (iso?: string) => {
                if (!iso) return '-';
                const d = new Date(iso);
                return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              }
              
              return (
                <tr key={p.student_id} className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${i < 3 ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                  <td className="px-6 py-4 text-center text-lg">
                    {i === 0 ? '🥇 1' : i === 1 ? '🥈 2' : i === 2 ? '🥉 3' : <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {p.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                      <span>{p.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 text-center">
                    <span className="text-indigo-600 dark:text-indigo-400">{p.score}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">/{p.total_questions}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-center">
                    <span className="text-emerald-600">
                      +{points}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right text-xs">
                    {formatTime((p as any).finished_at)}
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
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
