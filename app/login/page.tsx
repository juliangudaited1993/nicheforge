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
              <div className="mb-2">
                This means the Supabase keys you added in Netlify are <strong>not yet in the current live build</strong>.
              </div>
              <div className="text-xs">
                Common causes:<br />
                • You added the keys but haven't triggered a new build since then<br />
                • The keys were added to the wrong site or wrong deploy context<br />
                • You need to do a full "Clear cache and deploy" (or dummy git push)
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

          {/* Demo Login - Primary way to access when Supabase is not fully ready */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
            <div className="mb-2 text-center text-xs uppercase tracking-widest text-[#f59e0b]">Recommended for testing</div>
            <button
              onClick={() => {
                // Set explicit demo login cookie (acts as a real logged-in session)
                document.cookie = "researchforge-demo-login=true; path=/; max-age=86400";
                document.cookie = "researchforge-test-mode=; path=/; max-age=0";
                window.location.href = "/dashboard";
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-[#f59e0b] bg-[#f59e0b] hover:bg-[#fbbf24] active:bg-[#d97706] px-6 py-3.5 text-sm font-bold text-black transition shadow-lg"
            >
              Login with Demo Account (Recommended)
            </button>
            <p className="text-center text-xs text-[#a1a1aa] mt-2">
              Full access • Real Grok-4 (if XAI key set) • PDF customization • Data saved locally
            </p>

            <div className="mt-3 text-center">
              <button
                onClick={() => {
                  document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
                  window.location.href = "/new-report?test=true";
                }}
                className="text-[10px] text-[#52525b] hover:text-[#a1a1aa] underline"
              >
                Or quick Test Mode (no dashboard)
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-[9px] text-[#52525b]">
            Normal login requires full Supabase setup. Demo mode is the easiest way to test Grok + PDFs right now.<br />
            <strong>Important:</strong> After adding any keys in Netlify (Supabase or XAI), you must force a new build — easiest is to edit any file, commit, and <code>git push</code>.
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
