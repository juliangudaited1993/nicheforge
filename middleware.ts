import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Only run middleware on auth-related and protected routes
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/reports/:path*',
    '/new-report/:path*',
    '/alerts/:path*',
    '/settings/:path*',
    '/pricing', // keep pricing accessible but can protect later
  ],
}
