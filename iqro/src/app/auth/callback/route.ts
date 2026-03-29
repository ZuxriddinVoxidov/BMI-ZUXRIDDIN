import { createClient } from '@/lib/supabase/server'
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
      // Get user role and redirect to correct dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        const role = profile?.role
        if (role === 'student') return NextResponse.redirect(new URL('/student', request.url))
        if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url))
        if (role === 'director') return NextResponse.redirect(new URL('/director', request.url))
        if (role === 'school_admin' || role === 'super_admin' || role === 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
}
