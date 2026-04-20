'use client'

import { toggleBlockDirector, updateDirectorInfo } from '@/app/actions/directors'
import { createClient } from '@/lib/supabase/client'
import { Camera, Copy, Eye, EyeOff, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface Director {
  id: string
  user_id: string
  full_name: string
  phone?: string
  email?: string
  is_blocked?: boolean
  plain_password?: string
  avatar_url?: string | null
}

export default function DirectorsManager({ directors }: { directors: Director[] }) {
  const [directorsList, setDirectorsList] = useState(directors)
  const [editingDirector, setEditingDirector] = useState<Director | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Avatar states
  const [editingAvatarUrl, setEditingAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function showToast(type: 'success' | 'error', message: string) {
    setToastMsg({ type, message })
    setTimeout(() => setToastMsg(null), 3000)
  }

  function openEdit(director: Director) {
    setEditingDirector(director)
    setEditingAvatarUrl(director.avatar_url || null)
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
      email: form.email || undefined,
      new_password: form.new_password || undefined,
      avatar_url: editingAvatarUrl,
    })
    if (result.success) {
      showToast('success', "Direktor ma'lumotlari saqlandi ✅")
      setDirectorsList(prev => prev.map(d =>
        d.id === editingDirector.id
          ? {
              ...d,
              full_name: form.full_name,
              phone: form.phone,
              avatar_url: editingAvatarUrl,
              ...(form.new_password && { plain_password: form.new_password })
            }
          : d
      ))
      setShowModal(false)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Direktor boshqaruvi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{directorsList.length} ta direktor</p>
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
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Banner */}
              <div className="h-24 bg-gradient-to-br from-amber-500 to-orange-600 relative">
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
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg flex-shrink-0">
                    {director.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={director.avatar_url} alt={director.full_name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white text-xl font-black">
                        {director.full_name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  <div className="pb-1">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      director.is_blocked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${director.is_blocked ? 'bg-red-500' : 'bg-green-500'}`}/>
                      {director.is_blocked ? 'Bloklangan' : 'Faol'}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                  {director.full_name}
                </h3>
                <p className="text-amber-600 text-sm font-semibold mb-3">
                  🏫 Direktor
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>📧</span>
                    <span className="truncate">{director.email}</span>
                  </div>
                  {director.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>📞</span>
                      <span>{director.phone}</span>
                    </div>
                  )}
                </div>

                {/* Button */}
                <button
                  onClick={() => openEdit(director)}
                  className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-600 text-sm font-semibold hover:bg-amber-100 border border-amber-100 transition-all flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center sm:p-4 p-0" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 sm:rounded-2xl w-full max-w-lg sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto absolute sm:relative inset-0 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-1 pb-24 sm:pb-0">
              {/* Modal Header with avatar upload */}
              <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-200 dark:border-amber-800">
                    {editingAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editingAvatarUrl} alt={editingDirector.full_name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 flex items-center justify-center text-white text-xl font-black">
                        {editingDirector.full_name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  {/* Upload button */}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-50"
                    title="Rasm yuklash"
                  >
                    {avatarUploading ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file || !editingDirector) return
                      if (file.size > 5 * 1024 * 1024) { showToast('error', "Rasm 5MB dan kichik bo'lsin"); return }
                      setAvatarUploading(true)
                      const ext = file.name.split('.').pop()
                      const path = `directors/${editingDirector.id}.${ext}`
                      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
                      if (!error) {
                        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
                        setEditingAvatarUrl(publicUrl + '?t=' + Date.now())
                      } else {
                        showToast('error', 'Yuklashda xatolik')
                      }
                      setAvatarUploading(false)
                      e.target.value = ''
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{editingDirector.full_name}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Direktor ma&apos;lumotlarini tahrirlash</p>
                  <p className="text-xs text-amber-500 mt-0.5">📷 Rasmni almashtirish uchun bosing</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 self-start">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Section 1: Personal */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">👤 Shaxsiy ma&apos;lumotlar</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">To&apos;liq ism *</label>
                    <input
                      value={form.full_name}
                      onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Telefon</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Section 2: Login */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🔐 Login ma&apos;lumotlari</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Email</label>
                    <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Joriy parol</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-200">
                        {showPwd ? editingDirector.plain_password || '—' : '••••••••'}
                      </span>
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {editingDirector.plain_password && (
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(editingDirector.plain_password || ''); showToast('success', 'Nusxalandi!') }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Yangi parol (ixtiyoriy)</label>
                    <div className="relative">
                      <input
                        value={form.new_password}
                        onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))}
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Kamida 8 belgi..."
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPwd ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* Section 3: Block */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🚫 Kirish huquqi</h3>
                  {editingDirector.is_blocked ? (
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">● Bloklangan</p>
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
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">● Faol</p>
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
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 mt-auto sticky bottom-0 bg-white dark:bg-gray-900 sm:relative">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
