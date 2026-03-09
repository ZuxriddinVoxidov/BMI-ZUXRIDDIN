'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateParentTelegram(data: {
  parent_name: string
  parent_telegram_id: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({
      parent_name: data.parent_name,
      parent_telegram_id: data.parent_telegram_id,
    })
    .eq('id', profile!.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/student/profile')
  return { success: true }
}

export async function updateStudentGrade(grade: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ grade })
    .eq('id', profile!.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/student/profile')
  revalidatePath('/student/explore')
  revalidatePath('/student')
  return { success: true }
}

export async function updateAdminProfile(data: {
  full_name: string
  phone?: string
  new_password?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      ...(data.new_password && { plain_password: data.new_password }),
    })
    .eq('user_id', user.id)

  if (data.new_password) {
    await supabase.auth.updateUser({ password: data.new_password })
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
