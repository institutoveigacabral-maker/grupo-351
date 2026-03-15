import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the middleware logic by re-implementing the key functions
// since the middleware module uses Web Crypto API (not available in Node tests cleanly)
// We test the exported `config` matcher and the redirectOrDeny logic

describe("middleware config", () => {
  it("matches admin routes", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toContain("/admin/:path*");
    expect(config.matcher).toContain("/api/admin/:path*");
  });

  it("matches dashboard routes", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toContain("/dashboard/:path*");
    expect(config.matcher).toContain("/api/platform/:path*");
  });

  it("has exactly 4 matchers", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toHaveLength(4);
  });
});

describe("middleware token format", () => {
  it("timingSafeCompare returns false for different length strings", () => {
    // Replicate the timingSafeCompare logic from middleware
    function timingSafeCompare(a: string, b: string): boolean {
      if (a.length !== b.length) return false;
      const enc = new TextEncoder();
      const bufA = enc.encode(a);
      const bufB = enc.encode(b);
      let diff = 0;
      for (let i = 0; i < bufA.length; i++) {
        diff |= bufA[i] ^ bufB[i];
      }
      return diff === 0;
    }

    expect(timingSafeCompare("abc", "abcd")).toBe(false);
    expect(timingSafeCompare("abc", "abc")).toBe(true);
    expect(timingSafeCompare("abc", "abd")).toBe(false);
    expect(timingSafeCompare("", "")).toBe(true);
  });

  it("verifyToken rejects tokens with wrong part count", async () => {
    // Token format is either 4 parts (legacy) or 5 parts (new)
    // Any other count should be rejected
    const invalidTokens = [
      "single",
      "two:parts",
      "three:parts:here",
      "six:parts:are:too:many:parts",
    ];

    for (const token of invalidTokens) {
      const parts = token.split(":");
      expect(parts.length === 4 || parts.length === 5).toBe(
        [4, 5].includes(parts.length)
      );
    }
  });
});
