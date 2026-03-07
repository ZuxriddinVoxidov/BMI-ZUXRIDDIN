'use client'

import { getStudentLevel } from '@/lib/levels'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronDown, MapPin, Users } from 'lucide-react'
import { useState } from 'react'

export default function TeacherClubs({ clubs }: { clubs: Record<string, unknown>[] }) {
  const [openClub, setOpenClub] = useState<string | null>(null)

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">🏫</span>
        <h3 className="text-lg font-bold text-gray-900">Sizga to&apos;garak biriktirilmagan</h3>
        <p className="text-sm text-gray-500 mt-1">Admin bilan bog&apos;laning</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Mening To&apos;garaklarim</h1>

      <div className="space-y-4">
        {clubs.map((club) => {
          const enrollments = (club.enrollments as Record<string, unknown>[]) || []
          const approvedStudents = enrollments.filter(e => e.status === 'approved')
          const isOpen = openClub === (club.id as string)

          return (
            <motion.div key={club.id as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenClub(isOpen ? null : club.id as string)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">📚</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{club.name as string}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} />{(club.schedule as string) || '-'}</span>
                      {Boolean(club.room) && <span className="flex items-center gap-1"><MapPin size={12} />{String(club.room)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium flex items-center gap-1">
                    <Users size={14} /> {approvedStudents.length} o&apos;quvchi
                  </span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      {approvedStudents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Hali o&apos;quvchi yo&apos;q</p>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="text-left">
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">O&apos;quvchi</th>
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">Daraja</th>
                              <th className="text-xs font-semibold text-gray-400 uppercase pb-3">A&apos;zo bo&apos;lgan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvedStudents.map((e) => {
                              const student = e.student as Record<string, unknown>
                              const points = (student?.student_points as Record<string, unknown>[])?.[0]
                              const totalPts = (points?.total_points as number) || 0
                              const level = getStudentLevel(totalPts)
                              const initials = ((student?.full_name as string) || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                              const date = new Date(e.created_at as string)
                              const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

                              return (
                                <tr key={e.id as string} className="border-t border-gray-50">
                                  <td className="py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{initials}</div>
                                      <span className="text-sm font-medium text-gray-900">{student?.full_name as string}</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                                      {level.emoji} {level.name}
                                    </span>
                                  </td>
                                  <td className="py-3 text-sm text-gray-500">{dateStr}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
