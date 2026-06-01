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

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

  // In demo mode, allow viewing the UI without auth
  if (!user && !isDemoMode) {
    redirect('/login');
  }

  const displayUser = user || { email: 'demo@nicheforge.ai', id: 'demo' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0b]">
      {isDemoMode && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-yellow-500/90 text-black text-center py-1 text-sm font-medium">
          DEMO MODE — Supabase not configured. Auth &amp; data features disabled.
        </div>
      )}
      <DashboardSidebar user={displayUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar user={displayUser} />
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0a0a0b] ${isDemoMode ? 'pt-10' : ''}`}>
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
