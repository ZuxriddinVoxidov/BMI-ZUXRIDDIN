'use client'

import NotificationBell from '@/components/shared/NotificationBell'

export default function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-4">
      <NotificationBell />
      <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
          ZV
        </div>
        <span className="text-sm font-medium text-gray-700">Admin</span>
      </div>
    </header>
  )
}
