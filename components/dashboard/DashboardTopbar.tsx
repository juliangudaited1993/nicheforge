'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';

export default function DashboardTopbar({ user }: { user: any }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear demo login cookie if present (for the demo bypass login)
    document.cookie = "researchforge-demo-login=; path=/; max-age=0";
    document.cookie = "researchforge-test-mode=; path=/; max-age=0";

    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-[#27272a] bg-[#121214] px-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <div className="font-semibold tracking-tighter">ResearchForge</div>
        </div>
        <div className="hidden text-sm text-[#a1a1aa] lg:block">
          Professional Research for Any Topic
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-[#27272a] px-3 py-1 text-sm">
          <User className="h-4 w-4 text-[#f59e0b]" />
          <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-[#27272a] px-4 py-2 text-sm font-medium text-[#a1a1aa] transition hover:bg-[#1a1a1d] hover:text-[#ededed]"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </div>
  );
}
