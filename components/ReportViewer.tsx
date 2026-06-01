'use client';

import { NicheReport } from '@/lib/types';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { generateProfessionalPDF } from '@/lib/generateProfessionalPDF';
import { toast } from 'sonner';

interface Props {
  report: NicheReport;
  onReforge?: () => void;
}

export default function ReportViewer({ report, onReforge }: Props) {
  const exportMarkdown = () => {
    const md = `# ResearchForge Report: ${report.niche || report.topic || 'Research Report'}

**Score:** ${report.score}/100  
**Depth:** ${report.depth}  
**Generated:** ${report.created_at ? new Date(report.created_at).toLocaleString() : 'Just now'}

## Executive Summary
${report.summary}

## Validation Metrics
${report.metrics.map(m => `- **${m.label}:** ${m.value}/100 — ${m.note}`).join('\n')}

## Key Insights
${report.insights.map(i => `- ${i}`).join('\n')}

## Competitor Landscape
${(report.competitors || []).map(c => `### ${c.name}\n- **Strength:** ${c.strength}\n- **Gap:** ${c.gap}`).join('\n\n')}

## Action Playbook
${report.playbook.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Related Topics
${report.related.map(r => `- ${r}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (report.topic || report.niche || 'research-report').toLowerCase().replace(/\s+/g, '-');
    a.download = `${safeName}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    try {
      generateProfessionalPDF(report);
    } catch (e) {
      console.error('PDF generation failed:', e);
      toast.error('Failed to generate PDF. The report data may be incomplete.');
    }
  };

  return (
    <div data-report-viewer className="card rounded-3xl overflow-hidden border-[#f59e0b]/20">
      <div className="bg-[#121214] px-8 py-6 border-b border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs tracking-[2px] text-[#f59e0b] uppercase">RESEARCH SCORE</div>
          <h3 className="text-3xl font-semibold tracking-tighter pr-4">{report.topic || report.niche}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-5xl font-semibold tabular-nums tracking-tighter text-[#f59e0b]">{report.score}</div>
            <div className="text-xs text-[#a1a1aa] -mt-1">/100</div>
          </div>
          <div>
            <div className="text-sm font-medium">{report.score > 82 ? 'EXCEPTIONAL' : report.score > 70 ? 'STRONG' : 'PROMISING'}</div>
            <div className="text-xs text-[#a1a1aa]">{report.depth} research</div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-9">
        {/* Summary */}
        <div>
          <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">EXECUTIVE SUMMARY</div>
          <p className="text-lg leading-snug text-[#ededed]">{report.summary}</p>
        </div>

        {/* Metrics */}
        <div>
          <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-4">VALIDATION METRICS</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {report.metrics.map((m, i) => (
              <div key={i} className="bg-[#121214] rounded-2xl p-5 border border-[#27272a]">
                <div className="text-sm text-[#a1a1aa]">{m.label}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tighter tabular-nums">{m.value}</span>
                  <span className="text-[#a1a1aa]">/100</span>
                </div>
                <div className="mt-3 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]" style={{ width: `${m.value}%` }} />
                </div>
                <div className="text-xs text-[#a1a1aa] mt-2">{m.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights + Competitors */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">KEY INSIGHTS</div>
            <ul className="space-y-3">
              {report.insights.map((insight, i) => (
                <li key={i} className="flex gap-3 text-[15px]">
                  <span className="text-[#f59e0b] mt-1.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">COMPETITOR GAPS</div>
            <div className="space-y-3">
              {report.competitors.map((c, i) => (
                <div key={i} className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 text-sm">
                  <div className="font-medium mb-1.5">{c.name}</div>
                  <div className="text-[#a1a1aa] text-xs leading-relaxed">
                    <span className="text-[#22c55e]">Strength:</span> {c.strength}<br />
                    <span className="text-[#f59e0b]">Gap:</span> {c.gap}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Playbook */}
        <div>
          <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">ACTION PLAYBOOK</div>
          <ol className="grid md:grid-cols-2 gap-3 text-[15px]">
            {report.playbook.map((step, i) => (
              <li key={i} className="bg-[#121214] p-4 rounded-2xl border border-[#27272a] flex gap-3">
                <span className="font-mono text-[#f59e0b] w-5 shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Rich Deep-Mode Sections (makes the on-screen report feel complete & substantial) */}
        {report.financial_projections && (
          <div>
            <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">FINANCIAL PROJECTIONS</div>
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 text-sm grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-[#a1a1aa] text-xs">TAM / SAM / SOM</div>
                <div className="mt-1 font-medium">{report.financial_projections.estimated_tam} / {report.financial_projections.sam} / {report.financial_projections.som}</div>
              </div>
              <div>
                <div className="text-[#a1a1aa] text-xs">Year 1 Potential</div>
                <div className="mt-1 text-lg font-semibold text-[#f59e0b]">{report.financial_projections.revenue_potential_year1}</div>
              </div>
              <div>
                <div className="text-[#a1a1aa] text-xs">Year 3 Potential</div>
                <div className="mt-1 text-lg font-semibold text-[#f59e0b]">{report.financial_projections.revenue_potential_year3}</div>
              </div>
              {report.financial_projections.key_assumptions?.length > 0 && (
                <div className="md:col-span-3 mt-3 pt-3 border-t border-[#27272a] text-xs text-[#a1a1aa]">
                  Key assumptions: {report.financial_projections.key_assumptions.join(' • ')}
                </div>
              )}
            </div>
          </div>
        )}

        {report.detailed_sources && report.detailed_sources.length > 0 && (
          <div>
            <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">DETAILED SOURCES &amp; CREDIBILITY</div>
            <div className="space-y-3">
              {report.detailed_sources.slice(0, 6).map((s, i) => (
                <div key={i} className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 text-sm">
                  <div className="font-medium">{s.title}</div>
                  <a href={s.url} target="_blank" className="text-[#f59e0b] text-xs break-all hover:underline">{s.url}</a>
                  <div className="text-[#a1a1aa] text-xs mt-1 line-clamp-2">{s.summary}</div>
                  <div className="text-[10px] text-[#52525b] mt-1">Credibility: {s.credibility}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.agent_collaboration_log && report.agent_collaboration_log.length > 0 && (
          <div>
            <div className="uppercase tracking-widest text-xs text-[#f59e0b] mb-3">AGENT COLLABORATION LOG (10-AGENT PROCESS)</div>
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 text-xs space-y-3 max-h-[280px] overflow-auto">
              {report.agent_collaboration_log.slice(0, 8).map((log, i) => (
                <div key={i} className="border-l-2 border-[#f59e0b]/40 pl-3">
                  <span className="font-semibold text-[#f59e0b]">{log.agent}</span> — {log.step}
                  <div className="text-[#a1a1aa] mt-0.5 leading-snug">{log.reasoning.substring(0, 220)}{log.reasoning.length > 220 ? '…' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions — PDF is now the star via the big hero above */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#27272a]">
          <button onClick={exportPDF} className="btn-primary flex items-center gap-2 px-6 h-10 rounded-2xl text-sm font-semibold">
            <FileText className="h-4 w-4" /> Download Full Professional PDF
          </button>
          <button onClick={exportMarkdown} className="btn-secondary flex items-center gap-2 px-5 h-10 rounded-2xl text-sm">
            <Download className="h-4 w-4" /> Export Markdown
          </button>
          {onReforge && (
            <button onClick={onReforge} className="btn-secondary flex items-center gap-2 px-5 h-10 rounded-2xl text-sm">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
