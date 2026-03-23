'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  student?: { full_name?: string; grade?: string } | null
  club?: { name?: string; category?: string } | null
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mx-3">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={star <= review.rating ? 'text-yellow-400 text-xl' : 'text-gray-200 text-xl'}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-4 line-clamp-3 italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Student info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
          {review.student?.full_name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-800 dark:text-white">
            {review.student?.full_name || "O'quvchi"}
          </p>
          <p className="text-xs text-gray-500">
            {review.student?.grade ? `${review.student.grade}-sinf` : "O'quvchi"} · {review.club?.name || "To'garak"}
          </p>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TestimonialsSection({ reviews }: { reviews?: any[] }) {
  const data = (reviews || []) as Review[]
  const hasReviews = data.length > 0

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <Badge
            variant="outline"
            className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-4 px-4 py-1"
          >
            Fikrlar ({data.length})
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            O&apos;quvchilar fikri
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            To&apos;garaklarga a&apos;zo bo&apos;lgan o&apos;quvchilarning fikrlari
          </p>
        </motion.div>

        {!hasReviews ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Hali fikrlar yo&apos;q
            </h3>
            <p className="text-gray-500">
              To&apos;garaklarga a&apos;zo bo&apos;lgan o&apos;quvchilar fikrlarini bu yerda ko&apos;rasiz
            </p>
          </div>
        ) : (
          /* Auto-scrolling carousel */
          <div className="overflow-hidden">
            <div
              className="flex animate-scroll hover:[animation-play-state:paused]"
              style={{ width: `${data.length * 340}px` }}
            >
              {data.map((review, i) => (
                <ReviewCard key={`${review.id}-${i}`} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
