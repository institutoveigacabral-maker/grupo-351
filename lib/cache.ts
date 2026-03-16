import { Redis } from "@upstash/redis";
import { logger } from "./logger";

/** Typed cache key builders to avoid collisions and simplify invalidation. */
export const CACHE_KEYS = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  notifications: (userId: string) => `user:${userId}:notifications`,
  matches: (userId: string) => `user:${userId}:matches`,
  team: (companyId: string) => `company:${companyId}:team`,
  projects: (companyId: string) => `company:${companyId}:projects`,
  billing: (companyId: string) => `company:${companyId}:billing`,
  opportunities: (companyId: string) => `company:${companyId}:opportunities`,
  // Public listing caches
  publicOpportunities: (params: string) => `public:opportunities:${params}`,
  publicCompanies: (params: string) => `public:companies:${params}`,
  companyProfile: (slug: string) => `public:company:${slug}`,
  // User-scoped caches
  userReviews: (userId: string) => `user:${userId}:reviews`,
  apiKeys: (userId: string) => `user:${userId}:api-keys`,
  billingInvoices: (companyId: string) => `company:${companyId}:invoices`,
  // Admin
  adminAnalytics: () => `admin:analytics`,
} as const;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

/**
 * Cache wrapper — falls through to fetcher if Redis is unavailable.
 * TTL in seconds (default 300 = 5 min).
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300
): Promise<T> {
  const r = getRedis();
  if (!r) return fetcher();

  try {
    const hit = await r.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch (err) {
    logger.warn(`Redis GET failed for ${key}`, "cache", { error: String(err) });
  }

  const data = await fetcher();

  try {
    await r.set(key, JSON.stringify(data), { ex: ttl });
  } catch (err) {
    logger.warn(`Redis SET failed for ${key}`, "cache", { error: String(err) });
  }

  return data;
}

/**
 * Invalidate one or more cache keys.
 */
export async function invalidate(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (!r || keys.length === 0) return;
  try {
    await r.del(...keys);
  } catch (err) {
    logger.warn(`Redis DEL failed for ${keys.join(", ")}`, "cache", { error: String(err) });
  }
}

/**
 * Invalidate all keys matching a pattern prefix.
 */
export async function invalidatePrefix(prefix: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    let done = false;
    let cur = 0;
    while (!done) {
      const result = await r.scan(cur, { match: `${prefix}*`, count: 100 });
      const nextCursor = Number(result[0]);
      const keys = result[1] as string[];
      if (keys.length > 0) await r.del(...keys);
      if (nextCursor === 0) done = true;
      else cur = nextCursor;
    }
  } catch (err) {
    logger.warn(`Redis SCAN failed for prefix ${prefix}`, "cache", { error: String(err) });
  }
}
