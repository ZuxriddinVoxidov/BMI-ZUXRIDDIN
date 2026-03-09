'use client'

import { Badge } from '@/components/ui/badge'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Calendar, Star, User, Users } from 'lucide-react'

interface ClubData {
  id: string
  name: string
  category: string
  schedule: string
  emoji?: string
  max_students: number
  teacher?: { full_name: string } | null
  enrollments?: { count: number }[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClubsSection({ clubs }: { clubs?: any[] }) {
  const data = (clubs || []) as ClubData[]

  return (
    <section id="clubs" className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge
            variant="outline"
            className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-4 px-4 py-1"
          >
            To&apos;garaklar
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            To&apos;garaklar
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            O&apos;zingizga mos to&apos;garakni toping va hoziroq a&apos;zo bo&apos;ling
          </p>
        </motion.div>

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((club, i) => {
              const enrollCount = club.enrollments?.[0]?.count || 0
              const available = enrollCount < club.max_students
              const emoji = club.emoji || getDefaultEmoji(club.category)
              const catColor = getCategoryColor(club.category)

              return (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-5xl">{emoji}</span>
                    {/* Category Badge */}
                    <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>
                      {club.category}
                    </div>
                    {/* Rating Placeholder */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Star size={14} className="text-yellow-300 fill-yellow-300" />
                      <span className="text-white text-sm font-semibold">—</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {club.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User size={14} className="text-gray-400" />
                        <span>{club.teacher?.full_name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{club.schedule || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={14} className="text-gray-400" />
                        <span>{enrollCount} / {club.max_students} o&apos;quvchi</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          available
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0'
                            : 'bg-red-50 text-red-500 hover:bg-red-100 border-0'
                        }
                      >
                        {available ? "Bo'sh joy bor" : "To'lgan"}
                      </Badge>
                      <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                        Batafsil →
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
