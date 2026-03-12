'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateDirectorInfo(
  directorId: string,
  userId: string,
  data: {
    full_name: string
    phone?: string
    email?: string
    new_password?: string
  }
) {
  const supabase = createAdminClient()

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

  // Update Supabase Auth password and/or email
  if (data.new_password || data.email) {
    const authUpdate: Record<string, string> = {}
    if (data.new_password && data.new_password.length >= 6) authUpdate.password = data.new_password
    if (data.email) authUpdate.email = data.email
    if (Object.keys(authUpdate).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdate)
      if (authError) console.error('Auth update failed:', authError.message)
    }
  }

  revalidatePath('/dashboard/directors')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockDirector(directorId: string, block: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', directorId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/directors')
  revalidatePath('/dashboard')
  return { success: true }
}
