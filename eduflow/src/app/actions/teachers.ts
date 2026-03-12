'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addTeacher(data: {
  full_name: string
  email: string
  password: string
  school_id: string
}) {
  const supabase = createAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: 'teacher',
    },
  })

  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: "Foydalanuvchi yaratilmadi" }

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
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTeacherInfo(data: {
  profile_id: string
  user_id?: string
  full_name: string
  phone?: string
  teacher_bio?: string
  email?: string
  new_password?: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      teacher_bio: data.teacher_bio || null,
      ...(data.new_password && { plain_password: data.new_password }),
    })
    .eq('id', data.profile_id)

  if (error) return { success: false, error: error.message }

  // Update Supabase Auth password and/or email
  if (data.user_id && (data.new_password || data.email)) {
    const authUpdate: Record<string, string> = {}
    if (data.new_password && data.new_password.length >= 6) authUpdate.password = data.new_password
    if (data.email) authUpdate.email = data.email
    if (Object.keys(authUpdate).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(data.user_id, authUpdate)
      if (authError) console.error('Auth update failed:', authError.message)
    }
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTeacher(teacherId: string, userId: string) {
  try {
    const supabase = createAdminClient()

    // Delete all related records first (FK constraints)
    await supabase.from('teacher_rewards').delete().eq('teacher_id', teacherId)
    await supabase.from('notifications').delete().eq('user_id', teacherId)

    // Now delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', teacherId)

    if (error) {
      console.error('Delete teacher profile error:', error.message)
      return { success: false, error: error.message }
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard/teachers')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('deleteTeacher crash:', err)
    return { success: false, error: String(err) }
  }
}
