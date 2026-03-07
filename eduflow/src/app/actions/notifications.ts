'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAllNotificationsRead(profileId: string) {
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', profileId)
    .eq('is_read', false)
  revalidatePath('/student')
  return { success: true }
}
