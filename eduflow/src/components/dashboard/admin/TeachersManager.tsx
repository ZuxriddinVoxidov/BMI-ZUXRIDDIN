'use client'

import { motion } from 'framer-motion'
import { Search, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'

interface Teacher {
  id: string
  full_name: string
  email?: string
  phone?: string
  is_blocked?: boolean
  created_at: string
  clubs: { id: string; name: string }[]
}

export default function TeachersManager({ teachers }: { teachers: Teacher[] }) {
  const [search, setSearch] = useState('')

  const filtered = teachers.filter(
    (t) =>
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            O&apos;qituvchilar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <Users size={14} className="inline mr-1" />
            {teachers.length} ta o&apos;qituvchi
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
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
          <h3 className="text-lg font-bold text-gray-900">
            O&apos;qituvchi topilmadi
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Qidiruv shartlarini o&apos;zgartiring
          </p>
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
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                  O&apos;qituvchi
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                  To&apos;garaklar
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">
                  Holat
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((teacher, i) => {
                const initials = (teacher.full_name || '?')
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {teacher.full_name}
                          </p>
                          {teacher.phone && (
                            <p className="text-xs text-gray-400">{teacher.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {teacher.email || '-'}
                    </td>
                    <td className="py-4 px-6">
                      {teacher.clubs && teacher.clubs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.clubs.map((club) => (
                            <span
                              key={club.id}
                              className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600"
                            >
                              {club.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          teacher.is_blocked
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            teacher.is_blocked ? 'bg-red-400' : 'bg-emerald-400'
                          }`}
                        />
                        {teacher.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
