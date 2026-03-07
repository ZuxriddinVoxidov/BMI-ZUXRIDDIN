'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Download, FileText, Image, Package, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getFileIcon(url: string) {
  const ext = url?.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return <FileText className="text-red-500" size={24} />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return <Image className="text-blue-500" size={24} />
  return <Package className="text-gray-500" size={24} />
}

export default function StudentWorksPage() {
  const [profile, setProfile] = useState<{ id: string } | null>(null)
  const [works, setWorks] = useState<Record<string, unknown>[]>([])
  const [myClubs, setMyClubs] = useState<{ id: string; name: string }[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [workTitle, setWorkTitle] = useState('')
  const [selectedClub, setSelectedClub] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!p) return
      setProfile(p)

      const { data: w } = await supabase
        .from('student_works')
        .select('*, club:clubs(name)')
        .eq('student_id', p.id)
        .order('created_at', { ascending: false })
      setWorks((w || []) as Record<string, unknown>[])

      const { data: enrolled } = await supabase
        .from('enrollments')
        .select('club:clubs(id, name)')
        .eq('student_id', p.id)
        .eq('status', 'approved')
      
      const clubs = (enrolled || [])
        .map(e => (e.club as unknown) as { id: string; name: string } | null)
        .filter(Boolean) as { id: string; name: string }[]
      setMyClubs(clubs)
    }
    load()
  }, [])

  const handleUpload = async () => {
    if (!profile || !file || !workTitle || !selectedClub) return
    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('student-works')
        .upload(fileName, file)

      if (uploadError) {
        showToast('Fayl yuklashda xatolik: ' + uploadError.message, 'error')
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('student-works')
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase.from('student_works').insert({
        student_id: profile.id,
        club_id: selectedClub,
        title: workTitle,
        file_url: publicUrl,
      })

      if (insertError) {
        showToast('Saqlashda xatolik: ' + insertError.message, 'error')
        setUploading(false)
        return
      }

      await supabase.rpc('add_student_points', {
        p_student_id: profile.id,
        p_points: 5,
      })

      showToast('Ish muvaffaqiyatli yuklandi! +5 ball 🎉', 'success')
      setShowDialog(false)
      setWorkTitle('')
      setSelectedClub('')
      setFile(null)

      // Refresh
      const { data: w } = await supabase
        .from('student_works')
        .select('*, club:clubs(name)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
      setWorks((w || []) as Record<string, unknown>[])
    } catch {
      showToast('Kutilmagan xatolik', 'error')
    }
    setUploading(false)
  }

  const handleDelete = async (workId: string) => {
    if (!profile) return
    await supabase.from('student_works').delete().eq('id', workId)
    setWorks(works.filter(w => w.id !== workId))
    setDeleteConfirm(null)
    showToast("Ish o'chirildi", 'success')
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Mening Ishlarim</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Upload size={16} /> Ish yuklash
        </button>
      </div>

      {/* Works Grid */}
      {works.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {works.map((w) => {
            const club = w.club as Record<string, unknown> | null
            const createdAt = new Date(w.created_at as string).toLocaleDateString('uz-UZ')

            return (
              <div key={w.id as string} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(w.file_url as string)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{w.title as string}</h3>
                    {club && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mt-1">
                        {club.name as string}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-3">{createdAt}</p>
                <div className="flex gap-2">
                  <a
                    href={w.file_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-medium transition"
                  >
                    <Download size={14} /> Yuklab olish
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(w.id as string)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-medium transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-gray-300">
          <span className="text-5xl mb-4">📂</span>
          <p className="text-gray-500 font-medium">Hali ishlar yuklanmagan</p>
          <p className="text-sm text-gray-400">Birinchi ishingizni yuklang va +5 ball oling!</p>
        </div>
      )}

      {/* Upload Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-gray-900">📤 Ish yuklash</h3>
              <button onClick={() => setShowDialog(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ish nomi *</label>
                <input
                  type="text"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  placeholder="Masalan: Robot loyiha"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;garak *</label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Tanlang...</option>
                  {myClubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fayl yuklash</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !workTitle || !selectedClub || !file}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {uploading ? 'Yuklanmoqda...' : 'Yuklash 📤'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-bold text-gray-900 mb-2">Ishni o&apos;chirmoqchimisiz?</h3>
            <p className="text-sm text-gray-500 mb-5">Bu amalni qaytarib bo&apos;lmaydi</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition"
              >
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
