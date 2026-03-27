import TeacherSidebar from '@/components/dashboard/teacher/TeacherSidebar'
import NotificationBell from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Logo } from '@/components/shared/Logo'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'teacher' || profile.is_blocked) redirect('/login?error=blocked')

  const { data: myClubs } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('teacher_id', profile.id)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <TeacherSidebar
        fullName={profile.full_name || 'O\'qituvchi'}
        clubCount={myClubs?.length || 0}
      />
      <div className="lg:ml-[250px] transition-all duration-300">
        <div className="h-14 sm:h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            {/* Spacer for sidebar hamburger button on mobile */}
            <div className="w-8 lg:hidden shrink-0" />
            {/* Logo — mobile only */}
            <div className="lg:hidden">
              <Logo href="/teacher" />
            </div>
            {/* Desktop greeting */}
            <p className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 truncate">
              Salom, {profile.full_name?.split(' ')[0] || 'O\'qituvchi'}! 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell userId={profile.id} />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                {(profile.full_name?.split(' ')[0] || '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {profile.full_name?.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
