'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface QuizQuestion {
  id?: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  order_index: number
}

export interface Quiz {
  id: string
  club_id: string
  teacher_id: string
  title: string
  description: string | null
  status: 'draft' | 'waiting' | 'active' | 'finished'
  duration_seconds: number
  created_at: string
  quiz_questions?: QuizQuestion[]
}

// Create a new quiz (draft)
export async function createQuiz(
  clubId: string,
  title: string,
  description: string,
  durationSeconds: number,
  questions: QuizQuestion[]
): Promise<{ success: boolean; quizId?: string; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return { success: false, error: 'Profil topilmadi' }

  const { data: quiz, error: quizError } = await admin
    .from('quizzes')
    .insert({ club_id: clubId, teacher_id: profile.id, title, description, duration_seconds: durationSeconds, status: 'draft' })
    .select('id').single()

  if (quizError || !quiz) return { success: false, error: 'Test yaratilmadi' }

  const questionsToInsert = questions.map((q, i) => ({
    quiz_id: quiz.id,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    order_index: i
  }))

  const { error: qError } = await admin.from('quiz_questions').insert(questionsToInsert)
  if (qError) return { success: false, error: 'Savollar saqlanmadi' }

  revalidatePath('/teacher/quiz')
  return { success: true, quizId: quiz.id }
}

// Update quiz questions (for editing)
export async function updateQuiz(
  quizId: string,
  title: string,
  description: string,
  durationSeconds: number,
  questions: QuizQuestion[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Ruxsat yo\'q' }

  await admin.from('quizzes').update({ title, description, duration_seconds: durationSeconds }).eq('id', quizId)
  await admin.from('quiz_questions').delete().eq('quiz_id', quizId)

  const questionsToInsert = questions.map((q, i) => ({
    quiz_id: quizId,
    question: q.question,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    order_index: i
  }))

  await admin.from('quiz_questions').insert(questionsToInsert)
  revalidatePath('/teacher/quiz')
  return { success: true }
}

// Publish quiz (draft -> waiting)
export async function publishQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  const { error } = await admin.from('quizzes').update({ status: 'waiting' }).eq('id', quizId)
  if (error) return { success: false, error: 'Nashr qilinmadi' }
  revalidatePath('/teacher/quiz')
  return { success: true }
}

// Start quiz (waiting -> active)
export async function startQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  await admin.from('quizzes').update({ status: 'active' }).eq('id', quizId)
  await admin.from('quiz_sessions').insert({ quiz_id: quizId, started_at: new Date().toISOString() })
  revalidatePath('/teacher/quiz')
  return { success: true }
}

// Finish quiz (active -> finished) and award points
export async function finishQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()

  await admin.from('quizzes').update({ status: 'finished' }).eq('id', quizId)
  await admin.from('quiz_sessions').update({ finished_at: new Date().toISOString() }).eq('quiz_id', quizId).is('finished_at', null)

  // Get top participants sorted by score
  const { data: participants } = await admin
    .from('quiz_participants')
    .select('student_id, score')
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })

  // Award points: 1st=15, 2nd=12, 3rd=9, 4th=6, 5th=3
  const pointsMap = [15, 12, 9, 6, 3]

  for (let i = 0; i < Math.min(5, (participants || []).length); i++) {
    const p = participants![i]
    if (!p.student_id || p.score === 0) continue
    const pointsToAdd = pointsMap[i]
    
    const { data: existing } = await admin
      .from('student_points')
      .select('id, total_points')
      .eq('student_id', p.student_id)
      .single()

    if (existing) {
      await admin
        .from('student_points')
        .update({ 
          total_points: (existing.total_points || 0) + pointsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', p.student_id)
    } else {
      await admin
        .from('student_points')
        .insert({ 
          student_id: p.student_id, 
          total_points: pointsToAdd 
        })
    }

    const rankLabels = ['1-o\'rin', '2-o\'rin', '3-o\'rin', '4-o\'rin', '5-o\'rin']
    await admin.from('point_transactions').insert({
      student_id: p.student_id,
      points: pointsToAdd,
      reason: `Test natijasi — ${rankLabels[i]}: ${p.score} to\'g\'ri javob`,
      source: 'quiz',
      source_id: quizId
    })
  }

  revalidatePath('/teacher/quiz')
  return { success: true }
}

export async function deleteQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Ruxsat yoq' }
  const { error } = await admin
    .from('quizzes')
    .delete()
    .eq('id', quizId)
  if (error) return { success: false, error: 'Ochirish xatosi' }
  revalidatePath('/teacher/quiz')
  return { success: true }
}

// Get teacher's quizzes
export async function getTeacherQuizzes(clubId?: string): Promise<Quiz[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return []

  let query = supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('teacher_id', profile.id)
    .order('created_at', { ascending: false })

  if (clubId) query = query.eq('club_id', clubId)

  const { data } = await query
  return (data || []) as Quiz[]
}

// Join quiz (student)
export async function joinQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return { success: false, error: 'Profil topilmadi' }

  const { error } = await admin.from('quiz_participants')
    .upsert({ quiz_id: quizId, student_id: profile.id }, { onConflict: 'quiz_id,student_id' })

  if (error) return { success: false, error: 'Qo\'shilmadi' }
  return { success: true }
}

// Submit answers (student)
export async function submitAnswers(
  quizId: string,
  answers: { questionId: string; answer: 'A' | 'B' | 'C' | 'D' }[]
): Promise<{ success: boolean; score?: number; error?: string }> {
  const supabase = createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Foydalanuvchi topilmadi' }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return { success: false, error: 'Profil topilmadi' }

  // Get correct answers
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, correct_answer')
    .eq('quiz_id', quizId)

  if (!questions) return { success: false, error: 'Savollar topilmadi' }

  const answerRecords = answers.map(a => {
    const q = questions.find(q => q.id === a.questionId)
    return {
      quiz_id: quizId,
      question_id: a.questionId,
      student_id: profile.id,
      answer: a.answer,
      is_correct: q?.correct_answer === a.answer
    }
  })

  const score = answerRecords.filter(a => a.is_correct).length

  await admin.from('quiz_answers').insert(answerRecords)
  await admin.from('quiz_participants')
    .update({ score, finished_at: new Date().toISOString() })
    .eq('quiz_id', quizId)
    .eq('student_id', profile.id)

  return { success: true, score }
}
