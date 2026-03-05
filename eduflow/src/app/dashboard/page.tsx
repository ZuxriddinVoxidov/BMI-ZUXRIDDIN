'use client'

import { motion } from 'framer-motion'
import { CircleDot, FileText, GraduationCap, TrendingUp, Users } from 'lucide-react'
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const stats = [
  { label: "Jami O'quvchilar", value: '340', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: "Jami O'qituvchilar", value: '18', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-600' },
  { label: "Faol To'garaklar", value: '12', icon: CircleDot, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Kutilayotgan Arizalar', value: '3', icon: FileText, color: 'bg-amber-50 text-amber-600' },
  { label: 'Bugungi Davomat', value: '87%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
]

const monthlyData = [
  { name: 'Okt', students: 280 },
  { name: 'Noy', students: 295 },
  { name: 'Dek', students: 290 },
  { name: 'Yan', students: 310 },
  { name: 'Fev', students: 325 },
  { name: 'Mar', students: 340 },
]

const clubDistribution = [
  { name: 'Sport', value: 25, color: '#6366f1' },
  { name: 'Ingliz', value: 20, color: '#10b981' },
  { name: 'Roboto', value: 17, color: '#3b82f6' },
  { name: 'Musiqa', value: 15, color: '#f59e0b' },
  { name: 'Matema', value: 11, color: '#ef4444' },
  { name: 'Rasm', value: 12, color: '#8b5cf6' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 rounded-2xl p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
          Admin Panel 🏠
        </h1>
        <p className="text-white/70">Tizimni boshqaring va nazorat qiling</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div
              className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}
            >
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Oylik o&apos;sish
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            To&apos;garaklar taqsimoti
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clubDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {clubDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
