'use client'

import { motion } from 'framer-motion'
import {
    CartesianGrid,
    Cell, Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis,
} from 'recharts'

const monthlyData = [
  { name: 'Okt', users: 280 },
  { name: 'Noy', users: 295 },
  { name: 'Dek', users: 290 },
  { name: 'Yan', users: 310 },
  { name: 'Fev', users: 325 },
  { name: 'Mar', users: 340 },
]

const clubDistribution = [
  { name: 'Robototexnika', value: 24, color: '#6366f1' },
  { name: 'Rasm va Chizmachilik', value: 18, color: '#06b6d4' },
  { name: 'Ingliz tili', value: 28, color: '#10b981' },
  { name: 'Matematika Olimpiad...', value: 15, color: '#f59e0b' },
  { name: 'Musiqa', value: 22, color: '#ef4444' },
  { name: 'Sport va Fitnes', value: 35, color: '#8b5cf6' },
]

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Tizim Statistikasi</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Oylik foydalanuvchilar o&apos;sishi
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            To&apos;garaklar taqsimoti
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={clubDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
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
