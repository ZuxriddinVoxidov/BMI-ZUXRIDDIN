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

export async function updateStudentInfo(data: {
  profile_id: string
  user_id?: string
  full_name: string
  parent_name: string
  parent_telegram_id: string
  grade?: string
  new_password?: string
}) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      parent_name: data.parent_name,
      parent_telegram_id: data.parent_telegram_id || null,
      grade: data.grade || null,
      ...(data.new_password && { plain_password: data.new_password }),
    })
    .eq('id', data.profile_id)

  if (error) return { success: false, error: error.message }

  // Update Supabase Auth password
  if (data.new_password && data.new_password.length >= 6 && data.user_id) {
    const adminClient = getAdminClient()
    if (adminClient) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(data.user_id, {
        password: data.new_password
      })
      if (authError) console.error('Auth password update failed:', authError.message)
    }
  }

  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleBlockStudent(profileId: string, block: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', profileId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true }
}
