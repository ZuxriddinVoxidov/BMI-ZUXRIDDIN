'use server'
import { createClient } from '@/lib/supabase/server'
import {
    buildAbsentMessage,
    buildExcusedMessage,
    sendTelegramMessage,
} from '@/lib/telegram'
import { revalidatePath } from 'next/cache'

export async function saveAttendance(records: {
  club_id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'excused'
  note?: string
}[]) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: teacher } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user!.id)
    .single()

  const clubId = records[0]?.club_id
  const { data: club } = await supabase
    .from('clubs')
    .select('name')
    .eq('id', clubId)
    .single()

  // Save all attendance records
  for (const record of records) {
    await supabase
      .from('attendance')
      .upsert(record, { onConflict: 'club_id,student_id,date' })
  }

  // Send Telegram to parents of absent/excused students
  const notifyRecords = records.filter(
    r => r.status === 'absent' || r.status === 'excused'
  )

  for (const record of notifyRecords) {
    const { data: student } = await supabase
      .from('profiles')
      .select('full_name, parent_telegram_id')
      .eq('id', record.student_id)
      .single()

    if (student?.parent_telegram_id) {
      const message =
        record.status === 'absent'
          ? buildAbsentMessage(
              student.full_name,
              club?.name || '',
              teacher?.full_name || '',
              record.date
            )
          : buildExcusedMessage(
              student.full_name,
              club?.name || '',
              record.date
            )

      const result = await sendTelegramMessage(
        student.parent_telegram_id,
        message
      )

      if (result.success) {
        await supabase.from('notifications').insert({
          user_id: record.student_id,
          message:
            record.status === 'absent'
              ? '📱 Ota-onangizga davomat haqida xabar yuborildi'
              : '📱 Ota-onangizga sababli kelmaganingiz haqida xabar yuborildi',
          is_read: false,
        })
      }
    }
  }

  revalidatePath('/teacher/attendance')
  return { success: true }
}
