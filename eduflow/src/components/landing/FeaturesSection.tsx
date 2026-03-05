'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { BarChart3, Sprout, Target } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'Aqlli Boshqaruv',
    description:
      "To'garaklarni oson boshqaring. Arizalar, tasdiqlashlar, a'zolar ro'yxati — hammasi bir joyda. Avtomatik bildirishnomalar va jadvallar.",
    bg: 'bg-gradient-to-br from-pink-50 to-purple-50',
    iconBg: 'bg-gradient-to-br from-pink-400 to-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Real-vaqt Statistika',
    description:
      "Davomatni kuzating, hisobotlar oling. Grafik va diagrammalar orqali har bir o'quvchining holati aniq ko'rinadi. PDF va Excel eksport.",
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
  {
    icon: Sprout,
    title: "O'sish Tizimi",
    description:
      "Har bir o'quvchi rivojlanishini kuzating. Gamification elementlari, daraxt o'sish animatsiyasi va mukofotlar bilan o'quvchilar motivatsiyasi oshadi.",
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
            Imkoniyatlar
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Nima uchun EduFlow?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Zamonaviy maktablar uchun eng aqlli va qulay boshqaruv tizimi
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`${feature.bg} rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300`}
            >
              <div
                className={`${feature.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}
              >
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
