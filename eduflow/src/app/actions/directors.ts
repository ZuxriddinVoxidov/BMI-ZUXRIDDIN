'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDirectorInfo(
  directorId: string,
  userId: string,
  data: {
    full_name: string
    phone?: string
    new_password?: string
  }
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {
    full_name: data.full_name,
    phone: data.phone || null,
  }
  if (data.new_password) {
    updateData.plain_password = data.new_password
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', directorId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/directors')
  return { success: true }
}

export async function toggleBlockDirector(
  directorId: string,
  block: boolean
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', directorId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/directors')
  return { success: true }
}
