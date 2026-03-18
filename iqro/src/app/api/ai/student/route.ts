import { askGemini } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStudentLevel } from '@/lib/levels'

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

    const { data: enrollments } = await admin
      .from('enrollments')
      .select(`
        clubs(
          id, name, description, category, schedule,
          teacher_resources(id, title, file_name)
        )
      `)
      .eq('student_id', studentProfile.id)
      .eq('status', 'approved')

    const { data: pointsData } = await admin
      .from('student_points')
      .select('total_points')
      .eq('student_id', studentProfile.id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubsContext = (enrollments || []).map((e: any) => {
      const club = e.clubs
      if (!club) return ''
      const resources = club.teacher_resources || []
      const resourceList = resources.length > 0
        ? resources.map((r: {title: string}) => `    - ${r.title}`).join('\n')
        : '    - (hali material yuklanmagan)'
      return `📚 ${club.name} (${club.category || ''})
  Jadval: ${club.schedule || 'belgilanmagan'}
  Tavsif: ${club.description || 'mavjud emas'}
  O'qituvchi yuklagan materiallar:
${resourceList}`
    }).filter(Boolean).join('\n\n')

    const totalPoints = pointsData?.total_points || 0
    const level = getStudentLevel(totalPoints)

    const profileContext = `
O'quvchi: ${studentProfile.full_name}
Sinf: ${studentProfile.grade || 'belgilanmagan'}
Daraja: ${level.name} ${level.emoji}
Jami ball: ${totalPoints}
A'zo to'garaklar soni: ${(enrollments || []).length}
`

    const systemPrompt = `Sen IQRO maktab platformasidagi o'quvchiga yordam beruvchi aqlli AI assistentsan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O'QUVCHI MA'LUMOTLARI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${profileContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O'QUVCHINING TO'GARAKLARI VA MATERIALLARI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clubsContext || "Hali hech qaysi to'garakka a'zo emas."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QOIDALAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. FAQAT yuqoridagi to'garaklar va ularning fanlari doirasida javob ber
2. Agar o'quvchi biror mavzu yoki bob haqida so'rasa — batafsil, misolllar bilan tushuntir
3. Agar tashqi manbadan ma'lumot kerak bo'lsa — FAQAT o'sha sinfning davlat darsligi doirasida ma'lumot ol
4. Agar o'quvchi test so'rasa — test tuz. Bir so'rovda MAKSIMAL 20 ta savol. Agar ko'proq kerak bo'lsa, keyingi so'rovda davom ettir
5. Test formati: har bir savol 4 ta variant (A, B, C, D) bilan, javoblar eng oxirida
6. Agar o'quvchi o'z profili, daraja yoki ballari haqida so'rasa — yuqoridagi ma'lumotlardan javob ber
7. Agar savol to'garaklar doirasidan tashqarida bo'lsa — muloyimlik bilan rad et va o'z faniga yo'naldir
8. Har doim o'zbek tilida javob ber
9. Do'stona, qiziqarli va rag'batlantiruvchi uslubda gapir
10. Bugungi sana: ${new Date().toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`

    const response = await askGemini(systemPrompt, messages)
    return NextResponse.json({ reply: response })
  } catch (error) {
    console.error('Student AI error:', error)
    return NextResponse.json({ reply: 'Kechirasiz, hozir javob bera olmayapman. Qayta urinib ko\'ring.' }, { status: 500 })
  }
}
