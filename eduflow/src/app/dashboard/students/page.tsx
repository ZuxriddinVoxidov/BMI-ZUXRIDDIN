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
    .select('*, student_points(total_points), enrollments(count), parent_telegram_id, parent_name')
    .eq('school_id', adminProfile.school_id)
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  // Fetch emails from auth.users via DB function
  const userIds = students?.map(s => s.user_id).filter(Boolean) || []
  const { data: emailData } = userIds.length > 0
    ? await supabase.rpc('get_user_emails', { user_ids: userIds })
    : { data: [] }

  const studentsWithEmail = students?.map(s => ({
    ...s,
    email: emailData?.find((e: { user_id: string; email: string }) => e.user_id === s.user_id)?.email || '—'
  })) || []

  return <StudentsManager students={studentsWithEmail} />
}
