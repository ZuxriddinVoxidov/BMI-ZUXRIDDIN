'use client'

import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users } from 'lucide-react';
import { useMemo } from 'react';

interface AttendanceItem { date: string; status: string; student_id: string; club_id: string }
interface EnrollmentItem { student: Record<string, unknown>; club: Record<string, unknown> }

export default function TeacherReports({
  attendanceData,
  enrollments,
  clubs,
}: {
  attendanceData: AttendanceItem[]
  enrollments: EnrollmentItem[]
  clubs: Record<string, unknown>[]
}) {
  const monthlyStats = useMemo(() => {
    const months: Record<string, { total: number; present: number }> = {}
    const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
    attendanceData.forEach((a) => {
      const d = new Date(a.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      if (!months[key]) months[key] = { total: 0, present: 0 }
      months[key].total++
      if (a.status === 'present') months[key].present++
    })
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => ({
      name: monthNames[parseInt(key.split('-')[1])],
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      total: v.total,
      present: v.present,
    }))
  }, [attendanceData])

  // Per-student stats
  const studentStats = useMemo(() => {
    const map: Record<string, { name: string; club: string; present: number; absent: number; excused: number }> = {}
    enrollments.forEach((e) => {
      const sid = e.student?.id as string
      if (sid && !map[sid]) {
        map[sid] = { name: e.student?.full_name as string, club: e.club?.name as string, present: 0, absent: 0, excused: 0 }
      }
    })
    attendanceData.forEach((a) => {
      if (map[a.student_id]) {
        if (a.status === 'present') map[a.student_id].present++
        else if (a.status === 'absent') map[a.student_id].absent++
        else map[a.student_id].excused++
      }
    })
    return Object.entries(map).map(([id, s]) => ({ id, ...s, total: s.present + s.absent + s.excused }))
  }, [attendanceData, enrollments])

  const avgAttendance = attendanceData.length > 0
    ? Math.round((attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100)
    : 0

  const topStudent = studentStats.sort((a, b) => b.present - a.present)[0]

  function exportToast() {
    alert('Tez kunda... 📄')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Hisobotlar</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{avgAttendance}%</p>
          <p className="text-xs text-gray-500 mt-0.5">O&apos;rtacha davomat</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{topStudent?.name || '-'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Eng faol o&apos;quvchi</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <FileText size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{attendanceData.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Jami yozuvlar</p>
        </motion.div>
      </div>

      {/* Bar Chart */}
      {monthlyStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Oylik davomat (%)</h3>
          <div className="flex items-end gap-3 h-52">
            {monthlyStats.map((m, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="text-xs font-bold text-indigo-600 mb-1">{m.percentage}%</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${m.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg"
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{m.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Student Table */}
      {studentStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">O&apos;quvchilar statistikasi</h3>
            <div className="flex gap-2">
              <button onClick={exportToast} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">📄 PDF</button>
              <button onClick={exportToast} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">📊 Excel</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Ism</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Keldi</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Kelmadi</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Sababli</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase">%</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map((s) => {
                  const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{s.club}</td>
                      <td className="py-3 px-4 text-center text-sm text-emerald-600 font-medium">{s.present}</td>
                      <td className="py-3 px-4 text-center text-sm text-red-500 font-medium">{s.absent}</td>
                      <td className="py-3 px-4 text-center text-sm text-amber-500 font-medium">{s.excused}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${pct >= 80 ? 'bg-emerald-50 text-emerald-600' : pct >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {attendanceData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-3">📊</span>
          <h3 className="text-lg font-bold text-gray-900">Hali davomat ma&apos;lumotlari yo&apos;q</h3>
          <p className="text-sm text-gray-500 mt-1">Davomat olganingizda hisobotlar shu yerda chiqadi</p>
        </div>
      )}
    </div>
  )
}
