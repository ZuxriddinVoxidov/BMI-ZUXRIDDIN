import StudentClubs from '@/components/dashboard/student/StudentClubs'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentClubsPage() {
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
      *,
      club:clubs(
        *,
        teacher:profiles!teacher_id(full_name)
      )
    `)
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })

  // Fetch existing reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('club_id, rating, comment')
    .eq('student_id', profile.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening To&apos;garaklarim</h1>
      <StudentClubs
        enrollments={(enrollments || []) as Record<string, unknown>[]}
        existingReviews={(reviews || []) as Record<string, unknown>[]}
      />
    </div>
  )
}
