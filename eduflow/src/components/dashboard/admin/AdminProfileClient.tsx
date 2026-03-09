'use client'

import { updateAdminProfile } from '@/app/actions/profile'
import { Copy, Eye, EyeOff, Shield, User, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface Props {
  profile: {
    id: string
    full_name: string
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
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    new_password: '',
    confirm_password: '',
  })
  const [error, setError] = useState('')

  const initials = (profile.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleSave() {
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Parollar mos kelmaydi")
      return
    }
    if (form.new_password && form.new_password.length < 6) {
      setError("Parol kamida 6 ta belgi")
      return
    }
    setError('')
    startTransition(async () => {
      await updateAdminProfile({
        full_name: form.full_name,
        phone: form.phone || undefined,
        new_password: form.new_password || undefined,
      })
      setIsEditing(false)
      setForm(p => ({ ...p, new_password: '', confirm_password: '' }))
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Profil sozlamalari</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header gradient */}
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

        {/* Avatar + Name */}
        <div className="px-8 -mt-12 pb-6">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white">
              {initials}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                  <Shield size={10} /> Administrator
                </span>
                {profile.school?.name && (
                  <span className="text-xs text-gray-500">📍 {profile.school.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <User size={14} /> Shaxsiy ma&apos;lumotlar
              </h3>
              <div className="space-y-3">
                <div><span className="text-xs text-gray-400">To&apos;liq ism</span><p className="text-sm font-semibold text-gray-900">{profile.full_name}</p></div>
                <div><span className="text-xs text-gray-400">Telefon</span><p className="text-sm font-semibold text-gray-900">{profile.phone || '—'}</p></div>
                <div><span className="text-xs text-gray-400">Maktab</span><p className="text-sm font-semibold text-gray-900">{profile.school?.name || '—'}</p></div>
              </div>
            </div>

            {/* Login Info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={14} /> Tizimga kirish
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-400">Email</span>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Parol</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono text-gray-900">
                      {showPassword ? (profile.plain_password || '—') : '••••••••'}
                    </span>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 p-0.5">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {profile.plain_password && (
                      <button onClick={() => handleCopy(profile.plain_password!)} className="text-gray-400 hover:text-indigo-600 p-0.5">
                        <Copy size={14} />
                        {copied && <span className="text-xs text-emerald-500 ml-1">✓</span>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-5 flex justify-end">
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              ✏️ Tahrirlash
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">✏️ Profilni tahrirlash</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>}
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">To&apos;liq ism</label>
                <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Telefon</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+998 90 123 45 67" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Yangi parol</label>
                <input type="password" value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))}
                  placeholder="O'zgartirmasangiz bo'sh qoldiring" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
              </div>
              {form.new_password && (
                <div><label className="text-sm font-medium text-gray-700 mb-1 block">Parolni tasdiqlang</label>
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
