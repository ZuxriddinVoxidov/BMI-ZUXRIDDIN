'use client'

import { updateAdminProfile } from '@/app/actions/profile'
import { Copy, Eye, EyeOff, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { UserAvatar } from '@/components/shared/UserAvatar'

interface Props {
  profile: {
    id: string
    full_name: string
    avatar_url?: string | null
    phone?: string | null
    plain_password?: string | null
    role: string
    school?: { name: string; address?: string } | null
  }
  email: string
}

export default function AdminProfileClient({ profile, email }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    email: email || '',
    phone: profile.phone || '',
    new_password: '',
    confirm_password: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [error, setError] = useState('')

  const initials = (profile.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const roleLabel = profile.role === 'director' ? 'Direktor' : profile.role === 'teacher' ? "O'qituvchi" : 'Administrator'

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleSave() {
    if (form.new_password && form.new_password.length < 8) {
      setError('Parol kamida 8 ta belgi bo\'lishi kerak')
      return
    }
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError('Parollar mos kelmaydi')
      return
    }
    startTransition(async () => {
      await updateAdminProfile({
        full_name: form.full_name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        new_password: form.new_password || undefined,
      })
      setIsEditing(false)
      setForm(p => ({ ...p, new_password: '', confirm_password: '' }))
      showToast('Saqlandi ✅')
    })
  }


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Profil sozlamalari</h1>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg bg-emerald-500 text-white text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full"/>
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full"/>
          <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full"/>
          
          <div className="absolute -bottom-10 left-4 sm:left-8 z-20 shadow-lg rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900">
            <UserAvatar avatarUrl={profile.avatar_url} fullName={profile.full_name} size="xl" />
          </div>
        </div>

        {/* Profile Row */}
        <div className="pt-12 px-4 pb-6 sm:px-8 sm:pb-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.full_name}</h2>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-sm text-gray-600">
            <span className="font-medium text-indigo-600 flex items-center gap-1 shrink-0">🛡️ {roleLabel}</span>
            {profile.school?.name && (
              <span className="flex items-center gap-1 text-gray-500" title={profile.school.name}>
                <span className="hidden sm:inline text-gray-300 shrink-0">•</span>
                <span className="line-clamp-2">📍 {profile.school.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-4 pb-6 sm:px-8 sm:pb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info Card */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                👤 Shaxsiy ma&apos;lumotlar
              </h3>
              <div className="space-y-3">
                {[
                  { label: "To'liq ism", value: profile.full_name },
                  { label: 'Telefon', value: profile.phone || '—' },
                  { label: 'Maktab', value: profile.school?.name || '—' },
                  { label: 'Rol', value: roleLabel, highlight: true },
                ].map(item => (
                  <div key={item.label} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-1 sm:gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{item.label}</span>
                    <span className={`text-sm font-medium break-words w-full sm:w-auto sm:text-right ${'highlight' in item && item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Info Card */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                🔐 Tizimga kirish
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100 dark:border-gray-800 gap-1 sm:gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Email</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-words w-full sm:w-auto sm:text-right">{email}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-2 sm:gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Parol</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm dark:text-gray-300">
                      {showPassword ? (profile.plain_password || '—') : '••••••••'}
                    </span>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {profile.plain_password && (
                      <button onClick={() => handleCopy(profile.plain_password!)} className="text-gray-400 hover:text-indigo-600">
                        <Copy size={14} />
                        {copied && <span className="text-xs text-emerald-500 ml-1">✓</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="flex justify-end px-4 pb-6 sm:px-8">
          <button onClick={() => setIsEditing(true)}
            className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3 sm:py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            ✏️ Tahrirlash
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">✏️ Profilni tahrirlash</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">To&apos;liq ism</label>
                <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Hozirgi parol</label>
                <div className="relative">
                  <input type={showCurrentPassword ? "text" : "password"} value={profile.plain_password || ''} readOnly
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono outline-none focus:border-indigo-400" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Telefon</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+998 90 123 45 67"
                  autoComplete="tel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Yangi parol</label>
                <input type="password" value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))}
                  autoComplete="new-password"
                  placeholder="O'zgartirmasangiz bo'sh qoldiring" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
              </div>
              {form.new_password && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Parolni tasdiqlang</label>
                  <input type="password" value={form.confirm_password} onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                    placeholder="Parolni qayta kiriting" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Bekor qilish</button>
                <button onClick={handleSave} disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                  {isPending ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
