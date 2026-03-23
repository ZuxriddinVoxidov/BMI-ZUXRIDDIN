'use client'

import DataLoader from '@/components/ui/DataLoader'
import { BarChart3, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  studentsCount: number; teachersCount: number; clubsCount: number
  pendingCount: number; attendanceRate: number
  monthlyData: { month: string; keldi: number; kelmadi: number }[]
  recentActivity: { created_at: string; status: string; student: { full_name: string } | null; club: { name: string } | null }[]
  schoolName: string
}

export default function DirectorDashboardClient(props: Props) {
  const [ready, setReady] = useState(false)
  useEffect(() => { setReady(true) }, [])

  const kpi = [
    { label: "O'quvchilar", value: props.studentsCount, icon: Users, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
    { label: "O'qituvchilar", value: props.teachersCount, icon: GraduationCap, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    { label: "To'garaklar", value: props.clubsCount, icon: BookOpen, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { label: "Davomat", value: `${props.attendanceRate}%`, icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  ]

  return (
    <DataLoader loading={!ready} minHeight="min-h-[500px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">📊 Maktab ko&apos;rsatkichlari</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{props.schoolName}</p>
        </div>

        {props.pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-amber-600 text-lg">⚠️</span>
            <p className="text-sm text-amber-700 font-medium">{props.pendingCount} ta ariza kutilmoqda</p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {kpi.map((k, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                  <k.icon size={18} className="text-white" />
                </div>
                <BarChart3 size={14} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{k.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 w-full">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 w-full overflow-x-auto no-scrollbar">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">📈 Oylik davomat</h3>
            <div className="min-w-[350px]">
              <ResponsiveContainer width="100%" height={250}>
              <BarChart data={props.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="keldi" fill="#6366F1" radius={[4, 4, 0, 0]} name="Keldi" />
                <Bar dataKey="kelmadi" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Kelmadi" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 w-full">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">🕐 So&apos;nggi faoliyat</h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {props.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Faoliyat yo&apos;q</p>
              ) : props.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === 'approved' ? 'bg-emerald-400' : a.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-gray-700 dark:text-gray-200"><span className="font-medium">{a.student?.full_name || '?'}</span> — {a.club?.name || '?'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(a.created_at).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DataLoader>
  )
}
