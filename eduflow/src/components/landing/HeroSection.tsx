'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BarChart3, Bell, Palette, Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-blue-500/80 to-cyan-400/80" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8"
        >
          <span className="text-yellow-300">✦</span>
          <span className="text-white text-sm font-medium">
            Uzbekistonning #1 Klub Boshqaruv Platformasi
          </span>
        </motion.div>

        {/* Floating Cards */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex absolute top-32 left-8 items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20"
        >
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <Bell size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Alibek Toshmatov</p>
            <p className="text-white/70 text-xs">a&apos;zo bo&apos;ldi</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:flex absolute top-28 right-8 items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20"
        >
          <div className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Bugungi davomat</p>
            <p className="text-white/70 text-xs">94% ✓</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="hidden lg:flex absolute bottom-48 left-8 items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20"
        >
          <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center">
            <Palette size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Yangi to&apos;garak</p>
            <p className="text-white/70 text-xs">Robototexnika qo&apos;shildi</p>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
        >
          Bilim — Kelajak Kaliti,
          <br />
          <span className="text-yellow-300">To&apos;garaklar</span> — Uning Eshigi
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          Maktab to&apos;garaklarini boshqaring, davomatni kuzating, o&apos;quvchilar
          salohiyatini oching.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 py-6 text-base font-semibold shadow-xl"
          >
            Bepul Boshlash
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
          >
            <Play size={18} className="mr-2 fill-white" />
            Demo Ko&apos;rish
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {[
            { icon: '🏫', value: '200+', label: 'Maktab' },
            { icon: '👥', value: "15 000+", label: "O'quvchi" },
            { icon: '⭐', value: '4.9', label: 'Reyting' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5"
            >
              <span className="text-lg">{stat.icon}</span>
              <span className="text-white font-bold">{stat.value}</span>
              <span className="text-white/70 text-sm">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white/60 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
