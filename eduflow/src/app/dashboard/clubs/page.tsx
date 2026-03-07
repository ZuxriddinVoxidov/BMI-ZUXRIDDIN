import ClubsManager from '@/components/dashboard/admin/ClubsManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClubsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*, school:schools(*)')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile) redirect('/login')

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, teacher:profiles!teacher_id(full_name, id)')
    .eq('school_id', adminProfile.school_id)
    .order('created_at', { ascending: false })

  // Get enrollment counts
  const clubsWithCounts = await Promise.all(
    (clubs || []).map(async (club) => {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', club.id)
        .eq('status', 'approved')
      return { ...club, enrollment_count: count || 0 }
    })
  )

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', adminProfile.school_id)
    .eq('role', 'teacher')

  return (
    <ClubsManager
      clubs={clubsWithCounts}
      teachers={teachers || []}
      schoolId={adminProfile.school_id}
    />
  )
}
