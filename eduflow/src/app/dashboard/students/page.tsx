'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Ban, Pencil, Plus, Search } from 'lucide-react'

const students = [
  { id: 1, initials: 'AT', name: 'Alibek Toshmatov', email: 'alibek@eduflow.uz', clubs: 'Robototexnika, Sport', status: 'active' as const },
  { id: 2, initials: 'MY', name: 'Malika Yusupova', email: 'malika@eduflow.uz', clubs: 'Ingliz tili, Rasm', status: 'active' as const },
  { id: 3, initials: 'SX', name: 'Sardor Xolmatov', email: 'sardor@eduflow.uz', clubs: 'Matematika', status: 'active' as const },
  { id: 4, initials: 'NR', name: 'Nilufar Rahimova', email: 'nilufar@eduflow.uz', clubs: 'Musiqa, Rasm', status: 'active' as const },
  { id: 5, initials: 'BM', name: 'Bobur Mirzayev', email: 'bobur@eduflow.uz', clubs: 'Robototexnika', status: 'blocked' as const },
  { id: 6, initials: 'ZK', name: 'Zulfiya Karimova', email: 'zulfiya@eduflow.uz', clubs: 'Ingliz tili', status: 'active' as const },
  { id: 7, initials: 'JU', name: 'Jasur Umarov', email: 'jasur@eduflow.uz', clubs: 'Sport, Matematika', status: 'active' as const },
  { id: 8, initials: 'SN', name: 'Shahlo Nazarova', email: 'shahlo@eduflow.uz', clubs: 'Musiqa', status: 'active' as const },
]

const initialsColors = ['bg-indigo-100 text-indigo-600', 'bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600', 'bg-cyan-100 text-cyan-600', 'bg-teal-100 text-teal-600']

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <Plus size={18} /> Yangi O&apos;quvchi
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Qidirish..."
          className="pl-12 h-12 rounded-2xl border-gray-200 bg-white"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Ism</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Login</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Parol</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              >
                <td className="py-4 px-6 text-sm text-gray-400">{s.id}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${initialsColors[i % initialsColors.length]} flex items-center justify-center text-xs font-bold`}>
                      {s.initials}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{s.email}</td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    •••••••• <button className="text-gray-400 hover:text-gray-600"><Search size={14} /></button>
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{s.clubs}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {s.status === 'active' ? 'Faol' : 'Bloklangan'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
