'use client'

import { getProgressToNextLevel, getStudentLevel } from '@/lib/levels'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    Calendar,
    ChevronLeft,
    Compass,
    FolderOpen,
    Home,
    LogOut,
    Monitor,
    User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Bosh sahifa', href: '/student', icon: Home },
  { label: "To'garaklar Katalogi", href: '/student/explore', icon: Compass },
  { label: "Mening To'garaklarim", href: '/student/clubs', icon: Monitor },
  { label: 'Haftalik Jadval', href: '/student/schedule', icon: Calendar },
  { label: 'Davomat Hisoboti', href: '/student/attendance', icon: BarChart3 },
  { label: 'Mening Ishlarim', href: '/student/works', icon: FolderOpen },
  { label: 'Profil', href: '/student/profile', icon: User },
]

export default function StudentSidebar({
  fullName,
  points = 0,
}: {
  fullName: string
  points?: number
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const level = getStudentLevel(points)
  const progress = getProgressToNextLevel(points)

  const initials = fullName
    ? fullName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OQ'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">
              Edu<span className="text-indigo-600">Flow</span>
            </span>
          )}
        </Link>
      </div>

      {/* User Profile */}
      <div className={cn('px-4 py-4 border-b border-gray-100', collapsed && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {fullName || "O'quvchi"}
              </p>
              <p className="text-xs text-gray-500">O&apos;quvchi</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs">{level.emoji}</span>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: level.textColor }}
                >
                  {level.nameUz}
                </span>
              </div>
              {/* Level progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: level.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
          <LogOut size={20} />
          {!collapsed && <span>Chiqish</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 w-full transition-all"
        >
          <ChevronLeft
            size={20}
            className={cn('transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Yig&apos;ish</span>}
        </button>
      </div>
    </aside>
  )
}
