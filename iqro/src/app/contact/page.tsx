'use client'

import { sendContactMessage } from '@/app/actions/contact'
import Link from 'next/link'
import { useState } from 'react'

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">← Bosh sahifa</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 pt-24 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            📬 Bog&apos;lanish
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3">
            Biz bilan bog&apos;laning
          </h1>
          <p className="text-white/80 max-w-md mx-auto">
            Savollaringiz bormi? Biz yordam berishga doimo tayyormiz!
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT — Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: '📍', bg: 'bg-indigo-100 text-indigo-600', title: 'Maktab manzili', lines: ['Toshkent sh., Yunusobod tumani', '46-maktab'] },
              { icon: '📞', bg: 'bg-emerald-100 text-emerald-600', title: 'Telefon raqam', lines: ['+998 (71) 234-56-78'], link: 'tel:+998712345678' },
              { icon: '✉️', bg: 'bg-blue-100 text-blue-600', title: 'Email manzil', lines: ['admin@iqro.uz'], link: 'mailto:admin@iqro.uz' },
              { icon: '🕐', bg: 'bg-amber-100 text-amber-600', title: 'Ish vaqti', lines: ['Dushanba — Juma: 8:00 — 17:00', 'Shanba: 9:00 — 13:00'] },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center text-lg`}>
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{card.title}</h3>
                </div>
                {card.lines.map((line, j) => (
                  card.link ? (
                    <a key={j} href={card.link} className="block text-sm text-indigo-600 hover:text-indigo-700">{line}</a>
                  ) : (
                    <p key={j} className="text-sm text-gray-600">{line}</p>
                  )
                ))}
              </div>
            ))}

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { label: 'Telegram', bg: 'bg-blue-500 hover:bg-blue-600', icon: '✈️', href: 'https://t.me/iqro46' },
                { label: 'Instagram', bg: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600', icon: '📷', href: '#' },
                { label: 'YouTube', bg: 'bg-red-500 hover:bg-red-600', icon: '▶️', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`flex-1 py-3 ${s.bg} text-white text-sm font-medium rounded-xl text-center transition-all`}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Xabaringiz yuborildi!</h2>
                  <p className="text-gray-500 mb-6">Tez orada siz bilan bog&apos;lanamiz.</p>
                  <Link href="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                    Bosh sahifaga qaytish
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Xabar yuborish</h2>
                  <p className="text-sm text-gray-500 mb-6">Formani to&apos;ldiring, 24 soat ichida javob beramiz</p>

                  {errors.submit && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{errors.submit}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;liq ism *</label>
                        <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                          placeholder="Ism Familiya" className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 ${errors.full_name ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="email@example.com" className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 ${errors.email ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+998 90 123 45 67" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mavzu *</label>
                        <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white ${errors.subject ? 'border-red-300' : 'border-gray-200'}`}>
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
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none ${errors.message ? 'border-red-300' : 'border-gray-200'}`} />
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
  )
}
