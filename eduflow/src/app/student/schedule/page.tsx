import WeeklySchedule from '@/components/dashboard/student/WeeklySchedule'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentSchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      club:clubs(
        id, name, schedule, room, category,
        teacher:profiles!teacher_id(full_name)
      )
    `)
    .eq('student_id', profile.id)
    .eq('status', 'approved')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Haftalik Jadval</h1>
      <WeeklySchedule enrollments={(enrollments || []) as Record<string, unknown>[]} />
    </div>
  )
}
