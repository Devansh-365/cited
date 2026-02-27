import type { AIResponse, ScoreBreakdown, CompetitorResult, AIPlatform } from '@/types';
import { SCORE_WEIGHTS } from '../utils/constants';

export function calculateVisibilityScore(responses: AIResponse[]): ScoreBreakdown {
  const totalQueries = responses.length;
  if (totalQueries === 0) {
    return { mentionFrequency: 0, sentimentQuality: 0, platformCoverage: 0, positionStrength: 0, total: 0 };
  }

  const mentionedResponses = responses.filter(r => r.brandMentioned);

  // 1. Mention Frequency (what % of queries mention the brand)
  const mentionFrequency = (mentionedResponses.length / totalQueries) * 100;

  // 2. Sentiment Quality (weighted: positive=1, neutral=0.5, negative=0)
  let sentimentQuality = 0;
  if (mentionedResponses.length > 0) {
    const sentimentSum = mentionedResponses.reduce((sum, r) => {
      const s = r.mentionDetails?.sentiment;
      if (s === 'positive') return sum + 1;
      if (s === 'neutral') return sum + 0.5;
      return sum;
    }, 0);
    sentimentQuality = (sentimentSum / mentionedResponses.length) * 100;
  }

  // 3. Platform Coverage (how many of the 3 platforms mention the brand at least once)
  const platformsWithMention = new Set<AIPlatform>();
  mentionedResponses.forEach(r => platformsWithMention.add(r.platform));
  const platformCoverage = (platformsWithMention.size / 3) * 100;

  // 4. Position Strength (average of 1/position: 1st=1.0, 2nd=0.5, 3rd=0.33, 4th+=0.25)
  let positionStrength = 0;
  if (mentionedResponses.length > 0) {
    const positionSum = mentionedResponses.reduce((sum, r) => {
      const pos = r.mentionDetails?.position || 1;
      if (pos === 1) return sum + 1.0;
      if (pos === 2) return sum + 0.5;
      if (pos === 3) return sum + 0.33;
      return sum + 0.25;
    }, 0);
    positionStrength = (positionSum / mentionedResponses.length) * 100;
  }

  // Weighted total
  const total = Math.round(
    mentionFrequency * SCORE_WEIGHTS.mentionFrequency +
    sentimentQuality * SCORE_WEIGHTS.sentimentQuality +
    platformCoverage * SCORE_WEIGHTS.platformCoverage +
    positionStrength * SCORE_WEIGHTS.positionStrength
  );

  return {
    mentionFrequency: Math.round(mentionFrequency),
    sentimentQuality: Math.round(sentimentQuality),
    platformCoverage: Math.round(platformCoverage),
    positionStrength: Math.round(positionStrength),
    total: Math.min(100, total),
  };
}

export function calculateCompetitorScores(responses: AIResponse[]): CompetitorResult[] {
  // Aggregate all competitors found across all responses
  const competitorMap = new Map<string, {
    mentionCount: number;
    platforms: Set<AIPlatform>;
    totalQueries: number;
  }>();

  for (const response of responses) {
    for (const comp of response.competitorsFound) {
      const key = comp.name.toLowerCase();
      if (!competitorMap.has(key)) {
        competitorMap.set(key, { mentionCount: 0, platforms: new Set(), totalQueries: responses.length });
      }
      const data = competitorMap.get(key)!;
      data.mentionCount++;
      data.platforms.add(response.platform);
    }
  }

  // Convert to scored results
  const results: CompetitorResult[] = [];
  for (const [name, data] of competitorMap) {
    // Simple score: (mentions / total queries) * platform coverage factor
    const mentionRate = data.mentionCount / data.totalQueries;
    const platformFactor = data.platforms.size / 3;
    const score = Math.round(mentionRate * 60 + platformFactor * 40);

    results.push({
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      score: Math.min(100, score),
      mentionCount: data.mentionCount,
      platforms: Array.from(data.platforms),
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}
