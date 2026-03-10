'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTeacher(data: {
  full_name: string
  email: string
  password: string
  school_id: string
}) {
  const supabase = createClient()

  // Check if email already exists (signUp will handle duplicate emails)  // Use signUp to create the auth user (works with anon key)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        role: 'teacher',
      },
    },
  })

  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: "Foydalanuvchi yaratilmadi" }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: 'teacher',
      full_name: data.full_name,
      school_id: data.school_id,
      plain_password: data.password,
    })
    .eq('user_id', authData.user.id)

  if (profileError) {
    // If profile doesn't exist yet (trigger might not have fired), insert it
    await supabase.from('profiles').insert({
      user_id: authData.user.id,
      role: 'teacher',
      full_name: data.full_name,
      school_id: data.school_id,
      plain_password: data.password,
    })
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockTeacher(profileId: string, block: boolean) {
  const supabase = createClient()
  await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  revalidatePath('/dashboard/teachers')
  return { success: true }
}

export async function deleteTeacher(profileId: string) {
  const supabase = createClient()
  await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId)

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}
