'use client'

import DashboardHeader from '@/components/dashboard/admin/DashboardHeader'
import Sidebar from '@/components/dashboard/admin/Sidebar'
import dynamic from 'next/dynamic'

const PageLoader = dynamic(() => import('@/components/ui/PageLoader'), { ssr: false })

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageLoader />
      <Sidebar />
      <div className="ml-[250px] transition-all duration-300">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
