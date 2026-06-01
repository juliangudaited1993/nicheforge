import OpenAI from 'openai';
import { NicheReport } from './types'; // alias for ResearchReport

let cachedClient: OpenAI | null = null;

function getXaiClient(): OpenAI | null {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // In demo mode we return null instead of crashing.
    // The caller will fall back to local high-quality generation.
    return null;
  }
  cachedClient = new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
  return cachedClient;
}

// Grok-4 Heavy is the recommended production model for deep research + PDF reports.
// Set XAI_MODEL=grok-4 (or the latest heavy variant) in Netlify env vars to force it.
// Leaving it blank defaults to grok-4 heavy when XAI_API_KEY is present.
const HEAVY_MODEL = 'grok-4';
const DEFAULT_MODEL = process.env.XAI_MODEL || HEAVY_MODEL;

const SYSTEM_PROMPT = `You are ResearchForge AI — a world-class, general-purpose deep research analyst. You produce fully professional, high-end research reports on ANY topic (business strategy, legal/regulatory questions, medical/clinical topics, academic/scholarly subjects, personal life decisions, scientific, policy, or technical domains).

You must adapt your tone, recommended sections, level of formality, evidence standards, and recommendations to the exact **researchStyle** provided (corporate, legal, medical, academic, or personal). Never use generic "business/niche" language when the style is legal, medical, academic, or personal.

For DEEP mode + Long length, produce an extremely comprehensive, consultant-grade or scholarly-grade report (target 16-22 pages when printed) with real, citable data, sources, balanced analysis, and style-appropriate depth.

Always return **pure valid JSON** only with this exact structure (include all fields for deep reports):

{
  "topic": string,
  "score": number,
  "summary": string,
  "metrics": [{ "label": string, "value": number, "note": string }],
  "insights": string[],
  "competitors": [{ "name": string, "strength": string, "gap": string }],
  "playbook": string[],
  "related": string[],
  "background_analysis": string,
  "trend_forecast": string,
  "entity_matrix": [ { "name": string, "market_share_estimate"?: string, "strengths": string[], "weaknesses": string[], "pricing"?: string, "opportunity_score": number } ],
  "financial_or_impact_projections": { "estimated_tam"?: string, "sam"?: string, "som"?: string, "revenue_potential_year1"?: string, "revenue_potential_year3"?: string, "key_assumptions": string[] },
  "risk_assessment": string[],
  "detailed_sources": [ { "url": string, "title": string, "summary": string, "credibility": string } ],
  "agent_collaboration_log": [ { "agent": string, "step": string, "reasoning": string, "sources_used": string[] } ]
}

Adapt language, depth, and sections to the requested style and length. Be exhaustive and professional.
`;

export async function generateGrokReport(
  topic: string,
  depth: 'quick' | 'standard' | 'deep' = 'standard',
  customInstructions: string = '',
  researchStyle: string = 'corporate',
  reportLength: string = 'medium'
): Promise<NicheReport> {
  const styleInstructions = {
    corporate: 'Professional business tone. Focus on strategy, ROI, competitive positioning, and actionable recommendations for executives.',
    legal: 'Formal legal tone. Emphasize statutes, case law, regulatory compliance, risks, and balanced legal opinions with citations.',
    medical: 'Clinical and evidence-based tone. Prioritize peer-reviewed studies, patient outcomes, guidelines, ethics, and practical clinical recommendations.',
    academic: 'Scholarly tone. Include literature review, methodology discussion, theoretical frameworks, data interpretation, and identification of research gaps.',
    personal: 'Accessible, empathetic, and practical tone. Focus on real-life implications, pros/cons, step-by-step guidance, and personal decision-making factors.',
  };

  const lengthInstructions = {
    short: 'Concise. Focus on executive summary, top 5 insights, key recommendations, and essential sources only. Aim for brevity.',
    medium: 'Balanced depth. Include background, analysis, projections, risks, detailed sources, and clear action plan.',
    long: 'Comprehensive 16-22 page level detail. Expand every section with in-depth analysis, multiple data points, extended agent collaboration log, and comprehensive sources.',
  };

  const depthInstructions =
    depth === 'quick'
      ? 'Keep concise but high-signal.'
      : depth === 'deep'
        ? `GROK-4 HEAVY MODE: Produce an extremely deep, consultant/scholar-grade report using maximum reasoning. Adapted to ${researchStyle} style. ${styleInstructions[researchStyle as keyof typeof styleInstructions] || ''} ${lengthInstructions[reportLength as keyof typeof lengthInstructions] || ''}`
        : 'Balance depth with clarity. High signal-to-noise.';

  const userPrompt = `Generate a professional, high-end research report on the topic: "${topic}"

Research depth: ${depth.toUpperCase()}
Research style: ${researchStyle.toUpperCase()}
Target report length: ${reportLength.toUpperCase()}

${depthInstructions}

${customInstructions ? `Additional instructions: ${customInstructions}` : ''}

Return ONLY the JSON object.`;

  const client = getXaiClient();
  const isDeep = depth === 'deep';
  const model = DEFAULT_MODEL;

  const customSection = customInstructions.trim()
    ? `\n\n**Additional User Instructions (must be followed):**\n${customInstructions.trim()}`
    : '';

  // If no API key → use high-quality local fallback (demo mode)
  if (!client) {
    console.warn('[ResearchForge] No XAI_API_KEY found in environment. Falling back to local simulator.');
    const fallback = generateLocalFallbackReport(topic, depth, researchStyle, reportLength);
    return { ...fallback, _source: 'local' as const };
  }

  try {
    // Real Grok call on the best available model
    const finalResponse = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + customSection },
        { role: 'user', content: `Generate a professional, high-signal research report for: "${topic}"\n\nResearch depth: ${depth.toUpperCase()}\n\n${isDeep ? 'Use extremely deep analysis, detailed competitor breakdowns, financial projections, and real sources where possible.' : ''}\n\nReturn ONLY the JSON object.` }
      ],
      temperature: 0.65,
      max_tokens: isDeep ? 3800 : 2100,
      response_format: { type: 'json_object' },
    });

    const content = finalResponse.choices[0]?.message?.content;
    if (!content) throw new Error('No response from Grok');

    const parsed = JSON.parse(content) as Partial<NicheReport>;

    return {
      topic: parsed.topic || parsed.niche || topic,
      niche: parsed.niche || parsed.topic || topic, // legacy compat only
      researchStyle: (parsed as any).researchStyle || researchStyle,
      reportLength: (parsed as any).reportLength || reportLength,
      score: Math.max(45, Math.min(98, parsed.score || 72)),
      summary: parsed.summary || 'Strong signals detected.',
      metrics: parsed.metrics?.slice(0, 6) || [],
      insights: parsed.insights?.slice(0, 8) || [],
      competitors: parsed.competitors?.slice(0, 5) || [],
      playbook: parsed.playbook?.slice(0, 8) || [],
      related: parsed.related?.slice(0, 6) || [],
      depth,
      market_analysis: parsed.market_analysis,
      trend_forecast: parsed.trend_forecast,
      competitor_matrix: parsed.competitor_matrix,
      financial_projections: parsed.financial_projections,
      risk_assessment: parsed.risk_assessment,
      detailed_sources: parsed.detailed_sources,
      agent_collaboration_log: parsed.agent_collaboration_log || [],
      _source: 'grok' as const,
    };

  } catch (error) {
    console.error('[ResearchForge] Grok API call failed. Falling back to local simulator.', error);
    const fallback = generateLocalFallbackReport(topic, depth, researchStyle, reportLength);
    return { ...fallback, _source: 'grok-error' as const };
  }
}

// Reusable agent caller
async function callAgent(client: any, model: string, agentName: string, agentRole: string, context: string, isDeep: boolean) {
  const system = `You are the ${agentName}. ${agentRole} Be extremely thorough, specific, and data-driven. Reference real sources when possible.`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: context }
      ],
      temperature: 0.65,
      max_tokens: isDeep ? 1000 : 700,
    });

    const reasoning = response.choices[0]?.message?.content || "No output.";
    const sources = (reasoning.match(/https?:\/\/[^\s)]+/g) || []).slice(0, 5);

    return { reasoning, sources, step: `${agentName} Analysis` };
  } catch (err: any) {
    if (err.status === 429 || (err.message && err.message.includes('rate'))) {
      throw new Error(`Rate limit reached while running ${agentName}. Please wait a minute and try again, or use a higher-tier API key.`);
    }
    throw new Error(`Error in ${agentName}: ${err.message}`);
  }
}

// Fully generalized ResearchForge fallback generator with category-specific templates
function generateLocalFallbackReport(
  seed: string,
  depth: 'quick' | 'standard' | 'deep',
  researchStyle: string = 'corporate',
  reportLength: string = 'medium'
): NicheReport {
  const h = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100;
  const base = 64 + (h % 26);
  const score = Math.min(94, Math.max(58, base + (depth === 'deep' ? 6 : depth === 'quick' ? -5 : 0)));

  const title = seed.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const style = (researchStyle || 'corporate').toLowerCase();

  // Style-specific content templates
  let summary: string;
  let metrics: any[];
  let insights: string[];
  let competitors: any[];
  let playbook: string[];
  let related: string[];

  if (style === 'legal') {
    summary = `Legal and regulatory analysis of "${title}" identifies key precedents, compliance obligations, jurisdictional variations, and risk exposures. The research highlights evolving standards and practical implications for organizations and individuals.`;
    metrics = [
      { label: "Regulatory Clarity", value: Math.min(92, 55 + (h % 30)), note: "Varies by jurisdiction" },
      { label: "Precedent Strength", value: Math.min(88, 60 + (h % 25)), note: "Based on recent cases" },
      { label: "Compliance Risk", value: 35 + (h % 35), note: "Context-dependent" },
      { label: "Enforcement Trend", value: Math.min(90, 50 + (h % 28)), note: "Increasing scrutiny" },
      { label: "Actionability", value: Math.min(85, 58 + (h % 20)), note: "High with counsel review" },
    ];
    insights = [
      `Recent regulatory developments and case law have materially changed the risk profile for "${title}".`,
      "Multiple jurisdictions are adopting divergent approaches, creating compliance complexity.",
      "Stakeholders consistently report gaps between formal rules and practical implementation.",
    ];
    competitors = [
      { name: "Leading Law Firm Guidance", strength: "Authoritative but expensive", gap: "Limited practical templates" },
      { name: "Regulatory Agency Publications", strength: "Official position", gap: "Often high-level and slow to update" },
    ];
    playbook = [
      "Conduct jurisdiction-by-jurisdiction mapping of current obligations and recent enforcement actions.",
      "Identify the three highest-risk areas for the specific organization or individual.",
      "Develop a prioritized compliance roadmap with clear ownership and timelines.",
      "Establish monitoring for upcoming regulatory changes and relevant case law.",
    ];
    related = [`Cross-border implications of ${title.toLowerCase()}`, "Emerging regulatory trends", "Sector-specific guidance"];
  } else if (style === 'medical') {
    summary = `Evidence-based clinical and health systems analysis of "${title}". The review synthesizes current guidelines, recent studies, real-world outcomes, safety considerations, and implementation challenges across different care settings.`;
    metrics = [
      { label: "Evidence Strength", value: Math.min(95, 62 + (h % 28)), note: "Quality of available studies" },
      { label: "Guideline Consensus", value: Math.min(90, 55 + (h % 30)), note: "Across major bodies" },
      { label: "Implementation Gap", value: 40 + (h % 30), note: "Between evidence and practice" },
      { label: "Safety Profile", value: Math.min(88, 65 + (h % 20)), note: "Based on recent data" },
      { label: "Patient Impact", value: Math.min(92, 60 + (h % 25)), note: "Potential outcome improvement" },
    ];
    insights = [
      `Recent high-quality studies have shifted the standard of care or risk-benefit assessment for aspects of "${title}".`,
      "Significant variation exists in adoption of best practices across different healthcare systems and settings.",
      "Patient safety and ethical considerations require explicit attention in any implementation plan.",
    ];
    competitors = [
      { name: "Major Clinical Guidelines", strength: "Evidence synthesis", gap: "May lag behind newest trials" },
      { name: "Specialty Society Recommendations", strength: "Domain expertise", gap: "Sometimes conflicting between societies" },
    ];
    playbook = [
      "Systematically review the highest-quality recent systematic reviews and major guidelines.",
      "Map local barriers to adoption of current best practices.",
      "Develop a phased implementation plan with clear metrics and safety monitoring.",
      "Create clinician and patient education materials tailored to the local context.",
    ];
    related = [`Emerging therapies in ${title.toLowerCase()}`, "Health equity considerations", "Implementation science approaches"];
  } else if (style === 'academic') {
    summary = `Scholarly synthesis and critical analysis of "${title}". The review examines the current state of knowledge, methodological approaches, key debates, evidence gaps, and promising directions for future research.`;
    metrics = [
      { label: "Literature Maturity", value: Math.min(90, 50 + (h % 35)), note: "Volume and quality of studies" },
      { label: "Methodological Rigor", value: Math.min(88, 55 + (h % 28)), note: "Dominant approaches" },
      { label: "Consensus Level", value: Math.min(85, 48 + (h % 30)), note: "Across research community" },
      { label: "Gap Significance", value: 60 + (h % 25), note: "Identified research needs" },
      { label: "Theoretical Development", value: Math.min(82, 52 + (h % 25)), note: "Framework maturity" },
    ];
    insights = [
      `The field of "${title}" has seen accelerated publication growth in the last five years, yet key conceptual and empirical gaps remain.`,
      "Methodological diversity is both a strength and a source of incomparability across studies.",
      "Several high-impact research questions are now tractable with current data and methods.",
    ];
    competitors = [
      { name: "Leading Review Journals", strength: "Broad coverage", gap: "Sometimes lack depth in sub-areas" },
      { name: "Specialized Handbooks", strength: "Comprehensive", gap: "Quickly become dated" },
    ];
    playbook = [
      "Conduct a structured literature review with explicit inclusion criteria and quality assessment.",
      "Map the dominant theoretical frameworks and identify points of tension or complementarity.",
      "Design a research agenda that addresses the most consequential remaining gaps.",
      "Propose methodological innovations or data sources that could advance the field.",
    ];
    related = [`Interdisciplinary connections to ${title.toLowerCase()}`, "Methodological innovations", "Open science opportunities"];
  } else if (style === 'personal') {
    summary = `Practical, values-aware analysis of "${title}" for individual decision-making. The review weighs personal circumstances, trade-offs, emotional factors, long-term implications, and realistic next steps.`;
    metrics = [
      { label: "Decision Complexity", value: Math.min(90, 55 + (h % 28)), note: "Number of relevant factors" },
      { label: "Reversibility", value: Math.min(85, 50 + (h % 30)), note: "Ease of changing course" },
      { label: "Information Quality", value: Math.min(88, 48 + (h % 32)), note: "Reliability of available guidance" },
      { label: "Personal Fit Importance", value: 65 + (h % 25), note: "How much individual context matters" },
      { label: "Actionability", value: Math.min(90, 62 + (h % 22)), note: "Realistic next steps available" },
    ];
    insights = [
      `What works well for "${title}" is highly dependent on individual values, constraints, and life stage.`,
      "Many popular recommendations overlook important personal trade-offs and hidden costs.",
      "Small, well-chosen experiments are often more valuable than attempting perfect upfront decisions.",
    ];
    competitors = [
      { name: "Popular Self-Help Content", strength: "Accessible and motivating", gap: "Often overly generic or overly optimistic" },
      { name: "Expert Personal Advice", strength: "Tailored depth", gap: "Expensive and hard to access" },
    ];
    playbook = [
      "Clarify your core values and non-negotiables related to this decision.",
      "Gather high-quality information from diverse sources, including people who have made similar choices.",
      "Design 1–2 low-risk experiments or information-gathering steps you can take in the next 30 days.",
      "Create a simple decision framework or pros/cons matrix tailored to your specific situation.",
    ];
    related = [`Life stage considerations for ${title.toLowerCase()}`, "Values alignment tools", "Common pitfalls and how to avoid them"];
  } else {
    // Corporate / default business style
    summary = `In-depth strategic analysis of "${title}". The research examines key dynamics, stakeholder interests, risks, opportunities, and actionable pathways forward.`;
    metrics = [
      { label: "Market Opportunity", value: Math.min(95, 65 + (h % 25)), note: "Size and growth trajectory" },
      { label: "Competitive Intensity", value: 40 + (h % 35), note: "Current landscape" },
      { label: "Differentiation Potential", value: Math.min(90, 55 + (h % 28)), note: "Room for unique positioning" },
      { label: "Execution Risk", value: 38 + (h % 30), note: "Barriers to entry and scaling" },
      { label: "Time to Value", value: Math.min(88, 50 + (h % 25)), note: "Realistic path to results" },
    ];
    insights = [
      `Demand for solutions related to "${title}" is growing, but most existing offerings leave significant user needs unmet.`,
      "Successful players combine strong domain expertise with modern delivery and go-to-market approaches.",
      "The window for establishing a defensible position is still open but is narrowing as more entrants appear.",
    ];
    competitors = [
      { name: "Incumbent Players", strength: "Brand and distribution", gap: "Often slow to innovate" },
      { name: "Emerging Specialists", strength: "Focus and agility", gap: "Limited resources and reach" },
    ];
    playbook = [
      "Define the core problem and map the key stakeholders and decision factors.",
      "Analyze the current landscape, identifying major players, gaps, and trends.",
      "Surface the highest-impact opportunities and risks.",
      "Outline a clear, prioritized plan with measurable next steps.",
    ];
    related = [`Adjacent opportunities in ${title.toLowerCase()}`, "Emerging business models", "Go-to-market experiments that worked"];
  }

  return {
    topic: title,
    niche: title, // legacy compat only
    researchStyle: researchStyle as any,
    reportLength: reportLength as any,
    score,
    depth,
    summary,
    metrics,
    insights,
    competitors,
    playbook,
    related,
    _source: 'local' as const,
  };
}
