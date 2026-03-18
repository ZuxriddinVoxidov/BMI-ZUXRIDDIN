'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function markAllNotificationsRead(profileId: string) {
  const supabase = createAdminClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profileId)
    .eq('is_read', false)
  revalidatePath('/student')
  revalidatePath('/dashboard')
  return { success: true }
}
