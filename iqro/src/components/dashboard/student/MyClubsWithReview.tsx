'use client'

import Link from 'next/link'

interface Club {
  id: string
  name: string
  emoji?: string
  schedule?: string
  room?: string
  profiles: {
    full_name: string
  }
}

interface Enrollment {
  id: string
  club_id: string
  clubs: Club
}

interface Props {
  enrollments: Enrollment[]
}

export default function MyClubsWithReview({ enrollments }: Props) {
  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <span className="text-5xl mb-4">🎯</span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hali to&apos;garaklarga a&apos;zo emassiz</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium text-sm">O&apos;zingizga yoqqan to&apos;garakni tanlang va a&apos;zo bo&apos;ling</p>
        <Link 
          href="/student/explore"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {enrollments.map(enrollment => {
        const club = enrollment.clubs
        if (!club) return null

        return (
          <div key={enrollment.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between group">
            <div>
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0 font-emoji">
                  {club.emoji || '🎓'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {club.profiles?.full_name || 'Ustoz belgilanmagan'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl">
                {club.schedule && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm opacity-80">📅</span> {club.schedule}
                  </span>
                )}
                {club.schedule && club.room && <span className="text-gray-300">|</span>}
                {club.room && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm opacity-80">📍</span> {club.room}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
              <span className="inline-flex self-start sm:self-auto items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-900">
                <span className="text-xs">✅</span> A&apos;zosiz
              </span>
              
              <Link 
                href={`/clubs/${club.id}`}
                className="w-full sm:w-auto text-center px-4 py-3 sm:py-2 sm:px-0 bg-indigo-50 sm:bg-transparent text-indigo-700 sm:text-indigo-600 rounded-xl sm:rounded-none text-[16px] sm:text-sm font-bold sm:hover:text-indigo-800 transition-colors"
              >
                To&apos;garak sahifasi <span className="hidden sm:inline-block leading-none transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
