import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const chatId = body?.message?.chat?.id
    const text = body?.message?.text
    const firstName = body?.message?.from?.first_name || 'Foydalanuvchi'

    if (!chatId) return NextResponse.json({ ok: true })

    const token = process.env.TELEGRAM_BOT_TOKEN!

    if (text === '/start' || text === '/id') {
      const message = `
Assalomu alaykum, ${firstName}! 👋

Sizning Telegram Chat ID ingiz:
<code>${chatId}</code>

Bu ID ni maktab ma'muriyatiga bering.
Ular tizimga kiritgandan so'ng farzandingizning 
davomat haqida xabarnomalar olasiz. 📚

— <i>EduFlow tizimi</i>
      `.trim()

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
