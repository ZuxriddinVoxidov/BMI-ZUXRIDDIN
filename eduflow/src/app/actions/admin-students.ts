'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStudentInfo(data: {
  profile_id: string
  full_name: string
  parent_name: string
  parent_telegram_id: string
  grade?: string
}) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      parent_name: data.parent_name,
      parent_telegram_id: data.parent_telegram_id || null,
      grade: data.grade || null,
    })
    .eq('id', data.profile_id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockStudent(profileId: string, block: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}
