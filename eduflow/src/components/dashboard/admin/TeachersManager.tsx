'use client'

import { addTeacher, toggleBlockTeacher } from '@/app/actions/teachers'
import { motion } from 'framer-motion'
import { Copy, Eye, EyeOff, Search, ShieldCheck, ShieldX, UserPlus, Users } from 'lucide-react'
import { useState, useTransition } from 'react'

interface Teacher {
  id: string
  full_name: string
  email?: string
  plain_password?: string
  phone?: string
  user_id?: string
  is_blocked?: boolean
  created_at: string
  school_id?: string
  clubs: { id: string; name: string }[]
}

export default function TeachersManager({ teachers, schoolId }: { teachers: Teacher[]; schoolId: string }) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Add teacher form
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const filtered = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddTeacher(e: React.FormEvent) {
    e.preventDefault()
    if (form.full_name.length < 2) { setFormError("Ism kamida 2 harf"); return }
    if (!form.email.includes('@')) { setFormError("Email noto'g'ri"); return }
    if (form.password.length < 6) { setFormError("Parol kamida 6 ta belgi"); return }
    setFormError('')
    setFormLoading(true)
    const result = await addTeacher({ ...form, school_id: schoolId })
    setFormLoading(false)
    if (result.success) {
      setShowAddModal(false)
      setForm({ full_name: '', email: '', password: '' })
    } else {
      setFormError(result.error || 'Xatolik yuz berdi')
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function handleToggleBlock(profileId: string, block: boolean) {
    startTransition(async () => {
      await toggleBlockTeacher(profileId, block)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">O&apos;qituvchilar</h1>
          <p className="text-sm text-gray-500 mt-1">
            <Users size={14} className="inline mr-1" />
            {teachers.length} ta o&apos;qituvchi
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus size={18} /> Yangi o&apos;qituvchi
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ism yoki email bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">O&apos;qituvchi topilmadi</h3>
          <p className="text-sm text-gray-500 mt-1">Qidiruv shartlarini o&apos;zgartiring</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">O&apos;qituvchi</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Parol</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">To&apos;garaklar</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Holat</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => {
                const initials = (teacher.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <tr key={teacher.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{initials}</div>
                        <p className="text-sm font-semibold text-gray-900">{teacher.full_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600 font-mono">{teacher.email || '—'}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm text-gray-600">
                          {showPasswords[teacher.id] ? (teacher.plain_password || '—') : '••••••••'}
                        </span>
                        <button onClick={() => setShowPasswords(p => ({ ...p, [teacher.id]: !p[teacher.id] }))}
                          className="text-gray-400 hover:text-gray-600 p-1">
                          {showPasswords[teacher.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {teacher.plain_password && (
                          <button onClick={() => handleCopy(teacher.plain_password!, teacher.id)}
                            className="text-gray-400 hover:text-indigo-600 p-1" title="Nusxalash">
                            <Copy size={14} />
                            {copiedId === teacher.id && <span className="text-xs text-emerald-500 ml-1">✓</span>}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {teacher.clubs?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.clubs.map(c => (
                            <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{c.name}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${teacher.is_blocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${teacher.is_blocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {teacher.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleBlock(teacher.id, !teacher.is_blocked)}
                        disabled={isPending}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${teacher.is_blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'} disabled:opacity-50`}
                      >
                        {teacher.is_blocked ? <><ShieldCheck size={12} className="inline mr-1" />Faollashtirish</> : <><ShieldX size={12} className="inline mr-1" />Bloklash</>}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">👨‍🏫 Yangi o&apos;qituvchi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {formError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{formError}</div>}
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;liq ism *</label>
                <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ism Familiya" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (login) *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="teacher@eduflow.uz" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parol *</label>
                <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Kamida 6 ta belgi" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
              </div>
              <button type="submit" disabled={formLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50">
                {formLoading ? '⏳ Yaratilmoqda...' : '✅ Yaratish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
