'use client'

import { updateStudentInfo, deleteStudent } from '@/app/actions/admin-students'
import DataLoader from '@/components/ui/DataLoader'
import { getStudentLevel } from '@/lib/levels'
import { GRADES } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Copy, Edit3, Eye, EyeOff, Search, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Student {
  id: string
  full_name: string
  email?: string
  user_id?: string
  plain_password?: string
  grade?: string | null
  phone?: string | null
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
  const [formData, setFormData] = useState({ full_name: '', parent_name: '', parent_telegram_id: '', grade: '', phone: '', email: '', new_password: '' })
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [dataReady, setDataReady] = useState(false)
  const [showModalPwd, setShowModalPwd] = useState(false)
  const [modalBlocking, setModalBlocking] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; userId: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [studentsList, setStudentsList] = useState(students)

  useEffect(() => { setDataReady(true) }, [])

  const filtered = studentsList.filter((s) =>
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
      phone: student.phone || '',
      email: student.email || '',
      new_password: '',
    })
    setShowNewPwd(false)
    setShowModalPwd(false)
    setModalBlocking(false)
  }

  const handleSave = async () => {
    if (!editStudent) return
    if (!formData.full_name.trim()) {
      setToast({ message: "Ism bo'sh bo'lishi mumkin emas", type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    if (formData.new_password && formData.new_password.length < 8) {
      setToast({ message: "Parol kamida 8 ta belgi bo'lishi kerak", type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    setSaving(true)
    const result = await updateStudentInfo({
      profile_id: editStudent.id,
      user_id: editStudent.user_id,
      full_name: formData.full_name,
      parent_name: formData.parent_name,
      parent_telegram_id: formData.parent_telegram_id,
      grade: formData.grade,
      email: formData.email || undefined,
      new_password: formData.new_password || undefined,
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

  async function handleModalBlock() {
    if (!editStudent) return
    setModalBlocking(true)
    const { toggleBlockStudent } = await import('@/app/actions/admin-students')
    const res = await toggleBlockStudent(editStudent.id, !editStudent.is_blocked)
    if (res.success) {
      setEditStudent(prev => prev ? { ...prev, is_blocked: !prev.is_blocked } : null)
      setToast({ message: editStudent.is_blocked ? "O'quvchi faollashtirildi ✅" : "O'quvchi bloklandi 🚫", type: 'success' })
      setTimeout(() => setToast(null), 3000)
    }
    setModalBlocking(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteStudent(deleteTarget.id, deleteTarget.userId)
    setDeleteLoading(false)
    if (result.success) {
      setToast({ message: "O'quvchi o'chirildi ✅", type: 'success' })
      setDeleteTarget(null)
      setStudentsList(prev => prev.filter(s => s.id !== deleteTarget.id))
      setTimeout(() => setToast(null), 3000)
    } else {
      setToast({ message: 'Xatolik: ' + result.error, type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
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
            {studentsList.length} ta o&apos;quvchi
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
                        <button
                          onClick={() => setDeleteTarget({
                            id: student.id,
                            userId: student.user_id!,
                            name: student.full_name
                          })}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
                        >
                          🗑️ O&apos;chirish
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setEditStudent(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {(editStudent.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">✏️ {editStudent.full_name}</h2>
                    <p className="text-xs text-gray-500">O&apos;quvchi ma&apos;lumotlarini tahrirlash</p>
                  </div>
                </div>
                <button onClick={() => setEditStudent(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>

              {/* Section 1: Personal */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">👤 Shaxsiy ma&apos;lumotlar</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">To&apos;liq ism *</label>
                  <input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">🎓 Sinf</label>
                    <select value={formData.grade} onChange={e => setFormData(p => ({ ...p, grade: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
                      <option value="">Tanlang</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}-sinf</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">📞 Telefon</label>
                    <input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">👨‍👩‍👦 Ota-ona ismi</label>
                  <input value={formData.parent_name} onChange={e => setFormData(p => ({ ...p, parent_name: e.target.value }))}
                    placeholder="Masalan: Karimov Sardor"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">📱 Ota-ona Telegram Chat ID</label>
                  <input value={formData.parent_telegram_id} onChange={e => setFormData(p => ({ ...p, parent_telegram_id: e.target.value }))}
                    placeholder="Masalan: 123456789"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                  <p className="text-[11px] text-gray-400 mt-1">ID olish: <span className="text-indigo-500 font-medium">@EduFlow_notify_bot</span> ga <code className="bg-gray-100 px-1 rounded">/start</code> yuboring</p>
                </div>
              </div>

              <div className="border-t" />

              {/* Section 2: Login */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🔐 Login ma&apos;lumotlari</h3>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">📧 Email (Login)</label>
                  <input value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    type="email" placeholder="student@eduflow.uz"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">🔑 Joriy parol</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="flex-1 font-mono text-sm text-gray-700">
                      {showModalPwd ? (editStudent.plain_password || '—') : '••••••••'}
                    </span>
                    <button type="button" onClick={() => setShowModalPwd(!showModalPwd)} className="text-gray-400 hover:text-gray-600">
                      {showModalPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {editStudent.plain_password && (
                      <button type="button" onClick={() => { navigator.clipboard.writeText(editStudent.plain_password!); setToast({ message: 'Nusxalandi! 📋', type: 'success' }); setTimeout(() => setToast(null), 2000) }}
                        className="text-gray-400 hover:text-indigo-600"><Copy size={14} /></button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{editStudent.plain_password ? "Admin tomonidan o'rnatilgan parol" : "O'quvchi o'zi ro'yxatdan o'tgan"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">🔒 Yangi parol (ixtiyoriy)</label>
                  <div className="relative">
                    <input value={formData.new_password} onChange={e => setFormData(p => ({ ...p, new_password: e.target.value }))}
                      type={showNewPwd ? 'text' : 'password'} placeholder="Kamida 8 belgi. Bo'sh qolsa o'zgarmaydi."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 pr-10" />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {/* Section 3: Block */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">🚫 Kirish huquqi</h3>
                {editStudent.is_blocked ? (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                    <div>
                      <p className="font-medium text-red-700">● Bloklangan</p>
                      <p className="text-sm text-red-400">Tizimga kira olmaydi</p>
                    </div>
                    <button type="button" onClick={handleModalBlock} disabled={modalBlocking}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50">
                      {modalBlocking ? '⏳...' : '✅ Faollashtirish'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div>
                      <p className="font-medium text-green-700">● Faol</p>
                      <p className="text-sm text-green-500">Tizimga kirish mumkin</p>
                    </div>
                    <button type="button" onClick={handleModalBlock} disabled={modalBlocking}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50">
                      {modalBlocking ? '⏳...' : '🚫 Bloklash'}
                    </button>
                  </div>
                )}
              </div>

              {/* Save */}
              <div className="flex gap-3 pt-2 border-t">
                <button onClick={() => setEditStudent(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Bekor qilish</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
                  {saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">O&apos;chirishni tasdiqlang</h3>
              <p className="text-gray-500 text-sm">
                <span className="font-semibold text-gray-700">{deleteTarget.name}</span> ni haqiqatan ham o&apos;chirmoqchimisiz? Bu amalni qaytarib bo&apos;lmaydi.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Bekor qilish
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? '...' : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DataLoader>
  )
}
