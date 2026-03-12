import DashboardHeader from '@/components/dashboard/admin/DashboardHeader'
import Sidebar from '@/components/dashboard/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_blocked')
    .eq('user_id', user.id)
    .single()

  if (profile?.is_blocked) redirect('/login?error=blocked')

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="lg:ml-[250px] transition-all duration-300">
        <DashboardHeader />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
