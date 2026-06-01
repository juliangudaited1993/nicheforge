import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ReportViewer from '@/components/ReportViewer';
import { deleteReport } from '@/app/actions';
import Link from 'next/link';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (!report) {
    // Demo reports are not in the database. The client will attempt recovery from localStorage.
    // We'll render a lightweight shell and let client JS hydrate the data.
  }

  // Hydrate full rich report (supports deep fields stored in full_data or top-level columns)
  const full = report.full_data || {};
  const formattedReport = {
    id: report.id,
    topic: report.topic || report.niche,
    score: report.score,
    depth: report.depth,
    summary: report.summary,
    metrics: report.metrics || full.metrics || [],
    insights: report.insights || full.insights || [],
    competitors: report.competitors || full.competitors || [],
    playbook: report.playbook || full.playbook || [],
    related: report.related || full.related || [],
    created_at: report.created_at,
    // Rich deep fields for complete on-screen + PDF experience
    market_analysis: report.market_analysis || full.market_analysis,
    trend_forecast: report.trend_forecast || full.trend_forecast,
    competitor_matrix: report.competitor_matrix || full.competitor_matrix,
    financial_projections: report.financial_projections || full.financial_projections,
    risk_assessment: report.risk_assessment || full.risk_assessment,
    detailed_sources: report.detailed_sources || full.detailed_sources,
    agent_collaboration_log: report.agent_collaboration_log || full.agent_collaboration_log,
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/reports" className="text-sm text-[#a1a1aa] hover:text-[#ededed]">← Back to all reports</Link>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              try {
                const { generateProfessionalPDF } = await import('@/lib/generateProfessionalPDF');
                generateProfessionalPDF(formattedReport as any);
              } catch (e) {
                console.error('Report detail PDF failed:', e);
                // In real app could use a toast here if imported
              }
            }}
            className="btn-primary px-5 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2"
          >
            Download Professional PDF
          </button>
          <form action={async () => {
            'use server';
            await deleteReport(id);
          }}>
            <button type="submit" className="text-sm text-red-400 hover:text-red-500 px-3 py-2">Delete</button>
          </form>
        </div>
      </div>

      <ReportViewer report={formattedReport} />
    </div>
  );
}
