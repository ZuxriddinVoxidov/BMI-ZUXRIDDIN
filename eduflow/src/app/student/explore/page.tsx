import ClubCatalog from '@/components/dashboard/student/ClubCatalog'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentExplorePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch all clubs
  const { data: clubs } = await supabase
    .from('clubs')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name)
    `)

  // Fetch student's existing enrollments
  const { data: myEnrollments } = await supabase
    .from('enrollments')
    .select('club_id, status')
    .eq('student_id', profile.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">To&apos;garaklar Katalogi</h1>
        <p className="text-gray-500 mt-1">O&apos;zingizga mos to&apos;garakni toping va a&apos;zo bo&apos;ling</p>
      </div>

      <ClubCatalog
        clubs={(clubs as Record<string, unknown>[]) || []}
        myEnrollments={(myEnrollments as Record<string, unknown>[]) || []}
      />
    </div>
  )
}
