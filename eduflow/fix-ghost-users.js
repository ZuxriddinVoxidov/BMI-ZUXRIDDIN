require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixGhostUsers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Fetching auth users...');
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Failed to fetch auth users:', authError);
    return;
  }
  
  const authUsers = authData.users;
  console.log(`Found ${authUsers.length} auth users.`);

  console.log('Fetching profiles...');
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('user_id');
  
  if (profileError) {
    console.error('Failed to fetch profiles:', profileError);
    return;
  }
  
  const profileUserIds = new Set(profiles.map(p => p.user_id));
  
  // Find ghost users (in auth but not in profiles)
  const ghostUsers = authUsers.filter(u => !profileUserIds.has(u.id) && u.email);
  
  console.log(`Found ${ghostUsers.length} ghost users.`);
  
  if (ghostUsers.length === 0) {
    console.log('No ghost users to fix.');
    return;
  }
  
  // Get an active school_id to assign them to
  const { data: activeSchool } = await supabase.from('schools').select('id').limit(1).single();
  const schoolId = activeSchool?.id;
  
  if (!schoolId) {
    console.error('No school found in the database. Cannot assign users to a school.');
    return;
  }
  
  for (const user of ghostUsers) {
    console.log(`Fixing ghost user: ${user.email} (${user.id})`);
    
    // Determine role from metadata or default to teacher
    const role = user.user_metadata?.role || 'teacher';
    const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
    
    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: user.id,
      role: role,
      full_name: fullName,
      school_id: schoolId,
      plain_password: 'FixedByAdmin123!' // Placeholder since we can't extract the original
    });
    
    if (insertError) {
      console.error(`  Failed to insert profile for ${user.email}:`, insertError.message);
    } else {
      console.log(`  Successfully created profile for ${user.email}`);
    }
  }
  
  console.log('Done fixing ghost users!');
}

fixGhostUsers();
