'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface TeacherResource {
  id: string
  club_id: string
  teacher_id: string
  title: string
  file_url: string
  file_name: string
  file_size: number | null
  created_at: string
}

export async function getResourcesByClub(clubId: string): Promise<TeacherResource[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('teacher_resources')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
  return (data || []) as TeacherResource[]
}

export async function uploadResource(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'teacher') return { success: false, error: 'Ruxsat yor\'q' }

  const file = formData.get('file') as File
  const title = formData.get('title') as string
  const clubId = formData.get('club_id') as string

  if (!file || !title || !clubId) return { success: false, error: 'Barcha maydonlarni to\'ldiring' }
  if (file.size > 52428800) return { success: false, error: 'Fayl 50MB dan oshmasligi kerak' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  const buffer = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await adminClient.storage
    .from('resources')
    .upload(fileName, buffer, { contentType: file.type })

  if (uploadError) return { success: false, error: 'Fayl yuklanmadi' }

  const { data: { publicUrl } } = adminClient.storage.from('resources').getPublicUrl(fileName)

  const { error: dbError } = await adminClient
    .from('teacher_resources')
    .insert({ club_id: clubId, teacher_id: profile.id, title, file_url: publicUrl, file_name: file.name, file_size: file.size })

  if (dbError) return { success: false, error: 'Saqlashda xatolik' }

  revalidatePath('/teacher/clubs')
  revalidatePath('/student/clubs')
  return { success: true }
}

export async function deleteResource(resourceId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: resource } = await supabase
    .from('teacher_resources')
    .select('file_url')
    .eq('id', resourceId)
    .single()

  if (!resource) return { success: false, error: 'Topilmadi' }

  const urlParts = resource.file_url.split('/resources/')
  if (urlParts[1]) await adminClient.storage.from('resources').remove([urlParts[1]])

  const { error } = await adminClient.from('teacher_resources').delete().eq('id', resourceId)
  if (error) return { success: false, error: 'O\'chirishda xatolik' }

  revalidatePath('/teacher/clubs')
  return { success: true }
}
