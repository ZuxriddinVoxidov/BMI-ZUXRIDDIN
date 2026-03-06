'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, Star } from 'lucide-react'

const teachers = [
  { id: 1, initials: 'SX', name: 'Sardor Xolmatov', email: 'sardor.teacher@eduflow.uz', clubs: 'Robototexnika, Musiqa', experience: '8 yil', rating: 4.9, status: 'active' },
  { id: 2, initials: 'NR', name: 'Nilufar Rahimova', email: 'nilufar.teacher@eduflow.uz', clubs: 'Rasm va Chizmachilik', experience: '5 yil', rating: 4.8, status: 'active' },
  { id: 3, initials: 'MY', name: 'Malika Yusupova', email: 'malika.teacher@eduflow.uz', clubs: 'Ingliz tili', experience: '6 yil', rating: 4.7, status: 'active' },
  { id: 4, initials: 'BM', name: 'Bobur Mirzayev', email: 'bobur.teacher@eduflow.uz', clubs: 'Matematika Olimpiadasi', experience: '10 yil', rating: 4.6, status: 'active' },
]

const initialsColors = ['bg-indigo-100 text-indigo-600', 'bg-cyan-100 text-cyan-600', 'bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600']

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">O&apos;qituvchilar</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <Plus size={18} /> Yangi O&apos;qituvchi
        </Button>
      </div>

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
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garaklar</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Tajriba</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Reyting</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              >
                <td className="py-4 px-6 text-sm text-gray-400">{t.id}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${initialsColors[i]} flex items-center justify-center text-xs font-bold`}>
                      {t.initials}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{t.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{t.email}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{t.clubs}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{t.experience}</td>
                <td className="py-4 px-6">
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    {t.rating}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Faol
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
