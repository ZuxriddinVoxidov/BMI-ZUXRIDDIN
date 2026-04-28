'use client'

import { sendContactMessage } from '@/app/actions/contact'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const SUBJECTS = [
  'Umumiy savol',
  "To'garaklarga yozilish",
  'Texnik muammo',
  'Taklif va shikoyat',
  'Hamkorlik',
  'Boshqa',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', subject: '', message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (form.full_name.length < 3) e.full_name = 'Ism kamida 3 harf'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email noto'g'ri"
    if (!form.subject) e.subject = 'Mavzuni tanlang'
    if (form.message.length < 10) e.message = 'Xabar kamida 10 harf'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const result = await sendContactMessage(form)
    setLoading(false)
    if (result.success) setSent(true)
    else setErrors({ submit: result.error || 'Xatolik yuz berdi' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Full-page background with form overlaid */}
      <div className="relative min-h-screen bg-indigo-950 overflow-hidden">
        {/* Background school photo */}
        <div className="absolute inset-0">
          <Image
            src="/school-bg-new.jpg"
            alt="Maktab"
            fill
            className="object-cover object-center"
            priority
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-indigo-900/75 to-blue-950/80" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
        {/* Glows */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content on top of background */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-28 pb-20">
          {/* Title */}
          <div className="text-center mb-12">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              📬 Bog&apos;lanish
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
              Biz bilan bog&apos;laning
            </h1>
            <p className="text-white/80 max-w-md mx-auto">
              Savollaringiz bormi? Biz yordam berishga doimo tayyormiz!
            </p>
          </div>

          {/* Form grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT — Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { Icon: MapPin,  iconBg: 'bg-indigo-500/30', iconColor: 'text-indigo-200',  title: 'Maktab manzili',  lines: ["Buvayda tumani, Hakimto'ra MFY", "Taraqiyot ko'chasi 3A-uy"] },
              { Icon: Phone,   iconBg: 'bg-emerald-500/30', iconColor: 'text-emerald-200', title: 'Telefon raqam',   lines: ['+998 93 201 75 74'], link: 'tel:+998932017574' },
              { Icon: Mail,    iconBg: 'bg-blue-500/30',    iconColor: 'text-blue-200',    title: 'Email manzil',   lines: ['info@iqro46.uz'], link: 'mailto:info@iqro46.uz' },
              { Icon: Clock,   iconBg: 'bg-amber-500/30',   iconColor: 'text-amber-200',   title: 'Ish vaqti',      lines: ['Dush — Juma: 8:00 — 17:00', 'Shanba: 9:00 — 13:00'] },
            ].map((card, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}>
                    <card.Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{card.title}</h3>
                </div>
                {card.lines.map((line, j) => (
                  card.link ? (
                    <a key={j} href={card.link} className="block text-sm text-indigo-200 hover:text-white transition-colors">{line}</a>
                  ) : (
                    <p key={j} className="text-sm text-white/75">{line}</p>
                  )
                ))}
              </div>
            ))}
          </div>

          {/* RIGHT — Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/30">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xabaringiz yuborildi!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Tez orada siz bilan bog&apos;lanamiz.</p>
                  <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    Bosh sahifaga qaytish
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Xabar yuborish</h2>
                  <p className="text-sm text-gray-500 mb-6">Formani to&apos;ldiring, 24 soat ichida javob beramiz</p>

                  {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4">{errors.submit}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;liq ism *</label>
                        <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                          placeholder="Ism Familiya" className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 ${errors.full_name ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="email@example.com" className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 ${errors.email ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+998 90 123 45 67" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 placeholder:text-gray-400 focus:border-indigo-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mavzu *</label>
                        <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                          className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 focus:border-indigo-400 ${errors.subject ? 'border-red-300' : 'border-gray-200'}`}>
                          <option value="">Tanlang...</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xabar *</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Xabaringizni bu yerga yozing..." rows={5}
                        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`} />
                      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Yuborilmoqda...</>
                      ) : (
                        <>📤 Xabar yuborish</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
