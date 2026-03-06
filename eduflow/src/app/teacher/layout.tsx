'use client'

import DashboardHeader from '@/components/dashboard/admin/DashboardHeader'
import TeacherSidebar from '@/components/dashboard/teacher/TeacherSidebar'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <TeacherSidebar />
      <div className="ml-[250px] transition-all duration-300">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
