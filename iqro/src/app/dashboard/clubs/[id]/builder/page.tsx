'use client'

import { publishClub, saveClubDetail } from '@/app/actions/clubs'
import { createClient } from '@/lib/supabase/client'
import { getCategoryColor, getDefaultEmoji } from '@/lib/utils'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
export default function ClubBuilderPage() {
  const params = useParams()
  const clubId = params.id as string
  const supabase = createClient()

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_description: '',
    teacher_bio: '',
    achievements: [] as string[],
    cover_image_url: '',
    teacher_image_url: '',
    room_image_url: '',
  })
  const [newAchievement, setNewAchievement] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [previewTab, setPreviewTab] = useState<'card' | 'detail'>('card')
  const [published, setPublished] = useState(false)

  const loadClub = useCallback(async () => {
    const { data } = await supabase
      .from('clubs')
      .select('*, teacher:profiles!teacher_id(full_name)')
      .eq('id', clubId)
      .single()
    if (data) {
      setClub(data)
      setPublished(!!data.is_published)
      setFormData({
        full_description: data.full_description || '',
        teacher_bio: data.teacher_bio || '',
        achievements: data.achievements || [],
        cover_image_url: data.cover_image_url || '',
        teacher_image_url: data.teacher_image_url || '',
        room_image_url: data.room_image_url || '',
      })
    }
    setLoading(false)
  }, [clubId, supabase])

  useEffect(() => { loadClub() }, [loadClub])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await saveClubDetail(clubId, formData)
    setIsSaving(false)
    if (result.success) showToast('💾 Saqlandi!', 'success')
    else showToast(result.error || 'Xatolik', 'error')
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    const result = await publishClub(clubId, !published)
    setIsPublishing(false)
    if (result.success) {
      setPublished(!published)
      showToast(published ? '📥 Nashrdan olindi' : '🚀 Nashr qilindi!', 'success')
    } else {
      showToast(result.error || 'Xatolik', 'error')
    }
  }

  const removeAchievement = (idx: number) => {
    setFormData(p => ({ ...p, achievements: p.achievements.filter((_, i) => i !== idx) }))
  }

  async function handleUpload(file: File, folder: string, field: keyof typeof formData) {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('club-images').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('club-images').getPublicUrl(path)
      setFormData(p => ({ ...p, [field]: publicUrl }))
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  )

  if (!club) return <div className="p-8 text-center text-gray-500">To&apos;garak topilmadi</div>

  const emoji = club.emoji || getDefaultEmoji(club.category || '')
  const catColor = getCategoryColor(club.category || '')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/dashboard/clubs" className="text-gray-400 hover:text-gray-600 text-sm whitespace-nowrap">
            ←<span className="hidden sm:inline"> To&apos;garaklarga qaytish</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">{emoji} <span className="truncate max-w-[150px] sm:max-w-none">{club.name}</span></h1>
          {published ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">✅ Nashr qilingan</span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full whitespace-nowrap">📝 Qoralama</span>
          )}
        </div>
        {published && (
          <Link href={`/clubs/${clubId}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 text-sm font-medium hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl w-full sm:w-auto">
            👁 Batafsil sahifani ko&apos;rish
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT — PREVIEW (sticky) */}
        <div className="lg:w-[420px] lg:flex-shrink-0 bg-gray-100 dark:bg-gray-950 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 mb-4">
            {(['card', 'detail'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${previewTab === tab ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
              >
                {tab === 'card' ? '🃏 Karta' : '📄 Batafsil'}
              </button>
            ))}
          </div>

          {previewTab === 'card' ? (
            /* Card Preview */
            <div className="max-w-xs mx-auto bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {formData.cover_image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                  </>
                ) : null}
                <span className="text-5xl relative z-10">{emoji}</span>
                <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${catColor}`}>{club.category}</div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{club.name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {club.is_paid ? (
                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">💳 {club.price?.toLocaleString()} so&apos;m</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">🆓 Bepul</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">👨‍🏫 {club.teacher?.full_name || '-'}</p>
                <p className="text-sm text-gray-500">📅 {club.schedule || '-'}</p>
              </div>
            </div>
          ) : (
            /* Detail Preview */
            <div className="max-w-lg mx-auto space-y-4">
              {/* Hero */}
              <div className="relative h-48 rounded-2xl overflow-hidden flex items-center justify-center">
                {formData.cover_image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-cyan-400" />
                )}
                <div className="relative z-10 text-center text-white">
                  <span className="text-4xl block mb-2">{emoji}</span>
                  <h2 className="text-xl font-black">{club.name}</h2>
                </div>
              </div>
              {/* Description */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm mb-2">📖 To&apos;garak haqida</h3>
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{formData.full_description || club.description || "Ma'lumot kiritilmagan"}</p>
              </div>
              {/* Achievements */}
              {formData.achievements.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-sm mb-2">🏆 Yutuqlar</h3>
                  <div className="flex flex-wrap gap-1">
                    {formData.achievements.map((a, i) => (
                      <span key={i} className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">🏅 {a}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Teacher */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm mb-2">👨‍🏫 O&apos;qituvchi</h3>
                <div className="flex items-center gap-3">
                  {formData.teacher_image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={formData.teacher_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {club.teacher?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{club.teacher?.full_name || '-'}</p>
                    {formData.teacher_bio && <p className="text-xs text-gray-500">{formData.teacher_bio}</p>}
                  </div>
                </div>
              </div>
              {/* Room */}
              {formData.room_image_url && (
                <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.room_image_url} alt="" className="w-full h-32 object-cover" />
                  <p className="text-center text-xs text-gray-500 py-2">📍 Dars xonasi</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — FORM (scrollable) */}
        <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">📝 To&apos;liq tavsif</h3>
              <textarea
                value={formData.full_description}
                onChange={e => setFormData(p => ({ ...p, full_description: e.target.value }))}
                placeholder="To'garak haqida batafsil yozing... Nima o'rganiladi? Kimlar uchun?"
                rows={6}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:border-indigo-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.full_description.length} / 1000</p>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section 2: Achievements */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">🏆 YUTUQLAR VA IMKONIYATLAR</h3>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.achievements.map((ach, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {ach}
                    <button onClick={() => removeAchievement(i)} className="text-indigo-400 hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
              <input
                value={newAchievement}
                onChange={e => setNewAchievement(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newAchievement.trim()) {
                    e.preventDefault()
                    setFormData(p => ({ ...p, achievements: [...p.achievements, newAchievement.trim()] }))
                    setNewAchievement('')
                  }
                }}
                placeholder="Yutuq qo'shing... (Enter bosing)"
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>

            {/* Teacher Bio */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">👨‍🏫 O&apos;qituvchi haqida</h3>
              <textarea
                value={formData.teacher_bio}
                onChange={e => setFormData(p => ({ ...p, teacher_bio: e.target.value }))}
                placeholder="O'qituvchi haqida qisqacha (tajriba, yutuqlar...)"
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-3 text-sm outline-none focus:border-indigo-400 resize-none"
              />
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Section 4: Images */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">📸 RASMLAR</h3>
              <div className="space-y-4">
                {/* Cover */}
                <ImageUploader
                  label="To'garak muqovasi (Cover)"
                  hint="Karta va batafsil sahifada ko'rinadi"
                  currentUrl={formData.cover_image_url}
                  onUpload={file => handleUpload(file, 'covers', 'cover_image_url')}
                  onRemove={() => setFormData(p => ({ ...p, cover_image_url: '' }))}
                />
                {/* Teacher */}
                <ImageUploader
                  label="O'qituvchi rasmi"
                  hint="Profil kartasida ko'rinadi"
                  currentUrl={formData.teacher_image_url}
                  onUpload={file => handleUpload(file, 'teachers', 'teacher_image_url')}
                  onRemove={() => setFormData(p => ({ ...p, teacher_image_url: '' }))}
                />
                {/* Room */}
                <ImageUploader
                  label="Dars xonasi rasmi"
                  hint="Batafsil sahifada ko'rinadi"
                  currentUrl={formData.room_image_url}
                  onUpload={file => handleUpload(file, 'rooms', 'room_image_url')}
                  onRemove={() => setFormData(p => ({ ...p, room_image_url: '' }))}
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 flex gap-3 justify-between">
            <span className="text-xs text-gray-400 self-center">Tayyor bo&apos;lgach saqlang</span>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSaving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className={`px-6 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 ${published ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isPublishing ? '⏳ ...' : published ? '📥 Nashrdan olish' : '🚀 Nashr qilish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageUploader({ label, hint, currentUrl, onUpload, onRemove }: {
  label: string; hint: string; currentUrl: string;
  onUpload: (file: File) => void; onRemove: () => void
}) {
  const [uploading, setUploading] = useState(false)

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400">{hint}</p>
      {currentUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt={label} className="w-full h-32 object-cover rounded-xl" />
          <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500 text-white rounded-lg px-2 py-1 text-xs hover:bg-red-600">
            O&apos;chirish
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
          {uploading ? (
            <div className="text-indigo-500 text-sm">Yuklanmoqda...</div>
          ) : (
            <>
              <span className="text-3xl mb-1">📤</span>
              <span className="text-sm text-gray-500">Rasm yuklash</span>
              <span className="text-xs text-gray-400">JPG, PNG (max 5MB)</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={async e => {
              const file = e.target.files?.[0]
              if (file) {
                setUploading(true)
                await onUpload(file)
                setUploading(false)
              }
            }}
          />
        </label>
      )}
    </div>
  )
}
