'use client'

import { cancelApplication } from '@/app/actions/enrollment'
import { submitReview } from '@/app/actions/reviews'
import { Star, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'

const categoryColors: Record<string, string> = {
  texnologiya: 'bg-blue-100 text-blue-700',
  sport: 'bg-rose-100 text-rose-700',
  "san'at": 'bg-purple-100 text-purple-700',
  fan: 'bg-emerald-100 text-emerald-700',
  til: 'bg-amber-100 text-amber-700',
}

interface StudentClubsProps {
  enrollments: Record<string, unknown>[]
  existingReviews: Record<string, unknown>[]
}

export default function StudentClubs({ enrollments, existingReviews }: StudentClubsProps) {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('approved')
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [reviewDialog, setReviewDialog] = useState<{ clubId: string; clubName: string } | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const approved = enrollments.filter(e => e.status === 'approved')
  const pending = enrollments.filter(e => e.status === 'pending')
  const rejected = enrollments.filter(e => e.status === 'rejected')

  const tabs = [
    { key: 'approved' as const, label: 'Tasdiqlangan', count: approved.length },
    { key: 'pending' as const, label: 'Kutilmoqda', count: pending.length },
    { key: 'rejected' as const, label: 'Rad etilgan', count: rejected.length },
  ]

  const currentList = activeTab === 'approved' ? approved : activeTab === 'pending' ? pending : rejected

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleCancel = (enrollmentId: string) => {
    startTransition(async () => {
      const result = await cancelApplication(enrollmentId)
      if (result.success) {
        showToast('Ariza bekor qilindi', 'success')
      } else {
        showToast(result.error || 'Xatolik', 'error')
      }
    })
  }

  const handleReviewSubmit = () => {
    if (!reviewDialog || rating === 0) return
    startTransition(async () => {
      const result = await submitReview({
        club_id: reviewDialog.clubId,
        rating,
        comment,
      })
      if (result.success) {
        showToast("Baholash yuborildi! +2 ball 🎉", 'success')
        setReviewDialog(null)
        setRating(0)
        setComment('')
      } else {
        showToast(result.error || 'Xatolik', 'error')
      }
    })
  }

  const getExistingReview = (clubId: string) => {
    return existingReviews.find(r => r.club_id === clubId)
  }

  const openReview = (clubId: string, clubName: string) => {
    const existing = getExistingReview(clubId)
    setRating((existing?.rating as number) || 0)
    setComment((existing?.comment as string) || '')
    setReviewDialog({ clubId, clubName })
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-[120px] h-[120px] bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🎯</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Hali to&apos;garaklarga a&apos;zo emassiz
        </h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Quyidagi to&apos;garaklar katalogidan o&apos;zingizga mos to&apos;garakni tanlang
        </p>
        <Link href="/student/explore" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition-colors">
          Katalogga o&apos;tish →
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {currentList.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentList.map((e) => {
            const club = e.club as Record<string, unknown> | null
            if (!club) return null
            const teacher = club.teacher as Record<string, unknown> | null
            const category = (club.category as string)?.toLowerCase() || ''

            return (
              <div key={e.id as string} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Status badge */}
                  {activeTab === 'pending' && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-amber-100 text-amber-700">⏳ Kutilmoqda</span>
                  )}
                  {activeTab === 'rejected' && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-red-100 text-red-700">❌ Rad etildi</span>
                  )}
                  {activeTab === 'approved' && Boolean(club.category) && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${categoryColors[category] || 'bg-gray-100 text-gray-700'}`}>
                      {String(club.category)}
                    </span>
                  )}

                  <h3 className="font-bold text-lg text-gray-900 mb-3">{club.name as string}</h3>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-gray-500">👨‍🏫 {(teacher?.full_name as string) || 'Belgilanmagan'}</p>
                    <p className="text-sm text-gray-500">📅 {(club.schedule as string) || 'Jadval belgilanmagan'}</p>
                    <p className="text-sm text-gray-500">📍 {(club.room as string) || 'Xona belgilanmagan'}</p>
                  </div>

                  {/* Actions */}
                  {activeTab === 'approved' && (
                    <button
                      onClick={() => openReview(club.id as string, club.name as string)}
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold transition-colors"
                    >
                      {getExistingReview(club.id as string) ? '✏️ Bahoni tahrirlash' : 'Baholash ⭐'}
                    </button>
                  )}
                  {activeTab === 'pending' && (
                    <button
                      onClick={() => handleCancel(e.id as string)}
                      disabled={isPending}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
                    </button>
                  )}
                  {activeTab === 'rejected' && (
                    <Link
                      href="/student/explore"
                      className="block w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-semibold text-center transition-colors"
                    >
                      Qayta ariza →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <span className="text-4xl mb-3">{activeTab === 'approved' ? '📚' : activeTab === 'pending' ? '⏳' : '❌'}</span>
          <p className="text-sm">{activeTab === 'approved' ? 'Tasdiqlangan to\'garaklar yo\'q' : activeTab === 'pending' ? 'Kutilayotgan arizalar yo\'q' : 'Rad etilgan arizalar yo\'q'}</p>
        </div>
      )}

      {/* Review Dialog */}
      {reviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-gray-900">{reviewDialog.clubName} — Baholash</h3>
              <button onClick={() => setReviewDialog(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            {/* Star Rating */}
            <div className="flex gap-1 mb-5 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Fikringizni yozing..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
            />

            <button
              onClick={handleReviewSubmit}
              disabled={isPending || rating === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {isPending ? 'Yuborilmoqda...' : 'Yuborish ⭐'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
