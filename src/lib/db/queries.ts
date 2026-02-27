import { getDb, generateId } from './neon';
import type { AuditStatus, CategoryId } from '@/types';

export async function createBrand(name: string, category: CategoryId, websiteUrl?: string) {
  const sql = getDb();
  const id = generateId();
  await sql`
    INSERT INTO brands (id, name, website_url, category)
    VALUES (${id}, ${name}, ${websiteUrl || null}, ${category})
  `;
  return id;
}

export async function createAudit(brandId: string) {
  const sql = getDb();
  const id = generateId();
  await sql`
    INSERT INTO audits (id, brand_id, status)
    VALUES (${id}, ${brandId}, 'pending')
  `;
  return id;
}

export async function updateAuditStatus(auditId: string, status: AuditStatus) {
  const sql = getDb();
  await sql`
    UPDATE audits SET status = ${status}
    WHERE id = ${auditId}
  `;
}

export async function updateAuditResults(
  auditId: string,
  results: {
    visibilityScore: number;
    scoreBreakdown: Record<string, number>;
    competitorData: unknown[];
    gapData: unknown[];
    recommendationData: unknown[];
  }
) {
  const sql = getDb();
  await sql`
    UPDATE audits SET
      status = 'completed',
      visibility_score = ${results.visibilityScore},
      score_breakdown = ${JSON.stringify(results.scoreBreakdown)},
      competitor_data = ${JSON.stringify(results.competitorData)},
      gap_data = ${JSON.stringify(results.gapData)},
      recommendation_data = ${JSON.stringify(results.recommendationData)},
      completed_at = NOW()
    WHERE id = ${auditId}
  `;
}

export async function getAudit(auditId: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT a.*, b.name as brand_name, b.category, b.website_url
    FROM audits a
    JOIN brands b ON a.brand_id = b.id
    WHERE a.id = ${auditId}
  `;
  return rows[0] || null;
}

export async function saveAiQuery(
  auditId: string,
  platform: string,
  prompt: string,
  response: string,
  brandMentioned: boolean,
  mentionSentiment: string | null,
  mentionPosition: number | null,
  competitorsMentioned: unknown[],
  cached: boolean
) {
  const sql = getDb();
  const id = generateId();
  await sql`
    INSERT INTO ai_queries (id, audit_id, platform, prompt, response, brand_mentioned, mention_sentiment, mention_position, competitors_mentioned, cached)
    VALUES (${id}, ${auditId}, ${platform}, ${prompt}, ${response}, ${brandMentioned}, ${mentionSentiment}, ${mentionPosition}, ${JSON.stringify(competitorsMentioned)}, ${cached})
  `;
  return id;
}

export async function saveEmailCapture(auditId: string, email: string, brandName: string) {
  const sql = getDb();
  const id = generateId();
  await sql`
    INSERT INTO email_captures (id, audit_id, email, brand_name)
    VALUES (${id}, ${auditId}, ${email}, ${brandName})
  `;
  return id;
}

export async function getAuditQueries(auditId: string) {
  const sql = getDb();
  return await sql`
    SELECT * FROM ai_queries WHERE audit_id = ${auditId} ORDER BY created_at
  `;
}
