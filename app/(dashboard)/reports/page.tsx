'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'score'>('newest');
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reports: real ones (if any) + demo/test mode localStorage reports
  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      let realReports: any[] = [];
      try {
        // Dynamic import to avoid server action issues in pure client context for Test Mode
        const { getUserReports } = await import('@/app/actions');
        realReports = await getUserReports();
      } catch (e) {
        console.warn('Could not load real reports (expected in pure Test Mode)');
      }

      let demoReports: any[] = [];
      try {
        const stored = localStorage.getItem('researchforge_demo_reports');
        if (stored) demoReports = JSON.parse(stored);
      } catch {}

      // Dedupe by id
      const combined = [...demoReports, ...realReports];
      const unique = combined.filter((r, index, self) => 
        index === self.findIndex((t) => t.id === r.id)
      );

      setAllReports(unique);
      setLoading(false);
    }
    loadReports();
  }, []);

  const filtered = [...allReports]
    .filter(r => (r.topic || r.niche || '').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'score') return (b.score || 0) - (a.score || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  const handleQuickPDF = async (report: any) => {
    try {
      const { generateProfessionalPDF } = await import('@/lib/generateProfessionalPDF');
      generateProfessionalPDF(report);
    } catch (e) {
      console.error('Quick PDF export failed:', e);
      toast.error('Could not generate PDF.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Saved Reports</h1>
          <p className="text-[#a1a1aa]">All your research reports. Full professional PDFs with agent logs and sources available instantly.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#52525b]" />
            <input 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              placeholder="Search topics or reports..." 
              className="input pl-11 w-full rounded-2xl" 
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value as any)}
              className="input rounded-2xl px-4 py-2 text-sm flex-1 sm:flex-none"
            >
              <option value="newest">Newest first</option>
              <option value="score">Highest score</option>
            </select>
            <Link href="/new-report" className="btn-primary px-5 py-2 rounded-2xl text-sm whitespace-nowrap">+ New</Link>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card rounded-3xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[#f59e0b]/50" />
          <p className="mt-6 text-xl">No reports found</p>
          <Link href="/new-report" className="btn-primary mt-6 inline-block rounded-2xl px-8 py-3">Generate Your First Report</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r: any) => (
            <div key={r.id} className="card group rounded-2xl p-6 hover:border-[#f59e0b]/40 transition flex flex-col">
              <Link href={`/reports/${r.id}`} className="block flex-1">
                <div className="font-semibold tracking-tight text-lg line-clamp-2 pr-2">{r.topic || r.niche}</div>
                <div className="flex items-baseline justify-between mt-6">
                  <div className="text-4xl font-semibold tabular-nums tracking-tighter text-[#f59e0b]">{r.score}</div>
                  <div className="text-right text-xs text-[#a1a1aa]">
                    {new Date(r.created_at).toLocaleDateString()}<br />
                    <span className="uppercase tracking-widest text-[10px]">{r.depth}</span>
                  </div>
                </div>
              </Link>

              <div className="flex gap-2 mt-5 pt-4 border-t border-[#27272a]">
                <Link href={`/reports/${r.id}`} className="flex-1 text-center text-sm py-2 rounded-xl bg-[#121214] hover:bg-[#1f1f23] transition">
                  View Full Report
                </Link>
                <button 
                  onClick={() => handleQuickPDF(r)}
                  className="flex items-center gap-1.5 px-4 text-sm py-2 rounded-xl bg-[#f59e0b] text-black hover:bg-[#fbbf24] font-medium"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
