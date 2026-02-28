const DAILY_LIMIT = 20;

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

function getStartOfDay(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

function getEndOfDay(): number {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  // No entry or expired — start fresh
  if (!entry || now > entry.resetAt) {
    const resetAt = getEndOfDay();
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt };
  }

  // Within limit
  if (entry.count < DAILY_LIMIT) {
    entry.count++;
    return { allowed: true, remaining: DAILY_LIMIT - entry.count, resetAt: entry.resetAt };
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: entry.resetAt };
}
