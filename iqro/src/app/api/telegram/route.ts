import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!

async function sendMessage(chat_id: number, text: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
      }
    )
  } catch (err) {
    console.error('Failed to send telegram message:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update?.message
    if (!message) return Response.json({ ok: true })

    const chatId: number = message.chat.id
    const text: string = message.text?.trim() || ''

    const supabase = createAdminClient()

    // GET state
    const { data: state } = await supabase
      .from('telegram_conversation_state')
      .select('*')
      .eq('chat_id', chatId)
      .single()

    // /start command
    if (text === '/start') {
      await supabase
        .from('telegram_conversation_state')
        .upsert({ 
          chat_id: chatId, 
          step: 'waiting_parent_name',
          updated_at: new Date().toISOString()
        })
      
      await sendMessage(
        chatId,
        `🎓 <b>IQRO — 46-maktab</b>\n\nXush kelibsiz!\n\nFarzandingiz haqida xabarnomalar olish uchun ro'yxatdan o'ting.\n\n👤 Iltimos, <b>ism va familiyangizni</b> kiriting:\n<i>(Masalan: Karimova Zilola)</i>`
      )
      return Response.json({ ok: true })
    }

    // Step 1: waiting for parent name
    if (state?.step === 'waiting_parent_name') {
      await supabase
        .from('telegram_conversation_state')
        .upsert({ 
          chat_id: chatId, 
          step: 'waiting_child_name',
          parent_name: text,
          updated_at: new Date().toISOString()
        })

      await sendMessage(
        chatId,
        `✅ Rahmat, <b>${text}</b>!\n\n👦 Endi <b>farzandingizning to'liq ismi</b>ni kiriting:\n<i>(Masalan: Karimov Jasur)</i>`
      )
      return Response.json({ ok: true })
    }

    // Step 2: waiting for child name
    if (state?.step === 'waiting_child_name') {
      const parentName = state.parent_name
      const childName = text

      // Save to database
      const { error } = await supabase
        .from('parent_registration_requests')
        .insert({
          chat_id: chatId,
          parent_name: parentName,
          child_name: childName,
          status: 'pending'
        })

      // DELETE state
      await supabase
        .from('telegram_conversation_state')
        .delete()
        .eq('chat_id', chatId)

      if (error) {
        await sendMessage(
          chatId,
          `❌ Xatolik yuz berdi. Qaytadan urinib ko'ring: /start`
        )
        return Response.json({ ok: true })
      }

      await sendMessage(
        chatId,
        `✅ <b>Ma'lumotlar qabul qilindi!</b>\n\n👤 Ota-ona: ${parentName}\n👦 Farzand: ${childName}\n\nAdmin ma'lumotlarni ko'rib chiqadi va tizimga kiritadi. Keyin siz xabarnomalar olishni boshlaysiz! 🎉`
      )

      // Notify admin via telegram if ADMIN_CHAT_ID set
      const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID
      if (adminChatId) {
        await sendMessage(
          Number(adminChatId),
          `🔔 <b>Yangi ota-ona so'rovi!</b>\n\n👤 Ota-ona: ${parentName}\n👦 Farzand: ${childName}\n🆔 Chat ID: <code>${chatId}</code>\n\nAdmin panelda tasdiqlang.`
        )
      }

      return Response.json({ ok: true })
    }

    // Unknown message
    await sendMessage(
      chatId,
      `Botdan foydalanish uchun /start buyrug'ini yuboring.`
    )
    return Response.json({ ok: true })

  } catch (err) {
    console.error('Telegram webhook error:', err)
    return Response.json({ ok: true })
  }
}
