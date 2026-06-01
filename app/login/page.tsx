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
  // Robust check: also rejects placeholder values so local .env with template shows the banner + safe demo stub
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPlaceholder = (v?: string) =>
    !v ||
    v.trim() === '' ||
    v.includes('your-project') ||
    v.includes('placeholder') ||
    v.includes('example.supabase') ||
    (v.includes('your-anon') || (v.length > 0 && v.length < 20));
  const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseKey));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/dashboard` },
      });

      if (error) {
        // Give actionable guidance for common config issues (bad keys, redirects not set in Supabase, etc.)
        const msg = error.message || '';
        if (msg.toLowerCase().includes('invalid') || msg.includes('key') || msg.includes('fetch') || msg.includes('network')) {
          toast.error('Supabase auth error — double-check your Publishable key + Project URL in Netlify (and Supabase Auth → Redirect URLs includes this site). Use Demo Login for now.');
        } else {
          toast.error(msg);
        }
      } else {
        toast.success('Magic link sent! Check your email.');
      }
    } catch (err: any) {
      console.error('[Login] Unexpected error:', err);
      toast.error('Login failed. Check browser console for details. Use the Demo Account button below to access everything now.');
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
                • You need to do a full "Clear cache and deploy" (or dummy git push)<br /><br />
                <strong>To verify:</strong> In Netlify, go to a specific deploy → look for "Build details" or "Environment" section (or search the log for "Resolved config").
              </div>
            </div>
          )}

          {/* Dev-only diagnostics: shows exactly what the browser build sees (helps debug localhost + console issues) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 rounded-lg border border-[#27272a] bg-[#111113] px-3 py-2 text-[10px] text-[#52525b] font-mono">
              DEV DIAGNOSTICS — URL: {supabaseUrl ? supabaseUrl.replace(/https?:\/\/([^.]+).*/, 'https://$1...') : 'MISSING'} | Key: {supabaseKey ? supabaseKey.slice(0, 8) + '...' + supabaseKey.slice(-4) : 'MISSING'} | Configured: {isSupabaseConfigured ? 'YES ✓' : 'NO (using demo stub)'}
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
              {loading ? 'Sending magic link...' : 'Send Magic Link (Real Account)'}
            </button>
          </form>

          <p className="text-center text-sm text-[#a1a1aa] mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#f59e0b] hover:underline">Sign up</Link>
          </p>

          {/* Demo access is now secondary — real magic link is the primary path for permanent accounts + DB history */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
            <div className="mb-2 text-center text-xs uppercase tracking-widest text-[#52525b]">For quick testing only</div>
            <button
              onClick={() => {
                document.cookie = "researchforge-demo-login=true; path=/; max-age=86400";
                document.cookie = "researchforge-test-mode=; path=/; max-age=0";
                window.location.href = "/dashboard";
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] px-6 py-3 text-sm font-medium text-[#a1a1aa] transition"
            >
              Quick Demo Access (no real account)
            </button>
            <p className="text-center text-[10px] text-[#52525b] mt-2">
              Uses real Grok + PDF features • Data saved in browser only
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
            Real magic link login saves reports to your account, enforces quotas/trials, and gives permanent history.<br />
            Demo mode is only for fast testing while you finish setup.
          </div>
        </div>
      </div>
    </div>
  );
}
