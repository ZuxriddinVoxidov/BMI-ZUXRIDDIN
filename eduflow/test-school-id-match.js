const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: adminProfile } = await supabase.from('profiles').select('school_id').eq('role', 'school_admin').single()
  
  console.log("Admin school_id:", adminProfile?.school_id)

  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, full_name, school_id')
    .eq('school_id', adminProfile.school_id)
    .eq('role', 'student')

  console.log("Students matching admin school_id:", students?.length, error)
  console.log("Students:", students)
}
test()
