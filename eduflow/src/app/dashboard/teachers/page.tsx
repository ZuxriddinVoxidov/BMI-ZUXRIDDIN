import TeachersManager from '@/components/dashboard/admin/TeachersManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TeachersPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile) redirect('/login')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('*, clubs:clubs(id, name)')
    .eq('school_id', adminProfile.school_id)
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  // Fetch emails from auth.users via DB function
  const userIds = teachers?.map(t => t.user_id).filter(Boolean) || []
  const { data: emailData } = userIds.length > 0
    ? await supabase.rpc('get_user_emails', { user_ids: userIds })
    : { data: [] }

  const teachersWithEmail = teachers?.map(t => ({
    ...t,
    email: emailData?.find((e: { user_id: string; email: string }) => e.user_id === t.user_id)?.email || '—'
  })) || []

  return (
    <TeachersManager
      teachers={teachersWithEmail}
      schoolId={adminProfile.school_id}
    />
  )
}
