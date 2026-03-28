import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentQuizPlay from '@/components/dashboard/student/StudentQuizPlay'

export const dynamic = 'force-dynamic'

interface QuizQuestion {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface QuizWithQuestions {
  id: string
  title: string
  status: string
  duration_seconds: number
  clubs: { name: string }
  quiz_questions: QuizQuestion[]
}

interface Participation {
  id: string
  student_id: string
  score: number | null
  finished_at: string | null
}

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

  const { data: participation } = await supabase
    .from('quiz_participants')
    .select('*')
    .eq('quiz_id', params.id)
    .eq('student_id', profile.id)
    .single()

  if (!participation && quiz.status !== 'waiting') {
    redirect('/student/quiz')
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <StudentQuizPlay
        quiz={quiz as QuizWithQuestions}
        participation={participation as Participation | null}
      />
    </div>
  )
}
