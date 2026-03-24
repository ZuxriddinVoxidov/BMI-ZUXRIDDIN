'use client'

import { useState } from 'react'
import { PointTransaction } from '@/app/actions/points'

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

const SOURCE_ICONS: Record<string, string> = {
  attendance: '📅',
  quiz: '🏆',
  review: '⭐',
  work: '📎',
  other: '🎯'
}

interface Props {
  transactions: PointTransaction[]
  totalPoints: number
}

export function PointsHistory({ transactions, totalPoints }: Props) {
  const [filter, setFilter] = useState<FilterPeriod>('all')

  const now = new Date()

  const filtered = transactions.filter(t => {
    const date = new Date(t.created_at)
    if (filter === 'today') {
      return date.toDateString() === now.toDateString()
    }
    if (filter === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return date >= weekAgo
    }
    if (filter === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      return date >= monthAgo
    }
    return true
  })

  const totalFiltered = filtered.reduce((sum, t) => sum + t.points, 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('uz-UZ', {
      day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Tashkent'
    })
  }

  const periods: { key: FilterPeriod; label: string }[] = [
    { key: 'all', label: 'Barchasi' },
    { key: 'today', label: 'Bugun' },
    { key: 'week', label: 'Haftalik' },
    { key: 'month', label: 'Oylik' },
  ]

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ballar tarixi</h3>
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full whitespace-nowrap">
          Jami: {totalPoints} ball
        </span>
      </div>

      {/* Period filters */}
      <div className="flex flex-wrap gap-2 items-center w-full">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === p.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
        {filter !== 'all' && (
          <p className="text-xs font-semibold text-indigo-500 whitespace-nowrap">
            Bu davrda: +{totalFiltered} ball
          </p>
        )}
      </div>

      {/* Transactions list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-sm">Bu davrda ball yig&apos;ilmagan</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
          {filtered.map(t => (
            <div key={t.id} 
              className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="text-xl flex-shrink-0">{SOURCE_ICONS[t.source] || '🎯'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{t.reason}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(t.created_at)}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                +{t.points} ball
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
