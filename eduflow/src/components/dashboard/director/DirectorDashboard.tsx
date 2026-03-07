'use client'

import { getStudentLevel } from '@/lib/levels'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const categoryColors: Record<string, string> = {
  Texnologiya: '#6366f1',
  Sport: '#f43f5e',
  "San'at": '#a855f7',
  Fan: '#10b981',
  Til: '#f59e0b',
  Boshqa: '#94a3b8',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Hozirgina'
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  return `${days} kun oldin`
}

interface DirectorDashboardProps {
  studentsCount: number
  teachersCount: number
  clubsCount: number
  attendanceRate: number
  chartData: { name: string; davomat: number }[]
  categoryData: { name: string; count: number }[]
  teacherData: { id: string; name: string; clubs: number; rewards: number }[]
  topStudents: { name: string; points: number }[]
  activityData: { student: string; club: string; status: string; date: string }[]
}

export default function DirectorDashboard({
  studentsCount, teachersCount, clubsCount, attendanceRate,
  chartData, categoryData, teacherData, topStudents, activityData,
}: DirectorDashboardProps) {
  const medals = ['🥇', '🥈', '🥉']
  const totalCats = categoryData.reduce((s, c) => s + c.count, 0)

  const handleExport = () => {
    alert("Tez kunda qo'shiladi...")
  }

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Direktor Paneli</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition">📊 Excel</button>
          <button onClick={handleExport} className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 transition">📄 PDF</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: '🎓', label: 'Jami o\'quvchilar', value: studentsCount, color: 'bg-blue-50 text-blue-700' },
          { icon: '👨‍🏫', label: 'O\'qituvchilar', value: teachersCount, color: 'bg-emerald-50 text-emerald-700' },
          { icon: '🏫', label: 'Faol to\'garaklar', value: clubsCount, color: 'bg-purple-50 text-purple-700' },
          { icon: '📊', label: 'O\'rt. davomat', value: `${attendanceRate}%`, color: 'bg-amber-50 text-amber-700' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-5 ${s.color}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Oylik davomat tendensiyasi</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Davomat']} />
              <Bar dataKey="davomat" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Horizontal Bars */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">To&apos;garaklar kategoriya bo&apos;yicha</h2>
          <div className="space-y-4">
            {categoryData.map((cat) => {
              const pct = totalCats > 0 ? Math.round((cat.count / totalCats) * 100) : 0
              const color = categoryColors[cat.name] || categoryColors['Boshqa']
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="text-gray-400">{cat.count} ta ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
            {categoryData.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-8">Ma&apos;lumot yo&apos;q</p>
            )}
          </div>
        </div>
      </div>

      {/* Teacher + Top Students */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Teachers Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">O&apos;qituvchilar samaradorligi</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">O&apos;qituvchi</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">To&apos;garaklar</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Rag&apos;batlar</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Daraja</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.map((t) => {
                const grade = t.rewards >= 5 ? "A'lo" : t.rewards >= 2 ? 'Yaxshi' : 'Past'
                const gradeColor = grade === "A'lo" ? 'bg-emerald-100 text-emerald-700' : grade === 'Yaxshi' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                const initials = t.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{initials}</div>
                        <span className="font-medium text-gray-700">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{t.clubs}</td>
                    <td className="px-6 py-3 text-gray-600">{t.rewards}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${gradeColor}`}>{grade}</span>
                    </td>
                  </tr>
                )
              })}
              {teacherData.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-300">O&apos;qituvchilar yo&apos;q</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top 5 Students */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">Top 5 o&apos;quvchilar</h2>
          <div className="space-y-3">
            {topStudents.map((s, i) => {
              const level = getStudentLevel(s.points)
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''}`}>
                  <span className="text-xl w-8 text-center">{i < 3 ? medals[i] : `${i + 1}.`}</span>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {s.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{level.emoji} {level.name}</p>
                  </div>
                  <span className="font-bold text-indigo-600">{s.points} ball</span>
                </div>
              )
            })}
            {topStudents.length === 0 && (
              <p className="text-sm text-gray-300 text-center py-8">O&apos;quvchilar yo&apos;q</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">So&apos;nggi faoliyat</h2>
        <div className="space-y-3">
          {activityData.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-lg">{a.status === 'approved' ? '✅' : a.status === 'pending' ? '👤' : '❌'}</span>
              <p className="text-sm text-gray-700 flex-1">
                <span className="font-medium">{a.student}</span>
                {a.status === 'approved' ? ' ' + a.club + ' ga qabul qilindi' : a.status === 'pending' ? ' ' + a.club + ' ga ariza yubordi' : ' arizasi rad etildi'}
              </p>
              <span className="text-xs text-gray-400">{timeAgo(a.date)}</span>
            </div>
          ))}
          {activityData.length === 0 && (
            <p className="text-sm text-gray-300 text-center py-8">Faoliyat yo&apos;q</p>
          )}
        </div>
      </div>
    </div>
  )
}
