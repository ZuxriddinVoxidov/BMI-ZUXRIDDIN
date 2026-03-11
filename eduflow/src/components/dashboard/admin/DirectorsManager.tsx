'use client'

import { toggleBlockDirector, updateDirectorInfo } from '@/app/actions/directors'
import { Copy, Eye, EyeOff, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Director {
  id: string
  user_id: string
  full_name: string
  phone?: string
  email?: string
  is_blocked?: boolean
  plain_password?: string
}

export default function DirectorsManager({ directors }: { directors: Director[] }) {
  const [directorsList, setDirectorsList] = useState(directors)
  const router = useRouter()
  const [editingDirector, setEditingDirector] = useState<Director | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function showToast(type: 'success' | 'error', message: string) {
    setToastMsg({ type, message })
    setTimeout(() => setToastMsg(null), 3000)
  }

  function openEdit(director: Director) {
    setEditingDirector(director)
    setForm({
      full_name: director.full_name || '',
      phone: director.phone || '',
      email: director.email || '',
      new_password: '',
    })
    setShowPwd(false)
    setShowModal(true)
  }

  async function handleSave() {
    if (!editingDirector) return
    setSaving(true)
    const result = await updateDirectorInfo(editingDirector.id, editingDirector.user_id, {
      full_name: form.full_name,
      phone: form.phone,
      new_password: form.new_password || undefined,
    })
    if (result.success) {
      showToast('success', "Direktor ma'lumotlari saqlandi ✅")
      setDirectorsList(prev => prev.map(d =>
        d.id === editingDirector.id
          ? {
              ...d,
              full_name: form.full_name,
              phone: form.phone,
              ...(form.new_password && { plain_password: form.new_password })
            }
          : d
      ))
      setShowModal(false)
      router.refresh()
    } else {
      showToast('error', result.error || 'Xatolik')
    }
    setSaving(false)
  }

  async function handleBlockToggle(director: Director) {
    setBlocking(true)
    const result = await toggleBlockDirector(director.id, !director.is_blocked)
    if (result.success) {
      showToast('success', director.is_blocked ? 'Direktor faollashtirildi ✅' : 'Direktor bloklandi 🚫')
      setDirectorsList(prev => prev.map(d =>
        d.id === director.id
          ? { ...d, is_blocked: !d.is_blocked }
          : d
      ))
      setShowModal(false)
      router.refresh()
    } else {
      showToast('error', result.error || 'Xatolik')
    }
    setBlocking(false)
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toastMsg.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toastMsg.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direktor boshqaruvi</h1>
          <p className="text-gray-500 text-sm mt-1">{directorsList.length} ta direktor</p>
        </div>
      </div>

      {/* Director Cards */}
      {directorsList.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏫</p>
          <p className="font-medium">Hali direktor qo&apos;shilmagan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directorsList.map((director) => (
            <div
              key={director.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Banner */}
              <div className="h-24 bg-indigo-600 relative">
                {director.is_blocked && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                    🚫 Bloklangan
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="flex items-end gap-4 -mt-8 mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black border-4 border-white shadow-lg flex-shrink-0">
                    {director.full_name?.charAt(0) || 'D'}
                  </div>
                  <div className="pb-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      director.is_blocked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        director.is_blocked ? 'bg-red-500' : 'bg-green-500'
                      }`}/>
                      {director.is_blocked ? 'Bloklangan' : 'Faol'}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                  {director.full_name}
                </h3>
                <p className="text-indigo-600 text-sm font-semibold mb-3">
                  🏫 Direktor
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📧</span>
                    <span className="truncate">{director.email}</span>
                  </div>
                  {director.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📞</span>
                      <span>{director.phone}</span>
                    </div>
                  )}
                </div>

                {/* Button */}
                <button
                  onClick={() => openEdit(director)}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 border border-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  ✏️ Tahrirlash
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingDirector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">✏️ {editingDirector.full_name}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {/* Section 1: Personal */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">👤 Shaxsiy ma&apos;lumotlar</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">To&apos;liq ism *</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefon</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+998 90 123 45 67"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* Section 2: Login */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🔐 Login ma&apos;lumotlari</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Joriy parol</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border rounded-xl">
                    <span className="flex-1 font-mono text-sm">
                      {showPwd ? editingDirector.plain_password || '—' : '••••••••'}
                    </span>
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {editingDirector.plain_password && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(editingDirector.plain_password || '')
                          showToast('success', 'Nusxalandi!')
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Yangi parol (ixtiyoriy)</label>
                  <input
                    value={form.new_password}
                    onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))}
                    type="password"
                    placeholder="Kamida 8 belgi..."
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* Section 3: Block */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🚫 Kirish huquqi</h3>
                {editingDirector.is_blocked ? (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div>
                      <p className="font-medium text-red-700">● Bloklangan</p>
                      <p className="text-sm text-red-400">Tizimga kira olmaydi</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBlockToggle(editingDirector)}
                      disabled={blocking}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                      {blocking ? '⏳...' : '✅ Faollashtirish'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div>
                      <p className="font-medium text-green-700">● Faol</p>
                      <p className="text-sm text-green-500">Tizimga kirish mumkin</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBlockToggle(editingDirector)}
                      disabled={blocking}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                    >
                      {blocking ? '⏳...' : '🚫 Bloklash'}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50">
                  Bekor qilish
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
