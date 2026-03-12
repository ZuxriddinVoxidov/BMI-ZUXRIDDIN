export const dynamic = 'force-dynamic'
import StatisticsClient from '@/components/dashboard/admin/StatisticsClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StatisticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile) redirect('/login')

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixMonthsStr = sixMonthsAgo.toISOString().split('T')[0]

  const [
    { data: monthlyUsers },
    { data: clubsByCategory },
    { data: attendanceData },
    { count: totalStudents },
    { count: totalTeachers },
    { count: totalClubs },
  ] = await Promise.all([
    supabase.from('profiles').select('created_at, role')
      .eq('school_id', adminProfile.school_id)
      .gte('created_at', sixMonthsStr)
      .order('created_at', { ascending: true }),
    supabase.from('clubs').select('category')
      .eq('school_id', adminProfile.school_id),
    supabase.from('attendance').select('date, status')
      .gte('date', sixMonthsStr)
      .order('date', { ascending: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id).eq('role', 'teacher'),
    supabase.from('clubs').select('*', { count: 'exact', head: true })
      .eq('school_id', adminProfile.school_id),
  ])

  const MONTH_NAMES = ['Yan', 'Feb', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

  const userGrowthData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthStr = d.toISOString().slice(0, 7)
    const count = monthlyUsers?.filter(u => u.created_at.startsWith(monthStr)).length || 0
    return { month: MONTH_NAMES[d.getMonth()], count }
  })

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const categoryMap: Record<string, number> = {}
  clubsByCategory?.forEach(c => { categoryMap[c.category] = (categoryMap[c.category] || 0) + 1 })
  const categoryData = Object.entries(categoryMap).map(([name, value], i) => ({
    name, value, color: COLORS[i % COLORS.length]
  }))

  const attendanceChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthStr = d.toISOString().slice(0, 7)
    const records = attendanceData?.filter(a => a.date.startsWith(monthStr)) || []
    const total = records.length
    const present = records.filter(a => a.status === 'present').length
    return {
      month: MONTH_NAMES[d.getMonth()],
      keldi: present,
      kelmadi: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  })

  return (
    <StatisticsClient
      userGrowthData={userGrowthData}
      categoryData={categoryData}
      attendanceChartData={attendanceChartData}
      totalStudents={totalStudents || 0}
      totalTeachers={totalTeachers || 0}
      totalClubs={totalClubs || 0}
    />
  )
}
