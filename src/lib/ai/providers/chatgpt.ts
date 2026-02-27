import OpenAI from 'openai';
import { getCachedResponse, setCachedResponse } from '../../cache/redis';
import type { AIResponse, CompetitorMention } from '@/types';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function queryChatGPT(
  prompt: string,
  brandName: string,
  detectCompetitors: boolean = true
): Promise<AIResponse> {
  const start = Date.now();

  // Check cache
  const cached = await getCachedResponse('chatgpt', prompt);
  if (cached) {
    const parsed = JSON.parse(cached);
    return {
      ...parsed,
      cached: true,
      latencyMs: Date.now() - start,
    };
  }

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Detect brand mention
    const mentionResult = detectBrandMention(responseText, brandName);

    // Detect competitors
    const competitorsFound: CompetitorMention[] = [];

    const result: AIResponse = {
      platform: 'chatgpt',
      prompt,
      responseText,
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

    // Cache the response
    await setCachedResponse('chatgpt', prompt, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error('ChatGPT query error:', error);
    return {
      platform: 'chatgpt',
      prompt,
      responseText: '',
      brandMentioned: false,
      competitorsFound: [],
      cached: false,
      latencyMs: Date.now() - start,
    };
  }
}

function detectBrandMention(text: string, brandName: string): {
  mentioned: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  position: number;
  snippet: string;
} {
  const normalizedText = text.toLowerCase();
  const normalizedBrand = brandName.toLowerCase().trim();

  // Also try without spaces (e.g., "m Caffeine" -> "mcaffeine")
  const brandNoSpaces = normalizedBrand.replace(/\s+/g, '');

  const index = normalizedText.indexOf(normalizedBrand);
  const indexNoSpaces = index === -1 ? normalizedText.replace(/\s+/g, '').indexOf(brandNoSpaces) : -1;

  const mentioned = index !== -1 || indexNoSpaces !== -1;

  if (!mentioned) {
    return { mentioned: false, sentiment: 'neutral', position: 0, snippet: '' };
  }

  // Get context snippet (100 chars around mention)
  const mentionIndex = index !== -1 ? index : 0;
  const snippetStart = Math.max(0, mentionIndex - 50);
  const snippetEnd = Math.min(text.length, mentionIndex + brandName.length + 50);
  const snippet = text.slice(snippetStart, snippetEnd).trim();

  // Determine position (count how many brand-like names appear before this one)
  const textBeforeMention = normalizedText.slice(0, mentionIndex);
  const numberedPattern = /\d+\.\s/g;
  const matches = textBeforeMention.match(numberedPattern);
  const position = matches ? matches.length + 1 : 1;

  // Simple sentiment detection
  const sentimentContext = normalizedText.slice(
    Math.max(0, mentionIndex - 100),
    Math.min(normalizedText.length, mentionIndex + normalizedBrand.length + 100)
  );

  const positiveWords = ['best', 'top', 'recommend', 'excellent', 'great', 'popular', 'trusted', 'leading', 'favorite', 'outstanding', 'highly rated'];
  const negativeWords = ['worst', 'avoid', 'poor', 'disappointing', 'overpriced', 'complaints', 'issues', 'problems', 'controversial'];

  const posCount = positiveWords.filter(w => sentimentContext.includes(w)).length;
  const negCount = negativeWords.filter(w => sentimentContext.includes(w)).length;

  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

  return { mentioned, sentiment, position, snippet };
}
