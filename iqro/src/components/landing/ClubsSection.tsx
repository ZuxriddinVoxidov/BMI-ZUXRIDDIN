'use client'

import { Badge } from '@/components/ui/badge'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Calendar, Star, User, Users, ChevronRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface ClubData {
  id: string
  name: string
  category: string
  schedule: string
  emoji?: string
  max_students: number
  target_grades?: string[] | null
  is_paid?: boolean
  price?: number
  cover_image_url?: string
  teacher?: { full_name: string } | null
  enrollments?: { count: number }[] | null
  reviews?: { rating: number }[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClubsSection({ clubs }: { clubs?: any[] }) {
  const data = (clubs || []) as ClubData[]
  const [showAll, setShowAll] = useState(false)

  const renderClubCard = (club: ClubData, i: number, inGrid: boolean) => {
    const enrollCount = club.enrollments?.[0]?.count || 0
    const available = enrollCount < club.max_students
    const emoji = club.emoji || getDefaultEmoji(club.category)
    const catColor = getCategoryColor(club.category)

    const CATEGORY_STYLES: Record<string, { bg: string; hoverBg: string; border: string; hoverBorder: string; shadow: string }> = {
      "Til":         { bg: "bg-blue-50 dark:bg-blue-950/25",     hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-900/40",     border: "border-blue-300 dark:border-blue-700/70",     hoverBorder: "hover:border-blue-500 dark:hover:border-blue-400",     shadow: "hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30" },
      "Fan":         { bg: "bg-indigo-50 dark:bg-indigo-950/25", hoverBg: "hover:bg-indigo-100 dark:hover:bg-indigo-900/40", border: "border-indigo-300 dark:border-indigo-700/70", hoverBorder: "hover:border-indigo-500 dark:hover:border-indigo-400", shadow: "hover:shadow-indigo-300/40 dark:hover:shadow-indigo-900/30" },
      "Sport":       { bg: "bg-orange-50 dark:bg-orange-950/25", hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-900/40", border: "border-orange-300 dark:border-orange-700/70", hoverBorder: "hover:border-orange-500 dark:hover:border-orange-400", shadow: "hover:shadow-orange-300/40 dark:hover:shadow-orange-900/30" },
      "Texnologiya": { bg: "bg-emerald-50 dark:bg-emerald-950/25", hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-900/40", border: "border-emerald-300 dark:border-emerald-700/70", hoverBorder: "hover:border-emerald-500 dark:hover:border-emerald-400", shadow: "hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/30" },
      "San'at":      { bg: "bg-pink-50 dark:bg-pink-950/25",    hoverBg: "hover:bg-pink-100 dark:hover:bg-pink-900/40",    border: "border-pink-300 dark:border-pink-700/70",    hoverBorder: "hover:border-pink-500 dark:hover:border-pink-400",    shadow: "hover:shadow-pink-300/40 dark:hover:shadow-pink-900/30" },
      "Boshqa":      { bg: "bg-amber-50 dark:bg-amber-950/25",  hoverBg: "hover:bg-amber-100 dark:hover:bg-amber-900/40",  border: "border-amber-300 dark:border-amber-700/70",  hoverBorder: "hover:border-amber-500 dark:hover:border-amber-400",  shadow: "hover:shadow-amber-300/40 dark:hover:shadow-amber-900/30" },
    }

    const style = CATEGORY_STYLES[club.category] || { bg: "bg-gray-50 dark:bg-gray-800/40", hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-700/50", border: "border-gray-300 dark:border-gray-600/70", hoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-400", shadow: "hover:shadow-indigo-200/30" }

    const cardContent = (
      <div className={`${style.bg} ${style.hoverBg} rounded-2xl overflow-hidden shadow-md border-2 ${style.border} ${style.hoverBorder} ${style.shadow} hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.025] transition-all duration-300 h-full flex flex-col group`}>
        {/* Card Header */}
        <div className="relative w-full aspect-video shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {club.cover_image_url ? (
            <>
              <img src={club.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <span className="text-5xl relative z-10">{emoji}</span>
          )}
          {/* Category Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold z-10 ${catColor}`}>
            {club.category}
          </div>
          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 z-10">
            <Star size={14} className="text-yellow-300 fill-yellow-300" />
            <span className="text-white text-sm font-semibold">
              {club.reviews && club.reviews.length > 0
                ? (club.reviews.reduce((s, r) => s + r.rating, 0) / club.reviews.length).toFixed(1)
                : '—'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {club.name}
          </h3>
          {/* Price & Grade badges */}
          <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
            {club.is_paid ? (
              <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                💳 {club.price?.toLocaleString('uz-UZ')} so&apos;m
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                🆓 Bepul
              </span>
            )}
            {club.target_grades && club.target_grades.length > 0 ? (
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                📚 {club.target_grades.sort((a, b) => Number(a) - Number(b)).join(', ')}-sinf
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                📚 Barcha sinflar
              </span>
            )}
          </div>
          <div className="space-y-2 mb-4 shrink-0 mt-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <User size={14} className="text-gray-400 shrink-0" />
              <span className="truncate">{club.teacher?.full_name || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <span className="truncate">{club.schedule || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Users size={14} className="text-gray-400 shrink-0" />
              <span>{enrollCount} / {club.max_students} o&apos;quvchi</span>
            </div>
          </div>
          <div className="flex items-center justify-between shrink-0 pt-2 mt-auto border-t border-gray-50 dark:border-gray-800">
            <Badge
              className={
                available
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0'
                  : 'bg-red-50 text-red-500 hover:bg-red-100 border-0'
              }
            >
              {available ? "Bo'sh joy bor" : "To'lgan"}
            </Badge>
            <Link href={`/clubs/${club.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
              Batafsil →
            </Link>
          </div>
        </div>
      </div>
    )

    if (inGrid) {
      return (
        <motion.div
          key={club.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="h-full"
        >
          {cardContent}
        </motion.div>
      )
    }

    return cardContent
  }

  return (
    <section id="clubs" className="py-20 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-950 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center sm:text-left"
          >
            <Badge
              variant="outline"
              className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-4 px-4 py-1"
            >
              To&apos;garaklar
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Eng yaxshi to&apos;garaklar
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
              O&apos;zingizga mos to&apos;garakni toping va hoziroq a&apos;zo bo&apos;ling
            </p>
          </motion.div>
          
          {data.length > 4 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-xl font-medium transition-all shadow-sm"
            >
              {showAll ? (
                <>Yopish <ChevronDown size={18} /></>
              ) : (
                <>Barchasini ko&apos;rish <ChevronRight size={18} /></>
              )}
            </motion.button>
          )}
        </div>

        {data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <span className="text-5xl mb-4 block">🏫</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Hali to&apos;garaklar qo&apos;shilmagan
            </h3>
            <p className="text-sm text-gray-500">Tez kunda...</p>
          </motion.div>
        ) : (
          <div className="relative">
            {showAll ? (
              /* Grid View (When 'See All' is clicked) */
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.map((club, i) => renderClubCard(club, i, true))}
              </div>
            ) : (
              /* Swiper Carousel View (Default) */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pb-12" // Padding for pagination bullets
              >
                <Swiper
                  modules={[Pagination, Navigation, Autoplay]}
                  spaceBetween={24}
                  slidesPerView={1}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  navigation
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }
                  }}
                  className="!px-1 !pt-1"
                >
                  {data.map((club, i) => (
                    <SwiperSlide key={club.id} className="h-auto pb-8">
                      {renderClubCard(club, i, false)}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
