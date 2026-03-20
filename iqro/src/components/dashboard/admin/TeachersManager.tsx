'use client'

import { addTeacher, toggleBlockTeacher, updateTeacherInfo, deleteTeacher } from '@/app/actions/teachers'

import DataLoader from '@/components/ui/DataLoader'
import { motion } from 'framer-motion'
import { Copy, Eye, EyeOff, Search, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Teacher {
  id: string
  full_name: string
  email?: string
  plain_password?: string
  phone?: string
  teacher_bio?: string
  user_id?: string
  is_blocked?: boolean
  created_at: string
  school_id?: string
  clubs: { id: string; name: string }[]
}

export default function TeachersManager({ teachers, schoolId }: { teachers: Teacher[]; schoolId: string }) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Add teacher form
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [dataReady, setDataReady] = useState(false)

  // Edit modal states
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({ full_name: '', phone: '', teacher_bio: '', email: '', new_password: '' })
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [showTeacherPwd, setShowTeacherPwd] = useState(false)
  const [showNewTeacherPwd, setShowNewTeacherPwd] = useState(false)
  const [savingTeacher, setSavingTeacher] = useState(false)
  const [modalBlockingTeacher, setModalBlockingTeacher] = useState(false)
  const [teacherToast, setTeacherToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; userId: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [teachersList, setTeachersList] = useState(teachers)

  useEffect(() => { setDataReady(true) }, [])

  function openTeacherEdit(teacher: Teacher) {
    setEditingTeacher(teacher)
    setTeacherForm({
      full_name: teacher.full_name || '',
      phone: teacher.phone || '',
      teacher_bio: teacher.teacher_bio || '',
      email: teacher.email || '',
      new_password: '',
    })
    setShowTeacherPwd(false)
    setShowNewTeacherPwd(false)
    setModalBlockingTeacher(false)
    setShowTeacherModal(true)
  }

  async function handleTeacherSave() {
    if (!editingTeacher) return
    if (!teacherForm.full_name.trim()) { setTeacherToast({ message: 'Ism kiritilmagan', type: 'error' }); setTimeout(() => setTeacherToast(null), 3000); return }
    if (teacherForm.new_password && teacherForm.new_password.length < 8) { setTeacherToast({ message: 'Parol kamida 8 ta belgi', type: 'error' }); setTimeout(() => setTeacherToast(null), 3000); return }
    setSavingTeacher(true)
    const result = await updateTeacherInfo({
      profile_id: editingTeacher.id,
      user_id: editingTeacher.user_id,
      full_name: teacherForm.full_name,
      phone: teacherForm.phone,
      teacher_bio: teacherForm.teacher_bio,
      email: teacherForm.email || undefined,
      new_password: teacherForm.new_password || undefined,
    })
    setSavingTeacher(false)
    if (result.success) {
      setShowTeacherModal(false)
      setTeacherToast({ message: 'Saqlandi ✅', type: 'success' })
    } else {
      setTeacherToast({ message: result.error || 'Xatolik', type: 'error' })
    }
    setTimeout(() => setTeacherToast(null), 3000)
  }

  async function handleModalTeacherBlock() {
    if (!editingTeacher) return
    setModalBlockingTeacher(true)
    await toggleBlockTeacher(editingTeacher.id, !editingTeacher.is_blocked)
    setEditingTeacher({ ...editingTeacher, is_blocked: !editingTeacher.is_blocked })
    setModalBlockingTeacher(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteTeacher(deleteTarget.id, deleteTarget.userId)
    setDeleteLoading(false)
    if (result.success) {
      setTeacherToast({ message: "O'qituvchi o'chirildi ✅", type: 'success' })
      setDeleteTarget(null)
      setTeachersList(prev => prev.filter(t => t.id !== deleteTarget.id))
    } else {
      setTeacherToast({ message: 'Xatolik: ' + result.error, type: 'error' })
    }
  }

  const filtered = teachersList.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddTeacher(e: React.FormEvent) {
    e.preventDefault()
    if (form.full_name.length < 2) { setFormError("Ism kamida 2 harf"); return }
    if (!form.email.includes('@')) { setFormError("Email noto'g'ri"); return }
    if (form.password.length < 6) { setFormError("Parol kamida 6 ta belgi"); return }
    setFormError('')
    setFormLoading(true)
    const result = await addTeacher({ ...form, school_id: schoolId })
    setFormLoading(false)
    if (result.success) {
      setShowAddModal(false)
      setForm({ full_name: '', email: '', password: '' })
    } else {
      setFormError(result.error || 'Xatolik yuz berdi')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">O&apos;qituvchilar</h1>
          <p className="text-sm text-gray-500 mt-1">
            <Users size={14} className="inline mr-1" />
            {teachers.length} ta o&apos;qituvchi
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus size={18} /> Yangi o&apos;qituvchi
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Ism yoki email bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">O&apos;qituvchi topilmadi</h3>
          <p className="text-sm text-gray-500 mt-1">Qidiruv shartlarini o&apos;zgartiring</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">O&apos;qituvchi</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Parol</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">To&apos;garaklar</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Holat</th>
                <th className="text-left py-4 px-5 text-xs font-semibold text-gray-400 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher) => {
                const initials = (teacher.full_name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <tr key={teacher.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{initials}</div>
                        <p className="text-sm font-semibold text-gray-900">{teacher.full_name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600 font-mono">{teacher.email || '—'}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm text-gray-600">
                          {showPasswords[teacher.id] ? (teacher.plain_password || '—') : '••••••••'}
                        </span>
                        <button onClick={() => setShowPasswords(p => ({ ...p, [teacher.id]: !p[teacher.id] }))}
                          className="text-gray-400 hover:text-gray-600 p-1">
                          {showPasswords[teacher.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {teacher.plain_password && (
                          <button onClick={() => handleCopy(teacher.plain_password!, teacher.id)}
                            className="text-gray-400 hover:text-indigo-600 p-1" title="Nusxalash">
                            <Copy size={14} />
                            {copiedId === teacher.id && <span className="text-xs text-emerald-500 ml-1">✓</span>}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {teacher.clubs?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.clubs.map(c => (
                            <span key={c.id} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{c.name}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${teacher.is_blocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${teacher.is_blocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                        {teacher.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openTeacherEdit(teacher)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                        >
                          ✏️ Tahrir
                        </button>
                        <button
                          onClick={() => setDeleteTarget({
                            id: teacher.id,
                            userId: teacher.user_id!,
                            name: teacher.full_name
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
          </div>
        </motion.div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:p-4 p-0" onClick={() => setShowAddModal(false)}>
          <div className="bg-white sm:rounded-2xl max-w-md w-full h-full sm:h-auto sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl overflow-y-auto absolute sm:relative inset-0" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">👨‍🏫 Yangi o&apos;qituvchi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {formError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{formError}</div>}
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;liq ism *</label>
                <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ism Familiya" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (login) *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="teacher@iqro.uz" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parol *</label>
                <input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Kamida 6 ta belgi" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
              </div>
              <button type="submit" disabled={formLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50">
                {formLoading ? '⏳ Yaratilmoqda...' : '✅ Yaratish'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Teacher Toast */}
      {teacherToast && (
        <div className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${teacherToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {teacherToast.message}
        </div>
      )}

      {/* Teacher Edit Modal */}
      {showTeacherModal && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 p-0" onClick={() => setShowTeacherModal(false)}>
          <div className="bg-white sm:rounded-2xl max-w-lg w-full shadow-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto absolute sm:relative inset-0 flex flex-col" onClick={e => e.stopPropagation()}>
            
            <div className="flex-1 pb-24 sm:pb-0">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {(editingTeacher.full_name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">✏️ {editingTeacher.full_name}</h3>
                <p className="text-xs text-gray-500">O&apos;qituvchi ma&apos;lumotlarini tahrirlash</p>
              </div>
              <button onClick={() => setShowTeacherModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Section 1: Personal */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">👤 SHAXSIY MA&apos;LUMOTLAR</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To&apos;liq ism *</label>
                    <input value={teacherForm.full_name} onChange={e => setTeacherForm(p => ({ ...p, full_name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📱 Telefon</label>
                    <input value={teacherForm.phone} onChange={e => setTeacherForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+998 90 123 45 67" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📝 Bio</label>
                    <textarea value={teacherForm.teacher_bio} onChange={e => setTeacherForm(p => ({ ...p, teacher_bio: e.target.value }))}
                      placeholder="O'qituvchi haqida qisqacha..." rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none" />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section 2: Login */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">🔐 LOGIN MA&apos;LUMOTLARI</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">📧 Email (Login)</label>
                    <input value={teacherForm.email} onChange={e => setTeacherForm(p => ({ ...p, email: e.target.value }))}
                      type="email" placeholder="teacher@iqro.uz"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🔑 Joriy parol</label>
                    <div className="relative">
                      <input value={showTeacherPwd ? (editingTeacher.plain_password || '—') : '••••••••'} readOnly
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-20 text-sm bg-gray-50 font-mono outline-none" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button onClick={() => setShowTeacherPwd(!showTeacherPwd)} className="p-1.5 text-gray-400 hover:text-gray-600">
                          {showTeacherPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {editingTeacher.plain_password && (
                          <button onClick={() => { navigator.clipboard.writeText(editingTeacher.plain_password!); setCopiedId('modal-teacher') }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600">
                            <Copy size={14} />
                            {copiedId === 'modal-teacher' && <span className="text-xs text-emerald-500">✓</span>}
                          </button>
                        )}
                      </div>
                    </div>
                    {!editingTeacher.plain_password && <p className="text-xs text-gray-400 mt-1">O&apos;qituvchi o&apos;zi ro&apos;yxatdan o&apos;tgan</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">🔒 Yangi parol (ixtiyoriy)</label>
                    <div className="relative">
                      <input type={showNewTeacherPwd ? 'text' : 'password'} value={teacherForm.new_password} onChange={e => setTeacherForm(p => ({ ...p, new_password: e.target.value }))}
                        placeholder="Kamida 8 belgi. Bo'sh qolsa o'zgarmaydi."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-indigo-400 pr-10" />
                      <button type="button" onClick={() => setShowNewTeacherPwd(!showNewTeacherPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNewTeacherPwd ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Section 3: Block */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">🚫 KIRISH HUQUQI</h4>
                <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${editingTeacher.is_blocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div>
                    <p className={`font-bold ${editingTeacher.is_blocked ? 'text-red-700' : 'text-green-700'}`}>
                      ● {editingTeacher.is_blocked ? 'Bloklangan' : 'Faol'}
                    </p>
                    <p className={`text-sm ${editingTeacher.is_blocked ? 'text-red-500' : 'text-green-600'}`}>
                      {editingTeacher.is_blocked ? 'Tizimga kira olmaydi' : 'Tizimga kirish mumkin'}
                    </p>
                  </div>
                  <button onClick={handleModalTeacherBlock} disabled={modalBlockingTeacher}
                    className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 ${editingTeacher.is_blocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                    {modalBlockingTeacher ? '⏳' : editingTeacher.is_blocked ? '✅ Faollashtirish' : '🚫 Bloklash'}
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 mt-auto sticky bottom-0 bg-white sm:relative">
              <button onClick={() => setShowTeacherModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Bekor qilish</button>
              <button onClick={handleTeacherSave} disabled={savingTeacher}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                {savingTeacher ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
