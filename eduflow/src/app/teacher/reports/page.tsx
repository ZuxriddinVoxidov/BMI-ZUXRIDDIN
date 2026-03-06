'use client'

import { motion } from 'framer-motion'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis,
} from 'recharts'

const weeklyData = [
  { name: 'Dush', attendance: 92 },
  { name: 'Sesh', attendance: 88 },
  { name: 'Chor', attendance: 95 },
  { name: 'Pay', attendance: 90 },
  { name: 'Jum', attendance: 87 },
]

const monthlyData = [
  { name: 'Okt', attendance: 85 },
  { name: 'Noy', attendance: 88 },
  { name: 'Dek', attendance: 82 },
  { name: 'Yan', attendance: 90 },
  { name: 'Fev', attendance: 92 },
  { name: 'Mar', attendance: 91 },
]

const studentPerformance = [
  { name: 'Alibek T.', value: 95 },
  { name: 'Malika Y.', value: 92 },
  { name: 'Sardor X.', value: 88 },
  { name: 'Nilufar R.', value: 85 },
  { name: 'Bobur M.', value: 78 },
]

export default function TeacherReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Hisobotlar</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Haftalik davomat</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Bar dataKey="attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Oylik trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Student Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">O&apos;quvchilar samaradorligi</h3>
        <div className="space-y-3">
          {studentPerformance.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-gray-600">{s.name}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-12 text-right">{s.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
