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
            <span className="font-semibold text-2xl tracking-tighter">NicheForge AI</span>
          </div>
        </div>

        <div className="card rounded-3xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h1>
          <p className="text-[#a1a1aa] mb-6">Start generating professional niche reports today.</p>

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
        </div>
      </div>
    </div>
  );
}
