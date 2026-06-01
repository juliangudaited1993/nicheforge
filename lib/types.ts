// ResearchForge - Core Types (General Research Platform)

export interface Metric {
  label: string;
  value: number;
  note: string;
}

export interface Competitor {
  name: string;
  strength: string;
  gap: string;
}

// Generalized report for any research topic
export interface ResearchReport {
  id?: string;
  topic: string;
  // Legacy field kept for backward compatibility with older saved reports and the DB schema
  niche?: string;
  score: number;
  depth: 'quick' | 'standard' | 'deep';
  researchStyle?: 'legal' | 'corporate' | 'medical' | 'personal' | 'academic';
  reportLength?: 'short' | 'medium' | 'long';
  summary: string;
  metrics: Metric[];
  insights: string[];
  competitors?: Competitor[];
  playbook: string[];
  related: string[];
  created_at?: string;
  full_data?: any;

  // Enhanced sections for high-end reports
  market_analysis?: string; // generalized to "background_analysis" or keep for compatibility
  trend_forecast?: string;
  competitor_matrix?: Array<{
    name: string;
    market_share_estimate?: string;
    strengths: string[];
    weaknesses: string[];
    pricing?: string;
    opportunity_score: number;
  }>;
  financial_projections?: {
    estimated_tam?: string;
    sam?: string;
    som?: string;
    revenue_potential_year1?: string;
    revenue_potential_year3?: string;
    key_assumptions: string[];
  };
  risk_assessment?: string[];
  detailed_sources?: Array<{
    url: string;
    title: string;
    summary: string;
    credibility: string;
    date_accessed?: string;
  }>;
  agent_collaboration_log?: Array<{
    agent: string;
    step: string;
    reasoning: string;
    sources_used: string[];
  }>;

  // Internal flag used to show whether the report came from real Grok or local fallback
  // (only used in demo / testing mode)
  _source?: 'grok' | 'local' | 'grok-error';
}

// Keep alias for backward compatibility in some places
export type NicheReport = ResearchReport;

export interface TrendAlert {
  id: string;
  user_id: string;
  keyword: string;
  frequency: 'weekly' | 'monthly';
  min_score: number;
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'basic' | 'pro' | 'unlimited';
  // Tiers: basic ($29, 20 reports), pro ($59, 100 reports + customization), unlimited ($99)
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  report_quota_used: number;
  report_quota_limit: number;
  trial_started_at?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier = Profile['subscription_tier'];

// PDF Customization options for the new feature
export interface PDFCustomizationOptions {
  style: 'corporate' | 'legal' | 'medical' | 'personal' | 'academic';
  primaryColor: string; // hex e.g. '#f59e0b'
  secondaryColor?: string;
  pageFormat: 'letter' | 'a4';
  length: 'short' | 'medium' | 'long';
  font: 'helvetica' | 'times' | 'courier'; // jsPDF built-in
  includeAgentLog: boolean;
  includeSources: boolean;
  includeCharts: boolean;
  logoDataUrl?: string; // base64 for premium branding
  logoPosition?: 'top-left' | 'top-center' | 'bottom';

  // Premium cover page customization
  coverTitle?: string;           // Replaces "RESEARCHFORGE" on cover (company name or custom)
  coverSubtitle?: string;        // Optional line under the main title
  customFooter?: string;         // Custom text in the PDF footer
}
