import TeacherHome from '@/components/dashboard/teacher/TeacherHome'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: myClubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('teacher_id', profile.id)

  const myClubIds = myClubs?.map(c => c.id) || []

  // Count approved enrollments per club
  let enrollmentCounts: Record<string, number> = {}
  if (myClubIds.length > 0) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('club_id')
      .in('club_id', myClubIds)
      .eq('status', 'approved')
    enrollments?.forEach(e => {
      enrollmentCounts[e.club_id] = (enrollmentCounts[e.club_id] || 0) + 1
    })
  }

  // Attach counts to clubs
  const clubsWithCounts = (myClubs || []).map(c => ({
    ...c,
    studentCount: enrollmentCounts[c.id] || 0,
  }))

  const today = new Date().toISOString().split('T')[0]
  let todayPresentCount = 0
  if (myClubIds.length > 0) {
    const { count } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .in('club_id', myClubIds)
      .eq('date', today)
      .eq('status', 'present')
    todayPresentCount = count || 0
  }

  let totalRewards = 0
  if (myClubIds.length > 0) {
    const { count } = await supabase
      .from('teacher_rewards')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', profile.id)
    totalRewards = count || 0
  }

  const { data: recentRewards } = await supabase
    .from('teacher_rewards')
    .select('*, student:profiles!student_id(full_name), club:clubs(name)')
    .eq('teacher_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalStudents = clubsWithCounts.reduce((sum, c) => sum + c.studentCount, 0)

  return (
    <TeacherHome
      teacherName={profile.full_name}
      clubs={clubsWithCounts}
      totalStudents={totalStudents}
      todayPresent={todayPresentCount}
      totalRewards={totalRewards}
      recentRewards={recentRewards || []}
    />
  )
}
