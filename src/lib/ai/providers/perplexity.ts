import { getCachedResponse, setCachedResponse } from '../../cache/redis';
import type { AIResponse, CompetitorMention } from '@/types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function queryPerplexity(
  prompt: string,
  brandName: string
): Promise<AIResponse> {
  const start = Date.now();

  // Check cache
  const cached = await getCachedResponse('perplexity', prompt);
  if (cached) {
    const parsed = JSON.parse(cached);
    return {
      ...parsed,
      cached: true,
      latencyMs: Date.now() - start,
    };
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Detect brand mention
    const mentionResult = detectBrandMention(responseText, brandName);

    const competitorsFound: CompetitorMention[] = [];

    const result: AIResponse = {
      platform: 'perplexity',
      prompt,
      responseText,
      citations,
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

    await setCachedResponse('perplexity', prompt, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Perplexity query error:', error);
    return {
      platform: 'perplexity',
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
