import { askGemini } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const now = new Date()
    const currentDate = now.toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tashkent'
    })
    const currentTime = now.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tashkent'
    })
    const body = await request.json()
    const messages = body.messages || [{ role: 'user', content: body.question || body.message || 'Salom' }]

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ reply: 'Tizimga kiring' }, { status: 401 })

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ reply: 'Profil topilmadi' }, { status: 404 })

    const { data: teacherClubs } = await admin
      .from('clubs')
      .select('id, name, category, schedule, description, max_students')
      .eq('teacher_id', profile.id)

    // For each club get enrolled students count
    const clubsWithStats = await Promise.all(
      (teacherClubs || []).map(async (club) => {
        const { count: enrolledCount } = await admin
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .eq('status', 'approved')

        const { count: presentCount } = await admin
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .eq('status', 'present')

        const { count: absentCount } = await admin
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .eq('status', 'absent')

        return {
          ...club,
          enrolledCount: enrolledCount || 0,
          presentCount: presentCount || 0,
          absentCount: absentCount || 0
        }
      })
    )

    const clubsInfo = clubsWithStats.map(c =>
      `- ${c.name} (${c.category})\n   Jadval: ${c.schedule}\n   O'quvchilar: ${c.enrolledCount}/${c.max_students}\n   Davomat: ${c.presentCount} kelgan, ${c.absentCount} kelmagan\n   Tavsif: ${c.description || 'Yo\'q'}`
    ).join('\n\n')

    const systemPrompt = `
Sen ${profile.full_name} ning shaxsiy AI yordamchisisisan.
BUGUNGI SANA: ${currentDate}, soat ${currentTime}

MUHIM: Faqat quyidagi ma'lumotlar asosida javob ber.
Boshqa o'qituvchilar yoki o'quvchilar haqida 
maxfiy ma'lumot berma.

MENING TO'GARAKLARIM (${clubsWithStats.length} ta):
${clubsInfo || 'Hali to\'garak yo\'q'}

QOIDALAR:
- Faqat o'zbek tilida javob ber
- Faqat o'z to'garaklaring haqida gapir
- Parol, login, API key haqida hech gapirma
- Qisqa va aniq javob ber
    `.trim()

    const response = await askGemini(systemPrompt, messages)
    return NextResponse.json({ reply: response })
  } catch (error) {
    console.error('Teacher AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
