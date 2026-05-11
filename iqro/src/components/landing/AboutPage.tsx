'use client'

import { motion } from 'framer-motion'
import { Building2, CalendarDays, GraduationCap, MapPin, Phone, Clock, Trophy, Users, Monitor, BookOpen, Dumbbell, Palette } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

function LeaderAvatar({ src, initials, isCenter }: { src: string; initials: string; isCenter?: boolean }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`w-24 h-24 rounded-full font-bold text-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ${
        isCenter ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
      }`}>
        {initials}
      </div>
    )
  }

  return (
    <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden shadow-inner relative">
      <Image
        src={src}
        alt={initials}
        fill
        sizes="96px"
        className="object-cover object-top"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function AboutPage() {
  const [activeLeader, setActiveLeader] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Navbar />

      <main className="flex-grow">
        {/* SECTION 1 — Hero banner */}
        <section className="relative overflow-hidden bg-indigo-950 min-h-screen flex items-center">
          {/* Real school background photo */}
          <div className="absolute inset-0">
            <Image
              src="/school-bg-new.jpg"
              alt="Maktab"
              fill
              className="object-cover object-center"
              priority
              quality={80}
            />
            {/* Strong dark overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/75 via-indigo-900/65 to-blue-950/75" />
            {/* Dot texture on top */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </div>
          {/* Side glow accents */}
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
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
                initial={{ opacity: 0, scale: 0.9, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md p-7 rounded-3xl border border-white/25 shrink-0 w-full max-w-sm lg:max-w-md shadow-2xl"
              >
                {/* Glass card header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-5 bg-indigo-400 rounded-full" />
                  <span className="text-white/80 text-xs font-semibold tracking-widest uppercase">Maktab haqida</span>
                </div>
                {/* Single paragraph */}
                <p className="text-white/95 text-base sm:text-lg leading-relaxed font-medium">
                  46-sonli umumiy o&apos;rta ta&apos;lim maktabi 2008-yilda foydalanishga topshirilgan. 
                  Maktab Farg&apos;ona viloyatining Buvayda tumanida, Hakimto&apos;ra MFY, 
                  Taraqiyot ko&apos;chasi 3A-uy manzilida joylashgan. Umumiy maydoni 1.1 gektarni tashkil etib, 
                  zamonaviy ta&apos;lim infratuzilmasiga ega. Maktabda sport zali va stadion mavjud bo&apos;lib, 
                  yaxshi holatda saqlanmoqda. Informatika xonasi zamonaviy kompyuter texnikasi bilan jihozlangan. 
                  Maktabimiz 390 nafar o&apos;quvchi va 50 nafar malakali o&apos;qituvchini birlashtiradi.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION — About the school */}
        <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Maktabimiz haqida</h2>
            </motion.div>
            {/* Stats grid in place of text */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {[
                { icon: Users,         value: '390',    label: "O'quvchilar",     iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',    cardBg: 'bg-blue-100 dark:bg-blue-950/30',    border: 'border-blue-300 dark:border-blue-700/60',    hoverBorder: 'hover:border-blue-500',    shadow: 'hover:shadow-blue-300/40',    text: 'text-blue-800 dark:text-blue-200' },
                { icon: GraduationCap, value: '50',     label: "O'qituvchilar",   iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600',  cardBg: 'bg-indigo-100 dark:bg-indigo-950/30', border: 'border-indigo-300 dark:border-indigo-700/60', hoverBorder: 'hover:border-indigo-500', shadow: 'hover:shadow-indigo-300/40', text: 'text-indigo-800 dark:text-indigo-200' },
                { icon: Building2,     value: '20',     label: 'Sinflar',         iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',  cardBg: 'bg-emerald-100 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700/60', hoverBorder: 'hover:border-emerald-500', shadow: 'hover:shadow-emerald-300/40', text: 'text-emerald-800 dark:text-emerald-200' },
                { icon: Trophy,        value: '12',     label: "To'garaklar",     iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',  cardBg: 'bg-amber-100 dark:bg-amber-950/30',  border: 'border-amber-300 dark:border-amber-700/60',  hoverBorder: 'hover:border-amber-500',  shadow: 'hover:shadow-amber-300/40',  text: 'text-amber-800 dark:text-amber-200' },
                { icon: CalendarDays,  value: '2008',   label: "Tashkil etilgan", iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600', cardBg: 'bg-purple-100 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-700/60', hoverBorder: 'hover:border-purple-500', shadow: 'hover:shadow-purple-300/40', text: 'text-purple-800 dark:text-purple-200' },
                { icon: MapPin,        value: '1.1 ga', label: "Maydon",          iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',     cardBg: 'bg-rose-100 dark:bg-rose-950/30',    border: 'border-rose-300 dark:border-rose-700/60',    hoverBorder: 'hover:border-rose-500',    shadow: 'hover:shadow-rose-300/40',    text: 'text-rose-800 dark:text-rose-200' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.06 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{ cursor: 'default' }}
                  className={`group ${stat.cardBg} rounded-2xl p-5 border-2 ${stat.border} ${stat.hoverBorder} shadow-md flex flex-col items-center text-center gap-3 ${stat.shadow} hover:shadow-2xl transition-shadow duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <stat.icon size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-extrabold ${stat.text}`}>{stat.value}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                { name: "To'ychiyev Ikromjon", role: "Ma'naviy ma'rifiy ishlar bo'yicha direktor o'rinbosari", desc: "O'rinbosar | Buvayda tumani, 46-son maktab", initial: 'TI', photo: '/orinbosar-2.jpg' },
                { name: "Yo'ldasheva Go'yoxon Zokirovna", role: "Maktab direktori", desc: "Maktab direktori | Ish telefoni: +998 93 201 75 74 | info@iqro46.uz", center: true, initial: 'YG', photo: 'https://hwwsbwvvlkqqwbjemwhz.supabase.co/storage/v1/object/public/avatars/directors/9bcb4a8f-f116-4d87-b7a5-1a113a32e159.png' },
                { name: 'Turdiyev Zuxriddin', role: "O'quv ishlari bo'yicha direktor o'rinbosari", desc: "O'rinbosar | Buvayda tumani, 46-son maktab", initial: 'TZ', photo: '/orinbosar-1.jpg' },
              ].map((ldr, i) => (
                <div 
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.03] cursor-pointer ${
                    ldr.center 
                      ? 'md:scale-110 z-10 border-2 border-indigo-500 dark:border-indigo-400 shadow-indigo-200/50 dark:shadow-indigo-900/40 hover:shadow-indigo-400/30' 
                      : 'border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-gray-200/40'
                  }`}
                  onClick={() => setActiveLeader(activeLeader === i ? null : i)}
                >
                  <div className="p-8 text-center pb-20">
                    <LeaderAvatar src={ldr.photo} initials={ldr.initial} isCenter={ldr.center} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{ldr.name}</h3>
                    <p className={`text-sm font-semibold ${ldr.center ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>{ldr.role}</p>
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
                { icon: Dumbbell, title: 'Sport zali',   desc: "Zamonaviy sport mashg'ulotlari uchun",            iconBg: 'bg-gradient-to-br from-orange-400 to-red-500',    cardBg: 'bg-orange-50 dark:bg-orange-950/25',   border: 'border-orange-300 dark:border-orange-800/60',   hoverBorder: 'hover:border-orange-500',   shadow: 'hover:shadow-orange-300/40' },
                { icon: Trophy,   title: 'Stadion',       desc: "Ochiq havoda sport o'yinlari uchun",              iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',  cardBg: 'bg-amber-50 dark:bg-amber-950/25',     border: 'border-amber-300 dark:border-amber-800/60',     hoverBorder: 'hover:border-amber-500',    shadow: 'hover:shadow-amber-300/40' },
                { icon: Monitor,  title: 'Informatika',   desc: 'Zamonaviy kompyuter texnikasi bilan jihozlangan', iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',   cardBg: 'bg-blue-50 dark:bg-blue-950/25',       border: 'border-blue-300 dark:border-blue-800/60',       hoverBorder: 'hover:border-blue-500',     shadow: 'hover:shadow-blue-300/40' },
                { icon: BookOpen, title: 'Kutubxona',     desc: 'Boy kitob fondiga ega qulay maskan',              iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', cardBg: 'bg-emerald-50 dark:bg-emerald-950/25', border: 'border-emerald-300 dark:border-emerald-800/60', hoverBorder: 'hover:border-emerald-500',  shadow: 'hover:shadow-emerald-300/40' },
                { icon: Palette,  title: "To'garak xonalari", desc: 'Ijodiy faoliyatni rivojlantirish uchun',    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',   cardBg: 'bg-purple-50 dark:bg-purple-950/25',   border: 'border-purple-300 dark:border-purple-800/60',   hoverBorder: 'hover:border-purple-500',   shadow: 'hover:shadow-purple-300/40' },
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -12, scale: 1.05 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{ cursor: 'default' }}
                  className={`group ${f.cardBg} border-2 ${f.border} ${f.hoverBorder} ${f.shadow} rounded-2xl p-6 text-center shadow-md hover:shadow-2xl transition-shadow duration-300`}
                >
                  <div className={`w-16 h-16 rounded-2xl ${f.iconBg} text-white flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300`}>
                    <f.icon size={28} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{f.desc}</p>
                </motion.div>
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
                { icon: MapPin, title: 'Manzil',  value: "Buvayda tumani, Hakimto'ra MFY, Taraqiyot ko'chasi 3A", iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600',  cardBg: 'bg-indigo-50 dark:bg-indigo-950/30',   border: 'border-indigo-200 dark:border-indigo-800/50',   hoverBorder: 'hover:border-indigo-500 dark:hover:border-indigo-400',   shadow: 'hover:shadow-indigo-300/40',   titleColor: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300' },
                { icon: Phone,  title: 'Telefon', value: '+998 93 201 75 74',                                      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',  cardBg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800/50', hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-400', shadow: 'hover:shadow-emerald-300/40', titleColor: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300' },
                { icon: Clock,  title: 'Email',   value: 'info@iqro46.uz',                                         iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',     cardBg: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-200 dark:border-blue-800/50',       hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',       shadow: 'hover:shadow-blue-300/40',     titleColor: 'group-hover:text-blue-700 dark:group-hover:text-blue-300' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -12, scale: 1.05 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{ cursor: 'default' }}
                  className={`group ${item.cardBg} p-7 rounded-2xl border-2 ${item.border} ${item.hoverBorder} ${item.shadow} shadow-md text-center hover:shadow-2xl transition-shadow duration-300`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl ${item.iconBg} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl transition-all duration-300`}>
                    <item.icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className={`font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200 ${item.titleColor}`}>{item.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{item.value}</p>
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
