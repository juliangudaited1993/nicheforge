import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidSupabaseConfig(supabaseUrl, supabaseKey)) {
    // Return a dummy client for preview/demo purposes so pages don't 500
    return {
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
