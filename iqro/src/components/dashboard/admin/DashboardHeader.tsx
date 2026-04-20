'use client'

import NotificationBell from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Logo } from '@/components/shared/Logo'
import Image from 'next/image'

export default function DashboardHeader() {
  return (
    <header className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Mobile: left spacer + logo */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 lg:hidden shrink-0" />
        <div className="lg:hidden">
          <Logo href="/dashboard" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 shadow-sm relative">
              <Image
                src="/admin-picture.png"
                alt="Admin"
                fill
                quality={100}
                priority
                className="object-cover object-top"
                sizes="36px"
              />
            </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Admin</span>
        </div>
      </div>
    </header>
  )
}
