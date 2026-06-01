'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Detect if Supabase keys are missing at build time (common on fresh Netlify deploys)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured = !!(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Magic link sent! Check your email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center">
              <Flame className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-2xl tracking-tighter">ResearchForge</span>
          </div>
        </div>

        <div className="card rounded-3xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-[#a1a1aa] mb-6">Sign in to access your research reports.</p>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <div className="font-medium mb-1">Supabase is not configured on this deployment yet.</div>
              <div>
                Add your <strong>Publishable key</strong> from Supabase as <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify, then click <strong>Clear cache and redeploy</strong>.
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              className="input w-full rounded-2xl px-5 py-3"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 rounded-2xl font-semibold"
            >
              {loading ? 'Sending magic link...' : 'Send Magic Link'}
            </button>
          </form>

          <p className="text-center text-sm text-[#a1a1aa] mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#f59e0b] hover:underline">Sign up</Link>
          </p>

          {/* Demo Login - "Actual login" bypass without Supabase (user requested) */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
            <button
              onClick={() => {
                // Set explicit demo login cookie (acts as a real logged-in session)
                document.cookie = "researchforge-demo-login=true; path=/; max-age=86400";
                // Also clear any old test cookie for cleanliness
                document.cookie = "researchforge-test-mode=; path=/; max-age=0";
                window.location.href = "/dashboard";
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 px-6 py-3 text-sm font-semibold text-[#f59e0b] transition"
            >
              Login with Demo Account
              <span className="text-xs opacity-70">(No Supabase • Real Grok + PDFs)</span>
            </button>
            <p className="text-center text-[10px] text-[#52525b] mt-2">
              Creates a demo session. Full access to Grok research and PDF reports. Data saved locally.
            </p>
            <p className="text-center text-[10px] text-amber-400/70 mt-1">
              When you're ready for real accounts: Set Supabase keys in Netlify + run schema.sql
            </p>
          </div>

          {/* Legacy Test Mode (keep for power users) */}
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
                window.location.href = "/new-report?test=true";
              }}
              className="text-xs text-[#a1a1aa] hover:text-[#ededed] underline"
            >
              Or use quick Test Mode (no dashboard)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
