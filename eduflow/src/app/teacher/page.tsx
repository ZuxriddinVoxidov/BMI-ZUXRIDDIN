'use client'

import { motion } from 'framer-motion'
import { Calendar, ClipboardCheck, Monitor, Users } from 'lucide-react'

const stats = [
  { label: 'Faol to\'garaklar', value: '2', icon: Monitor, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Jami o\'quvchilar', value: '42', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'O\'rtacha davomat', value: '91%', icon: ClipboardCheck, color: 'bg-amber-50 text-amber-600' },
]

const upcoming = [
  { club: 'Robototexnika', day: 'Bugun', time: '14:00', room: '205-xona', students: 24 },
  { club: 'Musiqa', day: 'Ertaga', time: '15:00', room: '108-xona', students: 22 },
]

export default function TeacherHomePage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Salom, Sardor! 👋</h1>
        <p className="text-white/70">Bugun 1 ta dars bor. Muvaffaqiyatlar!</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" /> Kelayotgan darslar
        </h3>
        <div className="space-y-3">
          {upcoming.map((u, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">{u.club}</p>
                <p className="text-sm text-gray-500">{u.day} · {u.time} · {u.room}</p>
              </div>
              <span className="text-sm font-medium text-indigo-600">{u.students} o&apos;quvchi</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
