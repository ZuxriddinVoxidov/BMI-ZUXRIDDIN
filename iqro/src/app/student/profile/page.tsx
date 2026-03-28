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
  const initials = (profile.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const regDate = new Date(profile.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
  const schoolName = school?.name ? `${school.name}-maktab` : "Maktab ko'rsatilmagan"

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl">
      {/* === BANNER CARD === */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Gradient banner */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />
          {/* Avatar */}
          <div className="absolute -bottom-10 left-5 sm:left-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black border-[3px] border-white dark:border-gray-900 shadow-lg z-20">
            {initials}
          </div>
        </div>

        {/* Name + badges */}
        <div className="pt-14 pb-5 px-5 sm:px-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            {profile.full_name || '—'}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-500/20 text-xs">
              🎓 O&apos;quvchi
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium border border-gray-100 dark:border-gray-700 text-xs">
              🏫 {schoolName}
            </span>
            {profile.grade && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-medium border text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20">
                📚 {profile.grade}-sinf
              </span>
            )}

          </div>
        </div>


      </div>

      {/* === PERSONAL INFO + PASSWORD === */}
      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
        {/* Editable personal info */}
        <StudentProfileClient
          profile={{
            full_name: profile.full_name,
            phone: profile.phone ?? null,
            grade: profile.grade ?? null,
          }}
          email={user.email || '—'}
          school={schoolName}
          regDate={regDate}
        />

        {/* Password change */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 text-base sm:text-lg">🔐 Parolni o&apos;zgartirish</h2>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}
