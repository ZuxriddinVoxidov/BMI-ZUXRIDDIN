import DirectorsManager from '@/components/dashboard/admin/DirectorsManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 60

export default async function DirectorsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['super_admin', 'school_admin'].includes(profile.role)) {
    redirect('/login')
  }

  const { data: directors } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'director')
    .order('full_name')

  // Get emails via RPC if available
  const directorIds = directors?.map(d => d.user_id) || []
  let emailMap: Record<string, string> = {}
  if (directorIds.length > 0) {
    try {
      const { data: emailData } = await supabase
        .rpc('get_user_emails', { user_ids: directorIds })
      if (emailData) {
        emailMap = Object.fromEntries(
          emailData.map((e: { user_id: string; email: string }) => [e.user_id, e.email])
        )
      }
    } catch {
      // RPC might not exist, skip
    }
  }

  const directorsWithEmail = directors?.map(d => ({
    ...d,
    email: emailMap[d.user_id] || '—'
  })) || []

  return <DirectorsManager directors={directorsWithEmail} />
}
