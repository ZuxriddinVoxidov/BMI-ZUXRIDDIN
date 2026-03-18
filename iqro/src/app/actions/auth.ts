'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient()
  const selectedRole = formData.get('selectedRole') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { error: 'Profil topilmadi' }

  if (!selectedRole) {
    // No role check if not provided
  } else if (selectedRole === 'student' && profile.role !== 'student') {
    await supabase.auth.signOut()
    return { error: 'Bu kirish faqat o\'quvchilar uchun. O\'qituvchi sifatida kiring.' }
  } else if (selectedRole === 'teacher' && 
      !['teacher', 'school_admin', 'director'].includes(profile.role)) {
    await supabase.auth.signOut()
    return { error: 'Bu kirish faqat o\'qituvchilar uchun. O\'quvchi sifatida kiring.' }
  }

  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
