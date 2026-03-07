'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(data: {
  club_id: string
  rating: number
  comment: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil topilmadi' }

  const { error } = await supabase
    .from('reviews')
    .upsert({
      student_id: profile.id,
      club_id: data.club_id,
      rating: data.rating,
      comment: data.comment,
    }, { onConflict: 'student_id,club_id' })

  if (error) return { success: false, error: error.message }

  // Add 2 points for leaving a review
  await supabase.rpc('add_student_points', {
    p_student_id: profile.id,
    p_points: 2,
  })

  revalidatePath('/student/clubs')
  revalidatePath('/')
  return { success: true }
}
