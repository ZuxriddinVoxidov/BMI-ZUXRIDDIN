import { createClient } from '@/lib/supabase/server'
import { Bell } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const fullName = profile?.full_name || 'Direktor'
  const initials = fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const today = new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Edu<span className="text-indigo-600">Flow</span>
          </span>
          <span className="text-sm text-gray-400 ml-2">| Direktor Paneli</span>
        </div>

        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-gray-900">
            Assalomu alaykum, {fullName}! 👋
          </p>
          <p className="text-xs text-gray-400">Bugun, {today}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700">Direktor</span>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1200px] mx-auto">{children}</main>
    </div>
  )
}
