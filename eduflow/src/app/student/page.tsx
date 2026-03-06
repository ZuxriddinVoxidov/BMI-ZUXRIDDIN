import GrowingTree from '@/components/dashboard/student/GrowingTree'
import { getStudentLevel } from '@/lib/levels'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function StudentHomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Fetch points
  const { data: pointsData } = await supabase
    .from('student_points')
    .select('total_points')
    .eq('student_id', profile.id)
    .single()

  const points = pointsData?.total_points || 0
  const level = getStudentLevel(points)

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, club:clubs(*)')
    .eq('student_id', profile.id)
    .eq('status', 'approved')

  // Fetch recent rewards
  const { data: recentRewards } = await supabase
    .from('teacher_rewards')
    .select('*, teacher:profiles!teacher_id(full_name), club:clubs(name)')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const firstName = (profile.full_name || "O'quvchi").split(' ')[0]
  const hasEnrollments = enrollments && enrollments.length > 0

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">
          Salom, {firstName}! 🎯
        </h1>
        <p className="text-white/70">
          {hasEnrollments
            ? `Sizda ${enrollments.length} ta to'garak bor. Muvaffaqiyatlar!`
            : "To'garaklar katalogidan o'zingizga mos to'garakni tanlang!"}
        </p>
      </div>

      {/* Main Content — 2 columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT — Growing Tree (3/5) */}
        <div className="lg:col-span-3">
          <GrowingTree points={points} level={level} />
        </div>

        {/* RIGHT — Stats & Rewards (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">🏆 Jami ball</p>
              <p className="text-2xl font-extrabold text-gray-900">{points}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">📚 To&apos;garaklar</p>
              <p className="text-2xl font-extrabold text-gray-900">
                {enrollments?.length || 0} ta
              </p>
            </div>
          </div>

          {/* Recent Rewards */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3">So&apos;nggi rag&apos;batlar</h3>
            {recentRewards && recentRewards.length > 0 ? (
              <div className="space-y-3">
                {recentRewards.map((reward: Record<string, unknown>) => {
                  const teacher = reward.teacher as Record<string, unknown> | null
                  const club = reward.club as Record<string, unknown> | null
                  return (
                    <div
                      key={reward.id as string}
                      className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl"
                    >
                      <span className="text-lg">⭐</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(teacher?.full_name as string) || "O'qituvchi"} sizga{' '}
                          <span className="font-bold text-amber-600">
                            {reward.points_given as number} ball
                          </span>{' '}
                          berdi
                        </p>
                        <p className="text-xs text-gray-500">
                          {(club?.name as string) || "To'garak"} —{' '}
                          {reward.lesson_date as string}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  Hali rag&apos;bat olmagansiz.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Darsga faol qatnashing! 💪
                </p>
              </div>
            )}
          </div>

          {/* Quick Link to Explore */}
          {!hasEnrollments && (
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
