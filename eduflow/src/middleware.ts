import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
