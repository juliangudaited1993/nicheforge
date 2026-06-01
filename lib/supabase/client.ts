import { createBrowserClient } from '@supabase/ssr'

function isValidSupabaseConfig(url?: string, key?: string): boolean {
  if (!url || !key) return false
  const u = url.trim()
  const k = key.trim()
  if (!u || !k) return false
  // Reject obvious placeholders or too-short/invalid values (prevents bogus network calls + confusing errors)
  if (u.includes('your-project') || u.includes('placeholder') || u.includes('example.supabase')) return false
  if (k.includes('your-anon') || k.includes('placeholder') || k.length < 20) return false
  if (!u.startsWith('https://') || !u.includes('.supabase.')) return false
  return true
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidSupabaseConfig(supabaseUrl, supabaseKey)) {
    // Safety guard for deployed site when env vars are not yet configured.
    // Prevents the hard "@supabase/ssr: Your project's URL and API key are required" crash.
    // Also prevents confusing network errors when using placeholder values in .env.local.
    // The login/signup forms will show a friendly error via toast instead.
    console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL or ANON_KEY missing/invalid/placeholder. Using demo stub client.')
    return {
      auth: {
        signInWithOtp: async () => ({
          data: null,
          error: { message: 'Supabase is not configured yet. Please use the "Login with Demo Account" button or add your Publishable key + URL in Netlify.' }
        }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) })
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl!, supabaseKey!)
}
