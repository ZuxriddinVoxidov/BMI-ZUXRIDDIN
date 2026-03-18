'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Submit or update review
export async function submitReview(
  clubId: string,
  rating: number,
  comment: string
) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const { data: existingReview } = await admin.from('reviews')
    .select('id')
    .eq('student_id', profile.id)
    .eq('club_id', clubId)
    .single()

  // Upsert — if exists update, if not insert
  const { error } = await admin
    .from('reviews')
    .upsert({
      student_id: profile.id,
      club_id: clubId,
      rating,
      comment,
    }, {
      onConflict: 'student_id,club_id'
    })

  if (error) return { success: false, error: error.message }

  if (!existingReview) {
    await admin.rpc('add_student_points', {
      p_student_id: profile.id,
      p_points: 2,
    })

    await admin.from('point_transactions').insert({
      student_id: profile.id,
      points: 2,
      reason: `To'garak bahosi uchun`,
      source: 'review',
      source_id: clubId
    })
  }

  revalidatePath(`/clubs/${clubId}`)
  revalidatePath('/student/clubs')
  return { success: true }
}

// Get reviews for a club
export async function getClubReviews(clubId: string) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles!student_id(full_name, grade)
    `)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}
