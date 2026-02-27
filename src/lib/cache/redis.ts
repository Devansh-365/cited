import { Redis } from '@upstash/redis';
import { CACHE_TTL_SECONDS } from '../utils/constants';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis not configured — caching disabled');
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function getCacheKey(platform: string, prompt: string): string {
  // Simple hash for cache key
  const input = `${platform}:${prompt.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `avc:query:${Math.abs(hash).toString(36)}`;
}

export async function getCachedResponse(platform: string, prompt: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const key = getCacheKey(platform, prompt);
    const cached = await client.get<string>(key);
    return cached;
  } catch (error) {
    console.error('Redis cache get error:', error);
    return null;
  }
}

export async function setCachedResponse(platform: string, prompt: string, response: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    const key = getCacheKey(platform, prompt);
    await client.set(key, response, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
}
