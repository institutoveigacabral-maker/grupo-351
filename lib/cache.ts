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
  } catch {
    // Redis down — fallthrough
  }

  const data = await fetcher();

  try {
    await r.set(key, JSON.stringify(data), { ex: ttl });
  } catch {
    // Redis down — ignore
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
  } catch {
    // ignore
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
  } catch {
    // ignore
  }
}
