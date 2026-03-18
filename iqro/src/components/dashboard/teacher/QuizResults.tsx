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
        <p className="text-xl font-bold text-gray-500 animate-pulse">Natijalar hisoblanmoqda...</p>
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
        <h2 className="text-3xl font-black text-gray-900">Test Yakunlandi!</h2>
        <p className="text-gray-500 font-medium">Barcha o&apos;quvchilar natijalari hisoblandi va ballar taqsimlandi.</p>
      </div>

      {/* TOP 5 Leaderboard */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Trophy size={200} />
        </div>
        
        <h3 className="text-lg font-bold text-indigo-900 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
          <Medal size={20}/> Top 5 O&apos;quvchilar
        </h3>

        <div className="space-y-4 relative z-10">
          {top5.map((p, i) => (
            <motion.div 
              key={p.student_id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.5, type: "spring" }}
              className={`flex items-center justify-between p-4 rounded-2xl border ${getMedalColor(i)} ${i === 0 ? 'scale-105 my-6' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? 'bg-white/50' : 'bg-gray-100'}`}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold sm:text-lg">{p.full_name}</p>
                  <p className="text-sm opacity-80 font-medium">
                    {p.score} ta to&apos;g&apos;ri (jami: {p.total_questions})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-xl sm:text-2xl">{Math.round((p.score / p.total_questions) * 100)}%</p>
                <p className="text-sm font-bold opacity-80">{getPointsInfo(i)}</p>
              </div>
            </motion.div>
          ))}

          {top5.length === 0 && (
            <div className="text-center py-8 text-gray-500 italic">
              Hech kim testda ishtirok etmadi.
            </div>
          )}
        </div>
      </div>

      {/* Rest of students */}
      {rest.length > 0 && (
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">O&apos;rin</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">O&apos;quvchi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Natija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rest.map((p, i) => (
                <tr key={p.student_id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-400">#{i + 6}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{p.full_name}</td>
                  <td className="px-6 py-4 font-bold text-gray-600 text-right">
                    {p.score}/{p.total_questions} ({Math.round((p.score / p.total_questions) * 100)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
