import AdminProfileClient from '@/components/dashboard/admin/AdminProfileClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(*)')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get email via RPC
  const { data: emailData } = await supabase.rpc('get_user_emails', { user_ids: [profile.user_id] })
  const email = emailData?.[0]?.email || '—'

  return (
    <div className="space-y-6">
      <AdminProfileClient profile={{ ...profile, role: 'teacher' }} email={email} />
    </div>
  )
}
