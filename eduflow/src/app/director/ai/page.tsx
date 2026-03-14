import AIChatPage from '@/components/ai/AIChatPage'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DirectorAIPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'director') redirect('/login')

  return (
    <AIChatPage
      userId={profile.id}
      userRole="director"
      userName={profile.full_name || 'Direktor'}
      apiRoute="/api/ai/director"
    />
  )
}
