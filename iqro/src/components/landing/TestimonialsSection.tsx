'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  student?: { full_name?: string; grade?: string; avatar_url?: string | null } | null
  club?: { name?: string; category?: string } | null
}

const CARD_ACCENTS = [
  {
    bg: 'from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50',
    hoverBg: 'hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900/70 dark:hover:to-purple-900/70',
    border: 'border-indigo-300 dark:border-indigo-700',
    hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-400',
    shadow: 'hover:shadow-indigo-300/50 dark:hover:shadow-indigo-900/40',
    avatar: 'bg-indigo-600',
  },
  {
    bg: 'from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50',
    hoverBg: 'hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-900/70 dark:hover:to-cyan-900/70',
    border: 'border-blue-300 dark:border-blue-700',
    hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',
    shadow: 'hover:shadow-blue-300/50 dark:hover:shadow-blue-900/40',
    avatar: 'bg-blue-600',
  },
  {
    bg: 'from-emerald-100 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50',
    hoverBg: 'hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-900/70 dark:hover:to-teal-900/70',
    border: 'border-emerald-300 dark:border-emerald-700',
    hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-400',
    shadow: 'hover:shadow-emerald-300/50 dark:hover:shadow-emerald-900/40',
    avatar: 'bg-emerald-600',
  },
  {
    bg: 'from-pink-100 to-rose-100 dark:from-pink-950/50 dark:to-rose-950/50',
    hoverBg: 'hover:from-pink-200 hover:to-rose-200 dark:hover:from-pink-900/70 dark:hover:to-rose-900/70',
    border: 'border-pink-300 dark:border-pink-700',
    hoverBorder: 'hover:border-pink-500 dark:hover:border-pink-400',
    shadow: 'hover:shadow-pink-300/50 dark:hover:shadow-pink-900/40',
    avatar: 'bg-pink-600',
  },
  {
    bg: 'from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50',
    hoverBg: 'hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/70 dark:hover:to-orange-900/70',
    border: 'border-amber-300 dark:border-amber-700',
    hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400',
    shadow: 'hover:shadow-amber-300/50 dark:hover:shadow-amber-900/40',
    avatar: 'bg-amber-600',
  },
]

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
  return (
    <div className={`w-80 flex-shrink-0 bg-gradient-to-br ${accent.bg} ${accent.hoverBg} rounded-2xl p-6 shadow-md border-2 ${accent.border} ${accent.hoverBorder} ${accent.shadow} mx-3 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] transition-all duration-300`}>
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={star <= review.rating ? 'text-yellow-400 text-xl' : 'text-gray-200 dark:text-gray-600 text-xl'}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed mb-4 line-clamp-3 italic font-medium">
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Student info */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full ${accent.avatar} flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden relative`}>
          {review.student?.avatar_url ? (
            <img src={review.student.avatar_url} alt={review.student.full_name || 'Avatar'} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="relative z-10">{review.student?.full_name?.charAt(0) || '?'}</span>
          )}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-white">
            {review.student?.full_name || "O'quvchi"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
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
                <ReviewCard key={`${review.id}-${i}`} review={review} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
