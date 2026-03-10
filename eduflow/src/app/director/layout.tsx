import AIChatWidget from '@/components/ai/AIChatWidget'
import DirectorSidebar from '@/components/dashboard/director/DirectorSidebar'
import NotificationBell from '@/components/shared/NotificationBell'
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

  if (!profile || profile.role !== 'director') redirect('/login')

  const fullName = profile.full_name || 'Direktor'
  const initials = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <DirectorSidebar profile={profile} />
      <div className="lg:ml-[250px] transition-all duration-300">
        <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
          <p className="text-sm text-gray-500">Salom, {fullName.split(' ')[0]}! 👋</p>
          <div className="flex items-center gap-3">
            <NotificationBell userId={profile.id} />
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{initials}</div>
            <span className="text-sm font-medium text-gray-700">{fullName.split(' ')[0]}</span>
          </div>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
      <AIChatWidget apiRoute="/api/ai/director" title="EduFlow AI" subtitle="Maktab tahlili" placeholder="Statistika haqida so'rang..." color="from-purple-500 to-indigo-600" />
    </div>
  )
}
