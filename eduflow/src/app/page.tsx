import AIChatWidget from '@/components/ai/AIChatWidget'
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

  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name),
      enrollments:enrollments(count)
    `)
    .order('created_at', { ascending: false })

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
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ClubsSection clubs={(clubs || []) as any[]} />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection reviews={(reviews || []) as Record<string, unknown>[]} />
      <CTASection />
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
