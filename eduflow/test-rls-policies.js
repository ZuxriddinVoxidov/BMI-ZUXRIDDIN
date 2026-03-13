const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1) // Just to test query
  console.log("Can query?", data, error)
  // Getting policies via pg_policies might require rpc or direct sql execute.
  // Wait, I can execute SQL through supabase-mcp-server_execute_sql
}
run()
