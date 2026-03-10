import ClubCatalog from '@/components/dashboard/student/ClubCatalog'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 30

export default async function StudentExplorePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, school_id, grade')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const studentGrade = profile?.grade
    ? profile.grade.replace(/[^0-9]/g, '')
    : null

  // Fetch clubs filtered by grade
  let clubsQuery = supabase
    .from('clubs')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name, phone)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (studentGrade) {
    clubsQuery = clubsQuery.or(`target_grades.is.null,target_grades.cs.{${studentGrade}}`)
  } else {
    clubsQuery = clubsQuery.is('target_grades', null)
  }

  const { data: rawClubs } = await clubsQuery

  // Count approved enrollments per club
  const clubIds = rawClubs?.map(c => c.id) || []
  const enrollmentCounts: Record<string, number> = {}
  if (clubIds.length > 0) {
    const { data: countData } = await supabase
      .from('enrollments')
      .select('club_id')
      .in('club_id', clubIds)
      .eq('status', 'approved')
    if (countData) {
      for (const row of countData) {
        enrollmentCounts[row.club_id] = (enrollmentCounts[row.club_id] || 0) + 1
      }
    }
  }

  const clubs = rawClubs?.map(c => ({
    ...c,
    enrolled_count: enrollmentCounts[c.id] || 0
  })) || []

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

      {/* No grade warning */}
      {!studentGrade && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800">
            Sinfingiz belgilanmagan. Profil sahifasida sinfingizni belgilang — shunda sinfingizga mos to&apos;garaklar ko&apos;rinadi.
          </p>
        </div>
      )}

      <ClubCatalog
        clubs={(clubs as Record<string, unknown>[]) || []}
        myEnrollments={(myEnrollments as Record<string, unknown>[]) || []}
      />
    </div>
  )
}
