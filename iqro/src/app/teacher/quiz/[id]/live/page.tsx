import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherLiveRoom from '@/components/dashboard/teacher/TeacherLiveRoom'

export const dynamic = 'force-dynamic'

export default async function TeacherLiveQuizPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'teacher') redirect('/')

  // Fetch quiz with questions and club
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(*),
      clubs(name)
    `)
    .eq('id', params.id)
    .eq('teacher_id', profile.id)
    .single()

  if (error || !quiz) redirect('/teacher/quiz')

  // Fetch current participants
  const { data: participants } = await supabase
    .from('quiz_participants')
    .select(`
      *,
      profiles!student_id(full_name)
    `)
    .eq('quiz_id', params.id)

  return (
    <div className="max-w-7xl mx-auto py-8">
      <TeacherLiveRoom 
        quiz={quiz as any} 
        initialParticipants={participants as any || []} 
      />
    </div>
  )
}
