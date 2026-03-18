import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentQuizList from '@/components/dashboard/student/StudentQuizList'

export const dynamic = 'force-dynamic'

export default async function StudentQuizPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/')

  // Fetch approved clubs for student
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('club_id')
    .eq('student_id', profile.id)
    .eq('status', 'approved')

  const clubIds = enrollments?.map(e => e.club_id) || []

  // Fetch quizzes for those clubs that are waiting, active or finished
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select(`
      id, title, status, club_id, duration_seconds, 
       клубы:clubs!club_id(name),
      profiles!teacher_id(full_name),
      quiz_questions(id)
    `)
    .in('club_id', clubIds)
    .in('status', ['waiting', 'active', 'finished'])
    .order('created_at', { ascending: false })

  // Fetch student's participations
  const { data: participations } = await supabase
    .from('quiz_participants')
    .select('quiz_id, score, finished_at')
    .eq('student_id', profile.id)

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Testlar</h1>
        <p className="text-gray-500 font-medium">To&apos;garaklaringizdagi barcha joriy va yakunlangan testlar</p>
      </div>
      <StudentQuizList 
        quizzes={quizzes as any || []} 
        participations={participations || []} 
      />
    </div>
  )
}
