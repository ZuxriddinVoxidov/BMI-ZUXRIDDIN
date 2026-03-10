import TeacherReports from '@/components/dashboard/teacher/TeacherReports'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: myClubs } = await supabase
    .from('clubs').select('id, name').eq('teacher_id', profile.id)
  const myClubIds = myClubs?.map(c => c.id) || []

  if (myClubIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">📊</span>
        <h3 className="text-lg font-bold text-gray-900">Hisobot uchun ma&apos;lumot yo&apos;q</h3>
        <p className="text-sm text-gray-500 mt-1">Sizga to&apos;garak biriktirilgach hisobotlar chiqadi</p>
      </div>
    )
  }

  // Get attendance data from last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('date, status, student_id, club_id')
    .in('club_id', myClubIds)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student:profiles!student_id(id, full_name), club:clubs(name)')
    .in('club_id', myClubIds)
    .eq('status', 'approved')

  return (
    <TeacherReports
      attendanceData={attendanceData || []}
      enrollments={(enrollments || []) as unknown as { student: Record<string, unknown>; club: Record<string, unknown> }[]}
      clubs={myClubs || []}
    />
  )
}
