import AIChatWidget from '@/components/ai/AIChatWidget'
import ClubsSection from '@/components/landing/ClubsSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import Footer from '@/components/landing/Footer'
import HeroSection from '@/components/landing/HeroSection'
import Navbar from '@/components/landing/Navbar'
import StatsSection from '@/components/landing/StatsSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()

  // Fetch real stats
  const [
    { count: studentsCount },
    { count: clubsCount },
    { data: ratingsData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('rating'),
  ])

  const avgRating = ratingsData && ratingsData.length > 0
    ? (ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length).toFixed(1)
    : '—'

  // Fetch clubs
  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name),
      enrollments:enrollments(count),
      reviews:reviews(rating)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      student:profiles!student_id(full_name, grade),
      club:clubs(name, category)
    `)
    .order('rating', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection
        studentsCount={studentsCount || 0}
        clubsCount={clubsCount || 0}
        avgRating={avgRating}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ClubsSection clubs={(clubs || []) as any[]} />
      <FeaturesSection />
      <StatsSection
        studentsCount={studentsCount || 0}
        clubsCount={clubsCount || 0}
        avgRating={avgRating}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TestimonialsSection reviews={(reviews || []) as any[]} />
      <Footer />
      <AIChatWidget
        apiRoute="/api/ai/chat"
        title="EduFlow Yordamchi"
        subtitle="Savollaringizga javob beraman"
        placeholder="EduFlow haqida so'rang..."
        color="from-indigo-500 to-cyan-500"
      />
    </main>
  )
}
