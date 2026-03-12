'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function fixGhostUserAction(email: string, fullName: string, plainPassword: string) {
  try {
    const supabase = createAdminClient()
    let userId: string

    // 1. Find user ID by logging in temporarily
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: plainPassword,
      email_confirm: true
    })

    if (authError && authError.message.includes('already been registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: plainPassword
      })
      if (signInError) return { success: false, error: 'Cannot sign in: ' + signInError.message }
      if (!signInData.user) return { success: false, error: 'No user after sign in' }
      userId = signInData.user.id
    } else if (!authError && authData.user) {
      userId = authData.user.id
    } else {
      return { success: false, error: 'Auth failed' }
    }

    // 2. Get school
    const { data: school } = await supabase.from('schools').select('id').limit(1).single()
    if (!school) return { success: false, error: 'No school found' }

    // 3. Insert profile
    const { error: insertError } = await supabase.from('profiles').upsert({
      user_id: userId,
      role: 'teacher',
      full_name: fullName,
      school_id: school.id,
      plain_password: plainPassword
    })

    if (insertError) return { success: false, error: 'Insert failed: ' + insertError.message }

    return { success: true, message: 'Ghost user fixed!' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
