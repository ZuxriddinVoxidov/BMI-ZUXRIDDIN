'use client'

import { applyToClub } from '@/app/actions/enrollment'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ClubDetailClientProps {
  club: any
  enrolledCount: number
  avgRating: string | null
  userEnrollment: any
  userProfile: any
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} daqiqa oldin`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} kun oldin`
  return `${Math.floor(days / 30)} oy oldin`
}

export default function ClubDetailClient({
  club, enrolledCount, avgRating, userEnrollment, userProfile,
}: ClubDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [localStatus, setLocalStatus] = useState(userEnrollment?.status || null)

  const emoji = club.emoji || getDefaultEmoji(club.category || '')
  const catColor = getCategoryColor(club.category || '')
  const targetGrades = club.target_grades as string[] | null
  const isFull = enrolledCount >= (club.max_students || 30)
  const reviews = (club.reviews || []) as any[]

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyToClub(club.id)
      if (result.success) {
        setLocalStatus('pending')
        setToast({ message: "Ariza muvaffaqiyatli yuborildi!", type: 'success' })
      } else {
        setToast({ message: result.error || 'Xatolik', type: 'error' })
      }
      setTimeout(() => setToast(null), 4000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          ← Orqaga
        </button>
      </div>

      {/* HERO */}
      <div className="relative h-[350px] sm:h-[400px] flex items-center justify-center overflow-hidden">
        {club.cover_image_url ? (
          <>
            <img src={club.cover_image_url} alt={club.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" />
        )}
        <div className="relative z-10 text-center text-white px-4">
          <span className="text-6xl mb-4 block">{emoji}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3">{club.name}</h1>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${catColor}`}>
            {club.category}
          </span>
          {avgRating && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={s <= Math.round(Number(avgRating)) ? 'text-yellow-400 text-xl' : 'text-white/30 text-xl'}>★</span>
              ))}
              <span className="text-white/80 text-sm ml-1">{avgRating}</span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">📖 To&apos;garak haqida</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {club.full_description || club.description || "Ma'lumot kiritilmagan"}
              </p>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">📅 Dars jadvali</h2>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <span>🕐</span> {club.schedule || 'Belgilanmagan'}
                </p>
                {club.room && (
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <span>📍</span> {club.room}-xona
                  </p>
                )}
              </div>
            </div>

            {/* Achievements */}
            {club.achievements && club.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">🏆 Yutuqlar va imkoniyatlar</h2>
                <div className="flex flex-wrap gap-2">
                  {club.achievements.map((a: string, i: number) => (
                    <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      🏅 {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">⭐ O&apos;quvchilar fikri</h2>
              {avgRating && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={s <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({reviews.length} ta baholash)</span>
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-sm py-4">Hali baholash yo&apos;q</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {r.student?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{r.student?.full_name}</p>
                          <p className="text-xs text-gray-400">
                            {r.student?.grade ? `${r.student.grade}-sinf` : "O'quvchi"} · {timeAgo(r.created_at)}
                          </p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">&ldquo;{r.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">
            {/* Enrollment Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-6">
              <div className="text-center mb-4">
                <span className="text-4xl">{emoji}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{club.name}</h3>
              </div>

              {/* Price & Grade */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {club.is_paid ? (
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    💳 {club.price?.toLocaleString('uz-UZ')} so&apos;m/oy
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                    🆓 Bepul
                  </span>
                )}
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                  📚 {targetGrades && targetGrades.length > 0
                    ? `${targetGrades.sort((a, b) => Number(a) - Number(b)).join(', ')}-sinf`
                    : 'Barcha sinflar'}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-5 text-sm text-gray-600">
                <p>👥 {enrolledCount} / {club.max_students || 30} o&apos;quvchi</p>
                <p>📅 {club.schedule || 'Belgilanmagan'}</p>
                {club.room && <p>📍 {club.room}-xona</p>}
              </div>

              {/* Enrollment progress */}
              <div className="mb-5">
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((enrolledCount / (club.max_students || 30)) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Enroll Button */}
              {!userProfile ? (
                <Link href="/login" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold text-center transition-colors">
                  Kirish va ariza topshirish
                </Link>
              ) : userProfile.role !== 'student' ? null : localStatus === 'pending' ? (
                <div className="w-full py-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold text-center">
                  ⏳ Arizangiz ko&apos;rib chiqilmoqda
                </div>
              ) : localStatus === 'approved' ? (
                <div className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold text-center">
                  ✅ Siz a&apos;zo bo&apos;lgansiz
                </div>
              ) : localStatus === 'rejected' ? (
                <button
                  onClick={handleApply}
                  disabled={isPending}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Yuborilmoqda...' : '❌ Ariza rad etildi. Qayta topshirish'}
                </button>
              ) : isFull ? (
                <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold text-center">
                  To&apos;lgan
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isPending}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Yuborilmoqda...' : '📝 Ariza topshirish'}
                </button>
              )}
            </div>

            {/* Teacher */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">👨‍🏫 O&apos;qituvchi</h3>
              <div className="flex items-center gap-3 mb-3">
                {club.teacher_image_url ? (
                  <img src={club.teacher_image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {club.teacher?.full_name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{club.teacher?.full_name || 'Belgilanmagan'}</p>
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full inline-block mt-0.5">Mutaxassis o&apos;qituvchi</span>
                </div>
              </div>
              {club.teacher_bio && (
                <p className="text-sm text-gray-500 leading-relaxed">{club.teacher_bio}</p>
              )}
            </div>

            {/* Room Image */}
            {club.room_image_url && (
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img src={club.room_image_url} alt="Dars xonasi" className="w-full h-48 object-cover" />
                <p className="text-center text-xs text-gray-500 py-2">📍 Dars xonasi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
