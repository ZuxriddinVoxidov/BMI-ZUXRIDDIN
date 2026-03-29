'use client'

import { getStudentLevel } from '@/lib/levels'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, FolderOpen, Download, Star, X,
  ChevronDown, ChevronUp, Users, BookOpen, RotateCcw,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { rewardStudentWork } from '@/app/actions/rewards'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Club { id: string; name: string }
export interface EnrollmentItem {
  club_id: string
  student: {
    id: string
    full_name: string
    grade: string | null
    student_points: { total_points: number }[] | null
  }
}
interface AttItem { student_id: string; status: string }
interface StudentRow {
  id: string
  name: string
  grade: string
  clubId: string
  clubName: string
  points: number
  present: number
  total: number
}
interface Work {
  id: string
  title: string
  file_url: string
  created_at: string
  student_id: string
  is_rewarded: boolean
  club: { name: string } | null
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherStudents({
  clubs,
  enrollments,
  attendanceData,
}: {
  clubs: Club[]
  enrollments: EnrollmentItem[]
  attendanceData: AttItem[]
}) {
  const [search, setSearch] = useState('')
  const [filterClub, setFilterClub] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set())
  const [viewStudentWorks, setViewStudentWorks] = useState<{ id: string; name: string } | null>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [worksLoading, setWorksLoading] = useState(false)
  const [rewardLoading, setRewardLoading] = useState<string | null>(null)

  // Load works when modal opens
  useEffect(() => {
    async function loadWorks() {
      if (!viewStudentWorks) { setWorks([]); return }
      setWorksLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('student_works')
        .select('*, club:clubs(name)')
        .eq('student_id', viewStudentWorks.id)
        .order('created_at', { ascending: false })
      setWorks((data || []) as Work[])
      setWorksLoading(false)
    }
    loadWorks()
  }, [viewStudentWorks])

  async function handleReward(workId: string, studentId: string) {
    setRewardLoading(workId)
    const res = await rewardStudentWork(workId, studentId)
    if (res.success) {
      alert("5 ball rag'bat berildi! ⭐")
      setWorks(prev => prev.map(w => w.id === workId ? { ...w, is_rewarded: true } : w))
    } else {
      alert(res.error || 'Xatolik yuz berdi')
    }
    setRewardLoading(null)
  }

  // Build flat student list with attendance
  const students = useMemo((): StudentRow[] => {
    const map: Record<string, StudentRow> = {}
    enrollments.forEach(e => {
      const s = e.student
      if (!s?.id) return
      const club = clubs.find(c => c.id === e.club_id)
      if (!map[s.id]) {
        map[s.id] = {
          id: s.id,
          name: s.full_name || '—',
          grade: s.grade || '—',
          clubId: e.club_id,
          clubName: club?.name || '—',
          points: Array.isArray(s.student_points)
            ? (s.student_points[0]?.total_points ?? 0)
            : ((s.student_points as { total_points: number } | null)?.total_points ?? 0),
          present: 0,
          total: 0,
        }
      }
    })
    attendanceData.forEach(a => {
      if (map[a.student_id]) {
        map[a.student_id].total++
        if (a.status === 'present') map[a.student_id].present++
      }
    })
    return Object.values(map)
  }, [enrollments, attendanceData, clubs])

  // Unique grades across all students
  const allGrades = useMemo(() => {
    const grades = new Set(students.map(s => s.grade).filter(g => g !== '—'))
    return Array.from(grades).sort()
  }, [students])

  // Filtered list
  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
      const matchClub = filterClub === 'all' || s.clubId === filterClub
      const matchGrade = filterGrade === 'all' || s.grade === filterGrade
      return matchSearch && matchClub && matchGrade
    })
  }, [students, search, filterClub, filterGrade])

  const hasFilters = search !== '' || filterClub !== 'all' || filterGrade !== 'all'

  // Group: club → grade → students
  const grouped = useMemo(() => {
    const clubMap: Record<string, { club: Club; byGrade: Record<string, StudentRow[]> }> = {}

    // Preserve club order from DB
    clubs.forEach(club => {
      clubMap[club.id] = { club, byGrade: {} }
    })

    filtered.forEach(s => {
      if (!clubMap[s.clubId]) {
        clubMap[s.clubId] = { club: { id: s.clubId, name: s.clubName }, byGrade: {} }
      }
      const gradeKey = s.grade
      if (!clubMap[s.clubId].byGrade[gradeKey]) {
        clubMap[s.clubId].byGrade[gradeKey] = []
      }
      clubMap[s.clubId].byGrade[gradeKey].push(s)
    })

    return Object.values(clubMap).filter(item =>
      Object.keys(item.byGrade).length > 0
    )
  }, [filtered, clubs])

  function toggleGrade(key: string) {
    setCollapsedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function resetFilters() {
    setSearch('')
    setFilterClub('all')
    setFilterGrade('all')
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden pb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={26} className="text-indigo-500" />
          O&apos;quvchilar
          <span className="text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 px-2.5 py-0.5 rounded-full">
            {filtered.length} ta
          </span>
        </h1>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ism bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Club filter */}
        <select
          value={filterClub}
          onChange={e => setFilterClub(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-[16px] sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 min-w-[160px]"
        >
          <option value="all">Barcha to&apos;garaklar</option>
          {clubs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Grade filter */}
        <select
          value={filterGrade}
          onChange={e => setFilterGrade(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-[16px] sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 min-w-[140px]"
        >
          <option value="all">Barcha sinflar</option>
          {allGrades.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} /> Tozalash
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {grouped.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <span className="text-5xl mb-4">👨‍🎓</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">O&apos;quvchi topilmadi</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Filtrlarni o&apos;zgartiring yoki tozalang</p>
          {hasFilters && (
            <button onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              Filtrlarni tozalash
            </button>
          )}
        </motion.div>
      )}

      {/* ── Grouped list ── */}
      <div className="space-y-6">
        {grouped.map(({ club, byGrade }) => {
          const totalInClub = Object.values(byGrade).flat().length
          const sortedGrades = Object.keys(byGrade).sort()

          return (
            <motion.div key={club.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

              {/* Club header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50">
                <BookOpen size={20} className="text-indigo-500 shrink-0" />
                <h2 className="text-lg font-extrabold text-indigo-800 dark:text-indigo-300 flex-1">{club.name}</h2>
                <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
                  {totalInClub} o&apos;quvchi
                </span>
              </div>

              {/* Grades */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedGrades.map(grade => {
                  const gradeStudents = byGrade[grade]
                  const collapseKey = `${club.id}__${grade}`
                  const isCollapsed = collapsedKeys.has(collapseKey)

                  return (
                    <div key={grade}>
                      {/* Grade sub-header */}
                      <button
                        onClick={() => toggleGrade(collapseKey)}
                        className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-black">
                            {grade} sinf
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                            {gradeStudents.length} o&apos;quvchi
                          </span>
                        </span>
                        <span className="ml-auto text-gray-400 dark:text-gray-500">
                          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </span>
                      </button>

                      {/* Students in this grade */}
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            {/* Desktop table */}
                            <div className="hidden sm:block overflow-x-auto">
                              <table className="w-full min-w-[600px]">
                                <thead>
                                  <tr className="border-b border-gray-100 dark:border-gray-800">
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">O&apos;quvchi</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Daraja</th>
                                    <th className="text-left py-2.5 px-5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Davomat</th>
                                    <th className="text-right py-2.5 px-5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Amal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gradeStudents.map((s, idx) => (
                                    <StudentTableRow
                                      key={s.id}
                                      student={s}
                                      idx={idx}
                                      onViewWorks={() => setViewStudentWorks({ id: s.id, name: s.name })}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
                              {gradeStudents.map(s => (
                                <StudentMobileCard
                                  key={s.id}
                                  student={s}
                                  onViewWorks={() => setViewStudentWorks({ id: s.id, name: s.name })}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ──  Works Modal ── */}
      <AnimatePresence>
        {viewStudentWorks && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  {viewStudentWorks.name}ning ishlari
                </h3>
                <button
                  onClick={() => setViewStudentWorks(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1">
                {worksLoading ? (
                  <div className="py-10 text-center text-gray-400">Yuklanmoqda...</div>
                ) : works.length > 0 ? (
                  <div className="space-y-3">
                    {works.map(w => {
                      const date = new Date(w.created_at).toLocaleDateString('uz-UZ')
                      return (
                        <div key={w.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 text-indigo-500 shrink-0"><FolderOpen size={20} /></div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{w.title}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {w.club?.name && (
                                  <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">{w.club.name}</span>
                                )}
                                <span>{date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <a
                              href={w.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg transition"
                              title="Yuklab olish"
                            >
                              <Download size={16} />
                            </a>
                            {w.is_rewarded ? (
                              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                                <Star size={14} className="fill-emerald-600 dark:fill-emerald-400" /> Baholangan
                              </span>
                            ) : (
                              <button
                                disabled={rewardLoading === w.id}
                                onClick={() => handleReward(w.id, w.student_id)}
                                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                              >
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

// ─── Student Table Row (desktop) ──────────────────────────────────────────────
function StudentTableRow({
  student, idx, onViewWorks,
}: {
  student: StudentRow
  idx: number
  onViewWorks: () => void
}) {
  const level = getStudentLevel(student.points)
  const initials = student.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const pct = student.total > 0 ? Math.round((student.present / student.total) * 100) : 0

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.02 }}
      className="border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
    >
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{student.name}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold">
          {level.emoji} {level.name}
        </span>
      </td>
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{pct}%</span>
        </div>
      </td>
      <td className="py-3.5 px-5 text-right">
        <button
          onClick={onViewWorks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <FolderOpen size={13} /> Ishlarini ko&apos;rish
        </button>
      </td>
    </motion.tr>
  )
}

// ─── Student Mobile Card ──────────────────────────────────────────────────────
function StudentMobileCard({
  student, onViewWorks,
}: {
  student: StudentRow
  onViewWorks: () => void
}) {
  const level = getStudentLevel(student.points)
  const initials = student.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const pct = student.total > 0 ? Math.round((student.present / student.total) * 100) : 0

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold">
            {level.emoji} {level.name}
          </span>
          <span className={`text-[10px] font-bold ${pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            {pct}% davomat
          </span>
        </div>
      </div>
      <button
        onClick={onViewWorks}
        className="p-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors shrink-0"
        title="Ishlarini ko'rish"
      >
        <FolderOpen size={16} />
      </button>
    </div>
  )
}
