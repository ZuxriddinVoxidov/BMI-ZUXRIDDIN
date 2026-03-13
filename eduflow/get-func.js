const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.rpc('get_user_emails', { user_ids: ['some-id'] })
  console.log("Response:", data, error)
}
test()
