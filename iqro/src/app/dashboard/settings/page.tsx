export const dynamic = 'force-dynamic'
import AdminProfileClient from '@/components/dashboard/admin/AdminProfileClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: emailData }] = await Promise.all([
    supabase.from('profiles').select('*, school:schools(*)').eq('user_id', user.id).single(),
    supabase.rpc('get_user_emails', { user_ids: [user.id] }),
  ])

  if (!profile) redirect('/login')

  const email = emailData?.[0]?.email || user.email || '—'

  return <AdminProfileClient profile={profile} email={email} />
}
