const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('profiles').select('*, student_points(total_points), enrollments(count)').eq('role', 'student').limit(1)
  console.log("Students:", data, error)
  
  const { data: t, error: e2 } = await supabase.from('profiles').select('id, full_name').eq('role', 'teacher').limit(1)
  console.log("Teachers:", t, e2)
  
  const { data: c, error: e3 } = await supabase.from('clubs').select('id, name').limit(1)
  console.log("Clubs:", c, e3)
}
test()
