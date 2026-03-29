import DashboardContent from '@/components/dashboard/admin/DashboardContent'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
  ])

  // Fetch top students (single join query)
  const { data: topStudents } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      grade,
      student_points!inner(total_points)
    `)
    .eq('role', 'student')
    .eq('school_id', schoolId)
    .order('student_points(total_points)', {
      ascending: false
    })
    .limit(5)

  const topStudentsFormatted = (topStudents || []).map(s => ({
    student_id: s.id,
    full_name: s.full_name,
    grade: s.grade,
    total_points: (s.student_points as any)?.total_points ?? 0,
  }))

  const daysUz = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba']
  
  // Calculate days passed in current week (Monday = 0 ... Sunday = 6)
  const now = new Date()
  const todayDayIndex = now.getDay()
  const diffToMonday = todayDayIndex === 0 ? 6 : todayDayIndex - 1
  
  const mondayOfThisWeek = new Date(now)
  mondayOfThisWeek.setDate(now.getDate() - diffToMonday)
  
  const daysToCheck = []
  for (let i = 0; i <= diffToMonday; i++) {
    const d = new Date(mondayOfThisWeek)
    d.setDate(mondayOfThisWeek.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayNameUz = daysUz[d.getDay()]
    daysToCheck.push({ dateStr, dayNameUz })
  }

  const { data: allClubs } = await supabase.from('clubs').select('id, name, schedule, teacher:profiles!teacher_id(full_name)').eq('school_id', schoolId)
  
  const weekDates = daysToCheck.map(d => d.dateStr)
  const { data: weekAttendances } = await supabase.from('attendance').select('club_id, date').in('date', weekDates)
  
  const missedAttendanceClubs = []
  
  for (const { dateStr, dayNameUz } of daysToCheck) {
    const clubsForDay = (allClubs || []).filter(c => c.schedule?.toLowerCase().includes(dayNameUz))
    const attendanceForDay = new Set((weekAttendances || []).filter(a => a.date === dateStr).map(a => a.club_id))
    
    for (const c of clubsForDay) {
      if (!attendanceForDay.has(c.id)) {
        missedAttendanceClubs.push({
          id: `${c.id}_${dateStr}`, // Unique identifier for localStorage and key
          name: c.name,
          schedule: c.schedule,
          teacher_name: (c.teacher as unknown as { full_name: string })?.full_name || 'Noma\'lum',
          missed_date: dateStr,
          day_name: dayNameUz.charAt(0).toUpperCase() + dayNameUz.slice(1) // E.g., Dushanba
        })
      }
    }
  }

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
      topStudents={topStudentsFormatted}
      adminName={adminProfile.full_name}
      missedAttendanceClubs={missedAttendanceClubs}
    />
  )
}
