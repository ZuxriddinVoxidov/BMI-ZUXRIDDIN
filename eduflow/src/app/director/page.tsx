'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertTriangle, BarChart3, Building2, Download, GraduationCap, Star, TrendingDown, TrendingUp, Users } from 'lucide-react'
import {
    Bar,
    BarChart,
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

const stats = [
  { label: 'Jami To\'garaklar', value: '12', icon: Building2, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Jami O\'quvchilar', value: '340', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'O\'qituvchilar', value: '18', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'O\'rtacha Davomat', value: '87%', icon: BarChart3, color: 'bg-orange-50 text-orange-600' },
  { label: 'A\'lo O\'quvchilar', value: '45', icon: Star, color: 'bg-amber-50 text-amber-600' },
  { label: 'Muammoli O\'quvchilar', value: '12', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
]

const monthlyAttendance = [
  { name: 'Okt', value: 79 }, { name: 'Noy', value: 78 },
  { name: 'Dek', value: 84 }, { name: 'Yan', value: 86 },
  { name: 'Fev', value: 88 }, { name: 'Mar', value: 81 },
]

const clubDistribution = [
  { name: 'Robototexnika', value: 24, color: '#6366f1' },
  { name: 'Rasm va Chizmachilik', value: 18, color: '#06b6d4' },
  { name: 'Ingliz tili', value: 28, color: '#10b981' },
  { name: 'Matematika Olimpiadasi', value: 15, color: '#f59e0b' },
]

const teacherPerformance = [
  { name: 'Sardor X.', value: 92 },
  { name: 'Nilufar R.', value: 95 },
  { name: 'Malika Y.', value: 88 },
  { name: 'Bobur M.', value: 90 },
]

const topClubs = [
  { rank: 1, name: 'Rasm va Chizmachilik', emoji: '🎨', attendance: '95%' },
  { rank: 2, name: 'Matematika Olimpiadasi', emoji: '📐', attendance: '92%' },
  { rank: 3, name: 'Robototexnika', emoji: '🤖', attendance: '91%' },
  { rank: 4, name: 'Musiqa', emoji: '🎵', attendance: '89%' },
  { rank: 5, name: 'Ingliz tili', emoji: '🌍', attendance: '88%' },
]

const rankColors = ['bg-amber-500', 'bg-gray-400', 'bg-amber-700', 'bg-indigo-500', 'bg-blue-500']

const schoolOverview = [
  { club: 'Robototexnika', emoji: '🤖', teacher: 'Sardor Xolmatov', students: 24, attendance: '91%', trend: '+2.1%', trendUp: true, status: 'Yaxshi' },
  { club: 'Rasm va Chizmachilik', emoji: '🎨', teacher: 'Nilufar Rahimova', students: 18, attendance: '95%', trend: '+2.1%', trendUp: true, status: 'Yaxshi' },
  { club: 'Ingliz tili', emoji: '🌍', teacher: 'Malika Yusupova', students: 28, attendance: '88%', trend: '+2.1%', trendUp: true, status: 'Yaxshi' },
  { club: 'Matematika Olimpiadasi', emoji: '📐', teacher: 'Bobur Mirzayev', students: 15, attendance: '92%', trend: '+2.1%', trendUp: true, status: 'Yaxshi' },
  { club: 'Musiqa', emoji: '🎵', teacher: 'Sardor Xolmatov', students: 22, attendance: '89%', trend: '+2.1%', trendUp: true, status: 'Yaxshi' },
  { club: 'Sport va Fitnes', emoji: '⚽', teacher: 'Alibek Toshmatov', students: 35, attendance: '85%', trend: '-1.3%', trendUp: false, status: 'Muammoli' },
]

export default function DirectorHomePage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-2`}>
              <s.icon size={20} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-[11px] text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Oylik Davomat Tendensiyasi</h3>
            <span className="text-xs font-medium text-gray-400 px-3 py-1 border rounded-full">6 oy</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4338ca" strokeWidth={2.5} dot={{ fill: '#4338ca', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">To&apos;garaklar taqsimoti</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={clubDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                  {clubDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Teacher Performance + Top Clubs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Teacher Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">O&apos;qituvchilar samaradorligi</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4338ca" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-2">* Ustunni bosing — o&apos;qituvchi haqida batafsil</p>
        </motion.div>

        {/* Top 5 Clubs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">TOP 5 Faol To&apos;garaklar</h3>
          <div className="space-y-3">
            {topClubs.map((c) => (
              <div key={c.rank} className="flex items-center gap-3">
                <span className={`w-7 h-7 ${rankColors[c.rank - 1]} rounded-full text-white text-xs font-bold flex items-center justify-center`}>
                  {c.rank}
                </span>
                <span className="text-lg">{c.emoji}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{c.name}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: c.attendance }} />
                </div>
                <span className="text-sm font-bold text-gray-900 w-10 text-right">{c.attendance}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* School Overview Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Maktab umumiy holati</h3>
          <Button variant="outline" className="rounded-xl text-sm gap-2">
            <Download size={16} /> Hisobot yuklash
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">To&apos;garak</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">O&apos;qituvchi</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">O&apos;quvchilar</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">O&apos;rt. Davomat</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Trend</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Holat</th>
            </tr>
          </thead>
          <tbody>
            {schoolOverview.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-3 px-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    {s.emoji} {s.club}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{s.teacher}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{s.students}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.status === 'Yaxshi' ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: s.attendance }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{s.attendance}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`flex items-center gap-1 text-xs font-medium ${s.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {s.trend}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    s.status === 'Yaxshi' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Yaxshi' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {s.status}
                    {s.status === 'Muammoli' && <AlertTriangle size={12} />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
