'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const defaultTestimonials = [
  {
    name: 'Alibek Toshmatov',
    role: "9-sinf o'quvchisi, Toshkent",
    initials: 'AT',
    color: 'bg-indigo-100 text-indigo-600',
    text: "\"EduFlow platformasi orqali to'garaklarga yozilish juda oson bo'ldi. Mening o'sish daraxtim har kuni o'sib bormoqda va bu meni yanada ko'proq harakat qilishga undaydi!\"",
    rating: 5,
  },
  {
    name: 'Zulfiya Karimova',
    role: "10-sinf o'quvchisi, Samarqand",
    initials: 'ZK',
    color: 'bg-emerald-100 text-emerald-600',
    text: "\"Haftalik jadvalimni ko'rish juda qulay. Qaysi to'garakka qaysi kuni borishni aniq bilaman. Davomatim 95% ga yetdi — juda faxrlanaman!\"",
    rating: 5,
  },
  {
    name: 'Jasur Umarov',
    role: "8-sinf o'quvchisi, Namangan",
    initials: 'JU',
    color: 'bg-cyan-100 text-cyan-600',
    text: "\"Robototexnika to'garagiga a'zo bo'lganimdan beri juda ko'p narsa o'rgandim. EduFlow orqali ishlarimni yuklash va o'qituvchimdan baho olish juda qiziqarli!\"",
    rating: 5,
  },
]

const colors = [
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-cyan-100 text-cyan-600',
  'bg-purple-100 text-purple-600',
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
]

interface TestimonialsSectionProps {
  reviews?: Record<string, unknown>[]
}

export default function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const hasReviews = reviews && reviews.length > 0

  const displayReviews = hasReviews
    ? reviews.map((r, i) => {
        const student = r.student as Record<string, unknown> | null
        const club = r.club as Record<string, unknown> | null
        const name = (student?.full_name as string) || "O'quvchi"
        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        return {
          name,
          role: (club?.name as string) || "To'garak",
          initials,
          color: colors[i % colors.length],
          text: `"${(r.comment as string) || 'Ajoyib platform!'}"`,
          rating: (r.rating as number) || 5,
          date: r.created_at as string,
        }
      })
    : defaultTestimonials

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {hasReviews ? `${reviews.length} ta o'quvchi fikrlari` : "15 000+ o'quvchi EduFlow dan foydalanmoqda"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayReviews.map((t, i) => (
            <motion.div
              key={`${t.name}-${i}`}
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
                    className={j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 italic leading-relaxed mb-6 text-sm">
                {t.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
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
