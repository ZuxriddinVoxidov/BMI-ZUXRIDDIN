import AIChatWidget from '@/components/ai/AIChatWidget'
import TeacherSidebar from '@/components/dashboard/teacher/TeacherSidebar'
import NotificationBell from '@/components/shared/NotificationBell'
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

  if (!profile || profile.role !== 'teacher') redirect('/login')

  const { data: myClubs } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('teacher_id', profile.id)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <TeacherSidebar
        fullName={profile.full_name || 'O\'qituvchi'}
        clubCount={myClubs?.length || 0}
      />
      <div className="lg:ml-[250px] transition-all duration-300">
        <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6">
          <p className="text-sm text-gray-500">
            Salom, {profile.full_name?.split(' ')[0] || 'O\'qituvchi'}! 👋
          </p>
          <div className="flex items-center gap-3">
            <NotificationBell userId={profile.id} />
            <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs">
              {(profile.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {profile.full_name?.split(' ')[0]}
            </span>
          </div>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
      <AIChatWidget
        apiRoute="/api/ai/teacher"
        title="EduFlow AI"
        subtitle="Davomat tahlili"
        placeholder="Davomat haqida so'rang..."
        color="from-emerald-500 to-teal-600"
      />
    </div>
  )
}
