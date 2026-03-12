'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function applyToClub(clubId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil topilmadi' }

  // Check if already enrolled
  const { data: existing } = await admin
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
    await admin.from('enrollments').delete().eq('id', existing.id)
  }

  const { error } = await admin.from('enrollments').insert({
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
  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  revalidatePath('/teacher')
  revalidatePath('/director')
  return { success: true }
}

export async function cancelApplication(enrollmentId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/student/clubs')
  revalidatePath('/student/explore')
  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard')
  revalidatePath('/teacher')
  revalidatePath('/director')
  return { success: true }
}
