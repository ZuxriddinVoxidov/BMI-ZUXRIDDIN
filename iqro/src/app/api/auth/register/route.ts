import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client — uses SERVICE_ROLE key (bypasses RLS and rate limits)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const { email, password, full_name, grade, school_id } = await request.json()

    // Basic validation
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // Create user via Admin API — no email confirmation, no rate limit
    const { data: authData, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Instantly confirmed — no OTP needed
      user_metadata: {
        full_name,
        role: 'student',
        grade: grade || null,
        school_id: school_id || '00000000-0000-0000-0000-000000000001',
      },
    })

    if (createError) {
      // Translate common Supabase errors
      if (createError.message.toLowerCase().includes('already registered') || createError.message.toLowerCase().includes('already been registered')) {
        return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 409 })
      }
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId: authData.user?.id })
  } catch (err) {
    console.error('[register API]', err)
    return NextResponse.json({ error: 'Tizim xatosi yuz berdi' }, { status: 500 })
  }
}
