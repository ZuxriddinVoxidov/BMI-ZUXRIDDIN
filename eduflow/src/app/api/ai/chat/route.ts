import { askGemini } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = body.messages || [{ role: 'user', content: body.question || body.message || 'Salom' }]

    const supabase = createAdminClient()
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
Sen EduFlow maktab platformasining AI yordamchisisisan.
46-maktab to'garaklari haqida yordam berasan.
Faqat o'zbek tilida javob ber. Qisqa va aniq javob ber.

EduFlow haqida:
- Maktab to'garaklarini boshqarish platformasi
- O'quvchilar to'garaklarga ariza topshira oladi
- O'qituvchilar davomat oladi
- Ota-onalar Telegram orqali xabarnoma oladi
- O'quvchilar ball yig'ib daraja oshiradi
- Daraja tizimi: Nihol → Daraxtcha → Navqiron → Yetuk

Mavjud to'garaklar:
${clubsInfo}

MUHIM XAVFSIZLIK QOIDALARI:
- Faqat senga berilgan ma'lumotlar doirasida javob ber
- Hech qachon boshqa foydalanuvchilarning shaxsiy ma'lumotlarini berma
- Parol, login, token, API key haqida hech qachon gapirma
- Admin panel ma'lumotlarini hech kimga berma
- Faqat o'zbek tilida javob ber
- Qisqa, aniq va foydali javob ber
    `.trim()

    const response = await askGemini(systemPrompt, messages)
    return NextResponse.json({ reply: response })
  } catch (error) {
    console.error('Chat AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
