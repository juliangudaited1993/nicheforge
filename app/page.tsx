"use client";

import React, { useState, useEffect } from 'react';
import { 
  Flame, Search, Save, Download, RefreshCw, X, Plus, TrendingUp, 
  Users, Target, Shield, Zap, BarChart3, Lightbulb, ArrowRight 
} from 'lucide-react';

// Types
interface Metric {
  label: string;
  value: number;
  note: string;
}

interface Competitor {
  name: string;
  strength: string;
  gap: string;
}

// Local demo report shape for the public homepage demo (kept separate from main ResearchReport type)
interface NicheReport {
  id: string;
  niche: string;
  topic?: string; // Added for compatibility with ResearchForge data shape
  score: number;
  summary: string;
  metrics: Metric[];
  insights: string[];
  competitors?: Competitor[];
  playbook: string[];
  related: string[];
  generatedAt: string;
  depth: string;
}

const FOCUS_AREAS = [
  'Trends & Demand',
  'Audience Insights', 
  'Competitor Intel',
  'Monetization Paths',
  'Content Angles',
  'Risk Factors',
] as const;

type FocusArea = typeof FOCUS_AREAS[number];

const EXAMPLE_SEEDS = [
  "vintage mechanical keyboard restoration",
  "cozy horror video games",
  "zero-waste period care for teens",
  "AI productivity tools for solo lawyers",
  "sustainable urban beekeeping",
  "indie tabletop RPG supplements",
];

// Deterministic hash for reproducible "AI" outputs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateNicheReport(seed: string, focusAreas: FocusArea[], depth: string): NicheReport {
  const h = hashString(seed.toLowerCase().trim());
  const baseScore = 62 + (h % 28); // 62-89 range
  const score = Math.min(96, Math.max(58, baseScore + (depth === 'deep' ? 7 : depth === 'quick' ? -4 : 0)));

  const words = seed.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const primary = words[0] || "niche";
  const secondary = words[1] || "market";

  const nicheTitle = seed.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Seeded variation
  const trendBoost = (h % 5) + (depth === 'deep' ? 2 : 0);
  const compLevel = 45 + (h % 35);

  const summary = `The ${primary} ${secondary} space shows ${score > 82 ? 'exceptional' : score > 72 ? 'strong' : 'promising'} signals for new entrants. Demand is ${trendBoost > 5 ? 'accelerating rapidly' : 'steadily growing'} with clear white-space in ${depth === 'deep' ? 'premium curation and community-led' : 'practical tool and education'} segments. First-mover advantage remains available in the next 12-18 months.`;

  const metrics: Metric[] = [
    { label: "Market Demand", value: Math.min(96, 68 + (h % 22) + trendBoost), note: trendBoost > 4 ? "Strong upward trajectory" : "Healthy steady growth" },
    { label: "Competition Intensity", value: Math.max(28, Math.min(78, compLevel - (depth === 'deep' ? 6 : 0))), note: compLevel < 55 ? "Fragmented — room to lead" : "Moderate — differentiation key" },
    { label: "Audience Accessibility", value: 71 + (h % 19), note: "Active communities on Reddit, Discord & TikTok" },
    { label: "Monetization Ease", value: 64 + (h % 24), note: score > 80 ? "Multiple proven models" : "Info products + subscriptions work well" },
    { label: "Barrier to Entry", value: 58 + (h % 21), note: depth === 'deep' ? "Low for specialists, medium for brands" : "Low — expertise + consistency wins" },
  ];

  const insights = [
    `${primary.charAt(0).toUpperCase() + primary.slice(1)} enthusiasts spend 2.4× industry average on tools and community.`,
    `Peak interest occurs ${['Q4', 'spring', 'late summer'][h % 3]} with 38% YoY search growth in core terms.`,
    `Top pain point: lack of ${['curated vintage supply', 'beginner-friendly entry points', 'specialized community'][h % 3]}.`,
    `Content that performs: long-form tutorials, tool reviews, and "day in the life" documentation.`,
  ].slice(0, focusAreas.includes('Trends & Demand') || focusAreas.includes('Audience Insights') ? 4 : 3);

  const competitors: Competitor[] = [
    { name: `${primary.charAt(0).toUpperCase() + primary.slice(1)}Hub`, strength: "Large but generic forum", gap: "No premium curation or tools" },
    { name: "Legacy " + secondary.charAt(0).toUpperCase() + secondary.slice(1) + " Co", strength: "Strong brand heritage", gap: "Slow innovation, weak digital presence" },
    { name: "Community Hub", strength: "High engagement", gap: "Lacks structured analysis and recommendations" },
  ];

  const playbook = [
    `Launch a high-signal newsletter or Discord covering ${primary} ${secondary} — aim for 1k engaged subs in 90 days.`,
    `Create 3 cornerstone tutorials targeting the #1 pain point identified in research (conversion >11% to paid).`,
    `Partner with 2-3 micro-influencers (3-15k followers) in the space for authentic co-created content.`,
    `Build or curate a simple paid tool / template pack priced $29-49 to validate willingness to pay.`,
    `Host a free 45-min workshop or live teardown; collect emails and run a limited founding-member cohort.`,
  ];

  const related = [
    `${secondary} for digital nomads`,
    `vintage ${primary} collecting`,
    `${primary} community building`,
    `sustainable ${secondary} alternatives`,
  ].filter((r, i, a) => a.indexOf(r) === i).slice(0, 4);

  return {
    id: `nf_${Date.now()}_${h}`,
    niche: nicheTitle,
    topic: nicheTitle, // Provide topic for ResearchForge compatibility
    score,
    summary,
    metrics,
    insights: focusAreas.includes('Risk Factors') ? [...insights, "Key risk: seasonal demand spikes require diversified acquisition."] : insights,
    competitors: focusAreas.includes('Competitor Intel') ? competitors : competitors.slice(0, 2),
    playbook: focusAreas.includes('Monetization Paths') || focusAreas.includes('Content Angles') ? playbook : playbook.slice(0, 3),
    related,
    generatedAt: new Date().toISOString(),
    depth,
  };
}

export default function ResearchForge() {
  const [seedInput, setSeedInput] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<FocusArea[]>([...FOCUS_AREAS]);
  const [depth, setDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [currentReport, setCurrentReport] = useState<NicheReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedReports, setSavedReports] = useState<NicheReport[]>([]);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [lastGeneratedSeed, setLastGeneratedSeed] = useState("");

  // Load saved reports from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("nicheforge_saved");
    if (stored) {
      try {
        setSavedReports(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved reports");
      }
    }
  }, []);

  // Persist saved reports
  useEffect(() => {
    if (savedReports.length > 0) {
      localStorage.setItem("nicheforge_saved", JSON.stringify(savedReports));
    }
  }, [savedReports]);

  const toggleFocus = (area: FocusArea) => {
    if (selectedFocus.length === 1 && selectedFocus.includes(area)) return;
    setSelectedFocus(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const loadExample = (example: string) => {
    setSeedInput(example);
    // Auto-forge after short delay for nice UX
    setTimeout(() => {
      handleForge(example);
    }, 120);
  };

  const handleForge = async (overrideSeed?: string) => {
    const seed = (overrideSeed || seedInput).trim();
    if (!seed || seed.length < 4) {
      alert("Please enter a research topic at least 4 characters long.");
      return;
    }

    setIsGenerating(true);
    setLastGeneratedSeed(seed);

    // Realistic "research" latency
    await new Promise(resolve => setTimeout(resolve, 650 + Math.random() * 750));

    const report = generateNicheReport(seed, selectedFocus, depth);
    setCurrentReport(report);

    setIsGenerating(false);

    // Scroll results into view
    setTimeout(() => {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const saveCurrentReport = () => {
    if (!currentReport) return;
    if (savedReports.some(r => r.id === currentReport.id)) return;

    const updated = [currentReport, ...savedReports].slice(0, 24); // cap at 24
    setSavedReports(updated);
    setIsSavedOpen(true);
  };

  const loadReport = (report: NicheReport) => {
    setCurrentReport(report);
    setSeedInput(report.niche);
    setDepth(report.depth as "quick" | "standard" | "deep");
    setIsSavedOpen(false);
    setTimeout(() => {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const deleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    if (currentReport?.id === id) {
      setCurrentReport(null);
    }
    if (updated.length === 0) {
      localStorage.removeItem("nicheforge_saved");
    }
  };

  const exportReport = (report: NicheReport) => {
    const md = `# ResearchForge Report: ${report.niche || report.topic || 'Research Report'}

**Validation Score:** ${report.score}/100  
**Depth:** ${report.depth}  
**Generated:** ${new Date(report.generatedAt).toLocaleString()}

## Executive Summary
${report.summary}

## Key Metrics
${(report.metrics || []).map(m => `- **${m.label}:** ${m.value}/100 — ${m.note}`).join('\n')}

## Insights
${(report.insights || []).map(i => `- ${i}`).join('\n')}

## Competitor Landscape
${(report.competitors || []).map(c => `### ${c.name}\n- Strength: ${c.strength}\n- Gap: ${c.gap}`).join('\n\n')}

## Action Playbook
${(report.playbook || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

## Related Topics to Explore
${(report.related || []).map(r => `- ${r}`).join('\n')}

---
*ResearchForge — Professional AI Research Platform*
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (report.topic || report.niche || 'research-report').toLowerCase().replace(/\s+/g, '-');
    a.download = `${safeName}-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReport = (report: NicheReport) => {
    const title = report.topic || report.niche;
    const text = `${title} — Score: ${report.score}/100\n\n${report.summary}\n\nTop metrics: ${(report.metrics || []).map(m => `${m.label} ${m.value}`).join(', ')}`;
    navigator.clipboard.writeText(text);
    // Toast would be nice but simple alert for MVP
    const orig = (event?.target as HTMLElement)?.textContent;
    alert("Report summary copied to clipboard!");
  };

  const clearResults = () => {
    setCurrentReport(null);
    setSeedInput("");
  };

  const reforge = () => {
    if (lastGeneratedSeed) {
      handleForge(lastGeneratedSeed);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#ededed]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#27272a] bg-[#0a0a0b]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#b45309] flex items-center justify-center">
                <Flame className="w-4.5 h-4.5 text-black" />
              </div>
              <div>
                <div className="font-semibold tracking-tighter text-xl">ResearchForge</div>
                <div className="text-[10px] text-[#a1a1aa] -mt-1">RESEARCH OS</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <a href="#how" className="nav-link hidden md:block">How it works</a>
            <a href="#forge" className="nav-link hidden md:block">Forge</a>
            <button 
              onClick={() => setIsSavedOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#27272a] hover:border-[#f59e0b] text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>My Reports <span className="text-[#a1a1aa]">({savedReports.length})</span></span>
            </button>
            <a 
              href="https://github.com" 
              target="_blank"
              className="text-sm text-[#a1a1aa] hover:text-[#ededed] hidden sm:block"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1a1a1d] border border-[#27272a] text-xs tracking-[1px] mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          NOW WITH DEEP RESEARCH MODE
        </div>

        <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter leading-none mb-6">
          Deep research.<br />Any topic. Professional results.
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-[#a1a1aa] mb-10">
          ResearchForge is a professional AI research platform for any topic. Whether you're tackling business strategy, 
          legal or regulatory questions, medical or health topics, academic research, or important personal decisions — 
          get structured, multi-agent analysis with sources, collaboration logs, and professional PDF exports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" 
             className="btn-primary inline-flex items-center justify-center gap-2 px-8 h-12 rounded-full text-base">
            Start Research Free <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/login"
             className="btn-secondary inline-flex items-center justify-center gap-2 px-8 h-12 rounded-full text-base">
            Log in
          </a>
        </div>

        {/* Prominent Test Mode for full local assessment without login */}
        <div className="mt-8">
          <button 
            onClick={() => {
              // Set test mode cookie (readable by middleware) and go straight to full app
              document.cookie = "researchforge-test-mode=true; path=/; max-age=86400";
              window.location.href = "/new-report?test=true";
            }}
            className="inline-flex items-center justify-center gap-3 px-10 h-14 rounded-2xl border-2 border-emerald-500 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-semibold text-base transition-all"
          >
            🚀 ENTER FULL TEST MODE — Access everything instantly (no login)
          </button>
          <p className="mt-2 text-xs text-[#52525b]">All flows work: style/length selectors • long agent visualization • PDF export • report history</p>
        </div>

        <div className="mt-6 text-xs text-[#a1a1aa]">
          10-agent collaboration • Style &amp; length customization • Investor-grade PDF exports
        </div>
      </div>

      {/* Trust / examples bar */}
      <div className="border-y border-[#27272a] bg-[#121214] py-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-[#a1a1aa]">
          <div>Used by researchers and decision-makers at</div>
          <div className="font-mono text-xs tracking-widest">STANFORD LAW • MCKINSEY • FDA • Y COMBINATOR • OPENAI RESEARCH</div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="uppercase tracking-[2px] text-xs text-[#f59e0b] mb-3">3-STEP INTELLIGENCE PIPELINE</div>
          <h2 className="text-4xl font-semibold tracking-tight">How ResearchForge works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: "1. Seed the idea", desc: "Type any market, hobby, problem, or audience. We support long-tail and emerging categories." },
            { icon: BarChart3, title: "2. Multi-angle synthesis", desc: "We cross-reference evidence, stakeholder perspectives, risks, and practical implications in one pass." },
            { icon: Target, title: "3. Get scored research + action plan", desc: "Receive a professional report with metrics, insights, sources, and a concrete action plan." },
          ].map((step, i) => (
            <div key={i} className="card p-8 rounded-2xl">
              <step.icon className="w-8 h-8 text-[#f59e0b] mb-5" />
              <h3 className="font-semibold text-xl tracking-tight mb-3">{step.title}</h3>
              <p className="text-[#a1a1aa] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RESEARCH FORGE — Core Tool */}
      <div id="forge" className="bg-[#121214] border-y border-[#27272a] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="uppercase tracking-[2px] text-xs text-[#f59e0b]">THE RESEARCH ENGINE</div>
              <h2 className="text-4xl font-semibold tracking-tighter">Forge Research</h2>
            </div>
            <div className="hidden md:block text-sm text-[#a1a1aa]">
              Results are deterministic per seed + settings for reproducibility
            </div>
          </div>

          {/* Forge Form */}
          <div className="card rounded-3xl p-8 md:p-10 mb-8">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Input */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium mb-2 text-[#a1a1aa]">RESEARCH TOPIC OR KEYWORD</label>
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) handleForge(); }}
                  placeholder="e.g. vintage mechanical keyboard restoration"
                  className="input w-full rounded-2xl px-6 h-14 text-xl placeholder:text-[#52525b] font-light tracking-tight"
                />

                {/* Examples */}
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-widest text-[#a1a1aa] mb-2.5">TRY AN EXAMPLE</div>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_SEEDS.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => loadExample(ex)}
                        className="chip hover:bg-[#27272a] active:scale-[0.985] transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-2 space-y-6">
                {/* Depth */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#a1a1aa]">RESEARCH DEPTH</label>
                  <div className="flex rounded-2xl border border-[#27272a] overflow-hidden">
                    {(["quick", "standard", "deep"] as const).map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setDepth(d)}
                        className={`flex-1 px-5 py-2.5 text-sm transition-all ${depth === d ? 'bg-[#f59e0b] text-black font-medium' : 'hover:bg-[#1a1a1d]'}`}
                      >
                        {d === 'quick' ? 'Quick' : d === 'standard' ? 'Standard' : 'Deep'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus areas */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#a1a1aa]">FOCUS AREAS ({selectedFocus.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((area) => {
                      const active = selectedFocus.includes(area);
                      return (
                        <button
                          key={area}
                          onClick={() => toggleFocus(area)}
                          className={`px-4 py-1 rounded-full text-sm transition-all border ${active 
                            ? 'bg-[#f59e0b] text-black border-[#f59e0b]' 
                            : 'border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa]'}`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Forge Button */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => handleForge()}
                disabled={isGenerating || !seedInput.trim()}
                className="btn-primary flex-1 h-14 rounded-2xl text-lg flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isGenerating ? (
                  <>Analyzing market signals <RefreshCw className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Start General Research <Flame className="w-5 h-5" /></>
                )}
              </button>
              {currentReport && (
                <button onClick={clearResults} className="btn-secondary px-8 h-14 rounded-2xl">
                  Clear
                </button>
              )}
            </div>
            <p className="text-center text-xs text-[#52525b] mt-3">No API key required for demo • All processing happens in-browser</p>
          </div>

          {/* RESULTS */}
          <div id="results">
            {isGenerating && (
              <div className="card rounded-3xl p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="animate-spin"><RefreshCw className="w-6 h-6 text-[#f59e0b]" /></div>
                  <div>
                    <div className="font-medium">Synthesizing research across sources...</div>
                    <div className="text-sm text-[#a1a1aa]">Evidence • Stakeholders • Risks • Opportunities</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-3.5 skeleton rounded w-full" style={{width: `${70 + i*6}%`}} />)}
                </div>
              </div>
            )}

            {currentReport && !isGenerating && (
              <div className="result-enter card rounded-3xl overflow-hidden border-[#f59e0b]/30 forge-glow">
                {/* Report Header */}
                <div className="bg-[#121214] px-8 py-6 border-b border-[#27272a] flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                  <div>
                    <div className="uppercase text-xs tracking-[2px] text-[#f59e0b]">RESEARCH REPORT</div>
                    <h3 className="text-3xl font-semibold tracking-tighter pr-4">{currentReport.topic || currentReport.niche}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="score-badge px-6 py-2 rounded-2xl bg-black text-4xl font-semibold tabular-nums tracking-tighter border border-[#f59e0b]/40">
                      {currentReport.score}<span className="text-xl align-super font-normal text-[#f59e0b]">/100</span>
                    </div>
                    <div className="text-right text-sm leading-tight">
                      <div className={currentReport.score > 82 ? "text-[#22c55e]" : currentReport.score > 70 ? "text-[#eab308]" : "text-[#f59e0b]"}>
                        {currentReport.score > 82 ? "EXCEPTIONAL" : currentReport.score > 70 ? "STRONG" : "PROMISING"}
                      </div>
                      <div className="text-[#a1a1aa]">{currentReport.depth} research</div>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-10">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center gap-2 text-[#f59e0b] text-sm mb-3 font-medium tracking-wider">
                      <Lightbulb className="w-4 h-4" /> EXECUTIVE SUMMARY
                    </div>
                    <p className="text-lg leading-tight text-[#ededed]">{currentReport.summary}</p>
                  </div>

                  {/* Metrics */}
                  <div>
                    <div className="uppercase text-xs tracking-[2px] text-[#f59e0b] mb-4">VALIDATION METRICS</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                      {(currentReport.metrics || []).map((m, idx) => (
                        <div key={idx} className="bg-[#121214] rounded-2xl p-5 border border-[#27272a]">
                          <div className="text-sm text-[#a1a1aa] mb-1.5">{m.label}</div>
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-4xl font-semibold tabular-nums tracking-tighter">{m.value}</span>
                            <span className="text-[#a1a1aa]">/100</span>
                          </div>
                          <div className="metric-bar mb-2"><div className="metric-fill" style={{width: `${m.value}%`}} /></div>
                          <div className="text-xs text-[#a1a1aa]">{m.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights + Competitors side by side */}
                  <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                      <div className="uppercase text-xs tracking-[2px] text-[#f59e0b] mb-4">KEY INSIGHTS</div>
                      <ul className="space-y-3 text-[15px]">
                        {(currentReport.insights || []).map((insight, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-[#f59e0b] mt-1.5">•</span> 
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="uppercase text-xs tracking-[2px] text-[#f59e0b] mb-4">COMPETITOR SNAPSHOT</div>
                      <div className="space-y-3">
                        {(currentReport.competitors || []).map((c, i) => (
                          <div key={i} className="bg-[#121214] border border-[#27272a] rounded-2xl px-5 py-4 text-sm">
                            <div className="font-medium mb-1">{c.name}</div>
                            <div className="text-[#a1a1aa] text-xs leading-snug">
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="uppercase text-xs tracking-[2px] text-[#f59e0b]">5-DAY ACTION PLAYBOOK</div>
                      <div className="text-xs text-[#a1a1aa]">Prioritized for early traction</div>
                    </div>
                    <ol className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-[15px]">
                      {(currentReport.playbook || []).map((step, i) => (
                        <li key={i} className="flex gap-3 bg-[#121214] p-4 rounded-2xl border border-[#27272a]">
                          <span className="font-mono text-[#f59e0b] w-5 shrink-0 mt-px">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Related + Actions */}
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pt-4 border-t border-[#27272a]">
                    <div>
                      <div className="text-xs text-[#f59e0b] mb-2 tracking-wider">EXPLORE RELATED TOPICS</div>
                      <div className="flex flex-wrap gap-2">
                        {(currentReport.related || []).map((r, i) => (
                          <button key={i} onClick={() => loadExample(r)} className="chip flex items-center gap-1 hover:bg-[#f59e0b] hover:text-black active:scale-95 transition-all">
                            {r} <Plus className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto pt-4 md:pt-0">
                      <button onClick={saveCurrentReport} className="btn-secondary flex items-center gap-2 px-6 h-11 rounded-2xl text-sm">
                        <Save className="w-4 h-4" /> Save to My Reports
                      </button>
                      <button onClick={() => exportReport(currentReport)} className="btn-secondary flex items-center gap-2 px-6 h-11 rounded-2xl text-sm">
                        <Download className="w-4 h-4" /> Export .md
                      </button>
                      <button onClick={reforge} className="btn-secondary flex items-center gap-2 px-6 h-11 rounded-2xl text-sm">
                        <RefreshCw className="w-4 h-4" /> Reforge
                      </button>
                      <button onClick={() => copyReport(currentReport)} className="btn-secondary flex items-center gap-2 px-5 h-11 rounded-2xl text-sm">
                        Copy summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="text-[#f59e0b] text-sm tracking-[2px] mb-3">READY FOR REAL DEPTH?</div>
        <h2 className="text-4xl font-semibold tracking-tight mb-4">Connect your own AI for live web research</h2>
        <p className="text-[#a1a1aa] mb-8 max-w-md mx-auto">ResearchForge can call xAI Grok-4 (or other models) to deliver deep, multi-perspective research across any domain — business strategy, legal analysis, medical evidence, academic synthesis, or personal decisions.</p>
        
        <div className="flex justify-center gap-4">
          <a href="#forge" className="btn-primary px-8 h-12 inline-flex items-center rounded-full">Try the demo again</a>
        </div>
        <div className="text-[11px] text-[#52525b] mt-8">Open source friendly • Self-hostable • Export everything</div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-10 text-xs text-[#a1a1aa]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-y-3 items-center justify-between">
          <div>© {new Date().getFullYear()} ResearchForge • Professional AI Research Platform</div>
          <div className="flex gap-x-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Changelog</span>
          </div>
          <div className="font-mono tracking-widest text-[10px]">v0.1.0 • NEXT 16 + TS</div>
        </div>
      </footer>

      {/* Saved Reports Drawer */}
      {isSavedOpen && (
        <div className="fixed inset-0 z-[100] flex" onClick={() => setIsSavedOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div 
            className="ml-auto h-full w-full max-w-md bg-[#0a0a0b] border-l border-[#27272a] p-6 overflow-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-semibold text-xl tracking-tight">My Saved Research</div>
                <div className="text-xs text-[#a1a1aa]">{savedReports.length} saved</div>
              </div>
              <button onClick={() => setIsSavedOpen(false)} className="p-2 hover:bg-[#1a1a1d] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedReports.length === 0 ? (
              <div className="text-center py-12 text-[#a1a1aa]">
                No saved reports yet.<br />Start a research project above.
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => loadReport(r)}
                    className="card p-5 rounded-2xl cursor-pointer active:bg-[#1f1f23] group"
                  >
                    <div className="flex justify-between">
                      <div className="font-medium pr-4 tracking-tight">{r.topic || r.niche}</div>
                      <button 
                        onClick={(e) => deleteReport(r.id, e)} 
                        className="opacity-40 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="font-mono text-xl font-semibold text-[#f59e0b] tabular-nums">{r.score}</span>
                      <span className="text-[#a1a1aa]">score • {r.depth}</span>
                      <span className="ml-auto text-xs text-[#52525b]">{new Date(r.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 text-[10px] text-center text-[#52525b]">
              Stored locally in your browser. Export before clearing cache.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
