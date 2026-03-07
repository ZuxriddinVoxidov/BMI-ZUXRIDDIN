import StudentsManager from '@/components/dashboard/admin/StudentsManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile) redirect('/login')

  const { data: students } = await supabase
    .from('profiles')
    .select('*, student_points(total_points), enrollments(count)')
    .eq('school_id', adminProfile.school_id)
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return <StudentsManager students={students || []} />
}
