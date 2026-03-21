'use client'

import NotificationBell from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function StudentHeader({
  fullName,
  profileId,
}: {
  fullName: string
  profileId: string
  notifications?: unknown[]
  unreadCount?: number
}) {
  const firstName = fullName?.split(' ')[0] || "O'quvchi"
  const initials = fullName
    ? fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'OQ'

  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pl-10 sm:pl-0">
        Salom, {firstName}! 👋
      </p>
      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <NotificationBell userId={profileId} />
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{firstName}</span>
        </div>
      </div>
    </header>
  )
}
