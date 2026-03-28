import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Get questions with correct answers (only after quiz is finished)
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('status')
    .eq('id', params.id)
    .single()

  if (!quiz || quiz.status !== 'finished') {
    return NextResponse.json({ error: 'Quiz not finished yet' }, { status: 403 })
  }

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question, option_a, option_b, option_c, option_d, correct_answer, order_index')
    .eq('quiz_id', params.id)
    .order('order_index', { ascending: true })

  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('question_id, answer, is_correct')
    .eq('quiz_id', params.id)
    .eq('student_id', profile.id)

  const answerMap: Record<string, { answer: string; is_correct: boolean }> = {}
  for (const a of (answers || [])) {
    answerMap[a.question_id] = { answer: a.answer, is_correct: a.is_correct }
  }

  const result = (questions || []).map(q => ({
    id: q.id,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    order_index: q.order_index,
    student_answer: answerMap[q.id]?.answer || null,
    is_correct: answerMap[q.id]?.is_correct ?? false,
  }))

  return NextResponse.json({ questions: result })
}
