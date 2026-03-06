'use client'

import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

const students = [
  { id: 1, name: 'Alibek Toshmatov', initials: 'AT', club: 'Robototexnika', attendance: '95%', status: 'active' },
  { id: 2, name: 'Malika Yusupova', initials: 'MY', club: 'Musiqa', attendance: '92%', status: 'active' },
  { id: 3, name: 'Nilufar Rahimova', initials: 'NR', club: 'Robototexnika', attendance: '88%', status: 'active' },
  { id: 4, name: 'Bobur Mirzayev', initials: 'BM', club: 'Musiqa', attendance: '85%', status: 'active' },
  { id: 5, name: 'Zulfiya Karimova', initials: 'ZK', club: 'Robototexnika', attendance: '90%', status: 'active' },
  { id: 6, name: 'Jasur Umarov', initials: 'JU', club: 'Musiqa', attendance: '78%', status: 'warning' },
]

const initColors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-cyan-100 text-cyan-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600', 'bg-teal-100 text-teal-600']

export default function TeacherStudentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input placeholder="Qidirish..." className="pl-12 h-12 rounded-2xl border-gray-200 bg-white" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Davomat</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="py-4 px-6 text-sm text-gray-400">{s.id}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${initColors[i]} flex items-center justify-center text-xs font-bold`}>{s.initials}</div>
                    <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{s.club}</td>
                <td className="py-4 px-6">
                  <span className={`text-sm font-bold ${parseInt(s.attendance) >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.attendance}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {s.status === 'active' ? 'Yaxshi' : 'E\'tibor'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
