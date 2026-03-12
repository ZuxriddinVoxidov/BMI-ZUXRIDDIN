'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceRoleKey || !supabaseUrl) return null
  return createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function addTeacher(data: {
  full_name: string
  email: string
  password: string
  school_id: string
}) {
  // Try admin client first (skips email confirmation)
  const adminClient = getAdminClient()

  if (adminClient) {
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: 'teacher',
      },
    })

    if (authError) return { success: false, error: authError.message }
    if (!authData.user) return { success: false, error: "Foydalanuvchi yaratilmadi" }

    const supabase = createClient()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'teacher',
        full_name: data.full_name,
        school_id: data.school_id,
        plain_password: data.password,
      })
      .eq('user_id', authData.user.id)

    if (profileError) {
      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        role: 'teacher',
        full_name: data.full_name,
        school_id: data.school_id,
        plain_password: data.password,
      })
    }
  } else {
    // Fallback: use signUp (may require email confirmation)
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: 'teacher',
        },
      },
    })

    if (authError) return { success: false, error: authError.message }
    if (!authData.user) return { success: false, error: "Foydalanuvchi yaratilmadi" }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'teacher',
        full_name: data.full_name,
        school_id: data.school_id,
        plain_password: data.password,
      })
      .eq('user_id', authData.user.id)

    if (profileError) {
      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        role: 'teacher',
        full_name: data.full_name,
        school_id: data.school_id,
        plain_password: data.password,
      })
    }
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockTeacher(profileId: string, block: boolean) {
  const supabase = createClient()
  await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  revalidatePath('/dashboard/teachers')
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
  const supabase = createClient()

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
    const adminClient = getAdminClient()
    if (adminClient) {
      const authUpdate: Record<string, string> = {}
      if (data.new_password && data.new_password.length >= 6) authUpdate.password = data.new_password
      if (data.email) authUpdate.email = data.email
      if (Object.keys(authUpdate).length > 0) {
        const { error: authError } = await adminClient.auth.admin.updateUserById(data.user_id, authUpdate)
        if (authError) console.error('Auth update failed:', authError.message)
      }
    }
  }

  revalidatePath('/dashboard/teachers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTeacher(
  teacherId: string,
  userId: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', teacherId)

  if (error) return { 
    success: false, error: error.message 
  }

  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceRoleKey && supabaseUrl) {
    const { createClient: createAdminClient } = 
      await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, 
                persistSession: false } }
    )
    await adminClient.auth.admin.deleteUser(userId)
  }

  revalidatePath('/dashboard/teachers')
  return { success: true }
}
