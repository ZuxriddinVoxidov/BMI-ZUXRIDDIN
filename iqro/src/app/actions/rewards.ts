'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function giveReward(
  studentId: string,
  clubId: string,
  lessonDate: string
) {
  const supabase = createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Tizimga kiring' }

  const { data: teacher } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!teacher) return { success: false, error: "O'qituvchi topilmadi" }

  // Check if already rewarded this student today
  const { data: existing } = await admin
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
  const { count } = await admin
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
  const { error: rewardError } = await admin
    .from('teacher_rewards')
    .insert({
      teacher_id: teacher.id,
      student_id: studentId,
      club_id: clubId,
      lesson_date: lessonDate,
      points_given: 3,
    })

  if (rewardError) {
    return { success: false, error: rewardError.message }
  }

  // Add points to student
  await admin.rpc('add_student_points', {
    p_student_id: studentId,
    p_points: 3,
  })

  revalidatePath('/teacher/attendance')
  revalidatePath('/student')
  revalidatePath('/student/profile')
  revalidatePath('/director')
  return { success: true }
}

export async function rewardStudentWork(workId: string, studentId: string) {
  const supabase = createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Tizimga kiring' }

  // Check if work is already rewarded
  const { data: work } = await admin
    .from('student_works')
    .select('is_rewarded, club_id')
    .eq('id', workId)
    .single()

  if (!work) return { success: false, error: 'Ish topilmadi' }
  if (work.is_rewarded) return { success: false, error: 'Bu ish allaqachon baholangan' }

  // Update work
  const { error: updateError } = await admin
    .from('student_works')
    .update({ is_rewarded: true })
    .eq('id', workId)

  if (updateError) return { success: false, error: updateError.message }

  // Add 5 points
  await admin.rpc('add_student_points', {
    p_student_id: studentId,
    p_points: 5,
  })

  // Save to teacher_rewards to show in "So'nggi rag'batlar"
  const { data: teacher } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (teacher && work.club_id) {
    await admin.from('teacher_rewards').insert({
      teacher_id: teacher.id,
      student_id: studentId,
      club_id: work.club_id,
      lesson_date: new Date().toISOString().split('T')[0],
      points_given: 5,
    })
  }

  revalidatePath('/teacher/students')
  revalidatePath('/student/works')
  revalidatePath('/student/profile')
  revalidatePath('/director')
  return { success: true }
}
