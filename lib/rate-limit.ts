import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// In-memory fallback for when Redis is unavailable
const memoryMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryMap) {
    if (now > entry.resetAt) memoryMap.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }
  return { success: true, remaining: limit - entry.count };
}

/**
 * Distributed rate limiting via Upstash Redis.
 * Falls back to in-memory if Redis is unavailable.
 */
export async function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<{ success: boolean; remaining: number }> {
  const r = getRedis();
  if (!r) return memoryRateLimit(key, limit, windowMs);

  const redisKey = `rl:${key}`;
  const windowSec = Math.ceil(windowMs / 1000);

  try {
    const current = await r.incr(redisKey);
    if (current === 1) {
      await r.expire(redisKey, windowSec);
    }
    const remaining = Math.max(0, limit - current);
    return { success: current <= limit, remaining };
  } catch {
    // Redis down — fallback to memory
    return memoryRateLimit(key, limit, windowMs);
  }
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
