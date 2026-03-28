'use client'

import { updateStudentProfile } from '@/app/actions/profile'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileInfo {
  full_name: string | null
  phone: string | null
  grade: string | null
}

interface StudentProfileClientProps {
  profile: ProfileInfo
  email: string
  school: string
  regDate: string
}

export default function StudentProfileClient({ profile, email, school, regDate }: StudentProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    grade: profile.grade || '',
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = () => {
    if (!form.full_name.trim()) {
      showToast("Ism bo'sh bo'lishi mumkin emas", 'error')
      return
    }
    startTransition(async () => {
      const result = await updateStudentProfile(form)
      if (result.success) {
        showToast("Ma'lumotlar muvaffaqiyatli saqlandi ✅", 'success')
        setIsEditing(false)
        router.refresh()
      } else {
        showToast(result.error || "Xatolik yuz berdi", 'error')
      }
    })
  }

  const handleCancel = () => {
    setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      grade: profile.grade || '',
    })
    setIsEditing(false)
  }

  const inputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500"

  const readItems = [
    { label: "To'liq ism", value: profile.full_name || '—' },
    { label: 'Email', value: email || '—' },
    { label: 'Telefon', value: profile.phone || '—' },
    { label: 'Sinf', value: profile.grade || '—' },
    { label: 'Maktab', value: school || '—' },
    { label: "Ro'yxatdan o'tgan", value: regDate },
  ]

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-4 sm:right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">👤 Shaxsiy ma&apos;lumotlar</h2>
        </div>

        {!isEditing ? (
          /* Read-only view */
          <>
            <div className="space-y-3">
              {readItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-right ml-4 break-all">{item.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-5 w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20"
            >
              ✏️ Tahrirlash
            </button>
          </>
        ) : (
          /* Edit form */
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">To&apos;liq ism <span className="text-red-400">*</span></label>
              <input
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Ism Familiya"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+998 90 123 45 67"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Sinf</label>
              <input
                value={form.grade}
                onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
                placeholder="Masalan: 9-A"
                className={inputClass}
              />
            </div>

            {/* Read-only fields */}
            <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">{email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Maktab</span>
                <span className="text-sm text-gray-500 dark:text-gray-500">{school}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isPending ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
