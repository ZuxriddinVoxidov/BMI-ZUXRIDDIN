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
      .select('id, full_name, school_id, school:schools(name)')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ reply: 'Profil topilmadi' }, { status: 404 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schoolName = (profile as any)?.school?.name || ''

    const { data: clubs } = await admin
      .from('clubs')
      .select(`
        id, name, category, schedule, 
        max_students, description,
        profiles!clubs_teacher_id_fkey (full_name)
      `)
      .eq('school_id', profile.school_id)

    const { data: enrollmentStats } = await admin
      .from('enrollments')
      .select('club_id, status')
      .eq('status', 'approved')

    const clubsInfo = (clubs || []).map(c => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teacher = (c.profiles as any)?.full_name || 'Noma\'lum'
      return `- ${c.name} (${c.category})\n  O'qituvchi: ${teacher}\n  Jadval: ${c.schedule}\n  Max o'quvchi: ${c.max_students}`
    }).join('\n\n')

    const [
      { count: studentsCount },
      { count: teachersCount },
      { count: clubsCount },
      { data: attendance },
    ] = await Promise.all([
      admin.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile.school_id)
        .eq('role', 'student'),
      admin.from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile.school_id)
        .eq('role', 'teacher'),
      admin.from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile.school_id),
      admin.from('attendance')
        .select('status')
        .gte('date', new Date(
          new Date().setDate(new Date().getDate() - 30)
        ).toISOString().split('T')[0]),
    ])

    const totalAtt = attendance?.length || 0
    const presentAtt = attendance?.filter(a => a.status === 'present').length || 0
    const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0

    const systemPrompt = `
BUGUNGI SANA VA VAQT: ${currentDate}, soat ${currentTime} (Toshkent vaqti)

Sen EduFlow platformasining AI yordamchisisan.
O'zbek tilida professional va aniq javob ber.
Maktab boshqaruvi, statistika tahlili haqida gapir.

Direktor: ${profile.full_name}
Maktab: ${schoolName}

Maktab statistikasi:
- O'quvchilar: ${studentsCount}
- O'qituvchilar: ${teachersCount}
- To'garaklar: ${clubsCount}
- Oxirgi 30 kun davomat: ${attRate}%

Direktorga maktab ko'rsatkichlari,
to'garaklar samaradorligi va rivojlantirish
strategiyalari haqida professional maslahat ber.

TO'GARAKLAR (${clubs?.length || 0} ta):
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
    console.error('Director AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
