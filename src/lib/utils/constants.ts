import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'beauty', label: 'Beauty & Skincare', examples: 'Mamaearth, mCaffeine, Sugar Cosmetics, Minimalist' },
  { id: 'food', label: 'Food & Beverages', examples: 'Licious, Country Delight, Vahdam, Yogabar' },
  { id: 'health', label: 'Health & Wellness', examples: 'HealthKart, Plix, Kapiva, Wow Skin Science' },
  { id: 'fashion', label: 'Fashion & Apparel', examples: 'Bewakoof, Snitch, The Souled Store, Urbanic' },
  { id: 'electronics', label: 'Electronics & Gadgets', examples: 'boAt, Noise, Fire-Boltt, Portronics' },
  { id: 'baby', label: 'Baby & Kids', examples: 'FirstCry, The Moms Co, Mamaearth Baby' },
  { id: 'home', label: 'Home & Living', examples: 'Wakefit, Sleepyhead, Pepperfry, Urban Ladder' },
  { id: 'pet', label: 'Pet Care', examples: 'Supertails, Heads Up For Tails, Wiggles' },
];

export const SCORE_WEIGHTS = {
  mentionFrequency: 0.4,
  sentimentQuality: 0.2,
  platformCoverage: 0.2,
  positionStrength: 0.2,
} as const;

export const SCORE_COLORS = {
  low: { color: '#ef4444', label: 'Low' },      // red - score < 30
  medium: { color: '#f59e0b', label: 'Medium' }, // yellow - 30-60
  high: { color: '#22c55e', label: 'High' },     // green - > 60
} as const;

export const getScoreColor = (score: number) => {
  if (score < 30) return SCORE_COLORS.low;
  if (score <= 60) return SCORE_COLORS.medium;
  return SCORE_COLORS.high;
};

export const PLATFORMS: { id: 'chatgpt' | 'perplexity' | 'google_ai'; label: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'perplexity', label: 'Perplexity' },
  { id: 'google_ai', label: 'Google AI' },
];

export const MAX_COMPETITORS = 5;
export const QUERIES_PER_CATEGORY = 15;
export const CACHE_TTL_SECONDS = 86400; // 24 hours
export const MAX_CONCURRENT_QUERIES = 5;
export const AUDIT_TIMEOUT_MS = 60000; // 60 seconds
