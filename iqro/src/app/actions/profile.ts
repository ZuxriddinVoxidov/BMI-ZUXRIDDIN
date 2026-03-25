'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateParentTelegram(data: {
  parent_name: string
  parent_telegram_id: string
}) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { error } = await admin
    .from('profiles')
    .update({
      parent_name: data.parent_name,
      parent_telegram_id: data.parent_telegram_id,
    })
    .eq('id', profile!.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/student/profile')
  return { success: true }
}

export async function updateStudentGrade(grade: string) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  const { error } = await admin
    .from('profiles')
    .update({ grade })
    .eq('id', profile!.id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/student/profile')
  revalidatePath('/student/explore')
  revalidatePath('/student')
  return { success: true }
}

export async function updateAdminProfile(data: {
  full_name: string
  email?: string
  phone?: string
  new_password?: string
}) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  await admin
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      ...(data.new_password && { plain_password: data.new_password }),
    })
    .eq('user_id', user.id)

  const authUpdates: Record<string, unknown> = {}
  if (data.new_password) authUpdates.password = data.new_password
  if (data.email && data.email !== user.email) {
    authUpdates.email = data.email
    authUpdates.email_confirm = true
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await admin.auth.admin.updateUserById(user.id, authUpdates)
    if (authError) return { success: false, error: authError.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProfileAvatar(formData: FormData) {
  try {
    const file = formData.get('avatar') as File | null
    if (!file) return { success: false, error: 'Fayl topilmadi' }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const supabase = createClient()
    const admin = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Auth xatoligi' }

    const { data: profile } = await admin.from('profiles').select('id, role').eq('user_id', user.id).single()
    if (!profile) return { success: false, error: 'Profil topilmadi' }

    const fileExt = file.name.split('.').pop()
    const filename = `${profile.role}-${profile.id}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await admin.storage
      .from('avatars')
      .upload(filename, buffer, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) return { success: false, error: uploadError.message }

    const { data: { publicUrl } } = admin.storage
      .from('avatars')
      .getPublicUrl(uploadData.path)

    const { error: dbError } = await admin
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id)

    if (dbError) return { success: false, error: dbError.message }

    if (profile.role === 'teacher') {
      await admin.from('clubs').update({ teacher_image_url: publicUrl }).eq('teacher_id', profile.id)
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard')
    revalidatePath('/teacher/profile')
    revalidatePath('/director/profile')
    
    return { success: true, avatarUrl: publicUrl }
  } catch (err: unknown) {
    console.error('updateProfileAvatar crash:', err)
    return { success: false, error: String(err) }
  }
}

