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

    const { data: clubs } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('teacher_id', profile!.id)

    const clubIds = clubs?.map(c => c.id) || []

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: attendance } = await supabase
      .from('attendance')
      .select('status, date, student_id')
      .in('club_id', clubIds)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

    const total = attendance?.length || 0
    const present = attendance?.filter(a => a.status === 'present').length || 0
    const absent = attendance?.filter(a => a.status === 'absent').length || 0
    const excused = attendance?.filter(a => a.status === 'excused').length || 0
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    const systemPrompt = `
Sen EduFlow platformasining AI yordamchisisan.
O'zbek tilida javob ber. Aniq va amaliy maslahat ber.
Faqat o'qituvchilik, davomat va o'quvchilar haqida gapir.

O'qituvchi ma'lumotlari:
- Ism: ${profile?.full_name}
- To'garaklar: ${clubs?.map(c => c.name).join(', ')}

Oxirgi 30 kunlik davomat statistikasi:
- Jami yozuvlar: ${total}
- Kelgan: ${present} (${rate}%)
- Kelmagan: ${absent}
- Sababli: ${excused}

O'qituvchiga davomat tahlili, o'quvchilarni
motivatsiya qilish va dars samaradorligini
oshirish bo'yicha maslahat ber.
    `.trim()

    const response = await askClaude(systemPrompt, question)
    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'AI xatolik yuz berdi' }, { status: 500 })
  }
}
