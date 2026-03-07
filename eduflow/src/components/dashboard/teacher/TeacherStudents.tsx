'use client'

import { getStudentLevel } from '@/lib/levels'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

interface EnrollItem { student: Record<string, unknown>; club: Record<string, unknown> }
interface AttItem { student_id: string; status: string }

export default function TeacherStudents({ enrollments, attendanceData }: { enrollments: EnrollItem[]; attendanceData: AttItem[] }) {
  const [search, setSearch] = useState('')

  const students = useMemo(() => {
    const map: Record<string, { name: string; club: string; points: number; present: number; total: number }> = {}
    enrollments.forEach((e) => {
      const sid = e.student?.id as string
      const pts = (e.student?.student_points as Record<string, unknown>[])?.[0]?.total_points as number || 0
      if (sid) {
        map[sid] = { name: e.student?.full_name as string, club: e.club?.name as string, points: pts, present: 0, total: 0 }
      }
    })
    attendanceData.forEach((a) => {
      if (map[a.student_id]) {
        map[a.student_id].total++
        if (a.status === 'present') map[a.student_id].present++
      }
    })
    return Object.entries(map).map(([id, s]) => ({ id, ...s }))
  }, [enrollments, attendanceData])

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Ism bo'yicha qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-3">👨‍🎓</span>
          <h3 className="text-lg font-bold text-gray-900">O&apos;quvchi topilmadi</h3>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Daraja</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Davomat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const level = getStudentLevel(s.points)
                const initials = (s.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{initials}</div>
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{s.club}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        {level.emoji} {level.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{pct}%</span>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
