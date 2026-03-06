'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Alibek Toshmatov',
    role: "9-sinf o'quvchisi, Toshkent",
    initials: 'AT',
    color: 'bg-indigo-100 text-indigo-600',
    text: "\"EduFlow platformasi orqali to'garaklarga yozilish juda oson bo'ldi. Mening o'sish daraxtim har kuni o'sib bormoqda va bu meni yanada ko'proq harakat qilishga undaydi!\"",
  },
  {
    name: 'Zulfiya Karimova',
    role: "10-sinf o'quvchisi, Samarqand",
    initials: 'ZK',
    color: 'bg-emerald-100 text-emerald-600',
    text: "\"Haftalik jadvalimni ko'rish juda qulay. Qaysi to'garakka qaysi kuni borishni aniq bilaman. Davomatim 95% ga yetdi — juda faxrlanaman!\"",
  },
  {
    name: 'Jasur Umarov',
    role: "8-sinf o'quvchisi, Namangan",
    initials: 'JU',
    color: 'bg-cyan-100 text-cyan-600',
    text: "\"Robototexnika to'garagiga a'zo bo'lganimdan beri juda ko'p narsa o'rgandim. EduFlow orqali ishlarimni yuklash va o'qituvchimdan baho olish juda qiziqarli!\"",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            O&apos;quvchilar fikri
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            15 000+ o&apos;quvchi EduFlow dan foydalanmoqda
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={18}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 italic leading-relaxed mb-6 text-sm">
                {t.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
