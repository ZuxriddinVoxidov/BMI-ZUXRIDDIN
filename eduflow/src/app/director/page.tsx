import DirectorDashboardClient from '@/components/dashboard/director/DirectorDashboardClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 60

export default async function DirectorPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*, school:schools(*)').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const schoolId = profile.school_id
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixStr = sixMonthsAgo.toISOString().split('T')[0]

  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: clubsCount },
    { count: pendingCount },
    { data: attendanceData },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
    supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('attendance').select('date, status').gte('date', sixStr),
    supabase.from('enrollments').select('created_at, status, student:profiles!student_id(full_name), club:clubs(name)').order('created_at', { ascending: false }).limit(8),
  ])

  const MONTHS = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const ms = d.toISOString().slice(0, 7)
    const recs = attendanceData?.filter((a: { date: string }) => a.date.startsWith(ms)) || []
    const total = recs.length
    const present = recs.filter((a: { status: string }) => a.status === 'present').length
    return { month: MONTHS[d.getMonth()], keldi: present, kelmadi: total - present }
  })

  const overallPresent = attendanceData?.filter((a: { status: string }) => a.status === 'present').length || 0
  const overallTotal = attendanceData?.length || 0
  const attendanceRate = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  return (
    <DirectorDashboardClient
      studentsCount={studentsCount || 0}
      teachersCount={teachersCount || 0}
      clubsCount={clubsCount || 0}
      pendingCount={pendingCount || 0}
      attendanceRate={attendanceRate}
      monthlyData={monthlyData}
      recentActivity={(recentActivity || []) as unknown as Array<{ created_at: string; status: string; student: { full_name: string } | null; club: { name: string } | null }>}
      schoolName={profile.school?.name || ''}
    />
  )
}
