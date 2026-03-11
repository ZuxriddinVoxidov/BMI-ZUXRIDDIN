'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  enrollments: any[]
  myReviews: any[]
}

export default function MyClubsWithReview({ 
  enrollments, myReviews 
}: Props) {
  const [activeReview, setActiveReview] = useState<
    string | null
  >(null)
  const [ratings, setRatings] = useState<
    Record<string, number>
  >({})
  const [comments, setComments] = useState<
    Record<string, string>
  >({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const getExistingReview = (clubId: string) =>
    myReviews.find(r => r.club_id === clubId)

  const handleSubmit = async (clubId: string) => {
    const rating = ratings[clubId] || 
      getExistingReview(clubId)?.rating || 0
    const comment = comments[clubId] ?? 
      getExistingReview(clubId)?.comment ?? ''

    if (!rating) {
      showToast('Yulduzcha tanlang!', 'error')
      return
    }

    setLoading(true)
    const result = await submitReview(
      clubId, rating, comment
    )
    setLoading(false)

    if (result.success) {
      showToast('Fikringiz saqlandi!', 'success')
      setActiveReview(null)
    } else {
      showToast('Xatolik: ' + result.error, 'error')
    }
  }

  const StarRating = ({ 
    clubId, current 
  }: { clubId: string, current: number }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => setRatings(p => ({
            ...p, [clubId]: star
          }))}
          className="text-2xl transition-transform 
                     hover:scale-110"
        >
          {star <= (ratings[clubId] || current)
            ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 
                   gap-4">
      {/* Toast popup */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {enrollments.map(enrollment => {
        const club = enrollment.clubs
        const existing = getExistingReview(
          enrollment.club_id
        )
        const isOpen = activeReview === enrollment.club_id

        return (
          <div key={enrollment.id}
            className="bg-white rounded-2xl border 
                      border-gray-100 shadow-sm 
                      overflow-hidden">
            {/* Club info */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl 
                            bg-indigo-100 flex items-center 
                            justify-center text-xl">
                🎓
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 
                              truncate">
                  {club?.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {club?.profiles?.full_name}
                </p>
              </div>
              {existing && !isOpen && (
                <div className="flex items-center gap-1 
                               text-amber-500 text-sm">
                  ⭐ {existing.rating}
                </div>
              )}
            </div>

            {/* Review section */}
            <div className="px-4 pb-4">
              {!isOpen ? (
                <button
                  onClick={() => setActiveReview(
                    enrollment.club_id
                  )}
                  className="w-full py-2 rounded-xl 
                            border border-indigo-200 
                            text-indigo-600 text-sm 
                            font-medium
                            hover:bg-indigo-50 
                            transition-colors"
                >
                  {existing 
                    ? '✏️ Fikrni tahrirlash' 
                    : '⭐ Fikr bildirish'}
                </button>
              ) : (
                <div className="space-y-3">
                  <StarRating
                    clubId={enrollment.club_id}
                    current={existing?.rating || 0}
                  />
                  <textarea
                    value={
                      comments[enrollment.club_id] ?? 
                      existing?.comment ?? ''
                    }
                    onChange={e => setComments(p => ({
                      ...p, 
                      [enrollment.club_id]: e.target.value
                    }))}
                    placeholder="To'garak haqida fikringiz..."
                    rows={3}
                    className="w-full border rounded-xl 
                              px-3 py-2 text-sm 
                              outline-none resize-none
                              focus:border-indigo-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(
                        enrollment.club_id
                      )}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl 
                                bg-indigo-600 text-white 
                                text-sm font-medium
                                hover:bg-indigo-700 
                                disabled:opacity-50"
                    >
                      {loading ? '...' : '💾 Saqlash'}
                    </button>
                    <button
                      onClick={() => setActiveReview(null)}
                      className="px-4 py-2 rounded-xl 
                                border text-gray-600 
                                text-sm hover:bg-gray-50"
                    >
                      Bekor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {enrollments.length === 0 && (
        <div className="col-span-2 text-center py-16 
                       text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p>Hali hech qaysi to&apos;garakka 
             yozilmagan</p>
        </div>
      )}
    </div>
  )
}
