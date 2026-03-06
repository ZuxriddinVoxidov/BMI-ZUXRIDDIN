'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

type ApplicationStatus = 'all' | 'pending' | 'approved' | 'rejected'

const tabs: { id: ApplicationStatus; label: string; count: number; color?: string }[] = [
  { id: 'all', label: 'Hammasi', count: 6 },
  { id: 'pending', label: 'Kutilmoqda', count: 3, color: 'text-amber-500' },
  { id: 'approved', label: 'Tasdiqlangan', count: 2, color: 'text-emerald-500' },
  { id: 'rejected', label: 'Rad etilgan', count: 1, color: 'text-red-500' },
]

const applications = [
  { id: 1, student: 'Alibek Toshmatov', club: 'Robototexnika', date: '2026-02-28', status: 'pending' as const },
  { id: 2, student: 'Zulfiya Karimova', club: 'Musiqa', date: '2026-02-27', status: 'pending' as const },
  { id: 3, student: 'Jasur Umarov', club: 'Rasm va Chizmachilik', date: '2026-02-26', status: 'approved' as const },
  { id: 4, student: 'Shahlo Nazarova', club: 'Matematika Olimpiadasi', date: '2026-02-25', status: 'approved' as const },
  { id: 5, student: 'Bobur Mirzayev', club: 'Sport va Fitnes', date: '2026-02-24', status: 'rejected' as const },
  { id: 6, student: 'Malika Yusupova', club: 'Robototexnika', date: '2026-03-01', status: 'pending' as const },
]

const statusConfig = {
  pending: { label: 'Kutilmoqda', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  approved: { label: 'Tasdiqlangan', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  rejected: { label: 'Rad etilgan', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('all')

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Arizalar</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-200 text-gray-500'
              } ${tab.color && activeTab !== tab.id ? tab.color : ''}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Sana</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Holat</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app, i) => {
              const cfg = statusConfig[app.status]
              return (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="py-4 px-6 text-sm text-gray-400">{app.id}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">{app.student}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{app.club}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{app.date}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <Check size={14} /> Tasdiqlash
                        </button>
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <X size={14} /> Rad etish
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
