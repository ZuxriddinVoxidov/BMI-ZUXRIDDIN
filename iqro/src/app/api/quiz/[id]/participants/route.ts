import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: participants } = await supabase
    .from('quiz_participants')
    .select(`
      student_id,
      score,
      finished_at,
      joined_at,
      profiles!student_id(full_name, avatar_url)
    `)
    .eq('quiz_id', params.id)
    .order('score', { ascending: false })

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('quiz_questions(id)')
    .eq('id', params.id)
    .single()

  const totalQuestions = quiz?.quiz_questions?.length || 0

  const mapped = (participants || []).map(p => ({
    student_id: p.student_id,
    full_name: (p.profiles as any)?.full_name || (p.profiles as any)?.[0]?.full_name || 'Noma\'lum',
    avatar_url: (p.profiles as any)?.avatar_url || (p.profiles as any)?.[0]?.avatar_url || null,
    score: p.score || 0,
    finished_at: p.finished_at,
    total_questions: totalQuestions
  }))

  return NextResponse.json({ participants: mapped })
}
