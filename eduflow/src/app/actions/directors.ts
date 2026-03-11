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

export async function updateDirectorInfo(
  directorId: string,
  userId: string,
  data: {
    full_name: string
    phone?: string
    new_password?: string
  }
) {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {
    full_name: data.full_name,
    phone: data.phone || null,
  }
  if (data.new_password) {
    updateData.plain_password = data.new_password
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', directorId)

  if (error) return { success: false, error: error.message }

  // Update Supabase Auth password
  if (data.new_password && data.new_password.length >= 6) {
    const adminClient = getAdminClient()
    if (adminClient) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        password: data.new_password
      })
      if (authError) console.error('Auth password update failed:', authError.message)
    }
  }

  revalidatePath('/dashboard/directors')
  return { success: true }
}

export async function toggleBlockDirector(
  directorId: string,
  block: boolean
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: block })
    .eq('id', directorId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard/directors')
  return { success: true }
}
