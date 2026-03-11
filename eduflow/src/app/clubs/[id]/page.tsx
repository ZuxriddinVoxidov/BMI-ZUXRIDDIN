import ClubDetailClient from '@/components/clubs/ClubDetailClient'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 60

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ClubDetailPage({ params }: { params: any }) {
  const { id } = await params
  const supabase = createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      *,
      teacher:profiles!teacher_id(id, full_name),
      enrollments:enrollments(id, status, student_id),
      reviews:reviews(
        id, rating, comment, created_at,
        student:profiles!student_id(full_name, grade)
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!club) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let userEnrollment = null
  let userProfile = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()
    userProfile = profile

    if (profile?.role === 'student') {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('student_id', profile.id)
        .eq('club_id', club.id)
        .maybeSingle()
      userEnrollment = enrollment
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrolledCount = club.enrollments?.filter((e: any) => e.status === 'approved').length || 0

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      profiles!student_id(full_name, grade)
    `)
    .eq('club_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <ClubDetailClient
      club={club}
      enrolledCount={enrolledCount}
      avgRating={avgRating}
      userEnrollment={userEnrollment}
      userProfile={userProfile}
      reviews={reviews || []}
    />
  )
}
