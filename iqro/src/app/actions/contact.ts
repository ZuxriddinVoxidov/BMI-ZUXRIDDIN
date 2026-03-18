'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function sendContactMessage(data: {
  full_name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('contact_messages').insert(data)
  if (error) return { success: false, error: error.message }

  // Notify all admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['school_admin', 'super_admin'])

  if (admins && admins.length > 0) {
    await supabase.from('notifications').insert(
      admins.map(admin => ({
        user_id: admin.id,
        message: `📬 Yangi xabar: ${data.full_name} — "${data.subject}"`,
        is_read: false,
      }))
    )
  }

  revalidatePath('/dashboard/messages')
  return { success: true }
}

export async function markMessageRead(messageId: string) {
  const supabase = createAdminClient()
  await supabase.from('contact_messages').update({ is_read: true }).eq('id', messageId)
  revalidatePath('/dashboard/messages')
  return { success: true }
}

export async function markMessageReplied(messageId: string) {
  const supabase = createAdminClient()
  await supabase.from('contact_messages').update({ is_read: true, is_replied: true }).eq('id', messageId)
  revalidatePath('/dashboard/messages')
  return { success: true }
}
