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
      .select('id, full_name, school_id, school:schools(name)')
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ reply: 'Profil topilmadi' }, { status: 404 })

    const SCHOOL_ID = '00000000-0000-0000-0000-000000000001'

    // 1. All clubs with teachers and enrollments
    const { data: clubs } = await admin
      .from('clubs')
      .select(`
        id, name, category, schedule,
        profiles!teacher_id(id, full_name),
        enrollments(id, status)
      `)
      .eq('school_id', SCHOOL_ID)

    // 2. All students with points
    const { data: students } = await admin
      .from('profiles')
      .select(`
        id, full_name, grade,
        student_points(total_points)
      `)
      .eq('school_id', SCHOOL_ID)
      .eq('role', 'student')

    // 3. All teachers
    const { data: teachers } = await admin
      .from('profiles')
      .select('id, full_name')
      .eq('school_id', SCHOOL_ID)
      .eq('role', 'teacher')

    // 4. Attendance stats
    const { data: attendance } = await admin
      .from('attendance')
      .select('student_id, club_id, status, date')

    // 5. Reviews
    const { data: reviews } = await admin
      .from('reviews')
      .select('club_id, rating')

    // General stats
    const totalStudents = (students || []).length
    const totalTeachers = (teachers || []).length
    const totalClubs = (clubs || []).length
    const totalEnrollments = (clubs || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flatMap((c: any) => c.enrollments || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((e: any) => e.status === 'approved').length

    // Attendance overall
    const totalAttendance = (attendance || []).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentCount = (attendance || []).filter((a: any) => a.status === 'present').length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const absentCount = (attendance || []).filter((a: any) => a.status === 'absent').length
    const overallAttendanceRate = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0

    // Top 5 students by points
    const studentsWithPoints = (students || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => ({
        name: s.full_name,
        grade: s.grade || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        points: (s.student_points as any)?.total_points || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presentDays: (attendance || []).filter((a: any) => a.student_id === s.id && a.status === 'present').length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        absentDays: (attendance || []).filter((a: any) => a.student_id === s.id && a.status === 'absent').length,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => b.points - a.points)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const top5Students = studentsWithPoints.slice(0, 2)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any, i: number) => `  ${i+1}. ${s.name} (${s.grade}) — ${s.points} ball`)
      .join('\n')

    const passiveStudents = studentsWithPoints
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((s: any) => s.absentDays > s.presentDays && (s.presentDays + s.absentDays) > 0)
      .slice(0, 2)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => `  - ${s.name} (${s.grade}): ${s.absentDays} dars qoldirgan`)
      .join('\n')

    const mostActiveStudent = studentsWithPoints[0]

    // Clubs stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubsStats = (clubs || []).map((club: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approved = (club.enrollments || []).filter((e: any) => e.status === 'approved').length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clubAttendance = (attendance || []).filter((a: any) => a.club_id === club.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clubPresent = clubAttendance.filter((a: any) => a.status === 'present').length
      const clubTotal = clubAttendance.length
      const rate = clubTotal > 0 ? Math.round((clubPresent / clubTotal) * 100) : 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clubReviews = (reviews || []).filter((r: any) => r.club_id === club.id)
      const avgRating = clubReviews.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (clubReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / clubReviews.length).toFixed(1)
        : 'baholanmagan'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const teacher = club.profiles as any
      return `  📚 ${club.name} — O'qituvchi: ${teacher?.full_name || 'belgilanmagan'} | ${approved} o'quvchi | Davomat: ${rate}% | Reyting: ${avgRating}⭐`
    }).join('\n')

    const statsContext = `
UMUMIY STATISTIKA:
  O'quvchilar: ${totalStudents} nafar
  O'qituvchilar: ${totalTeachers} nafar
  To'garaklar: ${totalClubs} ta
  Jami yozilganlar: ${totalEnrollments} nafar
  Umumiy davomat: ${overallAttendanceRate}% (${presentCount} keldi / ${absentCount} kelmadi)

ENG FAOL O'QUVCHI:
  ${mostActiveStudent ? `${mostActiveStudent.name} (${mostActiveStudent.grade}) — ${mostActiveStudent.points} ball` : 'ma\'lumot yo\'q'}

TOP 5 O'QUVCHI (ball bo'yicha):
${top5Students || '  ma\'lumot yo\'q'}

PASSIV O'QUVCHILAR (ko'p qoldirganlar):
${passiveStudents || '  hammasi faol'}

TO'GARAKLAR:
${clubsStats || '  to\'garaklar yo\'q'}
`

    const systemPrompt = `Sen IQRO maktab platformasidagi maktab direktori uchun 
professional AI tahlil assistentsan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAKTAB TO'LIQ STATISTIKASI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${statsContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QOBILIYATLAR VA QOIDALAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Maktab statistikasi bo'yicha ISTALGAN savolga aniq javob ber
2. "Eng faol o'quvchi kim?" — ball va davomatga qarab ayt
3. "Qaysi to'garak eng yaxshi?" — davomat va reyting bo'yicha tahlil qil
4. "Passiv o'quvchilar?" — ro'yxat bilan ayt
5. "O'qituvchilar samaradorligi?" — har bir o'qituvchi to'garagi statistikasi
6. "Davomat holati?" — foiz va raqamlar bilan batafsil ayt
7. HISOBOT so'ralganda — to'liq va professional hisobot matn shaklida tayyorla
8. Tavsiyalar ber — qaysi sohalarda yaxshilanish kerak
9. Har doim o'zbek tilida javob ber
10. Aniq, professional va dalilga asoslangan uslubda gapir
11. Bugungi sana: ${new Date().toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`

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
    console.error('Director AI error:', error)
    return NextResponse.json(
      { error: "AI javob bermadi. Qayta urinib ko'ring." },
      { status: 500 }
    )
  }
}
