import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Legacy demo cookie (from when Supabase wasn't ready). Real user always wins.
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const hasDemoLogin = cookieStore.get('researchforge-demo-login')?.value === 'true';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPlaceholder = (v?: string) => !v || v.trim()==='' || v.includes('your-project') || v.includes('placeholder') || v.includes('example.supabase') || v.includes('your-anon') || (v.length>0 && v.length<20);
  const isSupabaseMissing = !supabaseUrl || !supabaseKey || isPlaceholder(supabaseUrl) || isPlaceholder(supabaseKey);

  // Real Supabase user always takes priority. Only demo if no real user + (missing keys OR legacy demo cookie)
  const forceDemo = !user && (isSupabaseMissing || hasDemoLogin);
  const isDemoMode = forceDemo;
  const isTestMode = process.env.NODE_ENV === 'development' || (!user && hasDemoLogin) || isSupabaseMissing;

  // Only redirect if NOT in any demo/test mode and no real user
  if (!user && !forceDemo && !isTestMode) {
    redirect('/login');
  }

  // Show real user when available, otherwise fall back to demo/test identity
  const displayUser = user || { 
    email: hasDemoLogin ? 'demo@researchforge.test' : 'test@researchforge.ai', 
    id: hasDemoLogin ? 'demo-user-001' : 'test-user-001' 
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0b]">
      {(forceDemo || isTestMode) && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-emerald-500/90 text-black text-center py-1 text-sm font-medium">
          {hasDemoLogin && !user
            ? "DEMO ACCOUNT — Logged in as demo@researchforge.test • Real Grok reports + full PDF features • Data saved locally (use real login for permanent history)"
            : "TEST MODE — Full access enabled • No login required • All features work locally"}
        </div>
      )}

      {/* Only show production readiness hint when truly in demo with no real Supabase user */}
      {(forceDemo && !user) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white text-xs px-4 py-1.5 rounded-full border border-white/20">
          Using demo mode. <a href="/login" className="underline font-medium">Log in with real magic link</a> for saved reports + history.
        </div>
      )}
      <DashboardSidebar user={displayUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar user={displayUser} />
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0b] ${(forceDemo || isTestMode) ? 'pt-10' : ''}`}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
