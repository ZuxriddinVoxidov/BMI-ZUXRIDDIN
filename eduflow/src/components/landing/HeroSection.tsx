'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Link from 'next/link'

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
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 py-6 text-base font-semibold shadow-xl"
            >
              Bepul Boshlash
            </Button>
          </Link>
          <a href="#clubs">
            <Button
              size="lg"
              className="border border-white/40 bg-white/10 text-white hover:bg-white/20 rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
            >
              <Play size={18} className="mr-2 fill-white" />
              Demo Ko&apos;rish
            </Button>
          </a>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {[
            { icon: '👥', value: "15 000+", label: "O'quvchi" },
            { icon: '🎯', value: "850+", label: "To'garak" },
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
