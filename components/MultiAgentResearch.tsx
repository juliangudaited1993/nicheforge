'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Agent {
  name: string;
  role: string;
  color: string;
}

const TEN_AGENTS: Agent[] = [
  { name: "Market Researcher", role: "Demand & Market Sizing", color: "#3b82f6" },
  { name: "Demand Analyst", role: "Buyer Psychology", color: "#6366f1" },
  { name: "Competitor Analyst", role: "Competitive Intelligence", color: "#8b5cf6" },
  { name: "Pricing Strategist", role: "Monetization Design", color: "#a855f7" },
  { name: "Trend Forecaster", role: "Momentum & Timing", color: "#f59e0b" },
  { name: "Financial Modeler", role: "Revenue Projections", color: "#f97316" },
  { name: "Risk Analyst", role: "Barriers & Threats", color: "#ef4444" },
  { name: "Traffic Specialist", role: "Acquisition Channels", color: "#ec4899" },
  { name: "Offer Architect", role: "High-Converting Offers", color: "#14b8a6" },
  { name: "Strategy Synthesizer", role: "Final Integration", color: "#10b981" },
];

// Rich source with visual logo badge (colored initial acts as favicon)
interface Source {
  domain: string;
  url: string;
  logo: string;   // 1-2 char brand initial or short label
  color: string;  // brand-ish color
  insight?: string;
}

interface AgentMessage {
  agent: string;
  message: string;
  timestamp: string;
  referencesPrevious?: string;
  sources?: Source[];
}

interface MultiAgentResearchProps {
  topic: string; // generalized from niche
  depth: 'quick' | 'standard' | 'deep';
  researchStyle?: 'legal' | 'corporate' | 'medical' | 'personal' | 'academic';
  reportLength?: 'short' | 'medium' | 'long';
  onComplete: () => void;
}

type ViewMode = 'conversation' | 'full';

export default function MultiAgentResearch({ topic, depth, researchStyle = 'corporate', reportLength = 'medium', onComplete }: MultiAgentResearchProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(`Initializing ${researchStyle.charAt(0).toUpperCase() + researchStyle.slice(1)} Research Team`);
  const [viewMode, setViewMode] = useState<ViewMode>('conversation');

  // Dynamic agent team based on research style — expanded ~7-8 agents for rich, consistent Deep conversations
  const getResearchTeam = (style: string): Agent[] => {
    const baseColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#10b981"];
    
    const teams: Record<string, Agent[]> = {
      corporate: [
        { name: "Market Analyst", role: "Industry & Market Dynamics", color: baseColors[0] },
        { name: "Competitive Intelligence", role: "Rival & Landscape Analysis", color: baseColors[2] },
        { name: "Trend Forecaster", role: "Momentum & Timing", color: baseColors[4] },
        { name: "Financial Modeler", role: "Revenue & Cost Projections", color: baseColors[5] },
        { name: "Risk & Compliance", role: "Threats & Regulatory", color: baseColors[6] },
        { name: "Data Interpreter", role: "Evidence Synthesis", color: baseColors[7] },
        { name: "Strategic Synthesizer", role: "Recommendations & Roadmap", color: baseColors[9] },
      ],
      legal: [
        { name: "Legal Researcher", role: "Case Law & Statutes", color: baseColors[0] },
        { name: "Regulatory Analyst", role: "Compliance & Policy", color: baseColors[3] },
        { name: "Risk Assessor", role: "Liability & Exposure", color: baseColors[6] },
        { name: "Precedent Strategist", role: "Historical Outcomes", color: baseColors[7] },
        { name: "Evidence Analyst", role: "Documentation Review", color: baseColors[2] },
        { name: "Enforcement Specialist", role: "Practical Application Risks", color: baseColors[5] },
        { name: "Legal Synthesizer", role: "Opinions & Recommendations", color: baseColors[9] },
      ],
      medical: [
        { name: "Clinical Researcher", role: "Evidence & Studies", color: baseColors[0] },
        { name: "Epidemiology Analyst", role: "Population Health Data", color: baseColors[2] },
        { name: "Treatment Strategist", role: "Protocols & Outcomes", color: baseColors[5] },
        { name: "Ethics & Safety", role: "Risks & Guidelines", color: baseColors[6] },
        { name: "Data Interpreter", role: "Study Findings", color: baseColors[4] },
        { name: "Implementation Advisor", role: "Real-World Application", color: baseColors[8] },
        { name: "Medical Synthesizer", role: "Clinical Recommendations", color: baseColors[9] },
      ],
      academic: [
        { name: "Literature Reviewer", role: "Sources & Citations", color: baseColors[0] },
        { name: "Methodology Expert", role: "Research Design", color: baseColors[2] },
        { name: "Data Interpreter", role: "Findings Analysis", color: baseColors[4] },
        { name: "Theory Builder", role: "Frameworks & Models", color: baseColors[7] },
        { name: "Gap Analyst", role: "Unanswered Questions", color: baseColors[3] },
        { name: "Validation Specialist", role: "Reproducibility Check", color: baseColors[5] },
        { name: "Academic Synthesizer", role: "Conclusions & Gaps", color: baseColors[9] },
      ],
      personal: [
        { name: "Life Researcher", role: "Trends & Data", color: baseColors[0] },
        { name: "Options Analyst", role: "Alternatives & Tradeoffs", color: baseColors[3] },
        { name: "Risk Evaluator", role: "Personal Downsides", color: baseColors[6] },
        { name: "Practical Advisor", role: "Actionable Steps", color: baseColors[8] },
        { name: "Values Analyst", role: "Alignment & Priorities", color: baseColors[2] },
        { name: "Outcome Modeler", role: "Long-term Scenarios", color: baseColors[5] },
        { name: "Life Strategist", role: "Holistic Recommendations", color: baseColors[9] },
      ],
    };

    return teams[style] || teams.corporate;
  };

  const researchTeam = getResearchTeam(researchStyle || 'corporate');

  // Refs for the pure scrolling roll (top-to-bottom append + auto scroll)
  const conversationRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDeep = depth === 'deep';
  const agentsToShow = isDeep ? researchTeam : researchTeam.slice(0, Math.min(6, researchTeam.length));

  // === Speed model requested by user ===
  // - Visual conversation feels fast ("fast speaking and researching").
  // - Total time from clicking Generate until the final PDF report appears: 20-45s.
  const visualDelay = isDeep ? 720 : 380;                    // fast message appearance
  const targetTotalMs = isDeep ? 34000 : 14000;              // ~34s Deep research feel before report is "ready"

  // Helper to build rich Source objects (logo badge + visible research link + optional insight)
  const makeSource = (key: string, url: string, insight?: string): Source => {
    const presets: Record<string, { logo: string; color: string; domain: string }> = {
      reddit: { logo: 'R', color: '#FF4500', domain: 'reddit.com' },
      google: { logo: 'G', color: '#4285F4', domain: 'google.com' },
      trends: { logo: 'G', color: '#4285F4', domain: 'trends.google.com' },
      tiktok: { logo: 'TT', color: '#000000', domain: 'tiktok.com' },
      youtube: { logo: 'YT', color: '#FF0000', domain: 'youtube.com' },
      amazon: { logo: 'A', color: '#FF9900', domain: 'amazon.com' },
      etsy: { logo: 'E', color: '#F56400', domain: 'etsy.com' },
      indie: { logo: 'IH', color: '#0D9488', domain: 'indiehackers.com' },
      semrush: { logo: 'S', color: '#00BC5B', domain: 'semrush.com' },
      competitor: { logo: 'C1', color: '#64748B', domain: 'top-competitor.com' },
      pricing: { logo: 'C1', color: '#64748B', domain: 'top-competitor.com/pricing' },
      twitter: { logo: 'X', color: '#000000', domain: 'x.com' },
      substack: { logo: 'S', color: '#FF6719', domain: 'substack.com' },
      ahrefs: { logo: 'AH', color: '#FF6B00', domain: 'ahrefs.com' },
    };
    const p = presets[key] || { logo: key.slice(0,2).toUpperCase(), color: '#52525b', domain: key };
    return {
      domain: p.domain,
      url,
      logo: p.logo,
      color: p.color,
      insight,
    };
  };

  const getConversationalMessages = (): AgentMessage[] => {
    const style = researchStyle || 'corporate';
    const styleLabel = style.charAt(0).toUpperCase() + style.slice(1);
    const shortTopic = topic.length > 60 ? topic.slice(0, 57) + '...' : topic;

    // Highly generalized, style-aware conversations for ResearchForge.
    // Messages adapt language, concerns, sources, and framing to the selected research style + actual topic.
    const base: AgentMessage[] = [
      {
        agent: researchTeam[0]?.name || "Lead Researcher",
        message: `Research initiated on "${shortTopic}". Comprehensive scan across primary databases, official records, recent publications, and domain-specific sources completed. Clear patterns and several high-signal developments identified in the last 12–24 months.`,
        timestamp: "00:05",
        sources: [
          makeSource('google', `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`, 'Primary literature & reports'),
          makeSource('reddit', `https://reddit.com/search?q=${encodeURIComponent(topic)}`, 'Practitioner discussions'),
        ],
      },
      {
        agent: researchTeam[1]?.name || "Analyst",
        message: `Cross-referencing the initial data pull. For a ${style} lens on "${shortTopic}", the dominant theme is inconsistency in how practitioners currently approach this. Multiple stakeholders report the same core friction points with no authoritative, up-to-date synthesis available.`,
        timestamp: "00:11",
        referencesPrevious: researchTeam[0]?.name,
        sources: [
          makeSource('reddit', `https://reddit.com/search?q=${encodeURIComponent(topic)}`, 'Recurring practitioner pain'),
        ],
      },
      {
        agent: researchTeam[2]?.name || "Specialist",
        message: `Mapped the current landscape. The leading existing resources on this topic are either outdated, narrowly focused on one jurisdiction/setting, or buried behind paywalls with limited methodology transparency. Significant white space for a modern, well-structured treatment.`,
        timestamp: "00:17",
        sources: [
          makeSource('competitor', 'https://example.com/leading-resource', 'Current top reference — gaps noted'),
        ],
      },
      {
        agent: researchTeam[3]?.name || "Analyst",
        message: `The gap the previous agent identified is material. In ${style} contexts, decision-makers repeatedly cite "no single source that connects the dots across the main variables" as the #1 blocker. This directly affects both quality of decisions and speed of execution.`,
        timestamp: "00:23",
        referencesPrevious: researchTeam[2]?.name,
      },
      {
        agent: researchTeam[4]?.name || "Forecaster",
        message: `Momentum signals are strengthening. Publication volume, regulatory activity, and discussion frequency around "${shortTopic}" have all increased noticeably in the last 18 months. We are approaching an inflection where a clear, authoritative reference will have outsized influence.`,
        timestamp: "00:29",
        sources: [
          makeSource('trends', `https://trends.google.com/trends/explore?q=${encodeURIComponent(topic)}`, 'Search interest trajectory'),
        ],
      },
      {
        agent: researchTeam[1]?.name || "Analyst",
        message: `Strongly agree on timing. The combination of rising practitioner frustration + accelerating external change (regulation, technology, evidence base) creates a narrow but high-value window. Resources that appear in the next 6–9 months will likely become default references.`,
        timestamp: "00:35",
        referencesPrevious: researchTeam[4]?.name,
      },
      {
        agent: researchTeam[5]?.name || "Modeler",
        message: `Initial impact modeling for a high-quality deliverable on this topic: conservative adoption scenarios show meaningful reach within the core ${style} audience within 12 months, with clear downstream effects on decision quality, time saved, and risk reduction. The unit economics for a premium synthesized report or framework look very healthy.`,
        timestamp: "00:41",
      },
      {
        agent: researchTeam[6]?.name || "Risk Analyst",
        message: `Key risks identified: (1) rapid evolution in one sub-area could date parts of the work quickly, (2) jurisdictional or contextual differences may require explicit scoping, (3) over-simplification could reduce credibility with sophisticated readers. We need to design the structure to handle these gracefully.`,
        timestamp: "00:47",
      },
      {
        agent: researchTeam[7]?.name || "Architect",
        message: `Risk mitigation: structure the output with clear "core framework + modular extensions" so the main deliverable stays stable while specific modules can be updated. Also recommend explicit sections on scope, assumptions, and "when this does not apply".`,
        timestamp: "00:53",
        referencesPrevious: researchTeam[6]?.name,
      },
      {
        agent: researchTeam[0]?.name || "Lead Researcher",
        message: `Fresh data confirms the risk points. Several recent high-profile cases or studies in the last 8 weeks directly relate to "${shortTopic}". Any authoritative treatment must address these explicitly or it will immediately feel behind the curve.`,
        timestamp: "00:59",
        referencesPrevious: researchTeam[7]?.name,
        sources: [
          makeSource('google', `https://scholar.google.com/scholar?q=${encodeURIComponent(topic + ' 2024 OR 2025')}`, 'Very recent developments'),
        ],
      },
      {
        agent: researchTeam[2]?.name || "Specialist",
        message: `I reviewed the primary source documents from the last two major updates in this area. The official guidance is more conservative than practitioner behavior on the ground. This tension is important to surface clearly in the report.`,
        timestamp: "01:05",
        referencesPrevious: researchTeam[0]?.name,
      },
      {
        agent: researchTeam[3]?.name || "Analyst",
        message: `The tension the Specialist just flagged appears in 60%+ of the practitioner discussions I analyzed. People are operating in the gray zone between official guidance and real-world constraints. Documenting both the formal rules and the pragmatic patterns is essential.`,
        timestamp: "01:11",
        referencesPrevious: researchTeam[2]?.name,
      },
      {
        agent: researchTeam[5]?.name || "Modeler",
        message: `Updated projection incorporating the recent developments: a well-executed synthesis here has potential to become a frequently cited reference within the ${style} community. Early indicators (forum threads, newsletter mentions, conference talks) suggest strong latent demand.`,
        timestamp: "01:17",
      },
      {
        agent: researchTeam[4]?.name || "Forecaster",
        message: `Additional signal: two major ${style} publications and one professional association have all published pieces touching on this exact area in the last 30 days. The conversation is moving from specialized discussion to broad mainstream attention within the field. Timing is strong.`,
        timestamp: "01:23",
        sources: [
          makeSource('substack', `https://substack.com/search?q=${encodeURIComponent(topic)}`, 'Recent field commentary'),
        ],
      },
      {
        agent: researchTeam[6]?.name || "Risk Analyst",
        message: `One execution risk we haven't stressed enough: source credibility and citation quality. In ${style} work, readers are highly sensitive to weak sourcing. Every claim above a certain threshold needs traceable backing.`,
        timestamp: "01:29",
      },
      {
        agent: researchTeam[7]?.name || "Architect",
        message: `Agreed. I am recommending we include a "Sources & Credibility" appendix with tiered ratings and direct links. This directly addresses the risk the Risk Analyst raised and becomes a major differentiator vs existing resources.`,
        timestamp: "01:35",
        referencesPrevious: researchTeam[6]?.name,
      },
      {
        agent: researchTeam[8]?.name || "Synthesizer",
        message: `Pulling the threads together: rising demand, clear gaps in current resources, strong timing signals, manageable but real risks that we now have mitigation strategies for, and a structure that serves both quick reference and deep application use cases.`,
        timestamp: "01:41",
        referencesPrevious: researchTeam[7]?.name,
      },
      {
        agent: researchTeam[1]?.name || "Analyst",
        message: `Final validation on audience psychology: across the discussions reviewed, the #1 requested format is "something I can actually use this week" rather than another 80-page theoretical treatise. The deliverable should prioritize actionable frameworks while still being rigorous.`,
        timestamp: "01:47",
        referencesPrevious: researchTeam[8]?.name,
      },
      {
        agent: researchTeam[9]?.name || "Lead Synthesizer",
        message: `All agents aligned. We have a high-conviction case for a modern, well-scoped, practitioner-oriented treatment of "${shortTopic}" tailored to ${styleLabel} needs. Primary recommendation: proceed with the research synthesis at the selected depth and length. The window is open.`,
        timestamp: "01:53",
        referencesPrevious: researchTeam[1]?.name,
      },
      {
        agent: researchTeam[8]?.name || "Synthesizer",
        message: `Report synthesis complete. Full agent log, sources with credibility notes, and recommended structure are ready for the final deliverable. This will serve the target ${style} audience effectively.`,
        timestamp: "01:59",
      },
    ];

    // For non-deep we still give a solid but shorter show (first ~7 messages)
    return isDeep ? base : base.slice(0, 7);
  };

  // Compute messages fresh each time inputs change
  const agentMessages = getConversationalMessages();

  // Force a fresh simulation run whenever the core research parameters change.
  const simulationKey = `${topic}-${researchStyle}-${depth}-${reportLength}`;

  // === New speed + user-controlled scroll model ===
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  useEffect(() => {
    // Reset everything for a brand new research run
    setMessages([]);
    setIsComplete(false);
    setActiveAgentIndex(0);
    setIsAutoScrollPaused(false);
    setHasUserScrolled(false);
    setCurrentPhase(`Initializing ${ (researchStyle || 'research').charAt(0).toUpperCase() + (researchStyle || 'research').slice(1) } Research Team`);

    let index = 0;
    const currentMessages = getConversationalMessages();

    const startTime = Date.now();

    const interval = setInterval(() => {
      if (index < currentMessages.length) {
        const msg = currentMessages[index];
        setMessages(prev => [...prev, msg]);

        const foundIndex = agentsToShow.findIndex(a => a.name === msg.agent);
        setActiveAgentIndex(foundIndex >= 0 ? foundIndex : 0);

        // Style-aware phases (kept from previous improvement)
        const styleLabel = (researchStyle || 'research').toLowerCase();
        if (index === 2) setCurrentPhase(styleLabel === 'medical' ? "Phase 1: Evidence & Clinical Review" 
          : styleLabel === 'legal' ? "Phase 1: Precedent & Regulatory Scan" 
          : styleLabel === 'academic' ? "Phase 1: Literature & Methodology Review"
          : styleLabel === 'personal' ? "Phase 1: Context & Tradeoff Analysis"
          : "Phase 1: Discovery & Intent Analysis");
        if (index === 6) setCurrentPhase(styleLabel === 'medical' ? "Phase 2: Outcomes, Protocols & Safety" 
          : styleLabel === 'legal' ? "Phase 2: Risk Exposure & Compliance Modeling" 
          : styleLabel === 'academic' ? "Phase 2: Data Interpretation & Gaps" 
          : "Phase 2: Analysis & Synthesis");
        if (index === 11) setCurrentPhase(styleLabel === 'medical' ? "Phase 3: Implementation & Ethics" 
          : styleLabel === 'legal' ? "Phase 3: Jurisdictional & Enforcement Risks" 
          : "Phase 3: Recommendations & Constraints");
        if (index === 16) setCurrentPhase("Phase 4: Cross-Team Alignment & Final Deliverable");
        if (index === currentMessages.length - 1) setCurrentPhase("All Agents Aligned — Final Synthesis");

        index++;
      } else {
        clearInterval(interval);

        // Chat is visually complete. Now wait the remaining time so total research "feels" 20-45s.
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, targetTotalMs - elapsed);

        setTimeout(() => {
          setIsComplete(true);
          onComplete();
        }, remaining + 400); // small buffer
      }
    }, visualDelay);

    return () => clearInterval(interval);
  }, [simulationKey, onComplete, visualDelay, targetTotalMs]);

  // Smart auto-scroll that respects manual user scrolling
  const handleScroll = () => {
    if (!conversationRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = conversationRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;

    if (!isNearBottom) {
      setHasUserScrolled(true);
      setIsAutoScrollPaused(true);
    } else if (hasUserScrolled) {
      // User scrolled back to bottom → resume
      setIsAutoScrollPaused(false);
    }
  };

  useEffect(() => {
    if (!isAutoScrollPaused && messages.length > 0 && conversationRef.current) {
      requestAnimationFrame(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTo({
            top: conversationRef.current.scrollHeight + 90,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [messages.length, isAutoScrollPaused]);

  // Allow parent to force resume if needed (optional)
  const resumeAutoScroll = () => {
    setIsAutoScrollPaused(false);
    setHasUserScrolled(false);
    if (conversationRef.current) {
      conversationRef.current.scrollTo({
        top: conversationRef.current.scrollHeight + 120,
        behavior: 'smooth',
      });
    }
  };

  const activeAgent = agentsToShow[activeAgentIndex] || agentsToShow[0];
  const latestMessage = messages[messages.length - 1];

  return (
    <div className="rounded-3xl border border-[#27272a] bg-[#0a0a0b] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#27272a] bg-[#121214] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-[#f59e0b] font-semibold tracking-tight">LIVE RESEARCH TEAM COLLABORATION</div>
            <div className="px-2.5 py-0.5 text-[10px] rounded bg-[#f59e0b] text-black font-medium">GROK POWERED</div>
          </div>
          <div className="text-xs text-[#a1a1aa] mt-0.5">{currentPhase}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'conversation' ? 'full' : 'conversation')}
            className="text-xs px-3 py-1 rounded-full border border-[#27272a] hover:border-[#f59e0b] transition-colors"
          >
            {viewMode === 'conversation' ? 'Show Full Log' : 'Conversation View'}
          </button>
          <div className="text-xs text-[#52525b] font-mono">REAL-TIME • {depth.toUpperCase()}</div>
        </div>
      </div>

      {/* Conversation Mode — Pure vertical scrolling roll (no rotation, no orb, no curves) */}
      {viewMode === 'conversation' && (
        <div className="bg-[#0a0a0b] border-t border-[#27272a] relative">
          {/* Status bar */}
          <div className="px-6 py-3 border-b border-[#27272a] flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-[#ededed]">LIVE AGENT CONVERSATION ROLL</span>
              </div>
              <span className="text-[#52525b]">•</span>
              <span className="text-[#a1a1aa]">{agentMessages.length} messages • {depth} {reportLength} preview</span>
            </div>
            <div className="text-[#52525b] font-mono text-xs">SCROLLING TRANSCRIPT • LIVE AGENT COLLABORATION</div>
          </div>

          {/* The actual scrolling roll feed - user can scroll freely, auto-scroll pauses when they do */}
          <div 
            ref={conversationRef}
            onScroll={handleScroll}
            className="h-[620px] overflow-y-auto px-6 py-6 space-y-6 bg-[#050506] custom-scroll"
          >
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-[#52525b]">
                Initializing agent research stream…
              </div>
            )}

            {messages.map((msg, idx) => {
              const agent = agentsToShow.find(a => a.name === msg.agent) || agentsToShow[0] || { name: msg.agent, role: '', color: '#f59e0b' };
              const isLatest = idx === messages.length - 1 && !isComplete;

              return (
                <motion.div
                  key={`${msg.timestamp}-${idx}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className={`group relative pl-5 border-l-2 ${isLatest ? 'border-[#f59e0b]' : 'border-[#27272a]'} transition-colors`}
                >
                  {/* Agent header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: agent.color + '15', 
                        color: agent.color,
                        border: `1px solid ${agent.color}25`
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${isLatest ? 'animate-pulse' : ''}`} style={{ backgroundColor: agent.color }} />
                      {msg.agent}
                      <span className="text-[10px] opacity-60 font-normal">— {agent.role}</span>
                    </div>
                    <div className="text-[10px] text-[#52525b] font-mono tracking-widest">{msg.timestamp}</div>
                    {isLatest && !isComplete && (
                      <div className="ml-auto text-[10px] px-3 py-0.5 rounded-full bg-[#f59e0b] text-black font-semibold tracking-[1.5px] shadow-sm animate-pulse">
                        NOW SPEAKING
                      </div>
                    )}
                  </div>

                  {/* Message body — long form so user can see real "speaking" length */}
                  <div className="text-[#ededed] text-[15px] leading-relaxed pr-4 tracking-[-0.1px]">
                    {msg.message}
                  </div>

                  {/* References previous agent */}
                  {msg.referencesPrevious && (
                    <div className="mt-2 text-xs text-[#f59e0b]/70 flex items-center gap-1">
                      ↳ building directly on <span className="font-medium">{msg.referencesPrevious}</span>
                    </div>
                  )}

                  {/* RESEARCHED LINKS + LOGO ICONS — exactly what user requested */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#27272a]/70">
                      <div className="text-[10px] uppercase tracking-[1px] text-[#52525b] mb-1.5">Sources this agent pulled live</div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              // Demo mode: still open real link when possible, or at least show it
                              if (!src.url.startsWith('http')) e.preventDefault();
                            }}
                            className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-[#27272a] hover:border-[#f59e0b]/40 bg-[#111113] hover:bg-[#18181b] transition-all text-xs group/link"
                            title={src.insight || src.url}
                          >
                            {/* Little company logo icon (colored favicon-style circle) */}
                            <div 
                              className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white shadow-inner"
                              style={{ backgroundColor: src.color }}
                            >
                              {src.logo}
                            </div>
                            <div className="flex flex-col leading-none">
                              <span className="font-medium text-[#ededed] group-hover/link:text-[#f59e0b]">{src.domain}</span>
                              {src.insight && (
                                <span className="text-[#52525b] text-[10px] truncate max-w-[210px]">{src.insight}</span>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Completion state inside the roll */}
            {isComplete && (
              <div className="pt-4 pb-2 text-center border-t border-[#27272a]">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] text-sm font-semibold tracking-wider">
                  ALL 10 AGENTS • CONVERSATION COMPLETE
                </div>
                <div className="text-[#a1a1aa] text-sm mt-3 max-w-md mx-auto">
                  The full agent dialogue is preserved above. Scroll up to review any sources or reasoning. The synthesized report is ready below.
                </div>
              </div>
            )}

            {/* Invisible anchor for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Resume auto-scroll button - appears when user manually scrolls up */}
          {isAutoScrollPaused && !isComplete && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={resumeAutoScroll}
                className="px-4 py-1.5 rounded-full bg-[#f59e0b] text-black text-xs font-semibold shadow-lg hover:bg-[#fbbf24] transition flex items-center gap-2"
              >
                ▶ Resume live scroll
              </button>
            </div>
          )}

          {/* Bottom bar with CTAs once complete — points user to the big hero PDF download that appears right after */}
          {isComplete && (
            <div className="border-t border-[#27272a] bg-[#121214] px-6 py-4 flex flex-wrap gap-3 justify-center text-sm text-[#a1a1aa]">
              Conversation complete. Scroll down for the full synthesized report + prominent PDF download.
            </div>
          )}
        </div>
      )}

      {/* Full Log View (Expanded box style) */}
      {viewMode === 'full' && (
        <div className="p-6">
          {/* Agent Grid */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest text-[#f59e0b] mb-3">AGENT TEAM</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {agentsToShow.map((agent, index) => {
                const isActive = index === activeAgentIndex && !isComplete;
                return (
                  <div key={index} className={`rounded-2xl px-3 py-2 border text-sm transition-all ${isActive ? 'border-[#f59e0b] bg-[#f59e0b]/10' : 'border-[#27272a] bg-[#0a0a0b]'}`}>
                    <div className="font-semibold" style={{ color: agent.color }}>{agent.name}</div>
                    <div className="text-xs text-[#a1a1aa]">{agent.role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Conversation Log (also shows the rich researched links + logos) */}
          <div className="max-h-[460px] overflow-y-auto space-y-5 pr-2">
            {messages.map((msg, index) => {
              const agent = agentsToShow.find(a => a.name === msg.agent) || agentsToShow[0] || { name: msg.agent, role: '', color: '#f59e0b' };
              return (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: agent.color + '20', color: agent.color }}>
                    {msg.agent.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: agent.color }}>{msg.agent}</span>
                      <span className="text-[10px] text-[#52525b] font-mono">{msg.timestamp}</span>
                    </div>
                    <div className="text-[#ededed] text-sm leading-snug mt-1">
                      {msg.message}
                    </div>

                    {/* Same rich source logos + links in the expanded log view */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a key={sIdx} href={src.url} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-lg border border-[#27272a] hover:border-[#f59e0b]/40 bg-[#0a0a0b]">
                            <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{background: src.color}}>{src.logo}</span>
                            <span className="text-[#a1a1aa]">{src.domain}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    {msg.referencesPrevious && (
                      <div className="text-[10px] text-[#f59e0b]/60 mt-1">↳ on {msg.referencesPrevious}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion bar */}
      {isComplete && (
        <div className="p-4 border-t border-[#27272a] bg-[#121214] text-center text-sm text-[#a1a1aa]">
          All agents finished. The complete report + big PDF download button are directly below.
        </div>
      )}
    </div>
  );
}
