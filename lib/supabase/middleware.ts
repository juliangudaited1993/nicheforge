import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Safety guard: If Supabase env vars are missing, don't crash the app.
  // This allows the marketing page + login to work even without setup.
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  // Demo Login (explicit "actual login" bypass without Supabase)
  const hasDemoLogin = request.cookies.get('researchforge-demo-login')?.value === 'true'

  // Full Test Mode bypass for local assessment (no login required)
  const isTestMode = 
    process.env.NODE_ENV === 'development' ||
    request.cookies.get('researchforge-test-mode')?.value === 'true' ||
    request.nextUrl.searchParams.get('test') === 'true' ||
    hasDemoLogin

  // IMPORTANT: If demo login cookie is present, always bypass real Supabase auth
  // even if Supabase keys are configured in Netlify.
  if (hasDemoLogin || isTestMode) {
    return supabaseResponse
  }

  // Protected routes (only when NOT in test/demo mode)
  if (
    !user &&
    !hasDemoLogin &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/reports') ||
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/alerts'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in (or in demo login) and tries to access auth pages, redirect to dashboard
  if (
    (user || hasDemoLogin) &&
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
