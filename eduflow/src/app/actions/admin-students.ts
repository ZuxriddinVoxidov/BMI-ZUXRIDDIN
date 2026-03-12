'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateStudentInfo(data: {
  profile_id: string
  user_id?: string
  full_name: string
  parent_name: string
  parent_telegram_id: string
  grade?: string
  email?: string
  new_password?: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      parent_name: data.parent_name,
      parent_telegram_id: data.parent_telegram_id || null,
      grade: data.grade || null,
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

  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockStudent(profileId: string, block: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteStudent(studentId: string, userId: string) {
  try {
    const supabase = createAdminClient()

    // Delete all related records first (FK constraints)
    await supabase.from('teacher_rewards').delete().eq('student_id', studentId)
    await supabase.from('attendance').delete().eq('student_id', studentId)
    await supabase.from('enrollments').delete().eq('student_id', studentId)
    await supabase.from('notifications').delete().eq('user_id', studentId)
    await supabase.from('reviews').delete().eq('student_id', studentId)

    // Now delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentId)

    if (error) {
      console.error('Delete profile error:', error.message)
      return { success: false, error: error.message }
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('deleteStudent crash:', err)
    return { success: false, error: String(err) }
  }
}
