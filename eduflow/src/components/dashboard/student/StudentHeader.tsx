'use client'

import { Bell } from 'lucide-react'

export default function StudentHeader({ fullName }: { fullName: string }) {
  const firstName = fullName?.split(' ')[0] || 'O\'quvchi'
  const initials = fullName
    ? fullName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OQ'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <p className="text-sm font-semibold text-gray-900">
        Salom, {firstName}! 👋
      </p>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">{firstName}</span>
        </div>
      </div>
    </header>
  )
}
