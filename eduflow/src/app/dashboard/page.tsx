import DashboardContent from '@/components/dashboard/admin/DashboardContent'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 30

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!adminProfile) redirect('/login')

  const schoolId = adminProfile.school_id
  const today = new Date().toISOString().split('T')[0]
  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  const thisMonthStr = thisMonthStart.toISOString().split('T')[0]

  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: clubsCount },
    { count: pendingCount },
    { count: todayPresentCount },
    { count: todayAbsentCount },
    { count: thisMonthEnrollments },
    { data: recentApplications },
    { data: recentClubs },
    { data: topStudents },
  ] = await Promise.all([
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId).eq('role', 'student'),
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId).eq('role', 'teacher'),
    supabase.from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabase.from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today).eq('status', 'present'),
    supabase.from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today).eq('status', 'absent'),
    supabase.from('enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonthStr),
    supabase.from('enrollments')
      .select('*, student:profiles!student_id(full_name), club:clubs(name, category)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('clubs')
      .select('*, teacher:profiles!teacher_id(full_name)')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false }).limit(4),
    supabase.from('student_points')
      .select('total_points, student:profiles!student_id(full_name, grade)')
      .order('total_points', { ascending: false }).limit(5),
  ])

  return (
    <DashboardContent
      studentsCount={studentsCount || 0}
      teachersCount={teachersCount || 0}
      clubsCount={clubsCount || 0}
      pendingCount={pendingCount || 0}
      todayPresentCount={todayPresentCount || 0}
      todayAbsentCount={todayAbsentCount || 0}
      thisMonthEnrollments={thisMonthEnrollments || 0}
      recentApplications={recentApplications || []}
      recentClubs={recentClubs || []}
      topStudents={topStudents || []}
      adminName={adminProfile.full_name}
    />
  )
}
