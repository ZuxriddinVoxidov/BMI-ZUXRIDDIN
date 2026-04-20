export const dynamic = 'force-dynamic'

import PasswordChangeForm from '@/components/dashboard/student/PasswordChangeForm'
import StudentProfileClient from '@/components/dashboard/student/StudentProfileClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(name, district)')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const school = profile.school as { name: string; district?: string } | null
  const regDate = new Date(profile.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
  const schoolName = school?.name ? `${school.name}-maktab` : "Maktab ko'rsatilmagan"

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 
        Client component now handles the Banner, Avatar upload and 
        personal information form for a cohesive real-time experience.
      */}
      <div className="grid grid-cols-1 gap-6">
        <StudentProfileClient
          profile={{
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name,
            phone: profile.phone ?? null,
            grade: profile.grade ?? null,
            avatar_url: profile.avatar_url ?? null,
          }}
          email={user.email || '—'}
          school={schoolName}
          regDate={regDate}
        />

        {/* Password change (kept separate as it handles its own server action) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 text-base sm:text-lg flex items-center gap-2">
            🔐 Parolni o&apos;zgartirish
          </h2>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}
