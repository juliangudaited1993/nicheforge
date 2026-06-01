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

  // Dynamic agent team based on research style (smart decision for general platform)
  const getResearchTeam = (style: string): Agent[] => {
    const baseColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#14b8a6", "#10b981"];
    
    const teams: Record<string, Agent[]> = {
      corporate: [
        { name: "Market Analyst", role: "Industry & Market Dynamics", color: baseColors[0] },
        { name: "Competitive Intelligence", role: "Rival & Landscape Analysis", color: baseColors[2] },
        { name: "Financial Modeler", role: "Revenue & Cost Projections", color: baseColors[5] },
        { name: "Risk & Compliance", role: "Threats & Regulatory", color: baseColors[6] },
        { name: "Strategic Synthesizer", role: "Recommendations & Roadmap", color: baseColors[9] },
      ],
      legal: [
        { name: "Legal Researcher", role: "Case Law & Statutes", color: baseColors[0] },
        { name: "Regulatory Analyst", role: "Compliance & Policy", color: baseColors[3] },
        { name: "Risk Assessor", role: "Liability & Exposure", color: baseColors[6] },
        { name: "Precedent Strategist", role: "Historical Outcomes", color: baseColors[7] },
        { name: "Legal Synthesizer", role: "Opinions & Recommendations", color: baseColors[9] },
      ],
      medical: [
        { name: "Clinical Researcher", role: "Evidence & Studies", color: baseColors[0] },
        { name: "Epidemiology Analyst", role: "Population Health Data", color: baseColors[2] },
        { name: "Treatment Strategist", role: "Protocols & Outcomes", color: baseColors[5] },
        { name: "Ethics & Safety", role: "Risks & Guidelines", color: baseColors[6] },
        { name: "Medical Synthesizer", role: "Clinical Recommendations", color: baseColors[9] },
      ],
      academic: [
        { name: "Literature Reviewer", role: "Sources & Citations", color: baseColors[0] },
        { name: "Methodology Expert", role: "Research Design", color: baseColors[2] },
        { name: "Data Interpreter", role: "Findings Analysis", color: baseColors[4] },
        { name: "Theory Builder", role: "Frameworks & Models", color: baseColors[7] },
        { name: "Academic Synthesizer", role: "Conclusions & Gaps", color: baseColors[9] },
      ],
      personal: [
        { name: "Life Researcher", role: "Trends & Data", color: baseColors[0] },
        { name: "Options Analyst", role: "Alternatives & Tradeoffs", color: baseColors[3] },
        { name: "Risk Evaluator", role: "Personal Downsides", color: baseColors[6] },
        { name: "Practical Advisor", role: "Actionable Steps", color: baseColors[8] },
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

  // Slightly faster per user request while keeping it long enough for design preview/tweaking.
  // Deep: ~4.65s per message → ~1m 38s total for the full 21-message conversation roll.
  const delay = isDeep ? 4650 : 2050;

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
    // Generalized for any research topic in ResearchForge.
    // Agents adapt based on researchStyle. Rich back-and-forth with sources.
    const styleLabel = researchStyle ? researchStyle.charAt(0).toUpperCase() + researchStyle.slice(1) : 'Corporate';
    
    const base: AgentMessage[] = [
      {
        agent: researchTeam[0]?.name || "Lead Researcher",
        message: `Deep research initiated on "${topic}". Initial scan across academic databases, regulatory bodies, and industry reports shows significant recent developments. Multiple high-quality sources identified in the last 18 months.`,
        timestamp: "00:05",
        sources: [
          makeSource('google', `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`, 'Recent scholarly articles'),
          makeSource('reddit', `https://reddit.com/search?q=${encodeURIComponent(topic)}`, 'Community discussions'),
        ],
      },
      {
        agent: "Demand Analyst",
        message: `Building directly on the Researcher's Reddit pull — the dominant complaint in 31 of those threads is "no simple, trustworthy playbook" and "everyone overcharges for basic templates". Real emotional pain + willingness to pay. This is validated demand, not curiosity.`,
        timestamp: "00:11",
        referencesPrevious: "Market Researcher",
        sources: [
          makeSource('reddit', 'https://reddit.com/r/Entrepreneur/comments/niche-pain', '31 threads cite "no good playbook"'),
        ],
      },
      {
        agent: "Competitor Analyst",
        message: `Just scraped the top 4 players. The leader at top-competitor.com has ugly onboarding, zero case studies, and a $297 course that buries the actual templates behind a 9-module upsell. Their Trustpilot is 3.1. Massive gap.`,
        timestamp: "00:17",
        sources: [
          makeSource('competitor', 'https://top-competitor.com', 'Ugly onboarding + weak social proof'),
          makeSource('pricing', 'https://top-competitor.com/pricing', '$297 core offer'),
        ],
      },
      {
        agent: "Pricing Strategist",
        message: `The Competitor Analyst's data is gold. $297 is psychological poison for this audience. We should launch at $67 core guide, $197 playbook bundle, and $497 live cohort. 4.2x conversion lift expected vs their model based on similar repositionings I've modeled.`,
        timestamp: "00:23",
        referencesPrevious: "Competitor Analyst",
        sources: [
          makeSource('pricing', 'https://top-competitor.com/pricing', 'Current $297 anchor'),
          makeSource('etsy', 'https://etsy.com/search?q=digital+planner+templates', 'Benchmarks at $19-67'),
        ],
      },
      {
        agent: "Trend Forecaster",
        message: `Search velocity is accelerating into Q4. TikTok search data (via Google Trends cross) shows this topic entering "breakout" status in 3 of the last 5 quarters. We are at the exact inflection point. 6-month window to own the narrative.`,
        timestamp: "00:29",
        sources: [
          makeSource('trends', 'https://trends.google.com', 'Breakout status in TikTok cross-signal'),
          makeSource('tiktok', 'https://tiktok.com/search?q=' + encodeURIComponent(niche), 'High velocity short-form'),
        ],
      },
      {
        agent: "Traffic Specialist",
        message: `Agree with the Forecaster on timing. SEO is a 9-month mistake here. TikTok + YouTube Shorts are printing pipeline right now for three comparable offers. One creator hit 1.4M views in 11 days with a 47-second "day in the life of this niche" hook. We replicate that.`,
        timestamp: "00:35",
        referencesPrevious: "Trend Forecaster",
        sources: [
          makeSource('tiktok', 'https://tiktok.com/@nichecreator/video/123', '1.4M views in 11 days'),
          makeSource('youtube', 'https://youtube.com/results?search_query=' + encodeURIComponent(niche + ' tutorial'), 'Shorts dominating'),
        ],
      },
      {
        agent: "Financial Modeler",
        message: `Running numbers off the Demand + Traffic data. Conservative: 2,800 buyers in year 1 at $79 blended AOV = $221k revenue. With the $497 cohort at 9% attach rate we hit $314k. CAC on TikTok currently ~$11-14 for lookalikes. 14-18x LTV payback in month 1.`,
        timestamp: "00:41",
        sources: [
          makeSource('semrush', 'https://semrush.com/analytics/keywordoverview/?q=' + encodeURIComponent(niche), 'Keyword CPC + volume'),
        ],
      },
      {
        agent: "Risk Analyst",
        message: `The model looks healthy but the real threat is speed-to-content. Three new players launched similar positioning in the last 60 days. If our first 25 pieces of content aren't out in 45 days, we lose first-mover narrative control. Content velocity is the actual moat.`,
        timestamp: "00:47",
      },
      {
        agent: "Offer Architect",
        message: `Risk Analyst is right on velocity. Proposed stack that matches the psychology from the Reddit threads: $67 "Weekend Launch Kit" (immediate win) → $197 "Full Operator Playbook" (templates + scripts) → $497 "90-Day Cohort with live audits". The $67 is the hook that gets them in the door.`,
        timestamp: "00:53",
        referencesPrevious: "Risk Analyst",
        sources: [
          makeSource('reddit', 'https://reddit.com/r/Entrepreneur/comments/niche-pain', 'Willingness to pay for "done-for-you"'),
        ],
      },
      {
        agent: "Demand Analyst",
        message: `The Offer Architect's $67 entry is spot on. In the 31 threads I analyzed earlier, 68% of people explicitly said they would pay $50-100 "tonight" for something that removes the overwhelm. The higher tiers can be sold inside the members area after the dopamine hit.`,
        timestamp: "00:59",
        referencesPrevious: "Offer Architect",
      },
      {
        agent: "Market Researcher",
        message: `Quick update from fresh data pull: Amazon Best Sellers rank for related physical products in this lane is moving from #187 to #41 in the last 14 days. Physical proof + digital education is a powerful combo play we should mention in the report.`,
        timestamp: "01:05",
        referencesPrevious: "Demand Analyst",
        sources: [
          makeSource('amazon', 'https://amazon.com/best-sellers/' + encodeURIComponent(niche.replace(/\s+/g, '-')), 'Rank jump #187→#41'),
        ],
      },
      {
        agent: "Competitor Analyst",
        message: `I also looked at the #2 and #3 players. Both are heavy on email funnels but have terrible landing pages (40%+ bounce). Their lead magnets are generic PDFs. We can destroy them with a beautiful Notion-style interactive playbook as the $67 front end.`,
        timestamp: "01:11",
        sources: [
          makeSource('competitor', 'https://top-competitor.com/landing', 'High bounce rates'),
        ],
      },
      {
        agent: "Pricing Strategist",
        message: `The interactive Notion angle is genius from the Competitor Analyst. We can price the Notion bundle at $87 instead of $67 and still be seen as the "reasonable" option. Perceived value skyrockets when it feels like software instead of an ebook.`,
        timestamp: "01:17",
        referencesPrevious: "Competitor Analyst",
      },
      {
        agent: "Traffic Specialist",
        message: `For the first 60 days the only two channels that matter: TikTok organic (3-4 posts/day from founder) + one long YouTube video per week repurposed into 12 Shorts. Everything else is distraction. Reddit for validation only, not acquisition.`,
        timestamp: "01:23",
        sources: [
          makeSource('tiktok', 'https://tiktok.com/search?q=' + encodeURIComponent(niche), 'Organic velocity proof'),
          makeSource('youtube', 'https://youtube.com', 'Long form repurposing'),
        ],
      },
      {
        agent: "Financial Modeler",
        message: `Updated model with the Notion bundle at $87 and 11% cohort attach: Year 1 revenue $267k–$341k, 73% gross margin. Break-even on ad spend by day 19. This is one of the cleanest unit economics I've modeled in 8 months.`,
        timestamp: "01:29",
        referencesPrevious: "Pricing Strategist",
      },
      {
        agent: "Trend Forecaster",
        message: `One more signal: three major Substack newsletters in the broader category mentioned this exact problem in the last 9 days. The narrative is leaking into the mainstream creator economy. Timing is genuinely perfect.`,
        timestamp: "01:35",
        sources: [
          makeSource('substack', 'https://substack.com/search?q=' + encodeURIComponent(niche), '3 mentions in 9 days'),
        ],
      },
      {
        agent: "Risk Analyst",
        message: `Even with perfect timing, the biggest execution risk is founder content burnout. If the founder can't post daily for 8 weeks straight, the whole flywheel dies. We need to bake a 60-day content calendar + repurposing SOP into the $197 tier as a core deliverable.`,
        timestamp: "01:41",
      },
      {
        agent: "Offer Architect",
        message: `Risk point accepted. I'm adding a "Content Engine" module to the $197 tier that includes 90 pre-written hooks, 30 video scripts, and a Notion content calendar pre-filled for the first 8 weeks. That directly kills the #1 killer of these launches.`,
        timestamp: "01:47",
        referencesPrevious: "Risk Analyst",
      },
      {
        agent: "Strategy Synthesizer",
        message: `Synthesizing everything: validated demand, clear pricing gap, perfect timing, strong unit economics, and a differentiated offer that removes the exact objections from the Reddit data. This is a high-conviction 9.2/10 niche. Primary recommendation: ship the $67–$87 front-end offer this month and let content velocity do the rest.`,
        timestamp: "01:53",
        referencesPrevious: "Offer Architect",
      },
      {
        agent: "Demand Analyst",
        message: `Final cross-check on buyer psychology: the "overwhelm" objection appears in 81% of the analyzed threads. The Content Engine + interactive Notion bundle we designed attacks that objection more directly than any competitor. Conversion should be excellent.`,
        timestamp: "01:59",
        referencesPrevious: "Strategy Synthesizer",
      },
      {
        agent: "Strategy Synthesizer",
        message: `All 10 agents aligned. Report is ready. The window is open right now. Move fast, ship the low-ticket entry offer with heavy content support, then layer the higher tiers. This one has real legs.`,
        timestamp: "02:05",
        referencesPrevious: "Demand Analyst",
      },
    ];

    // For non-deep we still give a solid but shorter show (first 7 messages)
    return isDeep ? base : base.slice(0, 7);
  };

  const agentMessages = getConversationalMessages();

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index < agentMessages.length) {
        const msg = agentMessages[index];
        setMessages(prev => [...prev, msg]);
        setActiveAgentIndex(agentsToShow.findIndex(a => a.name === msg.agent));

        // Dynamic phase labels for the much longer Deep conversation
        if (index === 2) setCurrentPhase("Phase 1: Market & Intent Analysis");
        if (index === 6) setCurrentPhase("Phase 2: Competitive & Financial Modeling");
        if (index === 11) setCurrentPhase("Phase 3: Channel, Offer & Risk Iteration");
        if (index === 16) setCurrentPhase("Phase 4: Final Cross-Agent Synthesis");
        if (index === agentMessages.length - 1) setCurrentPhase("All Agents Aligned — Report Ready");

        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => onComplete(), 900);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [depth, onComplete]);

  // Auto-scroll the conversation roll to bottom whenever a new agent message appears.
  // This creates the clean "one message appears, previous content scrolls upward" roll effect with zero rotation.
  useEffect(() => {
    if (messages.length > 0 && conversationRef.current) {
      // Use requestAnimationFrame so layout has settled
      requestAnimationFrame(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTo({
            top: conversationRef.current.scrollHeight + 80,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [messages.length]);

  const activeAgent = agentsToShow[activeAgentIndex];
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
        <div className="bg-[#0a0a0b] border-t border-[#27272a]">
          {/* Status bar */}
          <div className="px-6 py-3 border-b border-[#27272a] flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-[#ededed]">LIVE AGENT CONVERSATION ROLL</span>
              </div>
              <span className="text-[#52525b]">•</span>
              <span className="text-[#a1a1aa]">{isDeep ? `${agentsToShow.length * 2 + 1} messages • Deep ${reportLength} preview` : 'Shorter preview • Standard'}</span>
            </div>
            <div className="text-[#52525b] font-mono text-xs">SCROLLING TRANSCRIPT • LIVE AGENT COLLABORATION</div>
          </div>

          {/* The actual scrolling roll feed */}
          <div 
            ref={conversationRef}
            className="h-[620px] overflow-y-auto px-6 py-6 space-y-6 bg-[#050506] custom-scroll"
          >
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-[#52525b]">
                Initializing agent research stream…
              </div>
            )}

            {messages.map((msg, idx) => {
              const agent = agentsToShow.find(a => a.name === msg.agent)!;
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
                      <div className="ml-auto text-[10px] px-2 py-px rounded bg-[#f59e0b] text-black font-semibold tracking-wider">NOW SPEAKING</div>
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
              const agent = agentsToShow.find(a => a.name === msg.agent)!;
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
