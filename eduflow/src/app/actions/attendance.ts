'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAttendance(records: {
  club_id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'excused'
  note?: string
}[]) {
  const supabase = createClient()

  for (const record of records) {
    await supabase
      .from('attendance')
      .upsert(record, {
        onConflict: 'club_id,student_id,date',
      })
  }

  revalidatePath('/teacher/attendance')
  revalidatePath('/teacher')
  return { success: true }
}
