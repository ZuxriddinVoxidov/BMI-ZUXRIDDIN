import ApplicationsManager from '@/components/dashboard/admin/ApplicationsManager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ApplicationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pending } = await supabase
    .from('enrollments')
    .select(
      `*, student:profiles!student_id(id, full_name), club:clubs(id, name, category, teacher:profiles!teacher_id(full_name))`
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: processed } = await supabase
    .from('enrollments')
    .select(
      `*, student:profiles!student_id(id, full_name), club:clubs(id, name, category)`
    )
    .in('status', ['approved', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <ApplicationsManager
      pending={pending || []}
      processed={processed || []}
    />
  )
}
