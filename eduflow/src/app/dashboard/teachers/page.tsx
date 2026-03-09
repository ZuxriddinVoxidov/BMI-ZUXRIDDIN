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

  // Get emails from auth — we'll match by user_id
  // Since we can't access auth.users from client, 
  // we fetch email from the auth session or store it
  // For now teachers already have email in profile if set

  return (
    <TeachersManager
      teachers={teachers || []}
      schoolId={adminProfile.school_id}
    />
  )
}
