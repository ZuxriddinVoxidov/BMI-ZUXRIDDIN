'use client'

import { motion } from 'framer-motion'

interface StatsSectionProps {
  studentsCount: number
  clubsCount: number
  avgRating: string
}

export default function StatsSection({ studentsCount, clubsCount, avgRating }: StatsSectionProps) {
  const stats = [
    { value: `${studentsCount}`, label: "O'quvchi" },
    { value: `${clubsCount}`, label: "To'garak" },
    { value: `${avgRating}★`, label: 'Reyting' },
  ]

  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-white/70 dark:text-indigo-200 text-xs sm:text-sm sm:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
