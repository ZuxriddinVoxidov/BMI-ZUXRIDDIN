'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '15,000+', label: "O'quvchi" },
  { value: '850+', label: "To'garak" },
  { value: '4.9★', label: 'Reyting' },
]

export default function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl sm:text-5xl font-extrabold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-white/70 text-sm sm:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
