import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'all'

  const supabase = createClient()

  // Calculate date ranges
  const now = new Date()
  const weekStart = new Date(now)
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  weekStart.setDate(now.getDate() - diffToMonday)
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Base query: join profiles + student_points
  const { data: students, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      grade,
      avatar_url,
      student_points!inner(
        total_points,
        weekly_points,
        monthly_points
      )
    `)
    .eq('role', 'student')
    .order('student_points(total_points)', { ascending: false })
    .limit(10)

  if (error) {
    // If weekly/monthly columns don't exist yet, fallback to total_points only
    const { data: fallback } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        grade,
        avatar_url,
        student_points!inner(total_points)
      `)
      .eq('role', 'student')
      .order('student_points(total_points)', { ascending: false })
      .limit(10)

    const formatted = (fallback || []).map((s, i) => ({
      rank: i + 1,
      student_id: s.id,
      full_name: s.full_name || 'Noma\'lum',
      grade: s.grade,
      avatar_url: s.avatar_url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total_points: (s.student_points as any)?.total_points ?? 0,
      weekly_points: 0,
      monthly_points: 0,
    }))

    return NextResponse.json({ data: formatted }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' }
    })
  }

  const formatted = (students || []).map((s, i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sp = s.student_points as any
    return {
      rank: i + 1,
      student_id: s.id,
      full_name: s.full_name || 'Noma\'lum',
      grade: s.grade,
      avatar_url: s.avatar_url,
      total_points: sp?.total_points ?? 0,
      weekly_points: sp?.weekly_points ?? 0,
      monthly_points: sp?.monthly_points ?? 0,
    }
  })

  // Sort by selected period
  if (period === 'weekly') {
    formatted.sort((a, b) => b.weekly_points - a.weekly_points)
    formatted.forEach((s, i) => s.rank = i + 1)
  } else if (period === 'monthly') {
    formatted.sort((a, b) => b.monthly_points - a.monthly_points)
    formatted.forEach((s, i) => s.rank = i + 1)
  }

  void weekStart
  void monthStart

  return NextResponse.json({ data: formatted }, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' }
  })
}
