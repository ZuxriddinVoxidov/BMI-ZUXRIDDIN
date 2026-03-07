import ClubsSection from '@/components/landing/ClubsSection'
import CTASection from '@/components/landing/CTASection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import Footer from '@/components/landing/Footer'
import HeroSection from '@/components/landing/HeroSection'
import Navbar from '@/components/landing/Navbar'
import StatsSection from '@/components/landing/StatsSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      student:profiles!student_id(full_name),
      club:clubs(name, category)
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ClubsSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection reviews={(reviews || []) as Record<string, unknown>[]} />
      <CTASection />
      <Footer />
    </main>
  )
}
