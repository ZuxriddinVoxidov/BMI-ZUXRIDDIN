'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-3xl p-10 sm:p-14 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Hoziroq boshlang!
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
            Maktabingizni raqamlashtiring. Bepul demo versiyasi mavjud.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-10 py-6 text-base font-semibold shadow-xl"
            >
              Bepul Boshlash →
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
