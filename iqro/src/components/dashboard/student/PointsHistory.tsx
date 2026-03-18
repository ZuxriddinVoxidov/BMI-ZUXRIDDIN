'use client'

import { useState } from 'react'
import { PointTransaction } from '@/app/actions/points'

type FilterPeriod = 'all' | 'today' | 'week' | 'month'

const SOURCE_LABELS: Record<string, string> = {
  attendance: '📅 Davomat',
  quiz: '🏆 Test',
  review: '⭐ Sharh',
  work: '📎 Ish',
  other: '🎯 Boshqa'
}

export function PointsHistory({ transactions }: { transactions: PointTransaction[] }) {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ballar tarixi</h3>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Jami: +{totalFiltered} ball
        </span>
      </div>

      {/* Period filters */}
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === p.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
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
              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">{SOURCE_LABELS[t.source]?.split(' ')[0]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.reason}</p>
                  <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +{t.points} ball
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
