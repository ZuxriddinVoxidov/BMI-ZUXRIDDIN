'use client'

import { updateStudentProfile } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { Camera, X } from 'lucide-react'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProfileInfo {
  id: string
  user_id: string
  full_name: string | null
  phone: string | null
  grade: string | null
  avatar_url: string | null
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
  })
  
  // Avatar states
  const [editingAvatarUrl, setEditingAvatarUrl] = useState<string | null>(profile.avatar_url)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

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
      const result = await updateStudentProfile({ 
        ...form, 
        grade: profile.grade || '',
        avatar_url: editingAvatarUrl 
      })
      if (result.success) {
        showToast("Ma'lumotlar muvaffaqiyatli saqlandi ✅", 'success')
        setIsEditing(false)
        router.refresh()
      } else {
        showToast(result.error || "Xatolik yuz berdi", 'error')
      }
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast("Rasm 5MB dan kichik bo'lishi kerak", 'error')
      return
    }

    setAvatarUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile.id}_${Date.now()}.${ext}`
    const path = `students/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      setEditingAvatarUrl(publicUrl)
      showToast("Rasm yuklandi. Saqlash tugmasini bosing.", 'success')
    } catch (err: any) {
      showToast(err.message || "Rasm yuklashda xatolik", 'error')
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleAvatarReset = () => {
    setEditingAvatarUrl(null)
    showToast("Profil rasmi olib tashlandi. Saqlashni bosing.", 'success')
  }

  const handleCancel = () => {
    setForm({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
    })
    setEditingAvatarUrl(profile.avatar_url)
    setIsEditing(false)
  }

  const initials = (form.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all shadow-sm"

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-4 sm:right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* === BANNER & AVATAR === */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/10 rounded-full" />
          
          {/* Avatar Container */}
          <div className="absolute -bottom-10 left-5 sm:left-8 z-20 group">
             <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 p-1 shadow-lg relative">
               <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center text-white text-2xl font-black relative">
                 {editingAvatarUrl ? (
                   <Image 
                    src={editingAvatarUrl} 
                    alt={form.full_name} 
                    fill 
                    className="object-cover" 
                    unoptimized
                   />
                 ) : initials}
                 
                 {/* Uploading Overlay */}
                 {avatarUploading && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   </div>
                 )}
               </div>

               {/* Camera Button */}
               <button
                 onClick={() => avatarInputRef.current?.click()}
                 disabled={avatarUploading}
                 className="absolute -bottom-2 -right-2 w-7 h-7 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
                 title="Rasmni o'zgartirish"
               >
                 <Camera size={14} />
               </button>
               <input
                 ref={avatarInputRef}
                 type="file"
                 className="hidden"
                 accept="image/*"
                 onChange={handleAvatarUpload}
               />
             </div>
          </div>
        </div>

        <div className="pt-14 pb-5 px-5 sm:px-8">
           <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white line-clamp-1">
                  {form.full_name || profile.full_name || '—'}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm mt-1.5 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">🎓 O&apos;quvchi</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-indigo-600 dark:text-indigo-400">🏫 {school}</span>
                  {profile.grade && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-purple-600 dark:text-purple-400">📚 {profile.grade}-sinf</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Reset Avatar button if exists */}
              {editingAvatarUrl && (
                <button
                  onClick={handleAvatarReset}
                  className="text-xs text-red-500 hover:text-red-600 underline font-medium flex items-center gap-1 transition-colors"
                >
                  <X size={12} /> Profil rasmini o&apos;chirish
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 items-start">
        {/* Personal Details Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">👤 Shaxsiy ma&apos;lumotlar</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
              >
                ✏️ Tahrirlash
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">To&apos;liq ism</label>
              <input
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                disabled={!isEditing}
                placeholder="Ism Familiya"
                className={`${inputClass} ${!isEditing ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-transparent shadow-none' : ''}`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="+998 90 123 45 67"
                className={`${inputClass} ${!isEditing ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-transparent shadow-none' : ''}`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="text-sm text-gray-600 dark:text-gray-300 h-10 flex items-center font-medium truncate">{email}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5 block">Ro&apos;yxat sanasi</label>
                <div className="text-sm text-gray-600 dark:text-gray-300 h-10 flex items-center font-medium">{regDate}</div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Children components Slot (like PasswordChangeForm) can be placed outside or passed as prop */}
        <div id="student-profile-secondary-slot"></div>
      </div>
    </div>
  )
}
