'use client'

import { applyToClub } from '@/app/actions/enrollment'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import Link from 'next/link'
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
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [localStatus, setLocalStatus] = useState(userEnrollment?.status || null)

  const emoji = club.emoji || getDefaultEmoji(club.category || '')
  const catColor = getCategoryColor(club.category || '')
  const isFull = enrolledCount >= (club.max_students || 30)
  const reviews = (club.reviews || []) as any[]
  const spotsLeft = (club.max_students || 30) - enrolledCount

  const handleApply = () => {
    startTransition(async () => {
      const result = await applyToClub(club.id)
      if (result.success) {
        setLocalStatus('pending')
        setToast({ message: "Ariza muvaffaqiyatli yuborildi! 🎉", type: 'success' })
      } else {
        setToast({ message: result.error || 'Xatolik', type: 'error' })
      }
      setTimeout(() => setToast(null), 4000)
    })
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] relative">
      {/* Blurred background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {club.cover_image_url && (
          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
            style={{ backgroundImage: `url(${club.cover_image_url})` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100/40 via-gray-100/80 to-gray-100" />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-indigo-600 text-lg">EduFlow</span>
        </Link>
        <Link href="/#clubs"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold hover:shadow-md transition-all">
          ← To&apos;garaklarga qaytish
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition">Asosiy</Link>
          <span>›</span>
          <Link href="/#clubs" className="hover:text-indigo-600 transition">To&apos;garaklar</Link>
          <span>›</span>
          <span className="text-gray-900 font-semibold">{club.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Club Info Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50">
              {/* Category + Rating */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${catColor}`}>
                  {club.category}
                </span>
                {avgRating && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={`text-sm ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                    ))}
                    <span className="text-sm text-gray-500 ml-1">{avgRating}</span>
                  </div>
                )}
              </div>

              {/* Member avatars */}
              <div className="flex items-center gap-1 mb-4">
                {['bg-indigo-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400', 'bg-cyan-400'].slice(0, Math.min(enrolledCount, 5)).map((color, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white -ml-${i > 0 ? '2' : '0'}`} />
                ))}
                {enrolledCount > 5 && (
                  <span className="text-xs text-gray-500 ml-2">+{enrolledCount - 5}</span>
                )}
              </div>

              {/* Club Name */}
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 flex items-center gap-3">
                <span className="text-4xl">{emoji}</span>
                {club.name}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {club.description || "Ma'lumot kiritilmagan"}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div className="p-5 rounded-2xl bg-white/50 border border-gray-200 flex flex-col items-center text-center hover:bg-indigo-600 hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    💰
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">Narxi</p>
                  <p className="font-bold text-gray-900 group-hover:text-white text-sm">
                    {club.is_paid ? `${club.price?.toLocaleString('uz-UZ')} so'm` : 'Bepul'}
                  </p>
                </div>

                {/* Schedule */}
                <div className="p-5 rounded-2xl bg-white/50 border border-gray-200 flex flex-col items-center text-center hover:bg-indigo-600 hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    📅
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">Jadval</p>
                  <p className="font-bold text-gray-900 group-hover:text-white text-sm">
                    {club.schedule || '—'}
                  </p>
                </div>

                {/* Students */}
                <div className="p-5 rounded-2xl bg-white/50 border border-gray-200 flex flex-col items-center text-center hover:bg-indigo-600 hover:border-indigo-600 group transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 text-2xl group-hover:bg-white group-hover:text-indigo-600">
                    👥
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/70">O&apos;quvchilar</p>
                  <p className="font-bold text-gray-900 group-hover:text-white text-sm">
                    {enrolledCount} / {club.max_students || 30}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {(club.cover_image_url || club.room_image_url) && (
              <div className="grid grid-cols-2 gap-4">
                {club.cover_image_url && (
                  <div className="h-48 rounded-xl bg-cover bg-center shadow-lg hover:scale-[1.02] transition-transform"
                    style={{ backgroundImage: `url(${club.cover_image_url})` }} />
                )}
                {club.room_image_url && (
                  <div className="h-48 rounded-xl bg-cover bg-center shadow-lg hover:scale-[1.02] transition-transform"
                    style={{ backgroundImage: `url(${club.room_image_url})` }} />
                )}
              </div>
            )}

            {/* Full Description */}
            {club.full_description && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50">
                <h2 className="text-lg font-bold text-gray-900 mb-3">📖 Batafsil ma&apos;lumot</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{club.full_description}</p>
              </div>
            )}

            {/* Achievements */}
            {club.achievements && club.achievements.length > 0 && (
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50">
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
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/50">
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
                    <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
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

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Teacher + Enrollment Card */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-indigo-100/50 relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10" />

                {/* Teacher info */}
                <div className="relative text-center mb-6">
                  {club.teacher_image_url ? (
                    <img src={club.teacher_image_url} alt={club.teacher?.full_name || ''}
                      className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-indigo-600 ring-offset-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-2xl mx-auto ring-4 ring-indigo-600 ring-offset-4">
                      {club.teacher?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <h3 className="text-xl font-black text-gray-900 mt-4">{club.teacher?.full_name || 'Belgilanmagan'}</h3>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-1">O&apos;qituvchi</p>
                  {club.teacher_bio && (
                    <p className="text-sm text-gray-500 italic mt-3 leading-relaxed">{club.teacher_bio}</p>
                  )}
                </div>

                <hr className="border-gray-100 my-5" />

                {/* Room & Schedule */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-indigo-50/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Jadval</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{club.schedule || '—'}</p>
                  </div>
                  <div className="bg-indigo-50/50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Xona</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{club.room ? `${club.room}` : '—'}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{enrolledCount} ta a&apos;zo</span>
                    <span>{club.max_students || 30} ta joy</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min((enrolledCount / (club.max_students || 30)) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Enrollment Button */}
                {!userProfile ? (
                  <Link href="/login"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                    Kirish va ro&apos;yxatdan o&apos;tish 🚀
                  </Link>
                ) : userProfile.role !== 'student' ? null : localStatus === 'pending' ? (
                  <div className="w-full py-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-center">
                    <p className="font-bold text-amber-700">⏳ Arizangiz ko&apos;rib chiqilmoqda</p>
                    <p className="text-sm text-amber-500 mt-1">Admin tasdiqlashini kuting</p>
                  </div>
                ) : localStatus === 'approved' ? (
                  <div className="w-full py-4 rounded-xl bg-green-50 border-2 border-green-200 text-center">
                    <p className="font-bold text-green-700">✅ Siz bu to&apos;garak a&apos;zosisiz!</p>
                  </div>
                ) : localStatus === 'rejected' ? (
                  <button onClick={handleApply} disabled={isPending}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                    {isPending ? '⏳ Yuborilmoqda...' : '❌ Rad etildi — Qayta ariza'}
                  </button>
                ) : isFull ? (
                  <div className="w-full py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-center">
                    <p className="font-bold text-gray-600">😔 To&apos;garak to&apos;lgan</p>
                  </div>
                ) : (
                  <>
                    <button onClick={handleApply} disabled={isPending}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                      {isPending ? '⏳ Yuborilmoqda...' : "To'garakka a'zo bo'lish 🚀"}
                    </button>
                    <p className="mt-3 text-xs text-gray-500 text-center">
                      {spotsLeft} ta joy qoldi
                    </p>
                  </>
                )}
              </div>

              {/* Room Image */}
              {club.room_image_url && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white/50 shadow-sm">
                  <img src={club.room_image_url} alt="Dars xonasi" className="w-full h-48 object-cover" />
                  <p className="text-center text-xs text-gray-500 py-3">📍 Dars xonasi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
