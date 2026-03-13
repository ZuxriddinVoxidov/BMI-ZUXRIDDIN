const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function run() {
  const { data: students } = await supabase.from('profiles').select('id, full_name, user_id').eq('role', 'student')
  
  if (!students) return console.log("No students")
  
  // Keep Sodiqjon
  const toDelete = students.filter(s => s.full_name !== 'Yunusaliyev Sodiqjon')
  console.log("Deleting:", toDelete.map(s => s.full_name))
  
  for (const s of toDelete) {
    if (s.user_id) {
       // Delete from auth.users via admin api if service key is present
       await supabase.auth.admin.deleteUser(s.user_id)
    }
    await supabase.from('profiles').delete().eq('id', s.id)
  }
  
  console.log("Finished deleting fake students.")
}
run()
