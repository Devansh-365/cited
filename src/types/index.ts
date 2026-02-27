// Brand types
export interface Brand {
  id: string;
  name: string;
  websiteUrl?: string;
  category: CategoryId;
  createdAt: Date;
}

export type CategoryId = 'beauty' | 'food' | 'health' | 'fashion' | 'electronics' | 'baby' | 'home' | 'pet';

export interface Category {
  id: CategoryId;
  label: string;
  examples: string;
}

// Audit types
export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Audit {
  id: string;
  brandId: string;
  status: AuditStatus;
  visibilityScore: number | null;
  competitorData: CompetitorResult[] | null;
  gapData: Gap[] | null;
  recommendationData: Recommendation[] | null;
  createdAt: Date;
  completedAt: Date | null;
}

// AI Query types
export type AIPlatform = 'chatgpt' | 'perplexity' | 'google_ai';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface AIResponse {
  platform: AIPlatform;
  prompt: string;
  responseText: string;
  citations?: string[];
  brandMentioned: boolean;
  mentionDetails?: {
    sentiment: Sentiment;
    position: number;
    contextSnippet: string;
  };
  competitorsFound: CompetitorMention[];
  cached: boolean;
  latencyMs: number;
}

export interface CompetitorMention {
  name: string;
  position: number;
  sentiment: Sentiment;
}

// Scoring types
export interface ScoreBreakdown {
  mentionFrequency: number; // 0-100
  sentimentQuality: number; // 0-100
  platformCoverage: number; // 0-100
  positionStrength: number; // 0-100
  total: number; // 0-100 weighted
}

// Competitor types
export interface CompetitorResult {
  name: string;
  score: number;
  mentionCount: number;
  platforms: AIPlatform[];
}

// Gap types
export type GapPriority = 'high' | 'medium' | 'low';
export type GapType = 'missing_from_comparison' | 'missing_from_category' | 'missing_from_recommendation';

export interface Gap {
  prompt: string;
  platform: AIPlatform;
  priority: GapPriority;
  type: GapType;
  competitorsPresent: string[];
}

// Recommendation types
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Impact = 'low' | 'medium' | 'high';

export interface Recommendation {
  title: string;
  why: string;
  difficulty: Difficulty;
  impact: Impact;
  actionDetail: string;
}

// Email capture
export interface EmailCapture {
  id: string;
  auditId: string;
  email: string;
  brandName: string;
  optedIn: boolean;
  createdAt: Date;
}

// API request/response types
export interface AuditRequest {
  brandName: string;
  websiteUrl?: string;
  category: CategoryId;
  competitors?: string[];
}

export interface AuditResponse {
  auditId: string;
  status: AuditStatus;
  visibilityScore: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  competitors: CompetitorResult[];
  gaps: Gap[];
  recommendations: Recommendation[];
  brand: {
    name: string;
    category: CategoryId;
  };
}
