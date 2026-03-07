'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveApplication(
  enrollmentId: string,
  studentId: string,
  clubName: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('enrollments')
    .update({ status: 'approved' })
    .eq('id', enrollmentId)

  if (error) return { success: false, error: error.message }

  // Notify student
  await supabase.from('notifications').insert({
    user_id: studentId,
    message: `✅ "${clubName}" to'garagiga arizangiz tasdiqlandi! Tabriklaymiz!`,
    is_read: false,
  })

  // Add 5 bonus points
  await supabase.rpc('add_student_points', {
    p_student_id: studentId,
    p_points: 5,
  })

  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  revalidatePath('/student')
  return { success: true }
}

export async function rejectApplication(
  enrollmentId: string,
  studentId: string,
  clubName: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('enrollments')
    .update({ status: 'rejected' })
    .eq('id', enrollmentId)

  if (error) return { success: false, error: error.message }

  await supabase.from('notifications').insert({
    user_id: studentId,
    message: `❌ "${clubName}" to'garagiga arizangiz rad etildi.`,
    is_read: false,
  })

  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  return { success: true }
}
