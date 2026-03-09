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
  emoji?: string
  target_grades?: string[] | null
  is_paid?: boolean
  price?: number
}) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').insert(formData)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/dashboard')
  revalidatePath('/student/explore')
  revalidatePath('/')
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
    emoji?: string
    target_grades?: string[] | null
    is_paid?: boolean
    price?: number
  }
) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').update(formData).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/dashboard')
  revalidatePath('/student/explore')
  revalidatePath('/')
  return { success: true }
}

export async function deleteClub(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/clubs')
  revalidatePath('/dashboard')
  revalidatePath('/student/explore')
  revalidatePath('/')
  return { success: true }
}

export async function saveClubDetail(
  clubId: string,
  data: {
    full_description?: string
    teacher_bio?: string
    achievements?: string[]
    cover_image_url?: string
    teacher_image_url?: string
    room_image_url?: string
  }
) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').update(data).eq('id', clubId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/clubs/${clubId}`)
  revalidatePath('/dashboard/clubs')
  revalidatePath('/')
  return { success: true }
}

export async function publishClub(clubId: string, publish: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('clubs').update({ is_published: publish }).eq('id', clubId)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/clubs/${clubId}`)
  revalidatePath('/dashboard/clubs')
  revalidatePath('/student/explore')
  revalidatePath('/')
  return { success: true }
}
