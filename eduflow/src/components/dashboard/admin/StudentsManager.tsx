'use client'

import { updateStudentInfo } from '@/app/actions/admin-students'
import DataLoader from '@/components/ui/DataLoader'
import { getStudentLevel } from '@/lib/levels'
import { GRADES } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Copy, Edit3, Eye, EyeOff, Search, ShieldCheck, ShieldX, Users, X } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

interface Student {
  id: string
  full_name: string
  email?: string
  user_id?: string
  plain_password?: string
  grade?: string | null
  is_blocked?: boolean
  created_at: string
  student_points: { total_points: number }[] | null
  enrollments: { count: number }[] | null
  parent_telegram_id?: string | null
  parent_name?: string | null
}

export default function StudentsManager({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('')
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({ full_name: '', parent_name: '', parent_telegram_id: '', grade: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => { setDataReady(true) }, [])

  const filtered = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (student: Student) => {
    setEditStudent(student)
    setFormData({
      full_name: student.full_name || '',
      parent_name: student.parent_name || '',
      parent_telegram_id: student.parent_telegram_id || '',
      grade: student.grade || '',
    })
  }

  const handleSave = async () => {
    if (!editStudent) return
    setSaving(true)
    const result = await updateStudentInfo({
      profile_id: editStudent.id,
      ...formData,
    })
    setSaving(false)
    if (result.success) {
      setToast({ message: "Ma'lumotlar saqlandi! ✅", type: 'success' })
      setEditStudent(null)
      setTimeout(() => setToast(null), 3000)
    } else {
      setToast({ message: result.error || 'Xatolik', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  async function handleToggleBlock(student: Student) {
    setBlockingId(student.id)
    startTransition(async () => {
      const { toggleBlockStudent } = await import('@/app/actions/admin-students')
      await toggleBlockStudent(student.id, !student.is_blocked)
      setBlockingId(null)
    })
  }

  return (
    <DataLoader loading={!dataReady} minHeight="min-h-[400px]">
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>
          <p className="text-sm text-gray-500 mt-1">
            <Users size={14} className="inline mr-1" />
            {students.length} ta o&apos;quvchi
          </p>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Ism yoki email bo'yicha qidirish..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-4xl">👨‍🎓</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">O&apos;quvchi topilmadi</h3>
          <p className="text-sm text-gray-500 mt-1">Qidiruv shartlarini o&apos;zgartiring</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Sinf</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Daraja</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Ball</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Parol</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase">TG</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Holat</th>
                <th className="text-center py-4 px-4 text-xs font-semibold text-gray-400 uppercase">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const points = student.student_points?.[0]?.total_points || 0
                const level = getStudentLevel(points)
                const initials = (student.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px]">{initials}</div>
                        <p className="text-sm font-semibold text-gray-900">{student.full_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.grade ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">{student.grade}</span> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: level.bgColor, color: level.textColor }}>
                        {level.emoji} {level.nameUz}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-900">{points}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 font-mono">{student.email || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-600">
                          {showPasswords[student.id] ? (student.plain_password || '—') : '••••••'}
                        </span>
                        <button onClick={() => setShowPasswords(p => ({ ...p, [student.id]: !p[student.id] }))} className="text-gray-400 hover:text-gray-600 p-0.5">
                          {showPasswords[student.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        {student.plain_password && (
                          <button onClick={() => handleCopy(student.plain_password!, student.id)} className="text-gray-400 hover:text-indigo-600 p-0.5">
                            <Copy size={12} />
                            {copiedId === student.id && <span className="text-[10px] text-emerald-500">✓</span>}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {student.parent_telegram_id ? <span className="text-emerald-500">✅</span> : <span className="text-amber-400">⚠️</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${student.is_blocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.is_blocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {student.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 justify-center">
                        <button onClick={() => openEdit(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                          <Edit3 size={11} /> Tahrir
                        </button>
                        <button onClick={() => handleToggleBlock(student)} disabled={blockingId === student.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${student.is_blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                          {blockingId === student.id ? '⏳' : student.is_blocked ? <><ShieldCheck size={11} /> Faol</> : <><ShieldX size={11} /> Blok</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Edit Dialog */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">✏️ {editStudent.full_name}</h2>
              <button onClick={() => setEditStudent(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-600 mb-1 block">To&apos;liq ism</label>
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">Ota-ona ismi</label>
                <input type="text" value={formData.parent_name} onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="Masalan: Karimov Sardor" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">Ota-ona Telegram Chat ID</label>
                <input type="text" value={formData.parent_telegram_id} onChange={(e) => setFormData({ ...formData, parent_telegram_id: e.target.value })}
                  placeholder="Masalan: 123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
                <p className="text-[11px] text-gray-400 mt-1.5">Telegram ID olish uchun: <span className="font-semibold text-indigo-500">@EduFlow_notify_bot</span> ga <code className="bg-gray-100 px-1 rounded">/start</code> yuboring</p>
              </div>
              <div><label className="text-sm text-gray-600 mb-1 block">📚 Sinf</label>
                <select value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300">
                  <option value="">Sinfni tanlang</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}-sinf</option>)}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                {saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </DataLoader>
  )
}
