export const dynamic = 'force-dynamic'
import GradeSelector from '@/components/dashboard/student/GradeSelector'
import GrowingTree from '@/components/dashboard/student/GrowingTree'
import PasswordChangeForm from '@/components/dashboard/student/PasswordChangeForm'
import { getPointsToNextLevel, getProgressToNextLevel, getStudentLevel, LEVELS } from '@/lib/levels'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PointsHistory } from '@/components/dashboard/student/PointsHistory'
import { getMyPointTransactions } from '@/app/actions/points'

export default async function StudentProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(name, district)')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: pointsData } = await supabase
    .from('student_points')
    .select('total_points')
    .eq('student_id', profile.id)
    .maybeSingle()

  const points = pointsData?.total_points ?? 0

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, club:clubs(name, category, schedule)')
    .eq('student_id', profile.id)
    .eq('status', 'approved')

  const transactions = await getMyPointTransactions()

  const { data: works } = await supabase
    .from('student_works')
    .select('id')
    .eq('student_id', profile.id)

  const { data: attendanceData } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', profile.id)

  const presentCount = attendanceData?.filter((a: Record<string, unknown>) => a.status === 'present').length ?? 0
  const totalCount = attendanceData?.length ?? 0
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  const level = getStudentLevel(points)
  const progress = getProgressToNextLevel(points)
  const pointsToNext = getPointsToNextLevel(points)
  const nextLevel = LEVELS.find(l => l.level === level.level + 1)

  const school = profile.school as Record<string, unknown> | null
  const initials = (profile.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const regDate = new Date(profile.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Profile Card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-500 text-sm">🏫 {school?.name ? `${school.name}-maktab` : "Maktab ko'rsatilmagan"}</p>
              <div className="mt-2 text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block">
                Sinf: {profile.grade || '-'}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: level.bgColor, color: level.textColor }}>
                  {level.emoji} {level.name}
                </span>
                <span className="text-xs text-gray-400">{points} ball</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🏫', label: "To'garaklar", value: enrollments?.length || 0 },
              { icon: '🏆', label: 'Jami ball', value: points },
              { icon: '📊', label: 'Davomat', value: `${attendanceRate}%` },
              { icon: '📁', label: 'Yuklangan ishlar', value: works?.length || 0 },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2 — Daraja + Daraxt */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daraja kartasi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-5">🎖️ Daraja tizimi</h2>
          
          {/* Current level big display */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl mb-3" style={{ backgroundColor: level.bgColor }}>
              {level.emoji}
            </div>
            <h3 className="text-3xl font-black" style={{ color: level.textColor }}>{level.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{level.description}</p>
            <p className="text-sm font-medium text-gray-700 mt-2">
              {points} {nextLevel ? `/ ${nextLevel.minPoints}` : ''} ball
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%`, backgroundColor: level.color }}
              />
            </div>
            {nextLevel && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Keyingi daraja: <span className="font-semibold">{nextLevel.emoji} {nextLevel.name}</span> uchun <span className="font-bold text-indigo-600">{pointsToNext} ball</span> kerak
              </p>
            )}
            {!nextLevel && (
              <p className="text-xs text-emerald-600 mt-2 text-center font-semibold">
                🎉 Eng yuqori darajaga yetdingiz!
              </p>
            )}
          </div>

          {/* All levels steps */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {LEVELS.map((l) => {
              const isCurrent = l.level === level.level
              const isPast = l.level < level.level
              return (
                <div key={l.level} className={`text-center p-3 rounded-xl transition-all ${isCurrent ? 'ring-2 ring-indigo-400 bg-indigo-50' : isPast ? 'bg-emerald-50' : 'bg-gray-50 opacity-50'}`}>
                  <span className="text-2xl block mb-1">{l.emoji}</span>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-indigo-700' : isPast ? 'text-emerald-700' : 'text-gray-400'}`}>{l.name}</p>
                  <p className="text-[10px] text-gray-400">{l.minPoints}-{l.maxPoints === Infinity ? '∞' : l.maxPoints}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* GrowingTree */}
        <div>
          <GrowingTree points={points} level={level} />
        </div>
      </div>

      {/* SECTION 3 — Rag'batlar (Ballar tarixi) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <PointsHistory transactions={transactions} />
      </div>

      {/* SECTION 4 — Info + Password */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shaxsiy ma'lumotlar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">👤 Shaxsiy ma&apos;lumotlar</h2>
          <div className="space-y-4">
            {[
              { label: "To'liq ism", value: profile.full_name || '-' },
              { label: 'Email', value: user.email || '-' },
              { label: 'Maktab', value: school?.name ? `${school.name}-maktab` : '-' },
              { label: "Ro'yxatdan o'tgan", value: regDate },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Parolni o'zgartirish */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4">🔐 Parolni o&apos;zgartirish</h2>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  )
}
