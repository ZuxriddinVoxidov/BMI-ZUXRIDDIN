import DashboardContent from '@/components/dashboard/admin/DashboardContent'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile) redirect('/login')

  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: clubsCount },
    { count: pendingCount },
    { data: recentApplications },
    { data: recentClubs },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id)
      .eq('role', 'student'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id)
      .eq('role', 'teacher'),
    supabase
      .from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id),
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('enrollments')
      .select(
        '*, student:profiles!student_id(full_name), club:clubs(name, category)'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('clubs')
      .select('*, teacher:profiles!teacher_id(full_name)')
      .eq('school_id', adminProfile.school_id)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  return (
    <DashboardContent
      studentsCount={studentsCount || 0}
      teachersCount={teachersCount || 0}
      clubsCount={clubsCount || 0}
      pendingCount={pendingCount || 0}
      recentApplications={recentApplications || []}
      recentClubs={recentClubs || []}
      adminName={adminProfile.full_name}
    />
  )
}
