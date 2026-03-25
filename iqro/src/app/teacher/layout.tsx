import TeacherSidebar from '@/components/dashboard/teacher/TeacherSidebar'
import NotificationBell from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { UserAvatar } from '@/components/shared/UserAvatar'
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
        avatarUrl={profile.avatar_url}
      />
      <div className="lg:ml-[250px] transition-all duration-300">
        <div className="h-14 sm:h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate pl-10 sm:pl-0">
            Salom, {profile.full_name?.split(' ')[0] || 'O\'qituvchi'}! 👋
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell userId={profile.id} />
            <div className="hidden sm:flex items-center gap-2">
              <UserAvatar avatarUrl={profile.avatar_url} fullName={profile.full_name} size="md" />
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
