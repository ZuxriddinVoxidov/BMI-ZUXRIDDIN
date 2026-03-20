'use client'

import { getStudentLevel } from '@/lib/levels'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderOpen, Download, Star, X } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rewardStudentWork } from '@/app/actions/rewards'

interface EnrollItem { student: Record<string, unknown>; club: Record<string, unknown> }
interface AttItem { student_id: string; status: string }

export default function TeacherStudents({ enrollments, attendanceData }: { enrollments: EnrollItem[]; attendanceData: AttItem[] }) {
  const [search, setSearch] = useState('')
  const [viewStudentWorks, setViewStudentWorks] = useState<{ id: string; name: string } | null>(null)
  const [works, setWorks] = useState<any[]>([])
  const [worksLoading, setWorksLoading] = useState(false)
  const [rewardLoading, setRewardLoading] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorks() {
      if (!viewStudentWorks) {
        setWorks([])
        return
      }
      setWorksLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('student_works')
        .select('*, club:clubs(name)')
        .eq('student_id', viewStudentWorks.id)
        .order('created_at', { ascending: false })
      setWorks(data || [])
      setWorksLoading(false)
    }
    loadWorks()
  }, [viewStudentWorks])

  async function handleReward(workId: string, studentId: string) {
    setRewardLoading(workId)
    const res = await rewardStudentWork(workId, studentId)
    if (res.success) {
      alert("5 ball rag'bat berildi! ⭐")
      setWorks(works.map(w => w.id === workId ? { ...w, is_rewarded: true } : w))
    } else {
      alert(res.error || "Xatolik yuz berdi")
    }
    setRewardLoading(null)
  }

  const students = useMemo(() => {
    const map: Record<string, { name: string; club: string; points: number; present: number; total: number }> = {}
    enrollments.forEach((e) => {
      const sid = e.student?.id as string
      const pts = (e.student?.student_points as any)?.total_points as number || 0
      if (sid) {
        map[sid] = { name: e.student?.full_name as string, club: e.club?.name as string, points: pts, present: 0, total: 0 }
      }
    })
    attendanceData.forEach((a) => {
      if (map[a.student_id]) {
        map[a.student_id].total++
        if (a.status === 'present') map[a.student_id].present++
      }
    })
    return Object.entries(map).map(([id, s]) => ({ id, ...s }))
  }, [enrollments, attendanceData])

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden pb-4">
      <h1 className="text-2xl font-extrabold text-gray-900">O&apos;quvchilar</h1>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Ism bo'yicha qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-3">👨‍🎓</span>
          <h3 className="text-lg font-bold text-gray-900">O&apos;quvchi topilmadi</h3>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar pb-2">
            <table className="w-full min-w-[700px]">
              <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchi</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Daraja</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Davomat</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-400 uppercase">Amal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const level = getStudentLevel(s.points)
                const initials = (s.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
                return (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{initials}</div>
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{s.club}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        {level.emoji} {level.name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setViewStudentWorks({ id: s.id, name: s.name })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition whitespace-nowrap"
                      >
                        <FolderOpen size={14} /> Ishlarini ko&apos;rish
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </motion.div>
      )}

      {/* View Works Modal */}
      <AnimatePresence>
        {viewStudentWorks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900">{viewStudentWorks.name}ning ishlari</h3>
                <button onClick={() => setViewStudentWorks(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>

              <div className="overflow-y-auto flex-1 pr-2">
                {worksLoading ? (
                   <div className="py-10 text-center text-gray-400">Yuklanmoqda...</div>
                ) : works.length > 0 ? (
                  <div className="space-y-3">
                    {works.map((w) => {
                      const clubName = (w.club as any)?.name || ''
                      const date = new Date(w.created_at).toLocaleDateString('uz-UZ')
                      return (
                        <div key={w.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-indigo-500"><FolderOpen size={20} /></div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{w.title}</h4>
                              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                {clubName && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{clubName}</span>}
                                <span>{date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={w.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:bg-gray-200 bg-gray-100 rounded-lg transition" title="Yuklab olish">
                              <Download size={16} />
                            </a>
                            {w.is_rewarded ? (
                              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg flex items-center gap-1">
                                <Star size={14} className="fill-emerald-600" /> Baholangan
                              </span>
                            ) : (
                              <button 
                                disabled={rewardLoading === w.id}
                                onClick={() => handleReward(w.id, w.student_id)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-sm disabled:opacity-50">
                                {rewardLoading === w.id ? 'Kuting...' : <><Star size={14} /> 5 ball berish</>}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                   <div className="py-10 text-center text-gray-400">Hali ishlar yuklanmagan</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
