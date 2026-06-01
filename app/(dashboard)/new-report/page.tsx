'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateAndSaveReport, getTrialStatus } from '@/app/actions';
import { NicheReport } from '@/lib/types'; // alias for ResearchReport (legacy compat)
import dynamic from 'next/dynamic';

const ReportViewer = dynamic(() => import('@/components/ReportViewer'), {
  ssr: false,
  loading: () => <div className="card rounded-3xl p-8 text-center text-[#a1a1aa]">Loading report preview...</div>,
});
import { Flame } from 'lucide-react';
import { toast } from 'sonner';
import MultiAgentResearch from '@/components/MultiAgentResearch';
import { generateProfessionalPDF } from '@/lib/generateProfessionalPDF';
import PDFCustomizer from '@/components/PDFCustomizer';

const DEPTHS = ['quick', 'standard', 'deep'] as const;

// New ResearchForge customization options
const RESEARCH_STYLES = [
  { value: 'corporate', label: 'Corporate / Business' },
  { value: 'legal', label: 'Legal / Regulatory' },
  { value: 'medical', label: 'Medical / Healthcare' },
  { value: 'academic', label: 'Academic / Scholarly' },
  { value: 'personal', label: 'Personal / Life' },
] as const;

const REPORT_LENGTHS = [
  { value: 'short', label: 'Short (8-12 pages)', pages: '8-12' },
  { value: 'medium', label: 'Medium (12-16 pages)', pages: '12-16' },
  { value: 'long', label: 'Long (16-22 pages)', pages: '16-22' },
] as const;

export default function NewReportPage() {
  const [topic, setTopic] = useState(''); // generalized from "niche"
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [researchStyle, setResearchStyle] = useState<'legal' | 'corporate' | 'medical' | 'personal' | 'academic'>('corporate');
  const [reportLength, setReportLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<NicheReport | null>(null);
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [showPDFCustomizer, setShowPDFCustomizer] = useState(false);
  const router = useRouter();

  // For long-running Deep visualizer: we fire the real Grok call immediately but let the scrolling
  // agent conversation fully play out (2+ min in Deep) before revealing the report.
  const [pendingGeneration, setPendingGeneration] = useState<Promise<any> | null>(null);

  // Ref for instant-jump to the agent conversation the moment user hits Generate (especially Deep)
  const visualizerAreaRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || topic.length < 4) {
      toast.error('Please enter a research topic with at least 4 characters');
      return;
    }

    setIsGenerating(true);
    setGeneratedReport(null);

    // Fire the real (or demo) Grok generation immediately in the background.
    // The MultiAgentResearch visualizer now controls the entire long preview duration.
    const genPromise = generateAndSaveReport(
      topic.trim(), 
      depth, 
      customInstructions,
      researchStyle,
      reportLength
    );
    setPendingGeneration(genPromise);

    // INSTANT JUMP: the moment the user hits Generate (especially Deep), scroll directly
    // to the live agent conversation roll so they can watch the agents speak in real time.
    // This matches the exact request: "once the user hits deep research the page should jump..."
    setTimeout(() => {
      if (visualizerAreaRef.current) {
        visualizerAreaRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        // Fallback: scroll the main card area
        window.scrollTo({ top: 280, behavior: 'smooth' });
      }
    }, 60);
  };

  const handleSaveAndView = () => {
    if (generatedReport?.id) {
      router.push(`/reports/${generatedReport.id}`);
    }
  };

  // Load trial status for messaging (demo-safe)
  useEffect(() => {
    getTrialStatus().then(setTrialStatus);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Generate Professional Research Report</h1>
        <p className="text-[#a1a1aa] mt-1">ResearchForge • Deep AI Research for Any Topic</p>
      </div>

      {!generatedReport && (
        <div className="card rounded-3xl p-8 md:p-10">
          {trialStatus?.isTrialActive && (
            <div className="mb-6 -mt-2 rounded-xl bg-[#f59e0b]/10 px-4 py-2 text-xs text-[#f59e0b]">
              7-day trial active — {trialStatus.daysLeft} day{trialStatus.daysLeft !== 1 ? 's' : ''} remaining ({trialStatus.used}/{trialStatus.limit} reports used)
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                RESEARCH TOPIC
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                placeholder="e.g. impact of AI on healthcare diagnostics, legal implications of remote work policies, or personal financial planning for early retirement"
                className="input w-full rounded-2xl px-6 py-4 text-xl placeholder:text-[#52525b]"
                disabled={isGenerating}
              />
            </div>

            {/* New ResearchForge Customization Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">RESEARCH STYLE</label>
                <select
                  value={researchStyle}
                  onChange={(e) => setResearchStyle(e.target.value as any)}
                  disabled={isGenerating}
                  className="input w-full rounded-2xl px-4 py-3"
                >
                  {RESEARCH_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">REPORT LENGTH</label>
                <select
                  value={reportLength}
                  onChange={(e) => setReportLength(e.target.value as any)}
                  disabled={isGenerating}
                  className="input w-full rounded-2xl px-4 py-3"
                >
                  {REPORT_LENGTHS.map((len) => (
                    <option key={len.value} value={len.value}>{len.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">RESEARCH DEPTH</label>
              <div className="flex rounded-2xl border border-[#27272a] overflow-hidden">
                {DEPTHS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDepth(d)}
                    disabled={isGenerating}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-all capitalize ${
                      depth === d
                        ? 'bg-[#f59e0b] text-black'
                        : 'hover:bg-[#1a1a1d] text-[#a1a1aa]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {depth === 'deep' && !isGenerating && (
                <div className="mt-2 text-[11px] text-[#f59e0b]/80">Deep mode = 21 agent messages, ~1m 40s of scrolling conversation with live sources &amp; logos. Perfect for previewing the exact experience.</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                ADDITIONAL INSTRUCTIONS (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                disabled={isGenerating}
                placeholder="Example: Focus heavily on digital product opportunities and TikTok traffic. Ignore physical products."
                className="input w-full rounded-2xl px-4 py-3 text-sm min-h-[80px] resize-y"
              />
            </div>

            {!isGenerating ? (
              <button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className="btn-primary w-full h-14 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-60"
              >
                Generate Report with Grok <Flame className="h-5 w-5" />
              </button>
            ) : (
              <div ref={visualizerAreaRef} id="agent-conversation-area" className="pt-1 -mx-1">
                <div className="mb-3 px-1 text-center text-sm text-[#a1a1aa]">
                  Running live 10-agent collaboration with Grok Heavy...
                </div>
                {/* Prominent header so the long scrolling conversation is the immediate focus */}
                <div className="mb-3 px-1 flex items-center justify-between">
                  <div>
                    <div className="text-[#f59e0b] text-xs tracking-[2px] font-semibold">LIVE MULTI-AGENT RESEARCH</div>
                    <div className="text-xl font-semibold tracking-tight text-[#ededed] mt-0.5">
                      {depth === 'deep' ? 'Deep Research — 10 Agents Speaking' : `${depth.charAt(0).toUpperCase() + depth.slice(1)} Research`}
                    </div>
                    <div className="text-sm text-[#a1a1aa] mt-0.5">Watch the full conversation roll • Sources &amp; links appear in real time • Demo mode preview</div>
                  </div>
                  <div className="text-right text-xs text-[#52525b] font-mono">GROK HEAVY<br />CLIENT-SIMULATED</div>
                </div>

                <MultiAgentResearch 
                  topic={topic} 
                  depth={depth}
                  researchStyle={researchStyle}
                  reportLength={reportLength}
                  onComplete={async () => {
                    // The long scrolling conversation (especially Deep 2+ min) has now fully played.
                    // Surface the real report (await if the Grok call is still finishing).
                    if (pendingGeneration) {
                      const result = await pendingGeneration;
                      if (result.success && result.report) {
                        const rawReport = result.report;

                        // ALWAYS normalize the report for ResearchForge shape before using it anywhere
                        const report = {
                          ...rawReport,
                          topic: rawReport.topic || rawReport.niche || 'Research Topic',
                          niche: rawReport.niche || rawReport.topic || 'Research Topic',
                          researchStyle: rawReport.researchStyle || researchStyle || 'corporate',
                          reportLength: rawReport.reportLength || reportLength || 'medium',
                        };

                        setGeneratedReport(report);
                        const isDemo = report.id?.startsWith('demo-');

                        // In Test/Demo mode, persist the normalized version to localStorage
                        if (isDemo) {
                          try {
                            const existing = JSON.parse(localStorage.getItem('researchforge_demo_reports') || '[]');
                            const alreadyExists = existing.some((r: any) => r.id === report.id);
                            if (!alreadyExists) {
                              existing.unshift(report);
                              localStorage.setItem('researchforge_demo_reports', JSON.stringify(existing.slice(0, 50)));
                            }
                          } catch (e) {}
                        }

                        toast.success(isDemo 
                          ? 'Report generated in Test Mode — saved to your local history' 
                          : 'Report generated and saved!');
                      } else {
                        toast.error(result.error || 'Failed to generate report. Please try a different topic or shorter query.');
                      }
                      setPendingGeneration(null);
                    }
                    setIsGenerating(false);

                    // After the full conversation finishes, gently bring the final report into view
                    setTimeout(() => {
                      const reportSection = document.getElementById('generated-report-section');
                      if (reportSection) {
                        reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 650);
                  }} 
                />
              </div>
            )}
            <p className="text-center text-xs text-[#52525b]">
              Uses real Grok Heavy (Multi-Agent) intelligence. Agents collaborate live in demo mode.
            </p>
          </div>
        </div>
      )}

      {generatedReport && (
        <div id="generated-report-section" className="space-y-6">
          {/* Big attractive WOW PDF CTA — the main deliverable after the long agent conversation */}
          <div className="rounded-3xl border-2 border-[#f59e0b] bg-gradient-to-br from-[#0a0a0b] via-[#121214] to-[#0a0a0b] p-8 md:p-10 text-center">
            <div className="uppercase tracking-[3px] text-[#f59e0b] text-sm font-semibold mb-2">YOUR RESEARCH IS COMPLETE</div>
            <h2 className="text-4xl font-semibold tracking-tighter mb-3">Download Your Complete Professional Report</h2>
            <p className="text-[#a1a1aa] max-w-2xl mx-auto mb-6">
              15–40 page investor-grade PDF including full agent collaboration log, detailed financial projections, 
              competitor matrix, credibility-rated sources, 90-day action plan, and everything the 10 agents discovered.
            </p>

            <button
              onClick={() => setShowPDFCustomizer(true)}
              className="inline-flex items-center justify-center gap-3 bg-[#f59e0b] hover:bg-[#fbbf24] active:bg-[#d97706] text-black font-semibold text-lg px-12 h-14 rounded-2xl shadow-xl shadow-[#f59e0b]/20 transition-all active:scale-[0.985]"
            >
              <span>📄</span>
              CUSTOMIZE &amp; DOWNLOAD PDF
            </button>

            <div className="mt-4 text-xs text-[#52525b]">Includes every insight from the live multi-agent conversation above • Print-ready • Professional formatting</div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight">Detailed On-Screen Report</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setGeneratedReport(null);
                  setTopic('');
                }}
                className="btn-secondary rounded-2xl px-6 py-2"
              >
                Generate Another
              </button>
              {generatedReport.id?.startsWith('demo-') ? (
                <div className="text-sm text-[#a1a1aa] px-4 py-2">Demo mode — fully functional preview</div>
              ) : (
                <button
                  onClick={handleSaveAndView}
                  className="btn-primary rounded-2xl px-6 py-2 font-semibold"
                >
                  View Full Report →
                </button>
              )}
            </div>
          </div>

          <ReportViewer report={generatedReport} />

          {/* PDF Customization Modal */}
          <PDFCustomizer
            report={generatedReport}
            isOpen={showPDFCustomizer}
            onClose={() => setShowPDFCustomizer(false)}
            userTier="unlimited" // In Test Mode unlock all; in production pass real tier from profile
          />
        </div>
      )}
    </div>
  );
}
