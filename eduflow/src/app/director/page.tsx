import DirectorDashboard from '@/components/dashboard/director/DirectorDashboard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DirectorHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: clubsCount },
    { data: attendanceData },
    { data: teachers },
    { data: clubs },
    { data: topStudents },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'student'),

    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher'),

    supabase.from('clubs')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', profile.school_id),

    supabase.from('attendance')
      .select('date, status, club_id')
      .gte('date', sixMonthsAgo.toISOString().split('T')[0]),

    supabase.from('profiles')
      .select('id, full_name')
      .eq('school_id', profile.school_id)
      .eq('role', 'teacher'),

    supabase.from('clubs')
      .select('id, name, category, max_students')
      .eq('school_id', profile.school_id),

    supabase.from('student_points')
      .select('total_points, student:profiles!student_id(full_name)')
      .order('total_points', { ascending: false })
      .limit(5),

    supabase.from('enrollments')
      .select('*, student:profiles!student_id(full_name), club:clubs(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Calculate attendance rate
  const totalAtt = (attendanceData || []).length
  const presentAtt = (attendanceData || []).filter((a: Record<string, unknown>) => a.status === 'present').length
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

  // Monthly attendance chart
  const monthlyAtt: Record<string, { total: number; present: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyAtt[key] = { total: 0, present: 0 }
  }
  for (const a of (attendanceData || []) as Record<string, unknown>[]) {
    const key = (a.date as string)?.substring(0, 7)
    if (monthlyAtt[key]) {
      monthlyAtt[key].total++
      if (a.status === 'present') monthlyAtt[key].present++
    }
  }

  // Category counts
  const catCounts: Record<string, number> = {}
  for (const c of (clubs || []) as Record<string, unknown>[]) {
    const cat = (c.category as string) || 'Boshqa'
    catCounts[cat] = (catCounts[cat] || 0) + 1
  }

  // Enrollment counts per club
  const { data: enrollmentCounts } = await supabase
    .from('enrollments')
    .select('club_id')
    .eq('status', 'approved')

  const clubEnrollCounts: Record<string, number> = {}
  for (const e of (enrollmentCounts || []) as Record<string, unknown>[]) {
    const cid = e.club_id as string
    clubEnrollCounts[cid] = (clubEnrollCounts[cid] || 0) + 1
  }

  // Teacher clubs count
  const { data: teacherClubs } = await supabase
    .from('clubs')
    .select('teacher_id')
    .eq('school_id', profile.school_id)

  const teacherClubCounts: Record<string, number> = {}
  for (const tc of (teacherClubs || []) as Record<string, unknown>[]) {
    const tid = tc.teacher_id as string
    teacherClubCounts[tid] = (teacherClubCounts[tid] || 0) + 1
  }

  // Teacher rewards count
  const { data: teacherRewards } = await supabase
    .from('teacher_rewards')
    .select('teacher_id')

  const teacherRewardCounts: Record<string, number> = {}
  for (const tr of (teacherRewards || []) as Record<string, unknown>[]) {
    const tid = tr.teacher_id as string
    teacherRewardCounts[tid] = (teacherRewardCounts[tid] || 0) + 1
  }

  const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  const chartData = Object.entries(monthlyAtt).map(([key, val]) => {
    const m = parseInt(key.split('-')[1]) - 1
    return {
      name: monthNames[m],
      davomat: val.total > 0 ? Math.round((val.present / val.total) * 100) : 0,
    }
  })

  const categoryData = Object.entries(catCounts).map(([name, count]) => ({ name, count }))

  const teacherData = ((teachers || []) as Record<string, unknown>[]).map(t => ({
    id: t.id as string,
    name: t.full_name as string,
    clubs: teacherClubCounts[t.id as string] || 0,
    rewards: teacherRewardCounts[t.id as string] || 0,
  }))

  const topStudentsData = ((topStudents || []) as Record<string, unknown>[]).map(s => ({
    name: ((s.student as Record<string, unknown>)?.full_name as string) || 'Noma\'lum',
    points: (s.total_points as number) || 0,
  }))

  const activityData = ((recentEnrollments || []) as Record<string, unknown>[]).map(e => ({
    student: ((e.student as Record<string, unknown>)?.full_name as string) || '',
    club: ((e.club as Record<string, unknown>)?.name as string) || '',
    status: e.status as string,
    date: e.created_at as string,
  }))

  return (
    <DirectorDashboard
      studentsCount={studentsCount || 0}
      teachersCount={teachersCount || 0}
      clubsCount={clubsCount || 0}
      attendanceRate={attendanceRate}
      chartData={chartData}
      categoryData={categoryData}
      teacherData={teacherData}
      topStudents={topStudentsData}
      activityData={activityData}
    />
  )
}
