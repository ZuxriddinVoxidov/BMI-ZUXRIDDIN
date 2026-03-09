'use client'

import { updateStudentInfo } from '@/app/actions/admin-students'
import { getStudentLevel } from '@/lib/levels'
import { motion } from 'framer-motion'
import { Edit3, Search, Users, X } from 'lucide-react'
import { useState } from 'react'

interface Student {
  id: string
  full_name: string
  email?: string
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
  const [formData, setFormData] = useState({ full_name: '', parent_name: '', parent_telegram_id: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            <span className="text-4xl">👨‍🎓</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">O&apos;quvchi topilmadi</h3>
          <p className="text-sm text-gray-500 mt-1">Qidiruv shartlarini o&apos;zgartiring</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Daraja</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Ball</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garaklar</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Telegram</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const points = student.student_points?.[0]?.total_points || 0
                const level = getStudentLevel(points)
                const enrollCount = student.enrollments?.[0]?.count || 0
                const initials = (student.full_name || '?')
                  .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

                return (
                  <motion.tr key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{student.full_name}</p>
                          <p className="text-xs text-gray-400">{student.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: level.bgColor, color: level.textColor }}>
                        {level.emoji} {level.nameUz}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{points}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{enrollCount} ta</td>
                    <td className="py-4 px-6 text-center">
                      {student.parent_telegram_id ? (
                        <span title="Telegram ulangan" className="text-emerald-500">✅</span>
                      ) : (
                        <span title="Telegram ulanmagan" className="text-amber-400">⚠️</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.is_blocked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.is_blocked ? 'bg-red-400' : 'bg-emerald-400'
                        }`} />
                        {student.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openEdit(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      >
                        <Edit3 size={12} />
                        Tahrir
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Edit Dialog */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                ✏️ {editStudent.full_name}
              </h2>
              <button onClick={() => setEditStudent(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">To&apos;liq ism</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ota-ona ismi</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="Masalan: Karimov Sardor"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ota-ona Telegram Chat ID</label>
                <input
                  type="text"
                  value={formData.parent_telegram_id}
                  onChange={(e) => setFormData({ ...formData, parent_telegram_id: e.target.value })}
                  placeholder="Masalan: 123456789"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Telegram ID olish uchun: <span className="font-semibold text-indigo-500">@EduFlow_notify_bot</span> ga <code className="bg-gray-100 px-1 rounded">/start</code> yuboring
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
