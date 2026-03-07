'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClub(formData: {
  name: string
  category: string
  teacher_id: string
  schedule: string
  room?: string
  max_students: number
  description?: string
  school_id: string
}) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').insert(formData)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/student/explore')
  return { success: true }
}

export async function updateClub(
  id: string,
  formData: {
    name: string
    category: string
    teacher_id: string
    schedule: string
    room?: string
    max_students: number
    description?: string
  }
) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').update(formData).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/student/explore')
  return { success: true }
}

export async function deleteClub(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/student/explore')
  return { success: true }
}
