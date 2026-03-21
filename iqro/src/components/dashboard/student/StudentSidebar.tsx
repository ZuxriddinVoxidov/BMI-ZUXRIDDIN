'use client'

import { logout } from '@/app/actions/auth'
import { getProgressToNextLevel, getStudentLevel } from '@/lib/levels'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    BookOpen,
    Calendar,
    ChevronLeft,
    Compass,
    FolderOpen,
    Home,
    LogOut,
    Menu,
    Monitor,
    Sparkles,
    User,
    X,
    Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const navItems = [
  { label: 'Bosh sahifa', href: '/student', icon: Home },
  { label: "To'garaklar katalogi", href: '/student/explore', icon: Compass },
  { label: "Mening to'garaklarim", href: '/student/clubs', icon: Monitor },
  { label: 'Haftalik jadval', href: '/student/schedule', icon: Calendar },
  { label: 'Davomat hisoboti', href: '/student/attendance', icon: BarChart3 },
  { label: 'Testlar', href: '/student/quiz', icon: Trophy },
  { label: 'Mening ishlarim', href: '/student/works', icon: FolderOpen },
  { label: 'AI yordamchi', href: '/student/ai', icon: Sparkles },
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
  const [mobileOpen, setMobileOpen] = useState(false)

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
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 touch-manipulation transition-opacity ${mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Menu size={20} className="text-gray-700 dark:text-gray-200" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[250px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800">
        <Logo href="/student" collapsed={collapsed} />
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 touch-manipulation"
        >
          <X size={18} />
        </button>
      </div>

      {/* User Profile */}
      <div className={cn('px-4 py-4 border-b border-gray-100 dark:border-gray-800', collapsed && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {fullName || "O'quvchi"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">O&apos;quvchi</p>
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
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: level.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
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
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <ThemeToggle />
          {!collapsed && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mavzu</span>}
        </div>
        <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-all touch-manipulation">
          <LogOut size={20} />
          {!collapsed && <span>Chiqish</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-all touch-manipulation"
        >
          <ChevronLeft
            size={20}
            className={cn('transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Yig&apos;ish</span>}
        </button>
      </div>
    </aside>
    </>
  )
}
