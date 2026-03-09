import { askGemini } from '@/lib/ai/gemini'
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
      .select('id, full_name, school_id, school:schools(name)')
      .eq('user_id', user.id)
      .single()

    const schoolName = (profile as any)?.school?.name || ''

    const [
      { count: studentsCount },
      { count: teachersCount },
      { count: clubsCount },
      { data: attendance },
    ] = await Promise.all([
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile!.school_id)
        .eq('role', 'student'),
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile!.school_id)
        .eq('role', 'teacher'),
      supabase.from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile!.school_id),
      supabase.from('attendance')
        .select('status')
        .gte('date', new Date(
          new Date().setDate(new Date().getDate() - 30)
        ).toISOString().split('T')[0]),
    ])

    const totalAtt = attendance?.length || 0
    const presentAtt = attendance?.filter(a => a.status === 'present').length || 0
    const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

    const systemPrompt = `
Sen EduFlow platformasining AI yordamchisisan.
O'zbek tilida professional va aniq javob ber.
Maktab boshqaruvi, statistika tahlili haqida gapir.

Direktor: ${profile?.full_name}
Maktab: ${schoolName}

Maktab statistikasi:
- O'quvchilar: ${studentsCount}
- O'qituvchilar: ${teachersCount}
- To'garaklar: ${clubsCount}
- Oxirgi 30 kun davomat: ${attRate}%

Direktorga maktab ko'rsatkichlari,
to'garaklar samaradorligi va rivojlantirish
strategiyalari haqida professional maslahat ber.
    `.trim()

    const response = await askGemini(systemPrompt, question)
    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI xatolik yuz berdi' }, { status: 500 })
  }
}
