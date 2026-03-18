export const dynamic = 'force-dynamic'
import MyClubsWithReview from '@/components/dashboard/student/MyClubsWithReview'
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
      id,
      club_id,
      clubs(
        id, name, schedule, room, emoji,
        profiles!teacher_id(full_name)
      )
    `)
    .eq('student_id', profile.id)
    .eq('status', 'approved')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening To&apos;garaklarim</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MyClubsWithReview enrollments={(enrollments as any) || []} />
    </div>
  )
}
