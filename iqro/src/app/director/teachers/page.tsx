import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DirectorTeachersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name, is_blocked, clubs:clubs(id, name)')
    .eq('school_id', profile.school_id)
    .eq('role', 'teacher')
    .order('full_name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">👨‍🏫 O&apos;qituvchilar</h1>
        <p className="text-sm text-gray-500 mt-1">{teachers?.length || 0} ta o&apos;qituvchi</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers?.map(t => {
          const initials = (t.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{initials}</div>
                <div>
                  <p className="font-semibold text-gray-900">{t.full_name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_blocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {t.is_blocked ? '● Bloklangan' : '● Faol'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>🏫 {t.clubs?.length || 0} ta to&apos;garak</p>
              </div>
              {t.clubs && t.clubs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.clubs.map((c: { id: string; name: string }) => (
                    <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{c.name}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {(!teachers || teachers.length === 0) && (
          <div className="col-span-3 text-center py-16">
            <p className="text-4xl mb-3">👨‍🏫</p>
            <p className="text-gray-500">O&apos;qituvchilar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  )
}
