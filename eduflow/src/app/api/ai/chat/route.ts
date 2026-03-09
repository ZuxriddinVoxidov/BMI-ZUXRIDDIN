import { askGemini } from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]?.content || ''

    const supabase = createClient()
    const { data: clubs } = await supabase
      .from('clubs')
      .select('name, category, description, schedule, max_students')
      .limit(20)

    const clubsInfo = clubs
      ?.map(c =>
        `- ${c.name} (${c.category}): ${c.description || ''}, ` +
        `jadval: ${c.schedule}, max: ${c.max_students} o'quvchi`
      )
      .join('\n') || 'To\'garaklar haqida ma\'lumot yo\'q'

    const systemPrompt = `
Sen EduFlow — maktab to'garaklar platformasining
yordamchisisisan. Saytga yangi kelgan
foydalanuvchilarga yordam ber.

O'zbek tilida samimiy va qisqa javob ber.
Faqat EduFlow va to'garaklar haqida gapir.

EduFlow haqida:
- Maktab to'garaklarini boshqarish platformasi
- O'quvchilar to'garaklarga ariza topshira oladi
- O'qituvchilar davomat oladi
- Ota-onalar Telegram orqali xabarnoma oladi
- O'quvchilar ball yig'ib daraja oshiradi
- Daraja tizimi: Nihol → Daraxtcha → Navqiron → Yetuk

Demo kirish:
- Admin: admin@eduflow.uz / Admin@123
- O'quvchi: student@eduflow.uz / Student@123
- O'qituvchi: teacher@eduflow.uz / Teacher@123
- Direktor: director@eduflow.uz / Director@123

Mavjud to'garaklar:
${clubsInfo}
    `.trim()

    const conversationText = messages
      .map((m: any) => `${m.role === 'user' ? 'Foydalanuvchi' : 'AI'}: ${m.content}`)
      .join('\n')

    const response = await askGemini(systemPrompt, conversationText)
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat AI error:', error)
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 })
  }
}
