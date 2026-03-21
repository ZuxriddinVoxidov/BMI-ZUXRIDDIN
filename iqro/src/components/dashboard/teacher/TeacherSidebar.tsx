'use client'

import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    ChevronLeft,
    ClipboardCheck,
    FolderOpen,
    Home,
    LogOut,
    Menu,
    Monitor,
    Sparkles,
    User,
    Users,
    X,
    Trophy,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const navItems = [
  { label: 'Bosh sahifa', href: '/teacher', icon: Home },
  { label: "Mening to'garaklarim", href: '/teacher/clubs', icon: Monitor },
  { label: 'Davomat olish', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Hisobotlar', href: '/teacher/reports', icon: BarChart3 },
  { label: "O'quvchilar", href: '/teacher/students', icon: Users },
  { label: 'Testlar', href: '/teacher/quiz', icon: Trophy },
  { label: 'AI tahlilchi', href: '/teacher/ai', icon: Sparkles },
  { label: 'Profil', href: '/teacher/profile', icon: User },
]

export default function TeacherSidebar({
  fullName,
  clubCount,
}: {
  fullName: string
  clubCount: number
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const firstName = fullName.split(' ')[0]

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white shadow-md border border-gray-100 touch-manipulation"
      >
        <Menu size={20} />
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
        'fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[250px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        <Logo href="/teacher" collapsed={collapsed} />
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400 touch-manipulation"
        >
          <X size={18} />
        </button>
      </div>

      <div className={cn('px-4 py-4 border-b border-gray-100', collapsed && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {firstName} 👋
              </p>
              <p className="text-xs text-gray-500">
                O&apos;qituvchi · {clubCount} to&apos;garak
              </p>
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

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <ThemeToggle />
          {!collapsed && <span className="text-sm font-medium text-gray-500">Mavzu</span>}
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all touch-manipulation"
        >
          <LogOut size={20} />
          {!collapsed && <span>Chiqish</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 w-full transition-all touch-manipulation"
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
