export const dynamic = 'force-dynamic'
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
          id, full_name, avatar_url,
          student_points(total_points)
        )
      ),
      resources:teacher_resources(
        id, title, file_url, file_name, file_size, created_at
      )
    `)
    .eq('teacher_id', profile.id)

  const { data: messages } = await supabase
    .from('club_messages')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, role, avatar_url),
      receiver:profiles!receiver_id(id, full_name, role, avatar_url)
    `)
    .or(`receiver_id.eq.${profile.id},sender_id.eq.${profile.id}`)
    .order('created_at', { ascending: true })

  const clubsWithMessages = clubs?.map(club => {
    return {
      ...club,
      club_messages: messages?.filter(m => m.club_id === club.id) || []
    }
  }) || []

  return <TeacherClubs clubs={clubsWithMessages as unknown as Record<string, unknown>[]} />
}
