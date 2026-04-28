'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { BarChart3, Sprout, Target } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'Aqlli boshqaruv',
    description:
      "To'garaklarni oson boshqaring. Arizalar, tasdiqlashlar, a'zolar ro'yxati — hammasi bir joyda. Avtomatik bildirishnomalar va jadvallar.",
    bg: 'bg-gradient-to-br from-pink-100 via-fuchsia-50 to-purple-100 dark:from-pink-950/60 dark:via-fuchsia-950/40 dark:to-purple-950/60',
    hoverBg: 'group-hover:from-pink-200 group-hover:via-fuchsia-100 group-hover:to-purple-200 dark:group-hover:from-pink-900/70 dark:group-hover:to-purple-900/70',
    border: 'border-pink-300 dark:border-pink-700/60',
    hoverBorder: 'group-hover:border-pink-500 dark:group-hover:border-pink-500',
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    shadow: 'hover:shadow-pink-300/40 dark:hover:shadow-pink-800/30',
    textColor: 'text-gray-800 dark:text-gray-100',
    descColor: 'text-gray-700 dark:text-gray-200',
  },
  {
    icon: BarChart3,
    title: 'Real-vaqt statistika',
    description:
      "Davomatni kuzating, hisobotlar oling. Grafik va diagrammalar orqali har bir o'quvchining holati aniq ko'rinadi. PDF va Excel eksport.",
    bg: 'bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 dark:from-blue-950/60 dark:via-sky-950/40 dark:to-indigo-950/60',
    hoverBg: 'group-hover:from-blue-200 group-hover:via-sky-100 group-hover:to-indigo-200 dark:group-hover:from-blue-900/70 dark:group-hover:to-indigo-900/70',
    border: 'border-blue-300 dark:border-blue-700/60',
    hoverBorder: 'group-hover:border-blue-500 dark:group-hover:border-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    shadow: 'hover:shadow-blue-300/40 dark:hover:shadow-blue-800/30',
    textColor: 'text-gray-800 dark:text-gray-100',
    descColor: 'text-gray-700 dark:text-gray-200',
  },
  {
    icon: Sprout,
    title: "O'sish tizimi",
    description:
      "Har bir o'quvchi rivojlanishini kuzating. Gamification elementlari, daraxt o'sish animatsiyasi va mukofotlar bilan o'quvchilar motivatsiyasi oshadi.",
    bg: 'bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 dark:from-green-950/60 dark:via-teal-950/40 dark:to-emerald-950/60',
    hoverBg: 'group-hover:from-green-200 group-hover:via-teal-100 group-hover:to-emerald-200 dark:group-hover:from-green-900/70 dark:group-hover:to-emerald-900/70',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    hoverBorder: 'group-hover:border-emerald-500 dark:group-hover:border-emerald-500',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    shadow: 'hover:shadow-emerald-300/40 dark:hover:shadow-emerald-800/30',
    textColor: 'text-gray-800 dark:text-gray-100',
    descColor: 'text-gray-700 dark:text-gray-200',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 w-full overflow-x-hidden">
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
            Nima uchun IQRO?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
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
              className={`group w-full rounded-[2rem] p-8 sm:p-10 border-2 ${feature.border} ${feature.hoverBorder} ${feature.bg} ${feature.hoverBg} hover:shadow-2xl ${feature.shadow} hover:-translate-y-3 hover:scale-[1.03] transition-all duration-300 cursor-default`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300`}
              >
                <feature.icon size={24} className="text-white" />
              </div>

              {/* Content */}
              <h3 className={`text-xl font-bold ${feature.textColor} mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200`}>
                {feature.title}
              </h3>
              <p className={`${feature.descColor} leading-relaxed font-medium`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
