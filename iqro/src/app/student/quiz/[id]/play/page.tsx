import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentQuizPlay from '@/components/dashboard/student/StudentQuizPlay'

export const dynamic = 'force-dynamic'

export default async function StudentQuizPlayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/')

  // Fetch quiz with questions
  const { data: quiz } = await supabase
    .from('quizzes')
    .select(`
      *,
      clubs(name),
      quiz_questions(*)
    `)
    .eq('id', params.id)
    .single()

  if (!quiz) redirect('/student/quiz')

  // Verify participation
  const { data: participation } = await supabase
    .from('quiz_participants')
    .select('*')
    .eq('quiz_id', params.id)
    .eq('student_id', profile.id)
    .single()

  if (!participation && quiz.status !== 'waiting') {
    // If not joined and it's already active/finished, can't play
    redirect('/student/quiz')
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <StudentQuizPlay 
        quiz={quiz as any} 
        participation={participation as any} 
      />
    </div>
  )
}
