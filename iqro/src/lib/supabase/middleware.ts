import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    }
  )

  // IMPORTANT: getUser() is required here — it validates the token
  // and refreshes cookies. getSession() alone breaks login/register.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect logged-in users away from public landing/auth pages
  const isLandingOrAuth = pathname === '/' || pathname === '/login' || pathname === '/register'

  if (isLandingOrAuth && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role || user.user_metadata?.role || 'student'
    
    let redirectPath = '/student'
    switch (role) {
      case 'teacher':
        redirectPath = '/teacher'
        break
      case 'director':
        redirectPath = '/director'
        break
      case 'super_admin':
      case 'school_admin':
      case 'admin':
        redirectPath = '/dashboard'
        break
    }

    const url = request.nextUrl.clone()
    url.pathname = redirectPath
    return NextResponse.redirect(url)
  }

  // Other Public routes — never redirect these
  const isPublicRoute =
    pathname === '/contact' ||
    pathname.startsWith('/clubs') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')

  if (isLandingOrAuth || isPublicRoute) {
    return supabaseResponse
  }

  // Only redirect if trying to access protected routes without auth
  const protectedRoutes = ['/dashboard', '/student', '/teacher', '/director']
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
