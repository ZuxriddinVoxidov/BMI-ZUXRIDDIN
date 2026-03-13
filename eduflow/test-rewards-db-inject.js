const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  const adminSchoolId = '00000000-0000-0000-0000-000000000001';
  
  // get teacher
  const { data: teacher } = await supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).single()
  // get student
  const { data: student } = await supabase.from('profiles').select('id').eq('role', 'student').limit(1).single()
  // get club
  const { data: club } = await supabase.from('clubs').select('id').limit(1).single()

  if (teacher && student && club) {
     const { data, error } = await supabase.from('teacher_rewards').insert({
       teacher_id: teacher.id,
       student_id: student.id,
       club_id: club.id,
       lesson_date: new Date().toISOString().split('T')[0],
       points_given: 10
     })
     console.log("Injected reward:", data, error)
     
     const { data: rpc, error: rpcErr } = await supabase.rpc('add_student_points', {
        p_student_id: student.id,
        p_points: 10
     })
     console.log("Injected points:", rpc, rpcErr)
  }
}
test()
