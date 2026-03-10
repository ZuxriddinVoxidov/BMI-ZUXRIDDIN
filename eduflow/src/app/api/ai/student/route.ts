import { askClaude } from '@/lib/ai/claude'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { question } = await request.json()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', user.id)
      .single()

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('club:clubs(name, category, description)')
      .eq('student_id', profile!.id)
      .eq('status', 'approved')

    const { data: pointsData } = await supabase
      .from('student_points')
      .select('total_points')
      .eq('student_id', profile!.id)
      .maybeSingle()

    const { data: availableClubs } = await supabase
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
- Ism: ${profile?.full_name}
- Jami ball: ${pointsData?.total_points ?? 0}
- Hozirgi to'garaklar: ${enrolledClubNames}

Mavjud to'garaklar:
${clubsList}

O'quvchiga uning qiziqishlari va maqsadlariga qarab
to'garaklar tavsiya et. Motivatsiya ber.
    `.trim()

    const response = await askClaude(systemPrompt, question)
    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI xatolik yuz berdi' }, { status: 500 })
  }
}
