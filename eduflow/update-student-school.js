const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ school_id: '00000000-0000-0000-0000-000000000001' })
    .eq('role', 'student')
    .is('school_id', null)
    
  console.log("Updated students with default school_id.", data, error)
}
run()
