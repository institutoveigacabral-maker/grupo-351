import { describe, it, expect, beforeEach, vi } from "vitest";
// We need to reimport to get a fresh module for each test
import { rateLimit, getClientIP } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows first request", () => {
    const result = rateLimit("test-fresh-1", { limit: 5, windowMs: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("decrements remaining on successive calls", () => {
    const key = "test-decrement-" + Date.now();
    rateLimit(key, { limit: 5, windowMs: 60000 });
    const second = rateLimit(key, { limit: 5, windowMs: 60000 });
    expect(second.remaining).toBe(3);
  });

  it("blocks after limit is exceeded", () => {
    const key = "test-block-" + Date.now();
    for (let i = 0; i < 3; i++) {
      rateLimit(key, { limit: 3, windowMs: 60000 });
    }
    const result = rateLimit(key, { limit: 3, windowMs: 60000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("uses default limit of 10", () => {
    const key = "test-default-" + Date.now();
    const result = rateLimit(key);
    expect(result.remaining).toBe(9);
  });

  it("resets after window expires", async () => {
    const key = "test-expire-" + Date.now();
    // Use a tiny window of 10ms
    rateLimit(key, { limit: 1, windowMs: 10 });
    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 20));
    // After window expires, should allow again
    const result = rateLimit(key, { limit: 1, windowMs: 10 });
    expect(result.success).toBe(true);
  });

  it("uses different windows for different keys", () => {
    const key1 = "test-key1-" + Date.now();
    const key2 = "test-key2-" + Date.now();
    for (let i = 0; i < 3; i++) {
      rateLimit(key1, { limit: 3, windowMs: 60000 });
    }
    const blocked = rateLimit(key1, { limit: 3, windowMs: 60000 });
    const allowed = rateLimit(key2, { limit: 3, windowMs: 60000 });
    expect(blocked.success).toBe(false);
    expect(allowed.success).toBe(true);
  });
});

describe("getClientIP", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("extracts IP from x-real-ip header", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    expect(getClientIP(req)).toBe("10.0.0.1");
  });

  it("returns unknown when no IP headers present", () => {
    const req = new Request("https://example.com");
    expect(getClientIP(req)).toBe("unknown");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    const req = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "1.2.3.4",
        "x-real-ip": "10.0.0.1",
      },
    });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });
});
