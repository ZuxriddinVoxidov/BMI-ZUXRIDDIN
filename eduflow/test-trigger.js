const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.rpc('query', { 
     sql: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'handle_new_user';"
  })
  // Usually this rpc query fails if not defined, let's just do a direct query using postgres if possible, or using curl 
  // Wait, no easy psql client. We can test it by creating a test user.
  
  // Create a test user
  const email = 'test_trigger' + Date.now() + '@example.com';
  const { data: newUser, error: err1 } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
    user_metadata: {
       full_name: 'Test Trigger',
       role: 'student',
       school_id: '00000000-0000-0000-0000-000000000001',
       grade: '5-A'
    }
  })
  
  if (newUser?.user) {
    // wait a moment for trigger
    await new Promise(r => setTimeout(r, 1000));
    const { data: profile } = await supabase.from('profiles').select('school_id').eq('user_id', newUser.user.id).single()
    console.log("Trigger test profile school_id:", profile?.school_id)
    
    // cleanup
    await supabase.auth.admin.deleteUser(newUser.user.id)
  }
}
test()
