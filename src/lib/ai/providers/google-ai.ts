import { getCachedResponse, setCachedResponse } from '../../cache/redis';
import type { AIResponse, CompetitorMention } from '@/types';

export async function queryGoogleAI(
  prompt: string,
  brandName: string
): Promise<AIResponse> {
  const start = Date.now();

  // Check cache
  const cached = await getCachedResponse('google_ai', prompt);
  if (cached) {
    const parsed = JSON.parse(cached);
    return {
      ...parsed,
      cached: true,
      latencyMs: Date.now() - start,
    };
  }

  try {
    // Use SerpAPI to get Google AI Overview
    const params = new URLSearchParams({
      api_key: process.env.SERPAPI_KEY || '',
      q: prompt,
      engine: 'google',
      gl: 'in', // India
      hl: 'en',
    });

    const response = await fetch(`https://serpapi.com/search.json?${params}`);

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();

    // Extract AI Overview content
    const aiOverview = data.ai_overview?.text ||
                       data.ai_overview?.text_blocks?.map((b: { text?: string; snippet?: string }) => b.text || b.snippet).join('\n') ||
                       '';

    if (!aiOverview) {
      return {
        platform: 'google_ai',
        prompt,
        responseText: '',
        brandMentioned: false,
        competitorsFound: [],
        cached: false,
        latencyMs: Date.now() - start,
      };
    }

    // Detect brand mention
    const mentionResult = detectBrandMention(aiOverview, brandName);
    const competitorsFound: CompetitorMention[] = [];

    const result: AIResponse = {
      platform: 'google_ai',
      prompt,
      responseText: aiOverview,
      brandMentioned: mentionResult.mentioned,
      mentionDetails: mentionResult.mentioned ? {
        sentiment: mentionResult.sentiment,
        position: mentionResult.position,
        contextSnippet: mentionResult.snippet,
      } : undefined,
      competitorsFound,
      cached: false,
      latencyMs: Date.now() - start,
    };

    await setCachedResponse('google_ai', prompt, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Google AI query error:', error);
    return {
      platform: 'google_ai',
      prompt,
      responseText: '',
      brandMentioned: false,
      competitorsFound: [],
      cached: false,
      latencyMs: Date.now() - start,
    };
  }
}

function detectBrandMention(text: string, brandName: string) {
  const normalizedText = text.toLowerCase();
  const normalizedBrand = brandName.toLowerCase().trim();
  const brandNoSpaces = normalizedBrand.replace(/\s+/g, '');

  const index = normalizedText.indexOf(normalizedBrand);
  const indexNoSpaces = index === -1 ? normalizedText.replace(/\s+/g, '').indexOf(brandNoSpaces) : -1;
  const mentioned = index !== -1 || indexNoSpaces !== -1;

  if (!mentioned) {
    return { mentioned: false, sentiment: 'neutral' as const, position: 0, snippet: '' };
  }

  const mentionIndex = index !== -1 ? index : 0;
  const snippetStart = Math.max(0, mentionIndex - 50);
  const snippetEnd = Math.min(text.length, mentionIndex + brandName.length + 50);
  const snippet = text.slice(snippetStart, snippetEnd).trim();

  const textBeforeMention = normalizedText.slice(0, mentionIndex);
  const matches = textBeforeMention.match(/\d+\.\s/g);
  const position = matches ? matches.length + 1 : 1;

  const sentimentContext = normalizedText.slice(
    Math.max(0, mentionIndex - 100),
    Math.min(normalizedText.length, mentionIndex + normalizedBrand.length + 100)
  );

  const positiveWords = ['best', 'top', 'recommend', 'excellent', 'great', 'popular', 'trusted', 'leading'];
  const negativeWords = ['worst', 'avoid', 'poor', 'disappointing', 'overpriced', 'complaints'];

  const posCount = positiveWords.filter(w => sentimentContext.includes(w)).length;
  const negCount = negativeWords.filter(w => sentimentContext.includes(w)).length;
  const sentiment = posCount > negCount ? 'positive' as const : negCount > posCount ? 'negative' as const : 'neutral' as const;

  return { mentioned, sentiment, position, snippet };
}
