import { getGeminiModel } from '@/lib/ai/gemini'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStudentLevel } from '@/lib/levels'

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
    // Limit to last 6 messages
    const conversationMessages = messages.slice(-6)
    const sessionId = body.sessionId

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

    const { data: transactions } = await admin
      .from('point_transactions')
      .select('points, reason, source, created_at')
      .eq('student_id', studentProfile.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const totalPoints = pointsData?.total_points || 0
    const level = getStudentLevel(totalPoints)

    const transactionsContext = (transactions || [])
      .slice(0, 10)
      .map((t: { reason: string, points: number, created_at: string }) => `  - ${t.reason}: +${t.points} ball (${new Date(t.created_at).toLocaleDateString('uz-UZ')})`)
      .join('\n')

    const profileContext = `
O'quvchi: ${studentProfile.full_name}
Sinf: ${studentProfile.grade || 'belgilanmagan'}
Daraja: ${level.name} ${level.emoji}
Jami ball: ${totalPoints}
A'zo to'garaklar soni: ${(enrollments || []).length}

BALLAR TARIXI (so'nggi 10 ta):
${transactionsContext || '  - hali ball yig\'ilmagan'}
`

    const systemPrompt = `Sen IQRO maktab platformasidagi o'quvchiga yordam beruvchi aqlli AI assistentsan.

O'QUVCHI MA'LUMOTLARI:
${profileContext}

TO'GARAKLAR:
${clubsContext || "Hali hech qaysi to'garakka a'zo emas."}

QOIDALAR:
1. FAQAT yuqoridagi to'garaklar va ularning fanlari doirasida javob ber
2. Agar test so'ralsa tuz, maksimal 10 ta savol.
3. Har doim o'zbek tilida, aniq va tushunarli javob ber
4. Bugungi sana: ${currentDate}`

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
    console.error('AI route error:', error)
    return NextResponse.json(
      { error: "AI javob bermadi. Qayta urinib ko'ring." },
      { status: 500 }
    )
  }
}
