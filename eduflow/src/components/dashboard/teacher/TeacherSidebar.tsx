'use client'

import { cn } from '@/lib/utils'
import {
    BarChart3,
    ChevronLeft,
    ClipboardCheck,
    Home,
    LogOut,
    Monitor,
    User,
    Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { label: 'Bosh sahifa', href: '/teacher', icon: Home },
  { label: "Mening To'garaklarim", href: '/teacher/clubs', icon: Monitor },
  { label: 'Davomat Olish', href: '/teacher/attendance', icon: ClipboardCheck },
  { label: 'Hisobotlar', href: '/teacher/reports', icon: BarChart3 },
  { label: "O'quvchilar", href: '/teacher/students', icon: Users },
  { label: 'Profil', href: '/teacher/profile', icon: User },
]

export default function TeacherSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
        <Link href="/teacher" className="flex items-center gap-2">
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

      <div className={cn('px-4 py-4 border-b border-gray-100', collapsed && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            SX
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm text-gray-900">Salom, Sardor 👋</p>
              <p className="text-xs text-gray-500">O&apos;qituvchi</p>
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
          <LogOut size={20} />
          {!collapsed && <span>Chiqish</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 w-full transition-all">
          <ChevronLeft size={20} className={cn('transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Yig&apos;ish</span>}
        </button>
      </div>
    </aside>
  )
}
