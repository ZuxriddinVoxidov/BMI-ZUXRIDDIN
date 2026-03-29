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
  secret_word?: string
}) {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await admin.from('profiles').select('role').eq('user_id', user.id).single()
  const isAdmin = ['admin', 'school_admin', 'super_admin'].includes(profile?.role || '')
  const changingSensitive = !!data.new_password || (!!data.email && data.email !== user.email)

  if (isAdmin && changingSensitive) {
    if (!data.secret_word || data.secret_word !== process.env.ADMIN_SECRET_WORD) {
      return { success: false, error: "Maxfiy so'z noto'g'ri" }
    }
  }

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

export async function updateStudentProfile(data: {
  full_name: string
  phone: string
  grade: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Tizimga kirish talab qilinadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profil topilmadi' }

  const { error } = await admin
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      phone: data.phone.trim() || null,
      grade: data.grade.trim() || null,
    })
    .eq('id', profile.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/student/profile')
  revalidatePath('/student')

  return { success: true }
}
