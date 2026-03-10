import AdminProfileClient from '@/components/dashboard/admin/AdminProfileClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 60

export default async function TeacherProfilePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(*)')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Get email via RPC
  const { data: emailData } = await supabase.rpc('get_user_emails', { user_ids: [profile.user_id] })
  const email = emailData?.[0]?.email || '—'

  // Teacher's clubs
  const { data: myClubs } = await supabase
    .from('clubs')
    .select('id, name, schedule, max_students')
    .eq('teacher_id', profile.id)

  return (
    <div className="space-y-6">
      <AdminProfileClient profile={{ ...profile, role: 'teacher' }} email={email} />

      {/* My Clubs Section */}
      {myClubs && myClubs.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4">🏫 Mening to&apos;garaklarim ({myClubs.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {myClubs.map(club => (
                <div key={club.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">📚</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{club.name}</p>
                    <p className="text-xs text-gray-500">{club.schedule || '—'} · {club.max_students || '∞'} o&apos;rin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
