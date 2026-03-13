const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: students } = await supabase.from('profiles').select('id, full_name, school_id, role').eq('role', 'student')
  console.log("Students:", students)
}
test()
