import { getGeminiModel } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60
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
    const conversationMessages = messages.slice(-6)
    const sessionId = body.sessionId

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
      .select(`
        id, name, description, category, schedule,
        teacher_resources(id, title, file_name),
        enrollments(
          id, status, created_at,
          profiles!student_id(id, full_name, grade)
        )
      `)
      .eq('teacher_id', profile.id)

    const clubIds = (clubs || []).map(c => c.id)

    const { data: attendanceStats } = await admin
      .from('attendance')
      .select('club_id, student_id, status, date')
      .in('club_id', clubIds.length > 0 ? clubIds : ['none'])

    const studentIds = (clubs || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flatMap((c: any) => c.enrollments || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.status === 'approved')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => e.profiles?.id)
      .filter(Boolean)

    const { data: studentPoints } = await admin
      .from('student_points')
      .select('student_id, total_points')
      .in('student_id', studentIds.length > 0 ? studentIds : ['none'])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubsContext = (clubs || []).map((club: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approved = (club.enrollments || []).filter((e: any) => e.status === 'approved')
      const resources = club.teacher_resources || []
      
      // attendance for this club
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clubAttendance = (attendanceStats || []).filter((a: any) => a.club_id === club.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const presentCount = clubAttendance.filter((a: any) => a.status === 'present').length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const absentCount = clubAttendance.filter((a: any) => a.status === 'absent').length
      const totalAttendance = clubAttendance.length
      const attendanceRate = totalAttendance > 0 
        ? Math.round((presentCount / totalAttendance) * 100) 
        : 0

      // top students by points
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentsWithPoints = approved.map((e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pts = (studentPoints || []).find((p: any) => p.student_id === e.profiles?.id)
        return {
          name: e.profiles?.full_name || 'Noma\'lum',
          grade: e.profiles?.grade || '',
          points: pts?.total_points || 0,
          // attendance for this student in this club
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          present: clubAttendance.filter((a: any) => a.student_id === e.profiles?.id && a.status === 'present').length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          absent: clubAttendance.filter((a: any) => a.student_id === e.profiles?.id && a.status === 'absent').length,
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).sort((a: any, b: any) => b.points - a.points)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const top3 = studentsWithPoints.slice(0, 1).map((s: any, i: number) => 
        `    ${i+1}. ${s.name} (${s.grade}) — ${s.points} ball`
      ).join('\n')

      const passive = studentsWithPoints
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((s: any) => s.absent > s.present)
        .slice(0, 1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any) => `    - ${s.name}: ${s.absent} dars qoldirgan`)
        .join('\n')

      const resourceList = resources.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? resources.map((r: any) => `    - ${r.title}`).join('\n')
        : '    - (hali material yuklanmagan)'

      return `📚 TO'GARAK: ${club.name} (${club.category || ''})
  Jadval: ${club.schedule || 'belgilanmagan'}
  O'quvchilar: ${approved.length} nafar
  Davomat: ${attendanceRate}% (${presentCount} keldi / ${absentCount} kelmadi)
  
  Top 3 o'quvchi (ball bo'yicha):
${top3 || '    - ma\'lumot yo\'q'}
  
  Passiv o'quvchilar (ko'p qoldirgan):
${passive || '    - hammasi faol'}
  
  Yuklangan materiallar:
${resourceList}`
    }).join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n')

    const teacherContext = `
O'qituvchi: ${profile.full_name}
Jami to'garaklar: ${(clubs || []).length} ta
Jami o'quvchilar: ${studentIds.length} nafar
`

    const systemPrompt = `Sen IQRO maktab platformasidagi o'qituvchiga yordam beruvchi 
professional AI assistentsan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O'QITUVCHI MA'LUMOTLARI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${teacherContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TO'GARAKLAR VA STATISTIKA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${clubsContext || "Hali to'garak biriktirilmagan."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QOBILIYATLAR VA QOIDALAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. O'qituvchining to'garaklari va fanlari bo'yicha istalgan savolga javob ber
2. Dars rejasi, mavzu tavsifi, tushuntirish tayyorlashda yordam ber
3. TEST yaratish so'ralganda: 4 variantli (A,B,C,D) test tuz, to'g'ri javoblar oxirida
   - Bir so'rovda maksimal 20 ta savol
   - Mavzu, bob yoki butun kurs bo'yicha tuzish mumkin
4. FLASHCARD so'ralganda: "Savol → Javob" juftliklari tuz
5. O'QUVCHILAR TAHLILI so'ralganda: yuqoridagi statistikadan aniq javob ber
   - "Eng faol o'quvchi kim?" → ball va davomatga qarab ayt
   - "Passiv o'quvchilar?" → ko'p qoldirganlarni ayt
   - "Top 3/5?" → ballar bo'yicha ro'yxat
   - "Davomat holati?" → foiz va raqamlar bilan ayt
6. FAOLIYAT TAHLILI: O'qituvchining ishlash samaradorligi haqida tavsiyalar ber
   - Qaysi mavzularni qo'shimcha tushuntirish kerak
   - O'quvchilarni qanday motivatsiya qilish mumkin
   - Darslarni qiziqarliroq qilish uchun usullar
7. HISOBOT so'ralganda: to'liq statistika hisobotini matn ko'rinishida tayyorla
8. Har doim o'zbek tilida javob ber
9. Professional, aniq va dalilga asoslangan uslubda gapir
10. Bugungi sana: ${new Date().toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`

    const model = getGeminiModel()
    
    // Simple non-streaming call:
    const result = await model.generateContent({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: conversationMessages.map((m: any) => ({
         role: m.role === 'assistant' ? 'model' : 'user',
         parts: [{ text: m.content }]
      })),
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 1500,  // Limit output to prevent timeout
        temperature: 0.7,
      }
    })

    const responseText = result.response.text()

    if (sessionId) {
      await admin.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: responseText
      })
    }

    return NextResponse.json({ reply: responseText })
  } catch (error) {
    console.error('Teacher AI error:', error)
    return NextResponse.json(
      { error: "AI javob bermadi. Qayta urinib ko'ring." },
      { status: 500 }
    )
  }
}
