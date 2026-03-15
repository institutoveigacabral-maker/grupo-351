import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasScope, generateApiKey, type ApiKeyContext } from "@/lib/api-auth";

describe("hasScope", () => {
  it("returns true when scope matches", () => {
    const ctx: ApiKeyContext = { userId: "u1", keyId: "k1", scopes: ["companies:read", "opportunities:read"] };
    expect(hasScope(ctx, "companies:read")).toBe(true);
  });

  it("returns false when scope does not match", () => {
    const ctx: ApiKeyContext = { userId: "u1", keyId: "k1", scopes: ["companies:read"] };
    expect(hasScope(ctx, "opportunities:write")).toBe(false);
  });

  it("returns true for wildcard scope", () => {
    const ctx: ApiKeyContext = { userId: "u1", keyId: "k1", scopes: ["*"] };
    expect(hasScope(ctx, "anything")).toBe(true);
  });

  it("returns false for empty scopes", () => {
    const ctx: ApiKeyContext = { userId: "u1", keyId: "k1", scopes: [] };
    expect(hasScope(ctx, "companies:read")).toBe(false);
  });
});

describe("generateApiKey", () => {
  it("starts with pk351_ prefix", () => {
    const key = generateApiKey();
    expect(key.startsWith("pk351_")).toBe(true);
  });

  it("has sufficient length", () => {
    const key = generateApiKey();
    // pk351_ + 48 hex chars (24 bytes)
    expect(key.length).toBe(6 + 48);
  });

  it("generates unique keys", () => {
    const keys = new Set(Array.from({ length: 10 }, () => generateApiKey()));
    expect(keys.size).toBe(10);
  });
});
