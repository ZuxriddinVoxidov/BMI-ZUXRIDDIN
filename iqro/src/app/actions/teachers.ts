'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addTeacher(data: {
  full_name: string
  email: string
  password: string
  school_id: string
}) {
  const supabase = createAdminClient()

  let userId: string

  // Try to create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: 'teacher',
    },
  })

  if (authError) {
    // If user already exists, find them and update
    if (authError.message.includes('already been registered')) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users?.users?.find(u => u.email === data.email)
      if (!existingUser) return { success: false, error: 'Foydalanuvchi topilmadi' }
      userId = existingUser.id

      // Update password
      await supabase.auth.admin.updateUserById(userId, { password: data.password })
    } else {
      return { success: false, error: authError.message }
    }
  } else {
    if (!authData.user) return { success: false, error: "Foydalanuvchi yaratilmadi" }
    userId = authData.user.id
  }

  // Upsert profile — update if exists, insert if not
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  let profileId = existingProfile?.id

  if (existingProfile) {
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('profiles')
      .update({
        role: 'teacher',
        full_name: data.full_name,
        school_id: data.school_id,
        plain_password: data.password,
      })
      .eq('id', profileId)
      .select('id')
      .single()
    if (!updateErr && updatedProfile) profileId = updatedProfile.id
  } else {
    const { data: insertedProfile, error: insertErr } = await supabase.from('profiles').insert({
      user_id: userId,
      role: 'teacher',
      full_name: data.full_name,
      school_id: data.school_id,
      plain_password: data.password,
    }).select('id').single()
    if (!insertErr && insertedProfile) profileId = insertedProfile.id
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true, profileId }
}

export async function toggleBlockTeacher(profileId: string, block: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTeacherInfo(data: {
  profile_id: string
  user_id?: string
  full_name: string
  phone?: string
  teacher_bio?: string
  email?: string
  new_password?: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      teacher_bio: data.teacher_bio || null,
      ...(data.new_password && { plain_password: data.new_password }),
    })
    .eq('id', data.profile_id)

  if (error) return { success: false, error: error.message }

  // Update Supabase Auth password and/or email
  if (data.user_id && (data.new_password || data.email)) {
    const authUpdate: Record<string, string> = {}
    if (data.new_password && data.new_password.length >= 6) authUpdate.password = data.new_password
    if (data.email) authUpdate.email = data.email
    if (Object.keys(authUpdate).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(data.user_id, authUpdate)
      if (authError) console.error('Auth update failed:', authError.message)
    }
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTeacher(teacherId: string, userId: string) {
  try {
    const supabase = createAdminClient()

    // Delete all related records first (FK constraints)
    await supabase.from('teacher_rewards').delete().eq('teacher_id', teacherId)
    await supabase.from('notifications').delete().eq('user_id', teacherId)

    // Now delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', teacherId)

    if (error) {
      console.error('Delete teacher profile error:', error.message)
      return { success: false, error: error.message }
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard/teachers')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('deleteTeacher crash:', err)
    return { success: false, error: String(err) }
  }
}

export async function updateTeacherAvatar(profileId: string, formData: FormData) {
  try {
    const file = formData.get('avatar') as File | null
    if (!file) return { success: false, error: 'Fayl topilmadi' }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const supabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const filename = `teacher-${profileId}-${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filename, buffer, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) return { success: false, error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path)

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profileId)

    if (dbError) return { success: false, error: dbError.message }

    revalidatePath('/dashboard/teachers')
    revalidatePath('/dashboard')
    
    return { success: true, avatarUrl: publicUrl }
  } catch (err: unknown) {
    console.error('updateTeacherAvatar crash:', err)
    return { success: false, error: String(err) }
  }
}
