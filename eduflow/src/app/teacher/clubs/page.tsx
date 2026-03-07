import TeacherClubs from '@/components/dashboard/teacher/TeacherClubs'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeacherClubsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      enrollments:enrollments(
        id, status, created_at,
        student:profiles!student_id(
          id, full_name,
          student_points(total_points)
        )
      )
    `)
    .eq('teacher_id', profile.id)

  return <TeacherClubs clubs={(clubs || []) as unknown as Record<string, unknown>[]} />
}
