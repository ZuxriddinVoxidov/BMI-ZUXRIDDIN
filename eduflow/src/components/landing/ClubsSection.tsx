'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Calendar, Star, User, Users } from 'lucide-react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const clubs = [
  {
    name: 'Musiqa',
    teacher: 'Sardor Xolmatov',
    schedule: 'Chorshanba, Juma 14:30',
    students: 22,
    rating: 4.8,
    available: true,
    gradient: 'from-emerald-400 to-green-500',
    emoji: '🎵',
  },
  {
    name: 'Sport va Fitnes',
    teacher: 'Alibek Toshmatov',
    schedule: 'Har kuni 07:00',
    students: 35,
    rating: 4.9,
    available: true,
    gradient: 'from-red-400 to-rose-500',
    emoji: '⚽',
  },
  {
    name: 'Robototexnika',
    teacher: 'Sardor Xolmatov',
    schedule: 'Dushanba, Chorshanba 15:00',
    students: 24,
    rating: 4.8,
    available: true,
    gradient: 'from-violet-500 to-purple-600',
    emoji: '🤖',
  },
  {
    name: 'Rasm va Chizmachilik',
    teacher: 'Nilufar Rahimova',
    schedule: 'Seshanba, Payshanba 14:00',
    students: 18,
    rating: 4.9,
    available: false,
    gradient: 'from-pink-500 to-rose-500',
    emoji: '🎨',
  },
  {
    name: 'Ingliz tili',
    teacher: 'Aziza Karimova',
    schedule: 'Har kuni 15:00',
    students: 30,
    rating: 4.7,
    available: true,
    gradient: 'from-blue-400 to-indigo-500',
    emoji: '🇬🇧',
  },
  {
    name: 'Matematika olimpiada',
    teacher: 'Jasur Toshmatov',
    schedule: 'Dushanba, Juma 16:00',
    students: 15,
    rating: 4.9,
    available: true,
    gradient: 'from-amber-400 to-orange-500',
    emoji: '📐',
  },
]

export default function ClubsSection() {
  return (
    <section id="clubs" className="py-20 bg-gradient-to-b from-blue-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <Badge
            variant="outline"
            className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-4 px-4 py-1"
          >
            To&apos;garaklar
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Mashhur To&apos;garaklar
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            O&apos;zingizga mos to&apos;garakni toping va hoziroq a&apos;zo bo&apos;ling
          </p>
        </motion.div>

        {/* Swiper Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="clubs-swiper !pb-14"
          >
            {clubs.map((club) => (
              <SwiperSlide key={club.name}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  {/* Card Header - Gradient */}
                  <div
                    className={`relative h-40 bg-gradient-to-br ${club.gradient} flex items-center justify-center`}
                  >
                    <span className="text-5xl">{club.emoji}</span>
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Star size={14} className="text-yellow-300 fill-yellow-300" />
                      <span className="text-white text-sm font-semibold">
                        {club.rating}
                      </span>
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
                        <span>{club.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{club.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users size={14} className="text-gray-400" />
                        <span>{club.students} o&apos;quvchi</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          club.available
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-0'
                            : 'bg-red-50 text-red-500 hover:bg-red-100 border-0'
                        }
                      >
                        {club.available ? "Bo'sh joy bor" : "To'lgan"}
                      </Badge>
                      <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                        Batafsil →
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  )
}
