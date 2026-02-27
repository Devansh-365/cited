import type { AIResponse, CompetitorMention, Sentiment } from '@/types';
import { CATEGORIES } from '../utils/constants';

// Known brands per category for competitor detection
const KNOWN_BRANDS: Record<string, string[]> = {
  beauty: ['mamaearth', 'mcaffeine', 'sugar cosmetics', 'minimalist', 'plum', 'nykaa', 'wow skin science', 'dot & key', 'biotique', 'lakme', 'forest essentials', 'kama ayurveda', 'the body shop'],
  food: ['licious', 'country delight', 'vahdam', 'yogabar', 'true elements', 'slurrp farm', 'raw pressery', 'epigamia', 'good dot', 'blue tokai'],
  health: ['healthkart', 'plix', 'kapiva', 'wow skin science', 'oziva', 'boldfit', 'muscleblaze', 'fast&up', 'wellbeing nutrition', 'gynoveda'],
  fashion: ['bewakoof', 'snitch', 'the souled store', 'urbanic', 'rare rabbit', 'bonkers corner', 'virgio', 'freakins', 'nobero', 'damensch'],
  electronics: ['boat', 'noise', 'fire-boltt', 'portronics', 'ambrane', 'ptron', 'realme', 'oneplus', 'boult audio', 'crossbeats'],
  baby: ['firstcry', 'the moms co', 'mamaearth baby', 'mothercare', 'himalaya baby', 'johnsons baby', 'chicco', 'mee mee'],
  home: ['wakefit', 'sleepyhead', 'pepperfry', 'urban ladder', 'duroflex', 'the sleep company', 'flo mattress', 'sunday mattress'],
  pet: ['supertails', 'heads up for tails', 'wiggles', 'drools', 'pedigree', 'royal canin', 'whiskas', 'sheba'],
};

export function extractCompetitors(
  responseText: string,
  brandName: string,
  category: string
): CompetitorMention[] {
  const normalizedText = responseText.toLowerCase();
  const normalizedBrand = brandName.toLowerCase().trim();
  const knownBrands = KNOWN_BRANDS[category] || [];

  const competitors: CompetitorMention[] = [];
  let positionCounter = 1;

  for (const brand of knownBrands) {
    // Skip the user's own brand
    if (brand === normalizedBrand || brand.includes(normalizedBrand) || normalizedBrand.includes(brand)) {
      continue;
    }

    if (normalizedText.includes(brand)) {
      const index = normalizedText.indexOf(brand);
      const context = normalizedText.slice(
        Math.max(0, index - 80),
        Math.min(normalizedText.length, index + brand.length + 80)
      );

      const sentiment = detectSentiment(context);

      competitors.push({
        name: brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        position: positionCounter++,
        sentiment,
      });
    }
  }

  return competitors;
}

function detectSentiment(context: string): Sentiment {
  const positiveWords = ['best', 'top', 'recommend', 'excellent', 'great', 'popular', 'trusted', 'leading', 'favorite', 'highly rated', 'premium'];
  const negativeWords = ['worst', 'avoid', 'poor', 'disappointing', 'overpriced', 'complaints', 'issues', 'problems'];

  const posCount = positiveWords.filter(w => context.includes(w)).length;
  const negCount = negativeWords.filter(w => context.includes(w)).length;

  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

export function enrichResponseWithCompetitors(
  response: AIResponse,
  brandName: string,
  category: string
): AIResponse {
  const competitors = extractCompetitors(response.responseText, brandName, category);
  return {
    ...response,
    competitorsFound: competitors,
  };
}
