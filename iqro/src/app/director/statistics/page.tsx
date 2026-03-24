import StatisticsClient from '@/components/dashboard/admin/StatisticsClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DirectorStatisticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const schoolId = profile.school_id
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixStr = sixMonthsAgo.toISOString().split('T')[0]

  const [
    { count: studentsCount },
    { count: teachersCount },
    { count: clubsCount },
    { data: monthlyUsers },
    { data: clubsByCategory },
    { data: attendanceData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
    supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('profiles').select('created_at').eq('school_id', schoolId).gte('created_at', sixStr).order('created_at'),
    supabase.from('clubs').select('category').eq('school_id', schoolId),
    supabase.from('attendance').select('date, status').gte('date', sixStr).order('date'),
  ])

  const MONTHS = ['Yan','Feb','Mar','Apr','May','Iyn','Iyl','Avg','Sen','Okt','Noy','Dek']

  const userGrowthData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const ms = d.toISOString().slice(0, 7)
    return { month: MONTHS[d.getMonth()], count: monthlyUsers?.filter((u: { created_at: string }) => u.created_at.startsWith(ms)).length || 0 }
  })

  const catMap: Record<string, number> = {}
  clubsByCategory?.forEach((c: { category: string }) => { catMap[c.category || 'Boshqa'] = (catMap[c.category || 'Boshqa'] || 0) + 1 })
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }))

  const attendanceChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const ms = d.toISOString().slice(0, 7)
    const recs = attendanceData?.filter((a: { date: string }) => a.date.startsWith(ms)) || []
    const total = recs.length
    const present = recs.filter((a: { status: string }) => a.status === 'present').length
    return { month: MONTHS[d.getMonth()], keldi: present, kelmadi: total - present, rate: total > 0 ? Math.round((present / total) * 100) : 0 }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">📈 Statistika</h1>
      <StatisticsClient
        studentsCount={studentsCount || 0} teachersCount={teachersCount || 0} clubsCount={clubsCount || 0}
        userGrowthData={userGrowthData} categoryData={categoryData} attendanceChartData={attendanceChartData}
      />
    </div>
  )
}
