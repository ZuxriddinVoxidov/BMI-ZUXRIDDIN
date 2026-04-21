'use client'

import { motion } from 'framer-motion'
import {
    Calendar,
    FileText,
    GraduationCap,
    TrendingUp,
    Users,
    X
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ParentRequests from './ParentRequests'

interface Props {
  studentsCount: number
  teachersCount: number
  clubsCount: number
  pendingCount: number
  todayPresentCount: number
  todayAbsentCount: number
  thisMonthEnrollments: number
  recentApplications: Record<string, unknown>[]
  recentClubs: Record<string, unknown>[]
  topStudents: Record<string, unknown>[]
  adminName: string
  missedAttendanceClubs?: {
    id: string
    name: string
    schedule: string
    teacher_name: string
    missed_date?: string
    day_name?: string
  }[]
}

export default function DashboardContent({
  studentsCount, teachersCount, clubsCount, pendingCount,
  todayPresentCount, todayAbsentCount, thisMonthEnrollments,
  recentApplications, recentClubs, topStudents, adminName,
  missedAttendanceClubs = [],
}: Props) {
  const [showAllMissed, setShowAllMissed] = useState(false)
  const [showAllApps, setShowAllApps] = useState(false)
  const [dismissedClubIds, setDismissedClubIds] = useState<string[]>([])

  // Calculate the Monday of the current week for the localStorage key
  const getMondayStr = () => {
    const d = new Date()
    const diff = d.getDay() === 0 ? 6 : d.getDay() - 1
    d.setDate(d.getDate() - diff)
    return d.toISOString().split('T')[0]
  }

  useEffect(() => {
    const mondayStr = getMondayStr()
    const saved = localStorage.getItem(`dismissed_attendance_${mondayStr}`)
    if (saved) {
      try {
        setDismissedClubIds(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const handleDismiss = (clubId: string) => {
    const mondayStr = getMondayStr()
    const updated = [...dismissedClubIds, clubId]
    setDismissedClubIds(updated)
    localStorage.setItem(`dismissed_attendance_${mondayStr}`, JSON.stringify(updated))
  }

  const visibleMissedClubs = missedAttendanceClubs.filter(c => !dismissedClubIds.includes(c.id))

  const today = new Date().toISOString().split('T')[0]
  const stats = [
    {
      label: "O'quvchilar",
      value: studentsCount.toString(),
      subtitle: `+${thisMonthEnrollments} bu oy`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      href: '/dashboard/students',
    },
    {
      label: "O'qituvchilar",
      value: teachersCount.toString(),
      subtitle: `${clubsCount} ta to'garak`,
      icon: GraduationCap,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/dashboard/teachers',
    },
    {
      label: 'Kutilgan arizalar',
      value: pendingCount.toString(),
      subtitle: pendingCount > 0 ? 'Tasdiqlash kerak' : 'Barchasi ko\'rib chiqilgan',
      icon: FileText,
      color: pendingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
      href: '/dashboard/applications',
    },
    {
      label: 'Bugungi davomat',
      value: `${todayPresentCount}/${todayPresentCount + todayAbsentCount}`,
      subtitle: `Bugun ${today}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/dashboard',
    },
  ]

  const firstName = (adminName || 'Admin').split(' ')[0]
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

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
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{stat.subtitle}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Missed Attendance Alerts */}
      {visibleMissedClubs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/80 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Davomat olinmagan to&apos;garaklar</h3>
              <p className="text-sm text-red-700">Quyidagi to&apos;garaklar joriy haftada dars o&apos;tishi kerak edi, lekin davomat kiritilmadi:</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllMissed ? visibleMissedClubs : visibleMissedClubs.slice(0, 3)).map(club => (
              <div key={club.id} className="relative group bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-red-100 flex flex-col">
                <button 
                  onClick={() => handleDismiss(club.id)}
                  className="absolute top-2 right-2 text-red-300 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  title="O'chirish"
                >
                  <X size={14} />
                </button>
                <div className="flex justify-between items-start pr-6">
                  <span className="font-semibold text-gray-900 text-sm leading-tight">{club.name}</span>
                </div>
                {club.day_name && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center w-max mt-1.5 font-bold">
                    📅 {club.day_name} ({club.missed_date})
                  </span>
                )}
                <span className="text-xs text-gray-600 mt-1.5">👨‍🏫 {club.teacher_name}</span>
              </div>
            ))}
          </div>
          {visibleMissedClubs.length > 3 && (
            <button 
              onClick={() => setShowAllMissed(!showAllMissed)}
              className="mt-4 text-sm font-medium text-red-700 hover:text-red-800 underline transition-colors"
            >
              {showAllMissed ? 'Yashirish' : `Barchasini ko'rish (${visibleMissedClubs.length})`}
            </button>
          )}
        </motion.div>
      )}

      {/* Parent Telegram Registration Requests */}
      <ParentRequests />

      {/* Three Column Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">So&apos;nggi arizalar</h3>
            <Link href="/dashboard/applications" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
              Barchasi →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Yangi ariza yo&apos;q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showAllApps ? recentApplications : recentApplications.slice(0, 2)).map(app => {
                const student = app.student as Record<string, unknown> | null
                const club = app.club as Record<string, unknown> | null
                return (
                  <div key={app.id as string} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">⏳</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{(student?.full_name as string) || "O'quvchi"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(club?.name as string) || "To'garak"}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-600 font-medium">Kutilmoqda</span>
                  </div>
                )
              })}
              
              {recentApplications.length > 2 && (
                <button 
                  onClick={() => setShowAllApps(!showAllApps)}
                  className="w-full text-center mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  {showAllApps ? 'Yashirish' : `Barchasini ko'rish (${recentApplications.length})`}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Recent Clubs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">To&apos;garaklar</h3>
            <Link href="/dashboard/clubs" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium">
              Barchasi →
            </Link>
          </div>

          {recentClubs.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl">🏫</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">To&apos;garak qo&apos;shilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentClubs.map(club => {
                const teacher = club.teacher as Record<string, unknown> | null
                return (
                  <div key={club.id as string} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">📚</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{club.name as string}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <Calendar size={10} className="inline mr-1" />
                          {(teacher?.full_name as string) || "O'qituvchi"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium">
                      {(club.category as string) || 'Boshqa'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏆 Top o&apos;quvchilar</h3>
          {topStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm">Hali reytingda hech kim yo&apos;q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={(s as Record<string, unknown>).student_id as string || i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    i === 0 ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900'
                    : i === 1 ? 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                    : i === 2 ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {i < 3 ? medals[i] : (
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold inline-flex items-center justify-center">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    {(s as Record<string, unknown>).avatar_url ? (
                      <img
                        src={(s as Record<string, unknown>).avatar_url as string}
                        alt={(s as Record<string, unknown>).full_name as string}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {((s as Record<string, unknown>).full_name as string || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 ml-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {(s as Record<string, unknown>).full_name as string || "Noma'lum"}
                    </p>
                    {!!(s as Record<string, unknown>).grade ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {String((s as Record<string, unknown>).grade)}-sinf
                      </p>
                    ) : null}
                  </div>
                  <span className="font-bold text-amber-600 text-sm whitespace-nowrap">
                    {(s as Record<string, unknown>).total_points as number} ball
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tezkor amallar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "To'garak qo'shish", href: '/dashboard/clubs', emoji: '➕' },
            { label: "Arizalarni ko'rish", href: '/dashboard/applications', emoji: '📋' },
            { label: "O'quvchilar ro'yxati", href: '/dashboard/students', emoji: '👨‍🎓' },
            { label: "O'qituvchilar", href: '/dashboard/teachers', emoji: '👨‍🏫' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all"
            >
              <span className="text-xl">{action.emoji}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
