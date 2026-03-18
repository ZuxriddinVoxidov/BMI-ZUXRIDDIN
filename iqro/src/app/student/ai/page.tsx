import AIChatPage from '@/components/ai/AIChatPage'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentAIPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/login')

  return (
    <AIChatPage
      userId={profile.id}
      userRole="student"
      userName={profile.full_name || "O'quvchi"}
      apiRoute="/api/ai/student"
    />
  )
}
