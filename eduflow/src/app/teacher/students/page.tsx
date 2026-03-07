import TeacherStudents from '@/components/dashboard/teacher/TeacherStudents'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherStudentsPage() {
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
        <span className="text-5xl mb-4">👨‍🎓</span>
        <h3 className="text-lg font-bold text-gray-900">O&apos;quvchilar yo&apos;q</h3>
        <p className="text-sm text-gray-500 mt-1">Sizga to&apos;garak biriktirilgach o&apos;quvchilar ko&apos;rinadi</p>
      </div>
    )
  }

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('student:profiles!student_id(id, full_name, student_points(total_points)), club:clubs(name)')
    .in('club_id', myClubIds)
    .eq('status', 'approved')

  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('student_id, status')
    .in('club_id', myClubIds)

  return <TeacherStudents enrollments={(enrollments || []) as unknown as { student: Record<string, unknown>; club: Record<string, unknown> }[]} attendanceData={attendanceData || []} />
}
