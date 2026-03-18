'use client'

import { motion } from 'framer-motion'
import { Building2, Clock, GraduationCap, MapPin, Phone, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import Navbar from './Navbar'
import Footer from './Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <main className="flex-grow">
        {/* SECTION 1 — Hero banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 py-24 sm:py-32">
          <div className="absolute inset-0 bg-[url('/school-bg-new.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left text-white max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="text-yellow-400">✧</span>
                  <span className="text-sm font-medium">Buvayda tumani, Navoiy viloyati</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  46-sonli umumiy o&apos;rta ta&apos;lim maktabi
                </h1>
                <p className="text-lg text-indigo-100 mb-8 max-w-xl">
                  Zamonaviy bilimlar maskani. Biz kelajak yetakchilarini tarbiyalaymiz.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 flex flex-col items-center justify-center shrink-0"
              >
                <Logo className="scale-125" textClassName="text-white text-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Statistics cards */}
        <section className="py-12 bg-gray-50 -mt-10 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Users, value: '390', label: "O'quvchilar", color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: GraduationCap, value: '50', label: "O'qituvchilar", color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { icon: Building2, value: '20', label: 'Sinflar (2 smenali)', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: Trophy, value: '10+', label: "Faol to'garaklar", color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — About the school */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Maktab haqida</h2>
              <div className="bg-indigo-50/50 rounded-3xl p-8 sm:p-12 border border-indigo-100 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-3xl" />
                <p className="text-lg text-gray-700 leading-relaxed">
                  46-sonli maktab 1970-yildan buyon Buvayda tumanida ta&apos;lim bermoqda. 
                  Maktabimiz o&apos;quvchilarni zamonaviy ta&apos;lim va texnologiyalar bilan 
                  qurollantirish, ularning intellektual va ijodiy qobiliyatlarini 
                  rivojlantirishga qaratilgan. IQRO platformasi orqali to&apos;garaklar 
                  faoliyati raqamlashtirildi.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3 — School leadership */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Maktab rahbariyati</h2>
              <p className="text-gray-500 mt-4">Tajribali va malakali jamoa</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Director */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center shadow-indigo-100/50"
              >
                <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-md border-4 border-indigo-50">
                  GY
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yo&apos;ldasheva Go&apos;yaxon Zokirovna</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  Direktor
                </span>
              </motion.div>

              {/* Deputy 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center opacity-80"
              >
                <div className="w-24 h-24 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-4 border-gray-50">
                  O&apos;
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tez kunda</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  O&apos;rinbosar
                </span>
              </motion.div>

              {/* Deputy 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center opacity-80"
              >
                <div className="w-24 h-24 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-4 border-gray-50">
                  O&apos;
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tez kunda</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  O&apos;rinbosar
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — Contact information & Back to home */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Bog&apos;lanish</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { icon: MapPin, title: 'Manzil', value: "Buvayda tumani, Xakimto'ra MFY, Taraqiyot ko'chasi 3A", bg: 'bg-indigo-50', text: 'text-indigo-600' },
                { icon: Phone, title: 'Telefon', value: '+998 93 201 75 74', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                { icon: Clock, title: 'Ish vaqti', value: 'Dushanba–Shanba, 8:00–18:00', bg: 'bg-blue-50', text: 'text-blue-600' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 mx-auto rounded-full ${item.bg} ${item.text} flex items-center justify-center mb-4`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* SECTION 6 — Back to home button */}
            <div className="text-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
              >
                &larr; Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
