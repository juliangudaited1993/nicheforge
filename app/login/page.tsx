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

          {/* Easy Test Mode bypass for local testing */}
          <div className="mt-6 pt-6 border-t border-[#27272a] text-center">
            <button
              onClick={() => {
                document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
                window.location.href = "/new-report?test=true";
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300 underline"
            >
              Skip login → Enter Full Test Mode (recommended for review)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
