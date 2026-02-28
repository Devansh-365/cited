import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { auditRequestSchema } from "@/lib/utils/validators";
import { queryChatGPT } from "@/lib/ai/providers/chatgpt";
import { queryPerplexity } from "@/lib/ai/providers/perplexity";
import { queryGoogleAI } from "@/lib/ai/providers/google-ai";
import { enrichResponseWithCompetitors } from "@/lib/ai/detection";
import { getPromptsForCategory } from "@/lib/ai/prompts/categories";
import { calculateVisibilityScore, calculateCompetitorScores } from "@/lib/ai/scoring";
import { identifyGaps, generateRecommendations } from "@/lib/ai/recommendations";
import { MAX_CONCURRENT_QUERIES } from "@/lib/utils/constants";
import type { AIResponse, CategoryId, AuditResponse } from "@/types";

// Run queries in batches to respect rate limits
async function runInBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map((t) => t()));
    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 audits per day per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    const { allowed, remaining, resetAt } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Daily limit reached. You can run 20 audits per day.",
          code: "RATE_LIMIT",
          resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = auditRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { brandName, category, competitors: userCompetitors } = parsed.data;
    const categoryId = category as CategoryId;
    const prompts = getPromptsForCategory(categoryId);

    // Build query tasks across all 3 platforms
    const queryTasks: (() => Promise<AIResponse>)[] = [];

    for (const prompt of prompts) {
      queryTasks.push(() => queryChatGPT(prompt, brandName));
      queryTasks.push(() => queryPerplexity(prompt, brandName));
      queryTasks.push(() => queryGoogleAI(prompt, brandName));
    }

    // Execute all queries in batches
    const rawResponses = await runInBatches(queryTasks, MAX_CONCURRENT_QUERIES);

    // Enrich responses with competitor detection
    const enrichedResponses = rawResponses.map((r) =>
      enrichResponseWithCompetitors(r, brandName, categoryId)
    );

    // Calculate scores
    const scoreBreakdown = calculateVisibilityScore(enrichedResponses);
    const competitorResults = calculateCompetitorScores(enrichedResponses);

    // If user provided competitors, make sure they show up (even with score 0)
    if (userCompetitors && userCompetitors.length > 0) {
      for (const comp of userCompetitors) {
        const exists = competitorResults.find(
          (c) => c.name.toLowerCase() === comp.toLowerCase()
        );
        if (!exists) {
          competitorResults.push({
            name: comp,
            score: 0,
            mentionCount: 0,
            platforms: [],
          });
        }
      }
    }

    // Identify gaps
    const gaps = identifyGaps(enrichedResponses, brandName);

    // Generate recommendations
    const competitorNames = competitorResults.map((c) => c.name);
    const recommendations = generateRecommendations(
      gaps,
      brandName,
      categoryId,
      competitorNames
    );

    // Build response
    const auditResponse: AuditResponse = {
      auditId: crypto.randomUUID(),
      status: "completed",
      visibilityScore: scoreBreakdown.total,
      scoreBreakdown,
      competitors: competitorResults.slice(0, 5),
      gaps,
      recommendations,
      brand: {
        name: brandName,
        category: categoryId,
      },
    };

    return NextResponse.json(auditResponse, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(resetAt),
      },
    });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Failed to run audit. Please try again." },
      { status: 500 }
    );
  }
}
