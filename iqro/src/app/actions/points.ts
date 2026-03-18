'use server'

import { createClient } from '@/lib/supabase/server'

export interface PointTransaction {
  id: string
  points: number
  reason: string
  source: 'attendance' | 'quiz' | 'review' | 'work' | 'other'
  created_at: string
}

export async function getMyPointTransactions(): Promise<PointTransaction[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!profile) return []

  const { data } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })

  return (data || []) as PointTransaction[]
}
