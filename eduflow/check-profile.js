require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkProfile() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const userId = 'c8a63405-6c89-4fc5-a019-124def648423';
  console.log(`Checking profile for user: ${userId}`);
  
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    console.log('Profile details:', JSON.stringify(profile, null, 2));
  }
}

checkProfile();
