import StudentHeader from '@/components/dashboard/student/StudentHeader'
import StudentSidebar from '@/components/dashboard/student/StudentSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const fullName =
    profile?.full_name || user.user_metadata?.full_name || "O'quvchi"

  // Fetch points for sidebar level display
  const { data: pointsData } = await supabase
    .from('student_points')
    .select('total_points')
    .eq('student_id', profile?.id)
    .single()

  const points = pointsData?.total_points || 0

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, message, is_read, created_at')
    .eq('user_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const unreadCount = (notifications || []).filter((n: Record<string, unknown>) => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50/50">
      <StudentSidebar fullName={fullName} points={points} />
      <div className="ml-[250px] transition-all duration-300">
        <StudentHeader
          fullName={fullName}
          profileId={profile?.id || ''}
          notifications={(notifications || []) as { id: string; message: string; is_read: boolean; created_at: string }[]}
          unreadCount={unreadCount}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
