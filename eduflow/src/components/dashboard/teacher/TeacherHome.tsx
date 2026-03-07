'use client'

import { motion } from 'framer-motion'
import { Award, Calendar, ClipboardCheck, Monitor, Star, Users } from 'lucide-react'
import Link from 'next/link'

interface Props {
  teacherName: string
  clubs: Record<string, unknown>[]
  totalStudents: number
  todayPresent: number
  totalRewards: number
  recentRewards: Record<string, unknown>[]
}

export default function TeacherHome({
  teacherName,
  clubs,
  totalStudents,
  todayPresent,
  totalRewards,
  recentRewards,
}: Props) {
  const firstName = (teacherName || "O'qituvchi").split(' ')[0]

  const stats = [
    { label: "To'garaklarim", value: clubs.length.toString(), icon: Monitor, color: 'bg-indigo-50 text-indigo-600', href: '/teacher/clubs' },
    { label: "Jami o'quvchilar", value: totalStudents.toString(), icon: Users, color: 'bg-blue-50 text-blue-600', href: '/teacher/students' },
    { label: 'Bugungi davomat', value: todayPresent.toString(), icon: ClipboardCheck, color: 'bg-emerald-50 text-emerald-600', href: '/teacher/attendance' },
    { label: "Berilgan rag'batlar", value: totalRewards.toString(), icon: Award, color: 'bg-amber-50 text-amber-600', href: '/teacher/reports' },
  ]

  if (clubs.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Salom, {firstName}! 👋</h1>
          <p className="text-white/70">O&apos;qituvchi paneli</p>
        </motion.div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-5xl">🏫</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Sizga hali to&apos;garak biriktirilmagan</h3>
          <p className="text-sm text-gray-500">Admin bilan bog&apos;laning</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Salom, {firstName}! 👋</h1>
        <p className="text-white/70">Sizda {clubs.length} ta to&apos;garak bor</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Clubs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Mening to&apos;garaklarim</h3>
            <Link href="/teacher/clubs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Barchasini ko&apos;rish →
            </Link>
          </div>
          <div className="space-y-3">
            {clubs.map((club) => (
              <div key={club.id as string} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">📚</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{club.name as string}</p>
                    <p className="text-xs text-gray-500">
                      <Calendar size={10} className="inline mr-1" />
                      {(club.schedule as string) || '-'}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                  {(club.studentCount as number) || 0} o&apos;quvchi
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Rewards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">So&apos;nggi rag&apos;batlar</h3>
          {recentRewards.length === 0 ? (
            <div className="py-8 text-center">
              <Star className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500">Hali rag&apos;bat berilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRewards.map((r) => (
                <div key={r.id as string} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⭐</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {(r.student as Record<string, unknown>)?.full_name as string || "O'quvchi"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(r.club as Record<string, unknown>)?.name as string || "To'garak"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at as string).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tezkor amallar</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Davomat olish', href: '/teacher/attendance', emoji: '📋' },
            { label: "O'quvchilar ro'yxati", href: '/teacher/students', emoji: '👨‍🎓' },
            { label: 'Hisobotlar', href: '/teacher/reports', emoji: '📊' },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <span className="text-xl">{a.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
