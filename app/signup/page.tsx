'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/dashboard`,
          data: { full_name: fullName },
        },
      });

      if (error) {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('invalid') || msg.includes('key') || msg.includes('fetch') || msg.includes('network')) {
          toast.error('Supabase auth error — check Publishable key/URL in Netlify + Supabase redirect URLs. Use Demo Login for now.');
        } else {
          toast.error(msg);
        }
      } else {
        toast.success('Account created! Check your email for the magic link.');
      }
    } catch (err: any) {
      console.error('[Signup] Unexpected error:', err);
      toast.error('Signup failed. Use the Demo Account button below for full access while you finish Supabase setup.');
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
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h1>
          <p className="text-[#a1a1aa] mb-6">Start generating professional research reports on any topic.</p>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              <div className="font-medium mb-1">Supabase is not configured on this deployment yet.</div>
              <div>
                Add your <strong>Publishable key</strong> from Supabase as <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Netlify, then click <strong>Clear cache and redeploy</strong>.
              </div>
            </div>
          )}

          {/* Dev-only diagnostics: shows exactly what the browser build sees (helps debug localhost + console issues) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 rounded-lg border border-[#27272a] bg-[#111113] px-3 py-2 text-[10px] text-[#52525b] font-mono">
              DEV DIAGNOSTICS — URL: {supabaseUrl ? supabaseUrl.replace(/https?:\/\/([^.]+).*/, 'https://$1...') : 'MISSING'} | Key: {supabaseKey ? supabaseKey.slice(0, 8) + '...' + supabaseKey.slice(-4) : 'MISSING'} | Configured: {isSupabaseConfigured ? 'YES ✓' : 'NO (using demo stub)'}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="input w-full rounded-2xl px-5 py-3"
              required
            />
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
              {loading ? 'Creating account...' : 'Create Account & Send Magic Link'}
            </button>
          </form>

          <p className="text-center text-sm text-[#a1a1aa] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f59e0b] hover:underline">Log in</Link>
          </p>

          {/* Demo is secondary now that Supabase is configured */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
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
              Real Grok + PDF features • Data saved in browser only
            </p>
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={() => {
                document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
                window.location.href = "/new-report?test=true";
              }}
              className="text-xs text-[#a1a1aa] hover:text-[#ededed] underline"
            >
              Or use quick Test Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
