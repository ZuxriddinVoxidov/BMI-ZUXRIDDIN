require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixGhostUserFinal() {
  const emailToFix = 'jorayeva46@gmail.com';
  const plainPassword = 'zulfizar';
  
  // 1. Client for Auth (gets downgraded to user session after login)
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 2. Client for Admin Operations (Strictly uses Service Role)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  console.log(`[1] Logging in to find user ID for: ${emailToFix}...`);
  const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
    email: emailToFix,
    password: plainPassword
  });

  if (signInError) {
    console.error('Failed to sign in:', signInError.message);
    return;
  }

  const userId = signInData.user.id;
  console.log(`[2] Found user ID: ${userId}`);

  console.log('[3] Fetching school ID...');
  const { data: activeSchool } = await supabaseAdmin.from('schools').select('id').limit(1).single();
  const schoolId = activeSchool?.id;

  if (!schoolId) {
    console.error('No school found in the database.');
    return;
  }
  console.log(`[4] Assigning to school ID: ${schoolId}`);

  console.log('[5] Inserting into profiles bypassing RLS...');
  const { error: insertError } = await supabaseAdmin.from('profiles').upsert({
    user_id: userId,
    role: 'teacher',
    full_name: "Jo'rayeva Zulfizar",
    school_id: schoolId,
    plain_password: plainPassword,
    is_blocked: false
  });

  if (insertError) {
    console.error(`[X] Failed to insert profile:`, insertError.message);
  } else {
    console.log(`[✓] Successfully created profile for ${emailToFix}!`);
    console.log(`Now refresh the page in the browser.`);
  }
}

fixGhostUserFinal();
