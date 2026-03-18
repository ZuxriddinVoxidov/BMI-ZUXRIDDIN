const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: a, error: e1 } = await supabase.from('profiles').select('id, full_name, school_id, role')
  console.log("All Profiles:", a, e1)
}
test()
