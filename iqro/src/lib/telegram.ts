const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    const data = await response.json()
    if (!data.ok) return { success: false, error: data.description }
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function buildAbsentMessage(
  studentName: string,
  clubName: string,
  teacherName: string,
  date: string
): string {
  return `
🔔 <b>IQRO — Davomat Xabarnomasi</b>

Assalomu alaykum!

❌ <b>${studentName}</b> bugun to'garakka <b>kelmadi</b>.

📚 <b>To'garak:</b> ${clubName}
👨‍🏫 <b>O'qituvchi:</b> ${teacherName}
📅 <b>Sana:</b> ${date}

Iltimos, farzandingiz bilan bog'laning.

— <i>IQRO tizimi</i>
  `.trim()
}

export function buildExcusedMessage(
  studentName: string,
  clubName: string,
  date: string
): string {
  return `
📋 <b>IQRO — Davomat Xabarnomasi</b>

Assalomu alaykum!

📝 <b>${studentName}</b> bugun to'garakka 
<b>sababli kelmadi</b>.

📚 <b>To'garak:</b> ${clubName}
📅 <b>Sana:</b> ${date}

— <i>IQRO tizimi</i>
  `.trim()
}
