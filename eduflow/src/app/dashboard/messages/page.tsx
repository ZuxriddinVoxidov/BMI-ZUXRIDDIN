import MessagesManager from '@/components/dashboard/admin/MessagesManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 60

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: messages } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  return <MessagesManager messages={messages || []} />
}
