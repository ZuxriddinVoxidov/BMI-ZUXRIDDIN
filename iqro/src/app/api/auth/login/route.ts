import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, remember, role } = await request.json()

    const cookieStore = cookies()
    
    // Create server client with custom cookie setAll
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // If "Remember Me" is true, keep 30 days. Otherwise, 2 hours.
                const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 2
                
                cookieStore.set(name, value, {
                  ...options,
                  maxAge,
                })
              })
            } catch (error) {
              // Ignore cookie errors in route handlers
            }
          },
        },
      }
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      if (authError?.message?.includes('Email not confirmed')) {
        return NextResponse.json({ 
          error: "Emailingiz hali tasdiqlanmagan. Email qutingizni tekshiring va tasdiqlash kodini kiriting.",
          code: 'email_not_confirmed'
        }, { status: 401 })
      }
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_blocked')
      .eq('user_id', authData.user.id)
      .single()

    if (profile?.is_blocked) {
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Akkauntingiz bloklangan. Iltimos admin bilan bog\'laning.' }, { status: 403 })
    }

    const userRole = profile?.role || 'student'
    const ALLOWED_ROLES: Record<string, string[]> = {
      student: ['student'],
      teacher: ['teacher', 'school_admin', 'director'],
    }

    if (!ALLOWED_ROLES[role]?.includes(userRole)) {
      await supabase.auth.signOut()
      const message = role === 'student'
        ? "Bu kirish o'quvchilar uchun. O'qituvchi sifatida kiring."
        : "Bu kirish o'qituvchilar uchun. O'quvchi sifatida kiring."
      return NextResponse.json({ error: message }, { status: 403 })
    }

    const routes: Record<string, string> = {
      super_admin: '/dashboard',
      school_admin: '/dashboard',
      student: '/student',
      teacher: '/teacher',
      director: '/director',
    }

    return NextResponse.json({ success: true, redirect: routes[userRole] || '/student' })
  } catch (error) {
    return NextResponse.json({ error: 'Tizim xatosi yuz berdi' }, { status: 500 })
  }
}
