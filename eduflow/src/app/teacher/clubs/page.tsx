'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Users } from 'lucide-react'

const clubs = [
  { name: 'Robototexnika', emoji: '🤖', students: '24/30', attendance: '91%', schedule: 'Dush, Chor — 14:00', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Musiqa', emoji: '🎵', students: '22/25', attendance: '89%', schedule: 'Sesh, Pay — 15:00', gradient: 'from-teal-500 to-emerald-500' },
]

export default function TeacherClubsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening To&apos;garaklarim</h1>
      <div className="grid md:grid-cols-2 gap-5">
        {clubs.map((club, i) => (
          <motion.div key={club.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${club.gradient} px-6 py-5 flex items-center gap-3`}>
              <span className="text-3xl">{club.emoji}</span>
              <h3 className="text-white font-bold text-lg">{club.name}</h3>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-indigo-500" />
                <span>O&apos;quvchilar: <strong>{club.students}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp size={16} className="text-emerald-500" />
                <span>Davomat: <strong className="text-emerald-600">{club.attendance}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-amber-500" />
                <span>{club.schedule}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
