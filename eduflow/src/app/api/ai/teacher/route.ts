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

    const { data: clubs } = await admin
      .from('clubs')
      .select('id, name')
      .eq('teacher_id', profile.id)

    const clubIds = clubs?.map(c => c.id) || []

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: attendance } = await admin
      .from('attendance')
      .select('status, date, student_id')
      .in('club_id', clubIds.length > 0 ? clubIds : ['none'])
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
- Ism: ${profile.full_name}
- To'garaklar: ${clubs?.map(c => c.name).join(', ') || 'yo\'q'}

Oxirgi 30 kunlik davomat statistikasi:
- Jami yozuvlar: ${total}
- Kelgan: ${present} (${rate}%)
- Kelmagan: ${absent}
- Sababli: ${excused}

O'qituvchiga davomat tahlili, o'quvchilarni
motivatsiya qilish va dars samaradorligini
oshirish bo'yicha maslahat ber.

Sen faqat o'z to'garaklaring ma'lumotlari bilan ishlaysan.

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
    console.error('Teacher AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
