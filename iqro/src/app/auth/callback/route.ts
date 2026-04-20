import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
        
        // 1. Try to find profile in DB with retries
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

        // 2. Avatar Sync (Google only)
        if (profile && googleAvatar && !profile.avatar_url) {
          const admin = createAdminClient()
          await admin
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('user_id', user.id)
        }

        // 3. Robust Redirect Logic
        // Priority: Database Role > User Metadata Role
        const role = profile?.role || (user.user_metadata?.role as string) || (user.app_metadata?.role as string)
        
        if (role) {
          if (role === 'student') return NextResponse.redirect(new URL('/student', request.url))
          if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url))
          if (role === 'director') return NextResponse.redirect(new URL('/director', request.url))
          if (role === 'school_admin' || role === 'super_admin' || role === 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        }
        
        // 4. Final Fallback if no role found
        return NextResponse.redirect(new URL('/login?confirmed=true', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
}
