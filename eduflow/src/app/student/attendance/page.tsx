import AttendanceReport from '@/components/dashboard/student/AttendanceReport'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentAttendancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('*, club:clubs(name, category)')
    .eq('student_id', profile.id)
    .gte('date', threeMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Davomat Hisoboti</h1>
      <AttendanceReport records={(attendanceRecords || []) as Record<string, unknown>[]} />
    </div>
  )
}
