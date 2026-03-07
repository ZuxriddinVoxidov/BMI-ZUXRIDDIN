'use client'

import { motion } from 'framer-motion'
import {
    Calendar,
    CircleDot,
    FileText,
    GraduationCap,
    Users,
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  studentsCount: number
  teachersCount: number
  clubsCount: number
  pendingCount: number
  recentApplications: Record<string, unknown>[]
  recentClubs: Record<string, unknown>[]
  adminName: string
}

export default function DashboardContent({
  studentsCount,
  teachersCount,
  clubsCount,
  pendingCount,
  recentApplications,
  recentClubs,
  adminName,
}: Props) {
  const stats = [
    {
      label: "Jami O'quvchilar",
      value: studentsCount.toString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/students',
    },
    {
      label: "O'qituvchilar",
      value: teachersCount.toString(),
      icon: GraduationCap,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/dashboard/teachers',
    },
    {
      label: "To'garaklar",
      value: clubsCount.toString(),
      icon: CircleDot,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/dashboard/clubs',
    },
    {
      label: 'Kutilayotgan arizalar',
      value: pendingCount.toString(),
      icon: FileText,
      color: 'bg-amber-50 text-amber-600',
      href: '/dashboard/applications',
    },
  ]

  const firstName = (adminName || 'Admin').split(' ')[0]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-2xl p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
          Salom, {firstName}! 👋
        </h1>
        <p className="text-white/70">
          Tizimni boshqaring va nazorat qiling
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div
                className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Two Column Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              So&apos;nggi arizalar
            </h3>
            <Link
              href="/dashboard/applications"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Barchasini ko&apos;rish →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-gray-500 mt-2">
                Hozircha yangi ariza yo&apos;q
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => {
                const student = app.student as Record<string, unknown> | null
                const club = app.club as Record<string, unknown> | null
                return (
                  <div
                    key={app.id as string}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                        ⏳
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {(student?.full_name as string) || 'O\'quvchi'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(club?.name as string) || 'To\'garak'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">
                      Kutilmoqda
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Clubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              To&apos;garaklar
            </h3>
            <Link
              href="/dashboard/clubs"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Barchasini ko&apos;rish →
            </Link>
          </div>

          {recentClubs.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl">🏫</span>
              <p className="text-sm text-gray-500 mt-2">
                Hali to&apos;garak qo&apos;shilmagan
              </p>
              <Link
                href="/dashboard/clubs"
                className="inline-block mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                To&apos;garak qo&apos;shish →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentClubs.map((club) => {
                const teacher = club.teacher as Record<string, unknown> | null
                return (
                  <div
                    key={club.id as string}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                        📚
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {club.name as string}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Calendar
                            size={10}
                            className="inline mr-1"
                          />
                          {(teacher?.full_name as string) || "O'qituvchi"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                      {(club.category as string) || 'Boshqa'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tezkor amallar
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "To'garak qo'shish", href: '/dashboard/clubs', emoji: '➕' },
            { label: 'Arizalarni ko\'rish', href: '/dashboard/applications', emoji: '📋' },
            { label: "O'quvchilar ro'yxati", href: '/dashboard/students', emoji: '👨‍🎓' },
            { label: "O'qituvchilar", href: '/dashboard/teachers', emoji: '👨‍🏫' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
            >
              <span className="text-xl">{action.emoji}</span>
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
