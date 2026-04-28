'use client'

import { createClient } from '@/lib/supabase/client'
import { getStudentLevel } from '@/lib/levels'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Crown, Medal, Star, TrendingUp, Calendar, Zap } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

interface LeaderEntry {
  rank: number
  student_id: string
  full_name: string
  grade: string | null
  avatar_url?: string | null
  total_points: number
  weekly_points: number
  monthly_points: number
}

type Period = 'all' | 'weekly' | 'monthly'

const PERIOD_LABELS: Record<Period, { label: string; icon: React.ComponentType<{size?: number | string; className?: string}> }> = {
  all:     { label: 'Umumiy',  icon: Trophy },
  weekly:  { label: 'Haftalik', icon: Zap },
  monthly: { label: 'Oylik',   icon: Calendar },
}

function getPoints(entry: LeaderEntry, period: Period): number {
  if (period === 'weekly')  return entry.weekly_points
  if (period === 'monthly') return entry.monthly_points
  return entry.total_points
}

function PodiumCard({ entry, position, period }: { entry: LeaderEntry; position: 1 | 2 | 3; period: Period }) {
  const level = getStudentLevel(entry.total_points)
  const pts = getPoints(entry, period)
  const initials = entry.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  const configs = {
    1: {
      height: 'h-36 sm:h-44',
      avatarSize: 'w-16 h-16 sm:w-20 sm:h-20',
      avatarText: 'text-xl sm:text-2xl',
      crown: 'text-yellow-400',
      ring: 'ring-4 ring-yellow-400 ring-offset-2',
      bg: 'bg-gradient-to-b from-yellow-400 to-amber-500',
      podiumBg: 'bg-gradient-to-t from-yellow-500 to-amber-400',
      shadow: 'shadow-yellow-400/40',
      nameColor: 'text-yellow-300',
      order: 'order-2',
      icon: <Crown size={28} className="text-yellow-400 drop-shadow-lg" />,
    },
    2: {
      height: 'h-28 sm:h-36',
      avatarSize: 'w-14 h-14 sm:w-16 sm:h-16',
      avatarText: 'text-lg sm:text-xl',
      crown: 'text-gray-300',
      ring: 'ring-4 ring-gray-300 ring-offset-2',
      bg: 'bg-gradient-to-b from-gray-300 to-gray-400',
      podiumBg: 'bg-gradient-to-t from-gray-400 to-gray-300',
      shadow: 'shadow-gray-400/30',
      nameColor: 'text-gray-200',
      order: 'order-1',
      icon: <Medal size={24} className="text-gray-300" />,
    },
    3: {
      height: 'h-24 sm:h-28',
      avatarSize: 'w-12 h-12 sm:w-14 sm:h-14',
      avatarText: 'text-base sm:text-lg',
      crown: 'text-amber-600',
      ring: 'ring-4 ring-amber-600 ring-offset-2',
      bg: 'bg-gradient-to-b from-amber-600 to-amber-700',
      podiumBg: 'bg-gradient-to-t from-amber-700 to-amber-600',
      shadow: 'shadow-amber-600/30',
      nameColor: 'text-amber-300',
      order: 'order-3',
      icon: <Medal size={20} className="text-amber-600" />,
    },
  }

  const c = configs[position]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: position * 0.1 }}
      className={`flex flex-col items-center ${c.order} flex-1`}
    >
      {/* Crown / Icon */}
      <div className="mb-2">{c.icon}</div>
      {/* Avatar */}
      <div className={`${c.avatarSize} rounded-full ${c.bg} ${c.ring} ring-offset-indigo-950 flex items-center justify-center font-black ${c.avatarText} text-white shadow-xl ${c.shadow} mb-2 overflow-hidden relative`}>
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.full_name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="relative z-10">{initials}</span>
        )}
      </div>
      {/* Name */}
      <p className={`font-bold text-xs sm:text-sm text-center leading-tight mb-0.5 ${c.nameColor} max-w-[80px] sm:max-w-[100px] line-clamp-2`}>
        {entry.full_name}
      </p>
      {/* Grade & level */}
      <p className="text-white/50 text-xs text-center mb-2">
        {entry.grade ? `${entry.grade}-sinf` : ''} {level.emoji}
      </p>
      {/* Points */}
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-0.5 mb-2">
        <span className="text-white font-bold text-sm">{pts}</span>
        <span className="text-white/60 text-xs ml-1">ball</span>
      </div>
      {/* Podium bar */}
      <div className={`w-full ${c.height} ${c.podiumBg} rounded-t-xl flex items-center justify-center shadow-inner`}>
        <span className="text-white/40 font-black text-2xl sm:text-3xl">#{position}</span>
      </div>
    </motion.div>
  )
}

function LeaderRow({ entry, index, period }: { entry: LeaderEntry; index: number; period: Period }) {
  const level = getStudentLevel(entry.total_points)
  const pts = getPoints(entry, period)
  const initials = entry.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
    >
      {/* Rank */}
      <div className="w-7 text-center flex-shrink-0">
        <span className="text-white/50 font-bold text-sm">#{entry.rank}</span>
      </div>
      {/* Avatar */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0 overflow-hidden relative">
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.full_name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="relative z-10">{initials}</span>
        )}
      </div>
      {/* Name & grade */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{entry.full_name}</p>
        <p className="text-white/40 text-xs">
          {entry.grade ? `${entry.grade}-sinf` : ''} · {level.emoji} {level.name}
        </p>
      </div>
      {/* Points */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        <span className="text-white font-bold text-sm">{pts}</span>
        <span className="text-white/40 text-xs">ball</span>
      </div>
    </motion.div>
  )
}

interface LeaderboardSectionProps {
  initialData: LeaderEntry[]
}

export default function LeaderboardSection({ initialData }: LeaderboardSectionProps) {
  const [period, setPeriod] = useState<Period>('all')
  const [data, setData] = useState<LeaderEntry[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?period=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch {}
    finally { setIsLoading(false) }
  }, [period])

  // Re-fetch when period changes
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Real-time subscription to student_points
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('public:student_points')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_points' }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchLeaderboard])

  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3]
  const podiumEntries = podiumOrder.map(pos => top3[pos - 1]).filter(Boolean)

  return (
    <section
      id="leaderboard"
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 70%, #1e1b4b 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Reyting</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Eng faol o&apos;quvchilar
          </h2>
          <p className="text-white/60 max-w-md mx-auto text-sm sm:text-base">
            Ball yig&apos;ish bo&apos;yicha yetakchi o&apos;quvchilar
          </p>
        </motion.div>

        {/* Period Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/15 gap-1">
            {(Object.entries(PERIOD_LABELS) as [Period, { label: string; icon: React.ComponentType<{size?: number | string; className?: string}> }][]).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  period === key
                    ? 'bg-white text-indigo-700 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {data.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Hali reyting ma&apos;lumotlari yo&apos;q</p>
              </div>
            ) : (
              <>
                {/* Podium - Top 3 */}
                {top3.length >= 1 && (
                  <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8 px-4">
                    {podiumEntries.map((entry, i) => (
                      <PodiumCard
                        key={entry.student_id}
                        entry={entry}
                        position={podiumOrder[i]}
                        period={period}
                      />
                    ))}
                  </div>
                )}

                {/* Rank 4-10 */}
                {rest.length > 0 && (
                  <div className="space-y-2">
                    {rest.map((entry, i) => (
                      <LeaderRow
                        key={entry.student_id}
                        entry={entry}
                        index={i}
                        period={period}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
