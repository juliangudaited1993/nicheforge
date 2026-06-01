import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, FileText, TrendingUp, Zap, Flame, Clock } from 'lucide-react';
import { getUserReports, getTrialStatus } from '@/app/actions';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const reports = await getUserReports();
  const recentReports = reports.slice(0, 6);

  // Fetch profile for quota + tier (graceful in demo)
  const { data: profile } = user 
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null };

  const quotaUsed = profile?.report_quota_used ?? reports.length;
  const quotaLimit = profile?.report_quota_limit ?? 999;
  const tier = profile?.subscription_tier || (user ? 'pro' : 'demo');

  const trial = await getTrialStatus();

  return (
    <div className="space-y-8">
      {params.success && (
        <div className="rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 p-4 text-[#22c55e]">
          Payment successful! Your plan has been upgraded.
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-[#a1a1aa]">
            Here's what's happening with your niche intelligence.
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="text-[#a1a1aa]">Current Plan</div>
          <div className="font-semibold text-[#f59e0b] capitalize">{tier}</div>
        </div>
      </div>

      {/* 7-Day Trial Banner (only shows for real users in active trial) */}
      {trial.isTrialActive && (
        <div className="rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/5 p-4 flex items-center gap-3 text-sm">
          <Clock className="h-5 w-5 text-[#f59e0b] shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-[#f59e0b]">7-Day Trial Active</span> — {trial.daysLeft} day{trial.daysLeft !== 1 ? 's' : ''} left. 
            You have used {trial.used} of {trial.limit} trial reports.
          </div>
          <Link href="/pricing" className="text-xs font-semibold text-[#f59e0b] hover:underline whitespace-nowrap">Upgrade now →</Link>
        </div>
      )}

      {/* Quick Stats + Quota */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card rounded-2xl p-6">
          <div className="text-sm text-[#a1a1aa]">Reports Generated</div>
          <div className="mt-2 text-4xl font-semibold tracking-tighter">{reports.length}</div>
        </div>
        <div className="card rounded-2xl p-6">
          <div className="text-sm text-[#a1a1aa]">Avg. Opportunity Score</div>
          <div className="mt-2 text-4xl font-semibold tracking-tighter">
            {reports.length > 0
              ? Math.round(reports.reduce((sum, r) => sum + (r.score || 0), 0) / reports.length)
              : '--'}
          </div>
        </div>
        <div className="card rounded-2xl p-6">
          <div className="text-sm text-[#a1a1aa]">Monthly Reports Used</div>
          <div className="mt-2 text-4xl font-semibold tracking-tighter">{quotaUsed} <span className="text-xl text-[#a1a1aa]">/ {quotaLimit}</span></div>
          <div className="text-xs text-[#22c55e] mt-1">Unlimited on Pro ($49/mo + setup fee)</div>
        </div>
        <div className="card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-sm text-[#a1a1aa]">Current Plan</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight capitalize">{tier === 'pro' ? 'Pro ($49/mo + Setup)' : tier}</div>
          </div>
          {tier === 'free' || tier === 'demo' ? (
            <Link href="/pricing" className="text-sm text-[#f59e0b] hover:underline inline-flex items-center gap-1 mt-3">
              Upgrade for unlimited <Zap className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link href="/settings" className="text-sm text-[#a1a1aa] hover:underline mt-3">Manage subscription →</Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/new-report"
          className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold"
        >
          <Plus className="h-4 w-4" /> Generate New Report
        </Link>
        <Link
          href="/reports"
          className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3"
        >
          <FileText className="h-4 w-4" /> View All Reports
        </Link>
        <Link
          href="/alerts"
          className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3"
        >
          <TrendingUp className="h-4 w-4" /> Manage Trend Alerts
        </Link>
      </div>

      {/* Highlight the Star Feature: Live Multi-Agent Research */}
      <div className="card rounded-3xl p-8 border-[#f59e0b]/30 bg-gradient-to-br from-[#0a0a0b] to-[#121214]">
        <div className="flex items-start justify-between gap-6 flex-col lg:flex-row">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-semibold tracking-widest mb-3">
              <Flame className="h-3.5 w-3.5" /> GROK HEAVY
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">Live 10-Agent Research Visualization</h3>
            <p className="mt-2 text-[#a1a1aa] max-w-md">
              Watch 10 specialized AI agents debate, research sources with live company logos, and synthesize a complete strategy in real time. The best way to experience NicheForge.
            </p>
            <Link href="/new-report" className="mt-4 inline-flex btn-primary px-6 py-2.5 rounded-2xl text-sm">
              Try Deep Research Now →
            </Link>
          </div>
          <div className="text-sm text-[#a1a1aa] lg:text-right space-y-1 pt-2">
            <div>✓ 20–90 second full conversation</div>
            <div>✓ Back-and-forth reasoning</div>
            <div>✓ Real-time sources + brand logos</div>
            <div>✓ Professional PDF with full log</div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Reports</h2>
          <Link href="/reports" className="text-sm text-[#f59e0b] hover:underline">
            View all saved reports →
          </Link>
        </div>

        {recentReports.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentReports.map((report: any) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="card group rounded-2xl p-5 transition hover:border-[#f59e0b]/40 flex flex-col"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="font-medium tracking-tight line-clamp-2 pr-1 flex-1">
                    {report.niche}
                  </div>
                  <div className="text-3xl font-semibold tabular-nums text-[#f59e0b] shrink-0">
                    {report.score}
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#a1a1aa]">
                  <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  <span className="uppercase tracking-widest px-2 py-0.5 rounded bg-[#27272a] text-[10px]">{report.depth}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card rounded-2xl p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-[#f59e0b]/60" />
            <p className="mt-4 text-lg font-medium">No reports yet</p>
            <p className="mt-1 text-[#a1a1aa]">Generate your first niche intelligence report with live 10-agent collaboration.</p>
            <Link href="/new-report" className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-2.5">
              <Plus className="h-4 w-4" /> Start Deep Research
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
