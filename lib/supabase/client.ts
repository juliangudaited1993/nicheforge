import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Safety guard for deployed site when env vars are not yet configured.
    // Prevents the hard "@supabase/ssr: Your project's URL and API key are required" crash.
    // The login/signup forms will show a friendly error via toast instead.
    console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL or ANON_KEY missing. Using demo stub client.')
    return {
      auth: {
        signInWithOtp: async () => ({
          data: null,
          error: { message: 'Supabase is not configured yet. Please use the "Test Mode" button below or add your keys in Netlify.' }
        }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) })
      }),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
