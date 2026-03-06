'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToClub(clubId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil topilmadi' }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('student_id', profile.id)
    .eq('club_id', clubId)
    .single()

  if (existing && existing.status !== 'rejected') {
    return { success: false, error: 'Siz allaqachon ariza yuborgansiz' }
  }

  // If was rejected, delete old and create new
  if (existing && existing.status === 'rejected') {
    await supabase.from('enrollments').delete().eq('id', existing.id)
  }

  const { error } = await supabase.from('enrollments').insert({
    student_id: profile.id,
    club_id: clubId,
    status: 'pending',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/student/explore')
  revalidatePath('/student/clubs')
  revalidatePath('/student')
  return { success: true }
}
