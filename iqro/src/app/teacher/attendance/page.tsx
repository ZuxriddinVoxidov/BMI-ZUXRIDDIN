'use client'

import { saveAttendance } from '@/app/actions/attendance'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Check, CheckCircle, Clock, Star, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Club { id: string; name: string; schedule: string }
interface Student { id: string; full_name: string }
interface AttendanceRecord { student_id: string; status: string }
interface Reward { student_id: string }

export default function AttendancePage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<Student[]>([])
  const [statuses, setStatuses] = useState<Record<string, 'present' | 'absent' | 'excused'>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profileId, setProfileId] = useState('')
  const [rewards, setRewards] = useState<Reward[]>([])
  const [rewardLoading, setRewardLoading] = useState<string | null>(null)

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

  async function loadStudents() {
    if (!selectedClub) return
    const supabase = createClient()
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('student:profiles!student_id(id, full_name)')
      .eq('club_id', selectedClub)
      .eq('status', 'approved')

    const studentList = (enrollments || []).map((e: Record<string, unknown>) => e.student as unknown as Student).filter(Boolean)
    setStudents(studentList)

    // Load existing attendance
    const { data: existing } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('club_id', selectedClub)
      .eq('date', selectedDate)

    const statusMap: Record<string, 'present' | 'absent' | 'excused'> = {}
    studentList.forEach((s: Student) => { statusMap[s.id] = 'present' })
    ;(existing as AttendanceRecord[] || []).forEach((a) => {
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
    const records = students.map((s) => ({
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Davomat olish</h1>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To&apos;garak</label>
            <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option value="">Tanlang...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sana</label>
            <input type="date" value={selectedDate} onChange={e => {
              setSelectedDate(e.target.value)
              setStudents([]) // Clear students if date changes to avoid invalid saves
            }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            {!isAllowedToTakeAttendance && (
              <p className="text-xs text-red-500 font-medium mt-1.5 flex items-start gap-1">
                <X size={14} className="mt-0.5 shrink-0" />
                Dars faqat belgilangan kunlarda olinadi ({restrictionMessage}).
              </p>
            )}
          </div>
          <div className="flex items-end">
            <button onClick={loadStudents} disabled={!selectedClub || !isAllowedToTakeAttendance}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
              Davomatni yuklash
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      {students.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            O&apos;quvchilar ({students.length} ta)
          </h3>
          <div className="space-y-3">
            {students.map((student, i) => {
              const initials = student.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              const st = statuses[student.id] || 'present'
              return (
                <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">{initials}</div>
                    <span className="text-sm font-semibold text-gray-900">{student.full_name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setStatus(student.id, 'present')}
                      className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${st === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-emerald-50'}`}>
                      <Check size={14} /> Keldi
                    </button>
                    <button onClick={() => setStatus(student.id, 'absent')}
                      className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${st === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50'}`}>
                      <X size={14} /> Kelmadi
                    </button>
                    <button onClick={() => setStatus(student.id, 'excused')}
                      className={`flex-1 sm:flex-none min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${st === 'excused' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-amber-50'}`}>
                      <Clock size={14} /> Sababli
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
      {saved && presentStudents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">⭐ Rag&apos;bat berish (max 7 ta)</h3>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${rewards.length >= 7 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
              Berilgan: {rewards.length}/7
            </span>
          </div>
          {rewards.length >= 7 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium text-center">
              ⚠️ Limit tugadi (7/7)
            </div>
          )}
          <div className="space-y-3">
            {presentStudents.map((student) => {
              const initials = student.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              const alreadyRewarded = rewardedIds.has(student.id)
              return (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{initials}</div>
                    <span className="text-sm font-semibold text-gray-900">{student.full_name}</span>
                  </div>
                  {alreadyRewarded ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Berildi
                    </span>
                  ) : (
                    <button onClick={() => giveReward(student.id)}
                      disabled={rewards.length >= 7 || rewardLoading === student.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50 font-medium flex items-center gap-1 transition-colors">
                      {rewardLoading === student.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full" />
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
