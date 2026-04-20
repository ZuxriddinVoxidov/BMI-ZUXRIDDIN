'use client'

import { logout } from '@/app/actions/auth'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'

import { cn } from '@/lib/utils'
import {
    BarChart3,
    Building2,
    ChevronLeft,
    CircleDot,
    FileText,
    GraduationCap,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Settings,
    Users,
    X,
} from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { label: 'Bosh sahifa', href: '/dashboard', icon: Home },
  { label: 'Arizalar', href: '/dashboard/applications', icon: FileText },
  { label: "O'quvchilar", href: '/dashboard/students', icon: Users },
  { label: "O'qituvchilar", href: '/dashboard/teachers', icon: GraduationCap },
  { label: 'Direktor', href: '/dashboard/directors', icon: Building2 },
  { label: "To'garaklar", href: '/dashboard/clubs', icon: CircleDot },
  { label: 'Xabarlar', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Tizim statistikasi', href: '/dashboard/statistics', icon: BarChart3 },
  { label: 'Sozlamalar', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 touch-manipulation"
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
        <Logo href="/dashboard" collapsed={collapsed} />
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
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
            <img
              src="/admin-picture.png"
              alt="Admin"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.className = 'w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0';
                  e.currentTarget.parentElement.textContent = 'ZV';
                }
              }}
            />
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                Zuxriddin Voxidov 👋
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
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
