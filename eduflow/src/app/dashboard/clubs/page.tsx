'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Pencil, Plus, Trash2 } from 'lucide-react'

const clubs = [
  { name: 'Robototexnika', emoji: '🤖', teacher: 'Sardor Xolmatov', students: '24/30', attendance: '91%', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Rasm va Chizmachilik', emoji: '🎨', teacher: 'Nilufar Rahimova', students: '18/20', attendance: '95%', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Ingliz tili', emoji: '🌍', teacher: 'Malika Yusupova', students: '28/30', attendance: '88%', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Matematika Olimpiadasi', emoji: '📐', teacher: 'Bobur Mirzayev', students: '15/20', attendance: '92%', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Musiqa', emoji: '🎵', teacher: 'Sardor Xolmatov', students: '22/25', attendance: '89%', gradient: 'from-teal-500 to-emerald-500' },
  { name: 'Sport va Fitnes', emoji: '⚽', teacher: 'Alibek Toshmatov', students: '35/40', attendance: '85%', gradient: 'from-rose-500 to-red-500' },
]

export default function ClubsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">To&apos;garaklar</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <Plus size={18} /> Yangi To&apos;garak
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clubs.map((club, i) => (
          <motion.div
            key={club.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${club.gradient} px-6 py-5 flex items-center gap-3`}>
              <span className="text-3xl">{club.emoji}</span>
              <h3 className="text-white font-bold text-lg">{club.name}</h3>
            </div>

            {/* Info */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">O&apos;qituvchi</span>
                <span className="font-semibold text-gray-900">{club.teacher}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">O&apos;quvchilar</span>
                <span className="font-semibold text-gray-900">{club.students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Davomat</span>
                <span className="font-bold text-emerald-600">{club.attendance}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                  <Pencil size={14} /> Tahrir
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                  <Trash2 size={14} /> O&apos;chirish
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
