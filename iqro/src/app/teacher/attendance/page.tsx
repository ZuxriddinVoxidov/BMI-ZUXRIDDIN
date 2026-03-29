'use client'

import { saveAttendance } from '@/app/actions/attendance'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Check, CheckCircle, Clock, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Club { id: string; name: string; schedule: string }
interface Student { id: string; full_name: string; grade: string | null }
interface AttendanceRecord { student_id: string; status: string; full_name?: string; grade: string | null }
interface Reward { student_id: string }

export default function AttendancePage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [availableGrades, setAvailableGrades] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<Student[]>([])
  const [statuses, setStatuses] = useState<Record<string, 'present' | 'absent' | 'excused'>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileId, setProfileId] = useState('')
  const [rewards, setRewards] = useState<Reward[]>([])
  const [rewardLoading, setRewardLoading] = useState<string | null>(null)
  
  const [attendanceExists, setAttendanceExists] = useState(false)
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([])
  const [showHistoryDetails, setShowHistoryDetails] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('id').eq('user_id', user.id).single()
      if (!profile) return
      setProfileId(profile.id)
      const { data: myClubs } = await supabase
        .from('clubs').select('id, name, schedule').eq('teacher_id', profile.id)
      setClubs(myClubs || [])
      setLoading(false)
    }
    load()
  }, [])

  // Load available grades when club changes
  useEffect(() => {
    async function loadGrades() {
      setSelectedGrade('')
      setAvailableGrades([])
      setStudents([])
      setHistoryRecords([])
      setAttendanceExists(false)
      
      if (!selectedClub) return
      
      const supabase = createClient()
      const { data } = await supabase
        .from('enrollments')
        .select('student:profiles!student_id(grade)')
        .eq('club_id', selectedClub)
        .eq('status', 'approved')
        
      if (data) {
        const gradesSet = new Set<string>()
        data.forEach((row: any) => {
           const g = row.student?.grade
           if (g) gradesSet.add(g)
           else gradesSet.add("Boshqa")
        })
        const gradesArray = Array.from(gradesSet).sort()
        setAvailableGrades(gradesArray)
      }
    }
    loadGrades()
  }, [selectedClub])

  // 🔹 Fetch history immediately when club, grade and date change
  useEffect(() => {
    async function fetchHistory() {
      setShowHistoryDetails(false)
      setStudents([]) // Formani tozalaymiz
      
      if (!selectedClub || !selectedGrade || !selectedDate) {
        setHistoryRecords([])
        setAttendanceExists(false)
        return
      }
      
      const supabase = createClient()
      const { data } = await supabase
        .from('attendance')
        .select(`
          student_id,
          status,
          profiles:student_id (full_name, grade)
        `)
        .eq('club_id', selectedClub)
        .eq('date', selectedDate)

      const formattedHistory = (data || [])
        .map((row: any) => ({
          student_id: row.student_id,
          status: row.status,
          full_name: row.profiles?.full_name || "Noma'lum",
          grade: row.profiles?.grade || null
        }))
        .filter((r: { grade: string | null }) => (r.grade || 'Boshqa') === selectedGrade)

      setHistoryRecords(formattedHistory)
      setAttendanceExists(formattedHistory.length > 0)
    }

    fetchHistory()
  }, [selectedClub, selectedGrade, selectedDate])

  async function loadStudents() {
    if (!selectedClub || !selectedGrade) return
    const supabase = createClient()
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student:profiles!student_id(id, full_name, grade)')
      .eq('club_id', selectedClub)
      .eq('status', 'approved')

    const studentList = (enrollments || [])
      .map((e: any) => e.student as Student)
      .filter(Boolean)
      .filter((s: Student) => (s.grade || 'Boshqa') === selectedGrade)
      
    setStudents(studentList)

    const statusMap: Record<string, 'present' | 'absent' | 'excused'> = {}
    studentList.forEach((s: Student) => { statusMap[s.id] = 'present' })
    historyRecords.forEach((a) => {
      statusMap[a.student_id] = a.status as 'present' | 'absent' | 'excused'
    })
    setStatuses(statusMap)
    setSaved(false)

    // Load today's rewards
    const { data: existingRewards } = await supabase
      .from('teacher_rewards')
      .select('student_id')
      .eq('teacher_id', profileId)
      .eq('club_id', selectedClub)
      .eq('lesson_date', selectedDate)
    setRewards(existingRewards || [])
  }

  function setStatus(studentId: string, status: 'present' | 'absent' | 'excused') {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const records = students.map((s: Student) => ({
      club_id: selectedClub,
      student_id: s.id,
      date: selectedDate,
      status: statuses[s.id] || 'present',
    }))
    await saveAttendance(records)
    setSaving(false)
    setSaved(true)
  }

  async function giveReward(studentId: string) {
    setRewardLoading(studentId)
    const { giveReward: giveRewardAction } = await import('@/app/actions/rewards')
    const result = await giveRewardAction(studentId, selectedClub, selectedDate)
    
    if (result.success) {
      setRewards(prev => [...prev, { student_id: studentId }])
      alert("10 ball rag'bat berildi! ⭐")
    } else {
      alert(result.error || "Xatolik yuz berdi")
    }
    setRewardLoading(null)
  }

  const rewardedIds = new Set(rewards.map(r => r.student_id))
  const presentStudents = students.filter(s => statuses[s.id] === 'present')

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
    </div>
  }

  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl mb-4">🏫</span>
        <h3 className="text-lg font-bold text-gray-900">Sizga to&apos;garak biriktirilmagan</h3>
        <p className="text-sm text-gray-500 mt-1">Admin bilan bog&apos;laning</p>
      </div>
    )
  }

  const selectedClubData = clubs.find(c => c.id === selectedClub)
  let isAllowedToTakeAttendance = true
  let restrictionMessage = ''

  if (selectedClubData && selectedClubData.schedule) {
    const daysUz = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba']
    const dateObj = new Date(selectedDate)
    const dayNameUz = daysUz[dateObj.getDay()]
    if (!selectedClubData.schedule.toLowerCase().includes(dayNameUz)) {
      isAllowedToTakeAttendance = false
      restrictionMessage = `Bugun ${dayNameUz}. To'garak darslari: ${selectedClubData.schedule}`
    }
  }

  const isPastDate = selectedDate < todayStr
  const canEdit = !isPastDate && !attendanceExists

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden pb-4">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Davomat olish</h1>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">To&apos;garak</label>
              <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="">Tanlang...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sinf</label>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} disabled={!selectedClub || availableGrades.length === 0}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Tanlang...</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{g === 'Boshqa' ? "Sinfi aniqlanmaganlar" : `${g} sinf`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Sana</label>
            <input type="date" value={selectedDate} min={todayStr} onChange={e => {
              setSelectedDate(e.target.value)
              setStudents([]) // Clear students if date changes to avoid invalid saves
            }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            {!isAllowedToTakeAttendance && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1.5 flex items-start gap-1">
                <X size={14} className="mt-0.5 shrink-0" />
                Dars faqat belgilangan kunlarda olinadi ({restrictionMessage}).
              </p>
            )}
            {isPastDate && (
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-1.5 flex items-start gap-1">
                <Clock size={14} className="mt-0.5 shrink-0" />
                O&apos;tgan kunlar uchun davomat saqlash taqiqlangan!
              </p>
            )}
          </div>
          <div className="flex items-end">
            <button onClick={loadStudents} disabled={!selectedClub || !selectedGrade || !isAllowedToTakeAttendance || attendanceExists}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/50 dark:disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
              Davomatni yuklash
            </button>
          </div>
        </div>
      </div>

      {/* Davomat Olingan qatori (Single Row History Toggle) */}
      {attendanceExists && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-5 border border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Davomat olingan</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDate} sanasi uchun davomat olingan.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHistoryDetails(!showHistoryDetails)} 
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs transition duration-200">
              {showHistoryDetails ? 'Yopish' : "Ko'rish"}
            </button>
          </div>

          {showHistoryDetails && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
              <div className="space-y-6">
                {Object.entries(
                  historyRecords.reduce((acc, record) => {
                    const g = record.grade || 'Boshqa';
                    if (!acc[g]) acc[g] = [];
                    acc[g].push(record);
                    return acc;
                  }, {} as Record<string, AttendanceRecord[]>)
                ).sort(([a], [b]) => a.localeCompare(b)).map(([gradeStr, groupRecords]) => (
                  <div key={`hist-group-${gradeStr}`} className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-xl font-bold text-sm tracking-wide">
                        {gradeStr === 'Boshqa' ? "Sinfi ko'rsatilmagan" : `${gradeStr} sinf`} ({groupRecords.length})
                      </span>
                    </div>
                    {groupRecords.map((record) => {
                      const initials = (record.full_name || 'UU').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                      
                      let badge = null
                      if (record.status === 'present') badge = <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold"><Check size={14} /> Keldi</span>
                      if (record.status === 'absent') badge = <span className="flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold"><X size={14} /> Kelmadi</span>
                      if (record.status === 'excused') badge = <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold"><Clock size={14} /> Sababli</span>

                      return (
                        <div key={`hist-${record.student_id}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">{initials}</div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{record.full_name}</span>
                          </div>
                          <div>{badge}</div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Student List */}
      {students.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            O&apos;quvchilar ({students.length} ta)
          </h3>
          
          {attendanceExists && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle size={16} /> Bu kun uchun davomat allaqachon qilingan
            </p>
          )}

          <div className="space-y-8 mt-4">
            {Object.entries(
              students.reduce((acc, student) => {
                const g = student.grade || 'Boshqa';
                if (!acc[g]) acc[g] = [];
                acc[g].push(student);
                return acc;
              }, {} as Record<string, Student[]>)
            ).sort(([a], [b]) => a.localeCompare(b)).map(([gradeStr, groupStudents]) => (
              <div key={`group-${gradeStr}`} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-xl font-bold text-sm tracking-wide shadow-sm">
                    {gradeStr === 'Boshqa' ? "Sinfi ko'rsatilmagan" : `${gradeStr} sinf`} ({groupStudents.length})
                  </span>
                </div>
                {groupStudents.map((student, i) => {
                  const initials = student.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  const st = statuses[student.id] || 'present'
                  return (
                    <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-950 gap-3 border border-transparent dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">{initials}</div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.full_name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setStatus(student.id, 'present')} disabled={!canEdit}
                          className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:cursor-not-allowed ${st === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-50'}`}>
                          <Check size={14} /> Keldi
                        </button>
                        <button onClick={() => setStatus(student.id, 'absent')} disabled={!canEdit}
                          className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:cursor-not-allowed ${st === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50'}`}>
                          <X size={14} /> Kelmadi
                        </button>
                        <button onClick={() => setStatus(student.id, 'excused')} disabled={!canEdit}
                          className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:cursor-not-allowed ${st === 'excused' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-50'}`}>
                          <Clock size={14} /> Sababli
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </div>

          <button onClick={handleSave} disabled={saving || !canEdit}
            className={`w-full mt-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${canEdit ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400 dark:disabled:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
            {saving ? (
              <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : saved ? (
              <><CheckCircle size={18} /> Saqlandi!</>
            ) : (
              <><Check size={18} /> Davomatni saqlash</>
            )}
          </button>
        </motion.div>
      )}


      {/* Reward Section */}
      {saved && canEdit && presentStudents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">⭐ Rag&apos;bat berish (max 7 ta)</h3>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${rewards.length >= 7 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
              Berilgan: {rewards.length}/7
            </span>
          </div>
          {rewards.length >= 7 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium text-center border border-amber-200 dark:border-amber-500/20">
              ⚠️ Limit tugadi (7/7)
            </div>
          )}
          <div className="space-y-3">
            {presentStudents.map((student) => {
              const initials = student.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              const alreadyRewarded = rewardedIds.has(student.id)
              return (
                <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-transparent dark:border-gray-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">{initials}</div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{student.full_name}</span>
                  </div>
                  {alreadyRewarded ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 w-full sm:w-auto justify-center">
                      <CheckCircle size={14} /> Berildi
                    </span>
                  ) : (
                    <button onClick={() => giveReward(student.id)}
                      disabled={rewards.length >= 7 || rewardLoading === student.id}
                      className="w-full sm:w-auto text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-50 font-medium flex items-center justify-center gap-1 transition-colors border border-transparent dark:border-amber-500/20">
                      {rewardLoading === student.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-amber-300 border-t-amber-600 dark:border-amber-700 dark:border-t-amber-400 rounded-full" />
                      ) : (
                        <><Star size={14} /> Rag&apos;bat berish</>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
