'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check, Clock, Save, X } from 'lucide-react'
import { useState } from 'react'

type AttendanceStatus = 'present' | 'absent' | 'excused' | null

const students = [
  { id: 1, name: 'Alibek Toshmatov', initials: 'AT' },
  { id: 2, name: 'Malika Yusupova', initials: 'MY' },
  { id: 3, name: 'Sardor Xolmatov', initials: 'SX' },
  { id: 4, name: 'Nilufar Rahimova', initials: 'NR' },
  { id: 5, name: 'Bobur Mirzayev', initials: 'BM' },
  { id: 6, name: 'Zulfiya Karimova', initials: 'ZK' },
  { id: 7, name: 'Jasur Umarov', initials: 'JU' },
  { id: 8, name: 'Shahlo Nazarova', initials: 'SN' },
]

const initColors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600', 'bg-cyan-100 text-cyan-600', 'bg-teal-100 text-teal-600']

export default function TeacherAttendancePage() {
  const [attendance, setAttendance] = useState<Record<number, AttendanceStatus>>({})

  const setStatus = (id: number, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Davomat Olish</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">Robototexnika</span>
          <span>·</span>
          <span>2026-03-06</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Qatnashdi</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Qatnashmadi</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Sababli</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b border-gray-50 last:border-0">
                <td className="py-4 px-6 text-sm text-gray-400">{s.id}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${initColors[i]} flex items-center justify-center text-xs font-bold`}>
                      {s.initials}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => setStatus(s.id, 'present')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                      attendance[s.id] === 'present' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
                    }`}
                  >
                    <Check size={18} />
                  </button>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => setStatus(s.id, 'absent')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                      attendance[s.id] === 'absent' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => setStatus(s.id, 'excused')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                      attendance[s.id] === 'excused' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                    }`}
                  >
                    <Clock size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="flex justify-end">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 px-8 h-12">
          <Save size={18} /> Saqlash
        </Button>
      </div>
    </div>
  )
}
