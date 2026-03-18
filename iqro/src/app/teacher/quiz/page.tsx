import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TeacherQuizManager from '@/components/dashboard/teacher/TeacherQuizManager'
import { getTeacherQuizzes } from '@/app/actions/quiz'

export const dynamic = 'force-dynamic'

export default async function TeacherQuizPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'teacher') {
    redirect('/')
  }

  // Fetch teacher's clubs
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('teacher_id', profile.id)

  // Fetch quizzes
  const quizzes = await getTeacherQuizzes()

  return (
    <div className="max-w-7xl mx-auto py-8">
      <TeacherQuizManager 
        clubs={(clubs || []) as Record<string, unknown>[]} 
        quizzes={quizzes} 
      />
    </div>
  )
}
