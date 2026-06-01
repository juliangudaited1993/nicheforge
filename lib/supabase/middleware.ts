import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isValidSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false
  const u = url.trim()
  const k = key.trim()
  if (!u || !k) return false
  if (u.includes('your-project') || u.includes('placeholder') || u.includes('example.supabase')) return false
  if (k.includes('your-anon') || k.includes('placeholder') || k.length < 20) return false
  if (!u.startsWith('https://') || !u.includes('.supabase.')) return false
  return true
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Safety guard: If Supabase env vars are missing/invalid/placeholder, don't crash the app.
  // This allows the marketing page + login to work even without setup. No bogus auth calls.
  if (!isValidSupabaseConfig(supabaseUrl, supabaseKey)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Demo Login cookie (legacy bypass for when Supabase wasn't configured yet)
  const hasDemoLogin = request.cookies.get('researchforge-demo-login')?.value === 'true'

  // Full Test Mode bypass for local assessment (no login required)
  const isTestMode = 
    process.env.NODE_ENV === 'development' ||
    request.cookies.get('researchforge-test-mode')?.value === 'true' ||
    request.nextUrl.searchParams.get('test') === 'true'

  // Real user always takes priority over the old demo cookie.
  // Only treat as demo mode if there is NO real Supabase user AND (demo cookie or test mode).
  const forceDemo = !user && (hasDemoLogin || isTestMode)

  if (forceDemo) {
    return supabaseResponse
  }

  // Protected routes (only when NOT in test/demo mode)
  if (
    !user &&
    !forceDemo &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/reports') ||
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/alerts'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If real user (or explicit demo when no real user) tries to access auth pages, redirect to dashboard
  if (
    (user || forceDemo) &&
    !isTestMode &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
