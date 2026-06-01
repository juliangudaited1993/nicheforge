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

  // Check for explicit Demo Login (the "actual login" bypass the user requested)
  // This is set by the Demo Login button on the login page
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const hasDemoLogin = cookieStore.get('researchforge-demo-login')?.value === 'true';

  const isSupabaseMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isDemoMode = isSupabaseMissing || hasDemoLogin;
  const isTestMode = process.env.NODE_ENV === 'development' || hasDemoLogin || isSupabaseMissing;

  // Only redirect if NOT in any demo/test mode
  if (!user && !isTestMode && !hasDemoLogin) {
    redirect('/login');
  }

  // Demo user when using explicit demo login or when Supabase is missing
  const displayUser = user || { 
    email: hasDemoLogin ? 'demo@researchforge.test' : 'test@researchforge.ai', 
    id: hasDemoLogin ? 'demo-user-001' : 'test-user-001' 
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0b]">
      {(hasDemoLogin || isDemoMode || isTestMode) && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-emerald-500/90 text-black text-center py-1 text-sm font-medium">
          {hasDemoLogin 
            ? "DEMO ACCOUNT — Logged in as demo@researchforge.test • Real Grok reports + full PDF features • Data saved locally" 
            : "TEST MODE — Full access enabled • No login required • All features (research flow, agents, PDF, history) work locally"}
        </div>
      )}
      <DashboardSidebar user={displayUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar user={displayUser} />
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0b] ${(isDemoMode || isTestMode) ? 'pt-10' : ''}`}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
