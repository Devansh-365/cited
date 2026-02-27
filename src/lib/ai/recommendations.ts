import type { Gap, Recommendation, CategoryId, AIResponse } from '@/types';

// Subreddit suggestions per category
const SUBREDDITS: Record<string, string[]> = {
  beauty: ['r/IndianSkincareAddicts', 'r/IndianMakeupAddicts', 'r/SkincareAddiction'],
  food: ['r/IndianFood', 'r/Cooking', 'r/HealthyFood'],
  health: ['r/IndianFitness', 'r/Supplements', 'r/Fitness'],
  fashion: ['r/IndianFashionAddicts', 'r/malefashionadvice', 'r/streetwear'],
  electronics: ['r/IndianGaming', 'r/headphones', 'r/gadgets'],
  baby: ['r/IndianParenting', 'r/beyondthebump', 'r/Parenting'],
  home: ['r/IndianHomes', 'r/HomeDecorating', 'r/Mattress'],
  pet: ['r/IndianPets', 'r/dogs', 'r/cats'],
};

// Review/aggregator sites per category
const AGGREGATOR_SITES: Record<string, string[]> = {
  beauty: ['Nykaa', 'BeautyBargainIndia', 'SkinKraft', 'Purplle'],
  food: ['Zomato', 'FoodViva', 'TasteAtlas', 'YourStory'],
  health: ['HealthKart', 'Nutrabay', '1mg', 'PharmEasy'],
  fashion: ['Myntra', 'Ajio', 'CRED', 'Tata CLiQ'],
  electronics: ['Gadgets360', 'MySmartPrice', 'GSMArena', 'TechPP'],
  baby: ['FirstCry', 'BabyChakra', 'ParentCircle'],
  home: ['SleepyOwl', 'WoodenStreet', 'HomeLane'],
  pet: ['Supertails', 'PetIndia', 'DogSpot'],
};

export function generateRecommendations(
  gaps: Gap[],
  brandName: string,
  category: CategoryId,
  competitorNames: string[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const subreddits = SUBREDDITS[category] || ['r/india'];
  const aggregators = AGGREGATOR_SITES[category] || [];
  const topCompetitor = competitorNames[0] || 'competitors';

  // Count gap types
  const highGaps = gaps.filter(g => g.priority === 'high');
  const categoryGaps = gaps.filter(g => g.type === 'missing_from_category');
  const comparisonGaps = gaps.filter(g => g.type === 'missing_from_comparison');

  // Recommendation 1: Comparison articles (if comparison gaps exist)
  if (comparisonGaps.length > 0 || highGaps.length > 0) {
    recommendations.push({
      title: `Create a detailed "${brandName} vs ${topCompetitor}" comparison article`,
      why: `AI models heavily cite comparison articles when answering "which is better" queries. ${topCompetitor} appears in ${highGaps.length} queries where ${brandName} doesn't. Publishing an honest comparison gives AI models a source to cite your brand.`,
      difficulty: 'medium',
      impact: 'high',
      actionDetail: `Publish a 1,500+ word comparison on your blog covering: features, pricing, pros/cons, and use cases. Be balanced — AI models prefer objective content over promotional. Include a comparison table with specific data points. Target these specific queries: ${comparisonGaps.slice(0, 3).map(g => `"${g.prompt}"`).join(', ')}.`,
    });
  }

  // Recommendation 2: Reddit presence
  recommendations.push({
    title: `Build authentic Reddit presence in ${subreddits.slice(0, 2).join(' and ')}`,
    why: `Reddit is the #1 source AI models cite — 40% of all LLM citations come from Reddit. Indian D2C brands have almost zero Reddit presence, making this the biggest untapped opportunity.`,
    difficulty: 'medium',
    impact: 'high',
    actionDetail: `Start by genuinely participating in ${subreddits.join(', ')}. Answer real questions about your category. Share honest experiences (not promotional posts — Reddit communities detect and ban spam). After building credibility, naturally mention ${brandName} when relevant. Target: 2-3 genuine Reddit posts per week for 3 months.`,
  });

  // Recommendation 3: Review aggregators
  if (categoryGaps.length > 0) {
    recommendations.push({
      title: `Get listed on ${aggregators.slice(0, 3).join(', ')} with detailed product pages`,
      why: `AI models pull data from aggregator and review sites. Your competitors appear on these platforms but ${brandName} is missing or has minimal presence. ${categoryGaps.length} category queries don't mention your brand.`,
      difficulty: 'easy',
      impact: 'medium',
      actionDetail: `Submit your brand and products to: ${aggregators.join(', ')}. Ensure each listing has: detailed product descriptions with specific claims, customer review integration, pricing info, and high-quality images. Encourage existing customers to leave reviews on these platforms.`,
    });
  }

  // Recommendation 4: Website optimization for AI
  recommendations.push({
    title: `Optimize your website for AI extraction`,
    why: `When AI is asked about ${brandName}, it pulls from your website. Most D2C sites are optimized for humans, not AI. Adding structured data, FAQ schema, and clear factual claims makes your site 3x more likely to be cited.`,
    difficulty: 'easy',
    impact: 'medium',
    actionDetail: `Quick wins: (1) Add FAQ schema markup to your top 5 product pages with common questions and clear answers. (2) Create a comprehensive "About ${brandName}" page with founding story, key differentiators, awards, and specific statistics. (3) Add comparison tables with concrete numbers on product pages. (4) Ensure your meta descriptions include category keywords ("best [category] in India").`,
  });

  // Recommendation 5: PR / backlinks
  if (highGaps.length >= 3) {
    recommendations.push({
      title: `Get featured in high-authority Indian publications`,
      why: `Perplexity and Google AI heavily weight authoritative sources. ${topCompetitor} is cited from publications that ${brandName} doesn't appear in. High-authority backlinks are the strongest signal for AI recommendation.`,
      difficulty: 'hard',
      impact: 'high',
      actionDetail: `Target these publications: YourStory, Inc42, BusinessToday, Economic Times Brand Equity, Mint. Pitch angles: founder story, product innovation, category insights ("The state of ${category} in India 2025"), or a data-driven industry report. Even one feature in a top publication can significantly boost AI citations.`,
    });
  }

  // Recommendation 6: Category-specific content
  if (categoryGaps.length >= 2) {
    recommendations.push({
      title: `Publish a "Best ${getCategoryLabel(category)} in India" guide featuring your brand`,
      why: `${categoryGaps.length} category-level queries ("best [product] in India") don't mention ${brandName}. Publishing authoritative category content positions your brand as a thought leader and gives AI models a source to cite.`,
      difficulty: 'medium',
      impact: 'medium',
      actionDetail: `Create a comprehensive, honest guide reviewing the top 10 brands in your category (including yours). Use specific metrics: ingredients, pricing, reviews, certifications. Don't make it purely self-promotional — AI prefers balanced content. Include quotes from real customers and link to third-party reviews.`,
    });
  }

  // Return top 5 recommendations, sorted by impact
  const impactOrder = { high: 3, medium: 2, low: 1 };
  return recommendations
    .sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])
    .slice(0, 5);
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    beauty: 'Skincare & Beauty Products',
    food: 'Food & Beverages',
    health: 'Health & Wellness Supplements',
    fashion: 'Fashion Brands',
    electronics: 'Electronics & Gadgets',
    baby: 'Baby Care Products',
    home: 'Home & Living Products',
    pet: 'Pet Care Products',
  };
  return labels[category] || category;
}

export function identifyGaps(
  responses: AIResponse[],
  brandName: string
): Gap[] {
  const gaps: Gap[] = [];

  for (const response of responses) {
    // Only create gaps where brand is NOT mentioned but competitors ARE
    if (!response.brandMentioned && response.competitorsFound.length > 0) {
      // Determine gap type based on prompt content
      const promptLower = response.prompt.toLowerCase();
      let gapType: 'missing_from_comparison' | 'missing_from_category' | 'missing_from_recommendation' = 'missing_from_category';

      if (promptLower.includes(' vs ') || promptLower.includes('compare') || promptLower.includes('versus')) {
        gapType = 'missing_from_comparison';
      } else if (promptLower.includes('should i') || promptLower.includes('recommend') || promptLower.includes('which')) {
        gapType = 'missing_from_recommendation';
      }

      // Determine priority based on how many competitors appear
      const competitorCount = response.competitorsFound.length;
      let priority: 'high' | 'medium' | 'low' = 'low';

      if (competitorCount >= 2) priority = 'high';
      else if (competitorCount === 1) priority = 'medium';

      // If competitor appears on multiple platforms for same query concept, upgrade priority
      const samePromptResponses = responses.filter(
        r => r.prompt === response.prompt && !r.brandMentioned && r.competitorsFound.length > 0
      );
      if (samePromptResponses.length >= 2) priority = 'high';

      gaps.push({
        prompt: response.prompt,
        platform: response.platform,
        priority,
        type: gapType,
        competitorsPresent: response.competitorsFound.map(c => c.name),
      });
    }
  }

  // Sort: high priority first, then by competitor count
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
