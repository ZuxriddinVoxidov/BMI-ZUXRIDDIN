export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const admin = createAdminClient()
    // Make a simple query to keep the database awake
    const { data, error } = await admin.from('profiles').select('id').limit(1)

    if (error) {
       console.error("Keep-Alive Error:", error)
       return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Pinged Supabase Database to stay active", data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
