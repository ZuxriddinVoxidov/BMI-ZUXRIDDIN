'use client'

const dayMap: Record<string, number> = {
  'dush': 0, 'dushanba': 0,
  'sesh': 1, 'seshanba': 1,
  'chor': 2, 'chorshanba': 2,
  'pay': 3, 'payshanba': 3,
  'jum': 4, 'juma': 4,
}

const dayNames = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma']

const categoryBorders: Record<string, string> = {
  texnologiya: 'border-t-blue-500 bg-blue-50/50',
  sport: 'border-t-rose-500 bg-rose-50/50',
  "san'at": 'border-t-purple-500 bg-purple-50/50',
  fan: 'border-t-emerald-500 bg-emerald-50/50',
  til: 'border-t-amber-500 bg-amber-50/50',
}

function getWeekDates(): string[] {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}

function parseSchedule(schedule: string): { days: number[]; time: string } {
  const parts = schedule.toLowerCase().split(/\s+/)
  const days: number[] = []
  let time = ''

  for (const part of parts) {
    const clean = part.replace(/[,;]/g, '').trim()
    if (dayMap[clean] !== undefined) {
      days.push(dayMap[clean])
    } else if (/\d{1,2}[:.]\d{2}/.test(clean)) {
      time = clean
    }
  }

  return { days, time }
}

interface WeeklyScheduleProps {
  enrollments: Record<string, unknown>[]
}

export default function WeeklySchedule({ enrollments }: WeeklyScheduleProps) {
  const weekDates = getWeekDates()
  const today = new Date().getDay()
  const todayIndex = today === 0 ? -1 : today - 1

  // Parse clubs into day slots
  const daySlots: Record<number, { name: string; time: string; room: string; teacher: string; category: string }[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [],
  }

  for (const e of enrollments) {
    const club = e.club as Record<string, unknown> | null
    if (!club || !club.schedule) continue
    const teacher = club.teacher as Record<string, unknown> | null
    const { days, time } = parseSchedule(club.schedule as string)

    for (const day of days) {
      if (day >= 0 && day <= 4) {
        daySlots[day].push({
          name: club.name as string,
          time,
          room: (club.room as string) || '',
          teacher: (teacher?.full_name as string) || '',
          category: ((club.category as string) || '').toLowerCase(),
        })
      }
    }
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {dayNames.map((day, i) => (
        <div key={day} className={`rounded-2xl overflow-hidden border ${todayIndex === i ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100 bg-white'}`}>
          {/* Day header */}
          <div className={`px-4 py-3 text-center ${todayIndex === i ? 'bg-indigo-100' : 'bg-gray-50'}`}>
            <p className={`font-bold text-sm ${todayIndex === i ? 'text-indigo-700' : 'text-gray-700'}`}>{day}</p>
            <p className="text-xs text-gray-400">{weekDates[i]}</p>
          </div>

          {/* Slots */}
          <div className="p-3 space-y-3 min-h-[200px]">
            {daySlots[i].length > 0 ? (
              daySlots[i].map((slot, j) => (
                <div
                  key={j}
                  className={`rounded-xl border-t-4 p-3 ${categoryBorders[slot.category] || 'border-t-gray-400 bg-gray-50/50'}`}
                >
                  <p className="font-semibold text-sm text-gray-900">{slot.name}</p>
                  {slot.time && <p className="text-xs text-gray-500 mt-1">🕐 {slot.time}</p>}
                  {slot.room && <p className="text-xs text-gray-500">📍 {slot.room}</p>}
                  {slot.teacher && <p className="text-xs text-gray-400 mt-1">{slot.teacher}</p>}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-300">Bo&apos;sh</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
