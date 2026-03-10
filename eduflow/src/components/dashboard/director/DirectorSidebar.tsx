'use client'

import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { BarChart3, BookOpen, ChevronLeft, GraduationCap, Home, LogOut, Menu, School, User, Users, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/director', icon: Home, label: "Bosh sahifa" },
  { href: '/director/teachers', icon: GraduationCap, label: "O'qituvchilar" },
  { href: '/director/students', icon: Users, label: "O'quvchilar" },
  { href: '/director/clubs', icon: BookOpen, label: "To'garaklar" },
  { href: '/director/statistics', icon: BarChart3, label: "Statistika" },
  { href: '/director/profile', icon: User, label: "Profil" },
]

interface Props {
  profile: { full_name?: string; school?: { name?: string } | null }
}

export default function DirectorSidebar({ profile }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials = (profile.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white shadow-md border border-gray-100">
        <Menu size={20} />
      </button>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn('fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col z-50 transition-all duration-300', collapsed ? 'w-[70px]' : 'w-[250px]', mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <Link href="/director" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <School size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-gray-900">Edu<span className="text-amber-600">Flow</span></span>
                <p className="text-[10px] text-gray-400 -mt-1">Direktor paneli</p>
              </div>
            )}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className={cn('px-4 py-4 border-b border-gray-100', collapsed && 'px-2')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm flex-shrink-0">{initials}</div>
            {!collapsed && (
              <div>
                <p className="font-semibold text-sm text-gray-900">{profile.full_name || 'Direktor'}</p>
                <p className="text-xs text-gray-500">Direktor</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-amber-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center px-2')}>
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
            <LogOut size={20} />{!collapsed && <span>Chiqish</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 w-full transition-all">
            <ChevronLeft size={20} className={cn('transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Yig&apos;ish</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
