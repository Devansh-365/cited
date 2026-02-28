/**
 * Quick test script for the /api/audit endpoint.
 * Usage: npx tsx scripts/test-audit.ts
 *
 * Make sure the dev server is running (npm run dev) before executing.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testAudit() {
  const payload = {
    brandName: "Mamaearth",
    category: "beauty",
    competitors: ["mCaffeine", "Minimalist"],
  };

  console.log("→ POST", `${BASE_URL}/api/audit`);
  console.log("  Payload:", JSON.stringify(payload, null, 2));
  console.log();

  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`✗ ${res.status} ${res.statusText} (${elapsed}s)`);
      console.error("  Error:", JSON.stringify(err, null, 2));
      process.exit(1);
    }

    const data = await res.json();

    console.log(`✓ ${res.status} OK (${elapsed}s)`);
    console.log();
    console.log("auditId:         ", data.auditId);
    console.log("status:          ", data.status);
    console.log("visibilityScore: ", data.visibilityScore);
    console.log();

    if (data.scoreBreakdown) {
      console.log("Score Breakdown:");
      console.log("  Mention Frequency:", data.scoreBreakdown.mentionFrequency);
      console.log("  Sentiment Quality:", data.scoreBreakdown.sentimentQuality);
      console.log("  Platform Coverage:", data.scoreBreakdown.platformCoverage);
      console.log("  Position Strength:", data.scoreBreakdown.positionStrength);
      console.log();
    }

    console.log("Competitors:     ", data.competitors?.length ?? 0);
    for (const c of data.competitors ?? []) {
      console.log(`  - ${c.name}: ${c.score} (${c.mentionCount} mentions)`);
    }
    console.log();

    console.log("Gaps:            ", data.gaps?.length ?? 0);
    console.log("Recommendations: ", data.recommendations?.length ?? 0);
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`✗ Request failed (${elapsed}s)`);
    console.error(" ", err instanceof Error ? err.message : err);
    console.error();
    console.error("Is the dev server running? (npm run dev)");
    process.exit(1);
  }
}

testAudit();
