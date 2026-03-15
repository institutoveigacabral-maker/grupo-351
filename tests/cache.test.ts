import { describe, it, expect, vi } from "vitest";

// No Redis env vars — cache should fallthrough to fetcher
vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

describe("cache", () => {
  it("should fallthrough to fetcher when Redis is not configured", async () => {
    const { cached } = await import("@/lib/cache");
    const fetcher = vi.fn().mockResolvedValue({ data: "test" });
    const result = await cached("test-key", fetcher, 60);
    expect(result).toEqual({ data: "test" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("should call invalidate without error when Redis is not configured", async () => {
    const { invalidate } = await import("@/lib/cache");
    await expect(invalidate("key1", "key2")).resolves.toBeUndefined();
  });

  it("should call invalidatePrefix without error when Redis is not configured", async () => {
    const { invalidatePrefix } = await import("@/lib/cache");
    await expect(invalidatePrefix("prefix:")).resolves.toBeUndefined();
  });
});
