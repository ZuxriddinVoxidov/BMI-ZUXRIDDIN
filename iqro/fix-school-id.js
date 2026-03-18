require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixGhostUserFinal() {
  const userId = 'c8a63405-6c89-4fc5-a019-124def648423';
  const plainPassword = 'zulfizar';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log('[1] Fetching school ID...');
  const { data: activeSchool } = await supabaseAdmin.from('schools').select('id').limit(1).single();
  const schoolId = activeSchool?.id;

  if (!schoolId) {
    console.error('No school found in the database.');
    return;
  }
  
  console.log(`[2] Updating profile ${userId} with school ID: ${schoolId}`);
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      school_id: schoolId,
      plain_password: plainPassword
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error(`[X] Failed to update profile:`, updateError.message);
  } else {
    console.log(`[✓] Successfully fixed profile "Jo'rayeva Zulfizar" !`);
  }
}

fixGhostUserFinal();
