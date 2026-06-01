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
  const isSupabaseConfigured = !!(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email for the magic link.');
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
              {loading ? 'Creating account...' : 'Create Account & Send Link'}
            </button>
          </form>

          <p className="text-center text-sm text-[#a1a1aa] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#f59e0b] hover:underline">Log in</Link>
          </p>

          {/* Test Mode */}
          <div className={`mt-6 pt-6 border-t border-[#27272a] text-center ${!isSupabaseConfigured ? 'bg-emerald-500/10 -mx-2 px-2 py-3 rounded-xl' : ''}`}>
            <button
              onClick={() => {
                document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
                window.location.href = "/new-report?test=true";
              }}
              className={`font-medium ${!isSupabaseConfigured ? 'text-emerald-400 hover:text-emerald-300' : 'text-sm text-emerald-400 hover:text-emerald-300 underline'}`}
            >
              {!isSupabaseConfigured 
                ? "→ Skip signup and use Full Test Mode (recommended right now)" 
                : "Skip signup → Enter Full Test Mode (recommended for review)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
