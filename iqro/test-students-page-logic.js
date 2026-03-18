const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const adminSchoolId = '00000000-0000-0000-0000-000000000001';

  const { data: students, error } = await supabase
    .from('profiles')
    .select('*, student_points(total_points), enrollments(count), parent_telegram_id, parent_name')
    .eq('school_id', adminSchoolId)
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  console.log("DB returned students:", JSON.stringify(students, null, 2))
  console.log("DB error:", error)

  const userIds = students?.map(s => s.user_id).filter(Boolean) || []
  
  let emailData = [];
  try {
      const resp = userIds.length > 0
        ? await supabase.rpc('get_user_emails', { user_ids: userIds })
        : { data: [] }
      emailData = resp.data;
      console.log("RPC get_user_emails returned:", JSON.stringify(resp.data, null, 2), resp.error)
  } catch(e) {
      console.log("RPC get_user_emails threw:", e)
  }

  const studentsWithEmail = students?.map(s => ({
    ...s,
    email: emailData?.find((e) => e.user_id === s.user_id)?.email || '—'
  })) || []

  console.log("Final mapped studentsWithEmail arrays size:", studentsWithEmail.length)
}
test()
