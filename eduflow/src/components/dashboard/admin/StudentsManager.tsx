'use client'

import { getStudentLevel } from '@/lib/levels'
import { motion } from 'framer-motion'
import { Search, Users } from 'lucide-react'
import { useState } from 'react'

interface Student {
  id: string
  full_name: string
  email?: string
  is_blocked?: boolean
  created_at: string
  student_points: { total_points: number }[] | null
  enrollments: { count: number }[] | null
}

export default function StudentsManager({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('')

  const filtered = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>
          <p className="text-sm text-gray-500 mt-1">
            <Users size={14} className="inline mr-1" />
            {students.length} ta o&apos;quvchi
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ism yoki email bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-4xl">👨‍🎓</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">O&apos;quvchi topilmadi</h3>
          <p className="text-sm text-gray-500 mt-1">Qidiruv shartlarini o&apos;zgartiring</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Daraja</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Ball</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garaklar</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const points = student.student_points?.[0]?.total_points || 0
                const level = getStudentLevel(points)
                const enrollCount = student.enrollments?.[0]?.count || 0
                const initials = (student.full_name || '?')
                  .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <motion.tr key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{student.full_name}</p>
                          <p className="text-xs text-gray-400">{student.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: level.bgColor, color: level.textColor }}>
                        {level.emoji} {level.nameUz}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{points}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{enrollCount} ta</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.is_blocked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.is_blocked ? 'bg-red-400' : 'bg-emerald-400'
                        }`} />
                        {student.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
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
