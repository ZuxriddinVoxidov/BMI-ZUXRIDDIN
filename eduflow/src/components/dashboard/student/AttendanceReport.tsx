'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

interface AttendanceReportProps {
  records: Record<string, unknown>[]
}

export default function AttendanceReport({ records }: AttendanceReportProps) {
  const [chartMode, setChartMode] = useState<'monthly' | 'weekly'>('monthly')

  // Stats
  const total = records.length
  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const excused = records.filter(r => r.status === 'excused').length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  // Monthly chart data
  const monthlyData: Record<string, { total: number; present: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyData[key] = { total: 0, present: 0 }
  }

  for (const r of records) {
    const date = r.date as string
    const key = date?.substring(0, 7)
    if (monthlyData[key]) {
      monthlyData[key].total++
      if (r.status === 'present') monthlyData[key].present++
    }
  }

  const chartData = Object.entries(monthlyData).map(([key, val]) => {
    const m = parseInt(key.split('-')[1]) - 1
    return {
      name: monthNames[m],
      davomat: val.total > 0 ? Math.round((val.present / val.total) * 100) : 0,
    }
  })

  const stats = [
    { icon: '✅', label: 'Kelgan', value: `${present} kun`, color: 'bg-emerald-50 text-emerald-700' },
    { icon: '❌', label: 'Kelmagan', value: `${absent} kun`, color: 'bg-red-50 text-red-700' },
    { icon: '📝', label: 'Sababli', value: `${excused} kun`, color: 'bg-amber-50 text-amber-700' },
    { icon: '📊', label: 'Davomat', value: `${rate}%`, color: 'bg-indigo-50 text-indigo-700' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'present') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">✅ Keldi</span>
    if (status === 'absent') return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">❌ Kelmadi</span>
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">📝 Sababli</span>
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-2xl p-5 ${s.color}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-800">Davomat tendensiyasi</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartMode('weekly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${chartMode === 'weekly' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
            >
              Haftalik
            </button>
            <button
              onClick={() => setChartMode('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${chartMode === 'monthly' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}
            >
              Oylik
            </button>
          </div>
        </div>

        {total > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Davomat']} />
              <Bar dataKey="davomat" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-300">
            <p>Hali davomat ma&apos;lumotlari yo&apos;q</p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Davomat jadvali</h2>
        </div>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Sana</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">To&apos;garak</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Holat</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Izoh</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const club = r.club as Record<string, unknown> | null
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 text-gray-700">{r.date as string}</td>
                      <td className="px-6 py-3 text-gray-700">{(club?.name as string) || '—'}</td>
                      <td className="px-6 py-3">{statusBadge(r.status as string)}</td>
                      <td className="px-6 py-3 text-gray-400">{(r.note as string) || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-300">
            <p className="text-4xl mb-3">📊</p>
            <p>Hali davomat ma&apos;lumotlari yo&apos;q</p>
          </div>
        )}
      </div>
    </>
  )
}
