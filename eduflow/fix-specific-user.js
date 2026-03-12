require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixSpecificUser(emailToFix) {
  // Use the admin key to bypass RLS
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

  console.log(`Looking for user with email: ${emailToFix}`);
  
  // Try to find the user by attempting to create them and catching the error
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: emailToFix,
    password: 'TemporaryPassword123!',
    email_confirm: true
  });
  
  let userId;
  
  if (authError && authError.message.includes('already been registered')) {
    console.log('User exists. Using workaround to find ID...');
    
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: emailToFix,
      password: 'zulfizar' // The password shown in the screenshot
    });
    
    if (signInError) {
       console.log("Could not sign in with password from screenshot:", signInError.message);
    } else {
       console.log("Successfully signed in! Checking session for user ID...");
       const { data: sessionData } = await supabaseAdmin.auth.getSession();
       if (sessionData?.session?.user) {
         userId = sessionData.session.user.id;
         console.log('Found user ID:', userId);
       }
    }
  } else if (!authError && authData.user) {
    userId = authData.user.id;
    console.log('Created new auth user wth ID:', userId);
  } else {
    console.error('Unexpected auth result:', authError);
    return;
  }
  
  if (!userId) {
     console.error('Could not determine user ID for', emailToFix);
     return;
  }

  // Get an active school_id to assign them to
  const { data: activeSchool } = await supabaseAdmin.from('schools').select('id').limit(1).single();
  const schoolId = activeSchool?.id;
  
  if (!schoolId) {
    console.error('No school found in the database. Cannot assign user to a school.');
    return;
  }
  
  console.log('Inserting into profiles...');
  const { error: insertError } = await supabaseAdmin.from('profiles').upsert({
    user_id: userId,
    role: 'teacher',
    full_name: "Jo'rayeva Zulfizar", // From screenshot
    school_id: schoolId,
    plain_password: 'zulfizar'
  });
  
  if (insertError) {
    console.error(`Failed to insert profile:`, insertError.message);
  } else {
    console.log(`Successfully created/updated profile for ${emailToFix}`);
  }
}

fixSpecificUser('jorayeva46@gmail.com');
