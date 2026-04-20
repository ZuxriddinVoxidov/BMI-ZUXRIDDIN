import DirectorSidebar from '@/components/dashboard/director/DirectorSidebar'
import NotificationBell from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Logo } from '@/components/shared/Logo'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(*)')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'director' || profile.is_blocked) redirect('/login?error=blocked')

  const fullName = profile.full_name || 'Direktor'
  const initials = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <DirectorSidebar profile={profile} />
      <div className="lg:ml-[250px] transition-all duration-300">
        <div className="h-14 sm:h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            {/* Spacer for sidebar hamburger button on mobile */}
            <div className="w-8 lg:hidden shrink-0" />
            {/* Logo — mobile only */}
            <div className="lg:hidden">
              <Logo href="/director" />
            </div>
            {/* Desktop greeting */}
            <p className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 truncate">Salom, {fullName.split(' ')[0]}! 👋</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell userId={profile.id} />
            <div className="hidden sm:flex items-center gap-2">
              {profile.avatar_url ? (
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-200 dark:border-amber-800 shadow-sm flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover object-top" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{initials}</div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{fullName.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
