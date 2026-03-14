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

    const { data: studentProfile } = await admin
      .from('profiles')
      .select('id, full_name, grade')
      .eq('user_id', user.id)
      .single()

    if (!studentProfile) return NextResponse.json({ reply: 'Profil topilmadi' }, { status: 404 })

    const { data: points } = await admin
      .from('student_points')
      .select('total_points')
      .eq('student_id', studentProfile.id)
      .single()

    const { data: enrollments } = await admin
      .from('enrollments')
      .select(`
        status,
        clubs (
          id, name, category, schedule, description
        )
      `)
      .eq('student_id', studentProfile.id)

    const { count: presentCount } = await admin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentProfile.id)
      .eq('status', 'present')

    const { count: absentCount } = await admin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentProfile.id)
      .eq('status', 'absent')

    const enrolledClubs = (enrollments || [])
      .filter(e => e.status === 'approved')
      .map(e => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const club = e.clubs as any
        return `- ${club.name} (${club.category}): ${club.schedule}`
      }).join('\n')

    const pendingClubs = (enrollments || [])
      .filter(e => e.status === 'pending')
      .map(e => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const club = e.clubs as any
        return `- ${club.name}`
      }).join('\n')

    const systemPrompt = `
Sen ${studentProfile.full_name} ning 
shaxsiy AI yordamchisisisan.
BUGUNGI SANA: ${currentDate}, soat ${currentTime}

O'QUVCHI MA'LUMOTLARI:
- Ism: ${studentProfile.full_name}
- Sinf: ${studentProfile.grade || 'Noma\'lum'}
- Ballar: ${points?.total_points || 0}

MENING TO'GARAKLARIM:
${enrolledClubs || 'Hali to\'garakka yozilmagan'}

KUTILAYOTGAN ARIZALAR:
${pendingClubs || 'Yo\'q'}

DAVOMAT:
- Kelgan: ${presentCount || 0} marta
- Kelmagan: ${absentCount || 0} marta

QOIDALAR:
- Faqat o'zbek tilida javob ber
- Faqat shu o'quvchi ma'lumotlari haqida gapir
- Boshqa o'quvchilar haqida maxfiy ma'lumot berma
- Parol, login haqida hech gapirma
- Qisqa va aniq javob ber
    `.trim()

    const response = await askGemini(systemPrompt, messages)
    return NextResponse.json({ reply: response })
  } catch (error) {
    console.error('Student AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
