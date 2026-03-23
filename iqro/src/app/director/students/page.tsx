import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DirectorStudentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, grade, is_blocked')
    .eq('school_id', profile.school_id)
    .eq('role', 'student')
    .order('grade')

  // Grade distribution
  const gradeMap: Record<string, number> = {}
  students?.forEach(s => { gradeMap[s.grade || 'Noma\'lum'] = (gradeMap[s.grade || 'Noma\'lum'] || 0) + 1 })
  const gradeData = Object.entries(gradeMap).sort(([a], [b]) => {
    const na = parseInt(a), nb = parseInt(b)
    return (isNaN(na) ? 99 : na) - (isNaN(nb) ? 99 : nb)
  })

  const activeCount = students?.filter(s => !s.is_blocked).length || 0
  const blockedCount = students?.filter(s => s.is_blocked).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">👥 O&apos;quvchilar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{students?.length || 0} ta o&apos;quvchi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">Jami</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{students?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">✅ Faol</p>
          <p className="text-3xl font-extrabold text-emerald-600">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">🚫 Bloklangan</p>
          <p className="text-3xl font-extrabold text-red-500">{blockedCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">📊 Sinf bo&apos;yicha taqsimot</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {gradeData.map(([grade, count]) => (
            <div key={grade} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-lg font-bold text-indigo-600">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-200">{grade}-sinf</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[500px]">
            <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Sinf</th>
              <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Holat</th>
            </tr>
          </thead>
          <tbody>
            {students?.slice(0, 20).map(s => (
              <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {(s.full_name || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{s.full_name}</span>
                  </div>
                </td>
                <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{s.grade || '—'}-sinf</td>
                <td className="py-3 px-5">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_blocked ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                    {s.is_blocked ? '● Bloklangan' : '● Faol'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {students && students.length > 20 && (
          <p className="text-center text-xs text-gray-400 py-3">va yana {students.length - 20} ta...</p>
        )}
      </div>
    </div>
  )
}
