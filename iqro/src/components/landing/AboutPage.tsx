'use client'

import { motion } from 'framer-motion'
import { Building2, Clock, GraduationCap, MapPin, Phone, Trophy, Users, Monitor, BookOpen, Dumbbell, Palette, Camera, CalendarDays } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import Navbar from './Navbar'
import Footer from './Footer'

function SchoolPhoto({ src }: { src: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="rounded-xl aspect-video bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <Camera size={48} className="text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Maktab rasmi</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl aspect-video relative overflow-hidden bg-gray-200 dark:bg-gray-800">
      <Image
        src={src}
        alt="Maktab rasmi"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function AboutPage() {
  const [activeLeader, setActiveLeader] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col pt-16 dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow">
        {/* SECTION 1 — Hero banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 min-h-[calc(100vh-4rem)] flex items-center">
          {/* Dot texture */}
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          {/* Diagonal gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-transparent to-blue-900/80" />
          {/* Glow accents */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left text-white max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="text-yellow-400">✧</span>
                  <span className="text-sm font-medium">Buvayda tumani, Farg&apos;ona viloyati</span>
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
                <Logo className="scale-125" textClassName="text-white text-3xl" forceDark />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Statistics cards */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800/50 -mt-10 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {[
                { icon: Users, value: '390', label: "O'quvchilar", color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: GraduationCap, value: '50', label: "O'qituvchilar", color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                { icon: Building2, value: '20', label: 'Sinflar', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: Trophy, value: '12', label: "To'garaklar", color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { icon: CalendarDays, value: '2008', label: "Tashkil etilgan", color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                { icon: MapPin, value: '1.1 ga', label: "Maydon", color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center gap-3"
                >
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} dark:text-white flex items-center justify-center shrink-0 mb-1`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — About the school */}
        <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">Maktabimiz haqida</h2>
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-8 sm:p-12 border border-indigo-100 dark:border-indigo-900/50 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 rounded-l-3xl" />
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                  <span className="block">46-sonli umumiy o&apos;rta ta&apos;lim maktabi 2008-yilda foydalanishga topshirilgan.</span>
                  <span className="block">Maktab Farg&apos;ona viloyatining Buvayda tumanida, Hakimto&apos;ra MFY, Taraqiyot ko&apos;chasi 3A-uy manzilida joylashgan.</span>
                  <span className="block">Umumiy maydoni 1.1 gektarni tashkil etib, zamonaviy ta&apos;lim infratuzilmasiga ega.</span>
                  <span className="block">Maktabda sport zali va stadion mavjud bo&apos;lib, yaxshi holatda saqlanmoqda.</span>
                  <span className="block">Informatika xonasi zamonaviy kompyuter texnikasi bilan jihozlangan.</span>
                  <span className="block font-medium mt-4">Maktabimiz 390 nafar o&apos;quvchi va 50 nafar malakali o&apos;qituvchini birlashtiradi.</span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION — Leadership (moved up, right after about text) */}
        <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Maktab rahbariyati</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              {[
                { name: 'Toshmatova Nilufar', role: "O'quv ishlari bo'yicha direktor o'rinbosari", desc: "O'rinbosar | Buvayda tumani, 46-son maktab", initial: 'TN' },
                { name: "Yo'ldasheva Go'yaxon Zokirovna", role: "Maktab direktori", desc: "Maktab direktori | Ish telefoni: +998 93 201 75 74 | info@iqro46.uz", center: true, initial: 'YG' },
                { name: 'Xasanov Jahongir', role: "Tarbiya ishlari bo'yicha direktor o'rinbosari", desc: "O'rinbosar | Buvayda tumani, 46-son maktab", initial: 'XJ' },
              ].map((ldr, i) => (
                <div 
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer ${
                    ldr.center 
                      ? 'md:scale-110 z-10 border-2 border-indigo-400 dark:border-indigo-500/60' 
                      : 'border border-gray-100 dark:border-gray-700'
                  }`}
                  onClick={() => setActiveLeader(activeLeader === i ? null : i)}
                >
                  <div className="p-8 text-center pb-20">
                    <div className={`w-24 h-24 rounded-full font-bold text-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${
                      ldr.center 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {ldr.initial}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ldr.name}</h3>
                    <p className={`text-sm ${ldr.center ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{ldr.role}</p>
                  </div>
                  
                  {/* Detail panel slides up */}
                  <div className={`absolute bottom-0 left-0 right-0 bg-indigo-600 text-white p-4 transform transition-transform duration-300 ease-in-out flex items-center justify-center min-h-[80px] text-center ${
                    activeLeader === i ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{ldr.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION FACILITIES */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Maktab infratuzilmasi</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: Dumbbell, title: 'Sport zali', desc: "Zamonaviy sport mashg'ulotlari uchun" },
                { icon: Trophy, title: 'Stadion', desc: "Ochiq havoda sport o'yinlari uchun" },
                { icon: Monitor, title: 'Informatika', desc: 'Zamonaviy kompyuter texnikasi bilan jihozlangan xona' },
                { icon: BookOpen, title: 'Kutubxona', desc: 'Boy kitob fondiga ega qulay maskan' },
                { icon: Palette, title: "To'garak xonalari", desc: 'Ijodiy faoliyatni rivojlantirish uchun' },
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-6 transition-transform">
                    <f.icon size={32} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION PHOTOS */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Maktab hayotidan lavhalar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3, 4].map(idx => (
                <SchoolPhoto key={idx} src={`/images/school/school-${idx}.jpg`} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — Contact information & Back to home */}
        <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Bog&apos;lanish</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { icon: MapPin, title: 'Manzil', value: "Buvayda tumani, Hakimto'ra MFY, Taraqiyot ko'chasi 3A", bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
                { icon: Phone, title: 'Telefon', value: '+998 93 201 75 74', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
                { icon: Clock, title: 'Email', value: 'info@iqro46.uz', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 mx-auto rounded-full ${item.bg} ${item.text} flex items-center justify-center mb-4`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* SECTION 6 — Back to home button */}
            <div className="text-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 dark:border-gray-700 text-base font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
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
