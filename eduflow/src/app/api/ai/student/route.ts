import { askGemini } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
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

    const { data: enrollments } = await admin
      .from('enrollments')
      .select('club:clubs(name, category, description)')
      .eq('student_id', profile.id)
      .eq('status', 'approved')

    const { data: pointsData } = await admin
      .from('student_points')
      .select('total_points')
      .eq('student_id', profile.id)
      .maybeSingle()

    const { data: availableClubs } = await admin
      .from('clubs')
      .select('name, category, description, schedule')
      .limit(20)

    const enrolledClubNames = enrollments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((e: any) => e.club?.name)
      .filter(Boolean)
      .join(', ') || 'hali yo\'q'

    const clubsList = availableClubs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((c: any) =>
        `- ${c.name} (${c.category}): ${c.description || 'tavsif yo\'q'}, jadval: ${c.schedule}`
      )
      .join('\n') || ''

    const systemPrompt = `
Sen EduFlow platformasining AI yordamchisisan.
O'zbek tilida javob ber. Qisqa va aniq javob ber.
Faqat to'garaklar va o'qish haqida maslahat ber.

O'quvchi ma'lumotlari:
- Ism: ${profile.full_name}
- Jami ball: ${pointsData?.total_points ?? 0}
- Hozirgi to'garaklar: ${enrolledClubNames}

Mavjud to'garaklar:
${clubsList}

O'quvchiga uning qiziqishlari va maqsadlariga qarab
to'garaklar tavsiya et. Motivatsiya ber.
    `.trim()

    const response = await askGemini(systemPrompt, messages)
    return NextResponse.json({ reply: response })
  } catch (error) {
    console.error('Student AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
