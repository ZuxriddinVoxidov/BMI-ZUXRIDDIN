'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function giveReward(
  studentId: string,
  clubId: string,
  lessonDate: string
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Tizimga kiring' }

  const { data: teacher } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) return { success: false, error: "O'qituvchi topilmadi" }

  // Check if already rewarded this student today
  const { data: existing } = await supabase
    .from('teacher_rewards')
    .select('id')
    .eq('teacher_id', teacher.id)
    .eq('student_id', studentId)
    .eq('club_id', clubId)
    .eq('lesson_date', lessonDate)
    .single()

  if (existing) {
    return {
      success: false,
      error: "Bu o'quvchiga bugun allaqachon rag'bat berilgan",
    }
  }

  // Check 7 reward limit
  const { count } = await supabase
    .from('teacher_rewards')
    .select('id', { count: 'exact' })
    .eq('teacher_id', teacher.id)
    .eq('club_id', clubId)
    .eq('lesson_date', lessonDate)

  if ((count || 0) >= 7) {
    return {
      success: false,
      error: "Bugun uchun rag'bat limiti tugagan (7/7)",
    }
  }

  // Insert reward
  const { error: rewardError } = await supabase
    .from('teacher_rewards')
    .insert({
      teacher_id: teacher.id,
      student_id: studentId,
      club_id: clubId,
      lesson_date: lessonDate,
      points_given: 10,
    })

  if (rewardError) {
    return { success: false, error: rewardError.message }
  }

  // Add points to student
  await supabase.rpc('add_student_points', {
    p_student_id: studentId,
    p_points: 10,
  })

  revalidatePath('/teacher/attendance')
  revalidatePath('/student')
  return { success: true }
}
