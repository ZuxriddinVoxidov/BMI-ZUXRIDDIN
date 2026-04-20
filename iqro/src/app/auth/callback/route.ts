import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  const supabase = createClient()

  // 1. Handle either "code" (PKCE) or "token_hash" (OTP/Verification)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  } else {
    // No code or token_hash found, redirect to login
    return NextResponse.redirect(new URL('/login?error=no_auth_params', request.url))
  }

  // 2. A session should now be established. Get the user.
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
    
    // 3. Try to find profile in DB with retries (for database trigger sync)
    let profile = null
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase
        .from('profiles')
        .select('role, avatar_url')
        .eq('user_id', user.id)
        .single()
      if (data) { profile = data; break; }
      await new Promise(r => setTimeout(r, 500))
    }

    if (!profile) {
      await new Promise(r => setTimeout(r, 1000))
      const { data } = await supabase
        .from('profiles')
        .select('role, avatar_url')
        .eq('user_id', user.id)
        .single()
      if (data) profile = data
    }

    // 4. Avatar Sync (Google only)
    if (profile && googleAvatar && !profile.avatar_url) {
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ avatar_url: googleAvatar })
        .eq('user_id', user.id)
    }

    // 5. Robust Redirect Logic
    // Priority: Database Role > User Metadata Role (set during signup)
    const role = profile?.role || (user.user_metadata?.role as string) || (user.app_metadata?.role as string)
    
    if (role) {
      if (role === 'student') return NextResponse.redirect(new URL('/student', request.url))
      if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url))
      if (role === 'director') return NextResponse.redirect(new URL('/director', request.url))
      if (role === 'school_admin' || role === 'super_admin' || role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    // Final fallback if no role found after all checks
    return NextResponse.redirect(new URL('/login?confirmed=true', request.url))
  }

  return NextResponse.redirect(new URL('/login?error=user_not_found', request.url))
}
