'use client'

import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import {
    Bar, BarChart, CartesianGrid, Cell, Legend,
    Line, LineChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

interface Props {
  userGrowthData: { month: string; count: number }[]
  categoryData: { name: string; value: number; color?: string }[]
  attendanceChartData: { month: string; keldi: number; kelmadi: number; rate: number }[]
  totalStudents?: number
  totalTeachers?: number
  totalClubs?: number
  studentsCount?: number
  teachersCount?: number
  clubsCount?: number
}

export default function StatisticsClient(props: Props) {
  const totalStudents = props.totalStudents ?? props.studentsCount ?? 0
  const totalTeachers = props.totalTeachers ?? props.teachersCount ?? 0
  const totalClubs = props.totalClubs ?? props.clubsCount ?? 0
  const { userGrowthData, categoryData, attendanceChartData } = props
  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
  const kpiCards = [
    { label: "O'quvchilar", value: totalStudents, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: "O'qituvchilar", value: totalTeachers, icon: GraduationCap, color: 'bg-cyan-50 text-cyan-600' },
    { label: "To'garaklar", value: totalClubs, icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Tizim statistikasi</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.color}`}>
              <kpi.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart — User Growth */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Oylik foydalanuvchilar o&apos;sishi</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="Yangi foydalanuvchi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart — Club Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">To&apos;garaklar taqsimoti</h3>
          <div className="h-[300px]">
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Hali to&apos;garak yo&apos;q</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Attendance Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Oylik davomat</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
              <Legend />
              <Bar dataKey="keldi" fill="#10b981" radius={[6, 6, 0, 0]} name="Keldi" />
              <Bar dataKey="kelmadi" fill="#ef4444" radius={[6, 6, 0, 0]} name="Kelmadi" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
