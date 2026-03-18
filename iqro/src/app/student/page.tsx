import GrowingTree from '@/components/dashboard/student/GrowingTree'
import { getStudentLevel } from '@/lib/levels'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentHomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  const thisMonthStart = new Date()
  thisMonthStart.setDate(1)
  const thisMonthStr = thisMonthStart.toISOString().split('T')[0]

  const [
    { data: pointsData },
    { count: approvedClubsCount },
    { count: pendingClubsCount },
    { data: attendanceData },
    { data: thisMonthAttendance },
    { data: recentRewards },
  ] = await Promise.all([
    supabase.from('student_points')
      .select('total_points').eq('student_id', profile.id).maybeSingle(),
    supabase.from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile.id).eq('status', 'approved'),
    supabase.from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile.id).eq('status', 'pending'),
    supabase.from('attendance')
      .select('status').eq('student_id', profile.id),
    supabase.from('attendance')
      .select('status').eq('student_id', profile.id)
      .gte('date', thisMonthStr),
    supabase.from('teacher_rewards')
      .select('*, teacher:profiles!teacher_id(full_name), club:clubs(name)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const points = pointsData?.total_points ?? 0

  if (!pointsData) {
    await supabase.from('student_points')
      .upsert({ student_id: profile.id, total_points: 0 }, { onConflict: 'student_id' })
  }

  const level = getStudentLevel(points)
  const totalDays = attendanceData?.length || 0
  const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const thisMonthPresent = thisMonthAttendance?.filter(a => a.status === 'present').length || 0

  const firstName = (profile.full_name || "O'quvchi").split(' ')[0]
  const approved = approvedClubsCount || 0
  const pending = pendingClubsCount || 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">
          Salom, {firstName}! 🎯
        </h1>
        <p className="text-white/70">
          {approved > 0
            ? `Sizda ${approved} ta to'garak bor. Muvaffaqiyatlar!`
            : "To'garaklar katalogidan o'zingizga mos to'garakni tanlang!"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">🏆 Mening ballim</p>
          <p className="text-2xl font-extrabold text-gray-900">{points}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{level.name}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">🏫 To&apos;garaklarim</p>
          <p className="text-2xl font-extrabold text-gray-900">{approved} ta</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {pending > 0 ? `${pending} ta kutilmoqda` : "Faol a'zolik"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">📊 Davomat</p>
          <p className="text-2xl font-extrabold text-gray-900">{attendanceRate}%</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{presentDays} / {totalDays} kun</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">⭐ Bu oy</p>
          <p className="text-2xl font-extrabold text-gray-900">{thisMonthPresent} kun</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Darsga qatnashdim</p>
        </div>
      </div>

      {/* Main Content — 2 columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT — Growing Tree (3/5) */}
        <div className="lg:col-span-3">
          <GrowingTree points={points} level={level} />
        </div>

        {/* RIGHT — Rewards (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Rewards */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">So&apos;nggi rag&apos;batlar</h3>
            {recentRewards && recentRewards.length > 0 ? (
              <div className="space-y-3">
                {recentRewards.map((reward: Record<string, unknown>) => {
                  const teacher = reward.teacher as Record<string, unknown> | null
                  const club = reward.club as Record<string, unknown> | null
                  return (
                    <div key={reward.id as string} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                      <span className="text-lg">⭐</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(teacher?.full_name as string) || "O'qituvchi"} sizga{' '}
                          <span className="font-bold text-amber-600">{reward.points_given as number} ball</span>{' '}berdi
                        </p>
                        <p className="text-xs text-gray-500">
                          {(club?.name as string) || "To'garak"} — {reward.lesson_date as string}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">Hali rag&apos;bat olmagansiz.</p>
                <p className="text-xs text-gray-400 mt-1">Darsga faol qatnashing! 💪</p>
              </div>
            )}
          </div>

          {/* Quick Link to Explore */}
          {approved === 0 && (
            <Link
              href="/student/explore"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
            >
              To&apos;garaklarni ko&apos;rish →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
