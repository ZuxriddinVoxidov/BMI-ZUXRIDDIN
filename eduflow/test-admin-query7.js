const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data: t, error: e2 } = await supabase.from('profiles').select('user_id').eq('role', 'teacher').limit(1)
  console.log("Teachers:", t)
  
  if (t && t.length > 0) {
    const userIds = t.map(x => x.user_id)
    const { data: emailData, error: e3 } = await supabase.rpc('get_user_emails', { user_ids: userIds })
    console.log("Emails:", emailData, e3)
  }
}
test()
