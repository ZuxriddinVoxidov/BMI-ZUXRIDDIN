'use client'

import { approveApplication, rejectApplication } from '@/app/actions/applications'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

interface Enrollment {
  id: string
  status: string
  created_at: string
  student: { id: string; full_name: string } | null
  club: {
    id: string
    name: string
    category: string
    teacher?: { full_name: string } | null
  } | null
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Kutilmoqda', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  approved: { label: 'Tasdiqlangan', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  rejected: { label: 'Rad etilgan', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
}

export default function ApplicationsManager({
  pending,
  processed,
}: {
  pending: Enrollment[]
  processed: Enrollment[]
}) {
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleApprove(enrollment: Enrollment) {
    setLoadingId(enrollment.id)
    await approveApplication(
      enrollment.id,
      enrollment.student?.id || '',
      enrollment.club?.name || ''
    )
    setLoadingId(null)
  }

  async function handleReject(enrollment: Enrollment) {
    setLoadingId(enrollment.id)
    await rejectApplication(
      enrollment.id,
      enrollment.student?.id || '',
      enrollment.club?.name || ''
    )
    setLoadingId(null)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Arizalar</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Kutilmoqda
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'
          }`}>
            {pending.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('processed')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'processed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Qayta ishlangan
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'processed' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
          }`}>
            {processed.length}
          </span>
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Hozircha yangi ariza yo&apos;q</h3>
              <p className="text-sm text-gray-500 mt-1">Yangi arizalar kelganda bu yerda ko&apos;rinadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((app, i) => (
                <motion.div key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {(app.student?.full_name || '?')
                        .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {app.student?.full_name || "Noma'lum"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-500">
                          {app.club?.name || "To'garak"}
                        </span>
                        {app.club?.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {app.club.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(app.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app)}
                      disabled={loadingId === app.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <Check size={16} /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleReject(app)}
                      disabled={loadingId === app.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <X size={16} /> Rad etish
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Processed Tab */}
      {activeTab === 'processed' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {processed.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Hali qayta ishlangan ariza yo&apos;q
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                    O&apos;quvchi
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                    To&apos;garak
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                    Sana
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                    Holat
                  </th>
                </tr>
              </thead>
              <tbody>
                {processed.map((app) => {
                  const cfg = statusConfig[app.status] || statusConfig.pending
                  return (
                    <tr key={app.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                        {app.student?.full_name || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {app.club?.name || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </div>
  )
}
