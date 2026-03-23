import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DirectorClubsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, teacher:profiles!teacher_id(full_name)')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">🏫 To&apos;garaklar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{clubs?.length || 0} ta to&apos;garak</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs?.map(club => (
          <div key={club.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{club.emoji || '📚'}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{club.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">{club.category || 'Umumiy'}</span>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
              <p className="dark:text-gray-300">👨‍🏫 {club.teacher?.full_name || '—'}</p>
              <p>📅 {club.schedule || '—'}</p>
              <p>👥 {club.max_students || '∞'} o&apos;rin</p>
              {club.price && club.price > 0 ? (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">{club.price.toLocaleString()} so&apos;m</span>
              ) : (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-green-950 text-emerald-600 dark:text-green-400 font-medium">Bepul</span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
              <span className={`text-xs px-2 py-0.5 rounded-full ${club.is_published ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {club.is_published ? '● Faol' : '● Qoralama'}
              </span>
            </div>
          </div>
        ))}
        {(!clubs || clubs.length === 0) && (
          <div className="col-span-3 text-center py-16">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500">To&apos;garaklar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  )
}
