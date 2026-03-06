import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function StudentSchedulePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, club:clubs(*)')
    .eq('student_id', profile?.id)
    .eq('status', 'approved')

  const hasData = enrollments && enrollments.length > 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Haftalik Jadval</h1>

      {hasData ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-gray-600 mb-4">Sizning haftalik dars jadvalingiz:</p>
          <div className="space-y-3">
            {enrollments.map((e: Record<string, unknown>) => {
              const club = e.club as Record<string, unknown> | null
              if (!club) return null
              return (
                <div key={e.id as string} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">
                    📅
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{club.name as string}</p>
                    <p className="text-sm text-gray-500">{(club.schedule as string) || 'Jadval belgilanmagan'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-[120px] h-[120px] bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">📅</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Jadval bo&apos;sh</h2>
          <p className="text-gray-500 text-center max-w-md mb-8">
            To&apos;garaklarga a&apos;zo bo&apos;lganingizdan so&apos;ng haftalik dars
            jadvalingiz bu yerda ko&apos;rinadi
          </p>
          <Link
            href="/student/explore"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
          >
            To&apos;garaklar katalogi →
          </Link>
        </div>
      )}
    </div>
  )
}
