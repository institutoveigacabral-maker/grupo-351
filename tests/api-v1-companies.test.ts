import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// We test the API route handler logic
describe("API v1/companies route handler logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects request without API key", async () => {
    const { validateApiKey } = await import("@/lib/api-auth");

    const req = new Request("https://grupo351.com/api/v1/companies");
    const ctx = await validateApiKey(req);
    expect(ctx).toBeNull();
  });

  it("rejects request with non-pk351 key", async () => {
    const { validateApiKey } = await import("@/lib/api-auth");

    const req = new Request("https://grupo351.com/api/v1/companies", {
      headers: { Authorization: "Bearer sk_test_123" },
    });
    const ctx = await validateApiKey(req);
    expect(ctx).toBeNull();
  });

  it("rejects request without Bearer prefix", async () => {
    const { validateApiKey } = await import("@/lib/api-auth");

    const req = new Request("https://grupo351.com/api/v1/companies", {
      headers: { Authorization: "pk351_test_key" },
    });
    const ctx = await validateApiKey(req);
    expect(ctx).toBeNull();
  });

  it("validates API key from database", async () => {
    const { validateApiKey } = await import("@/lib/api-auth");

    const mockApiKey = {
      id: "key-1",
      key: "pk351_abc123",
      userId: "user-1",
      scopes: ["companies:read"],
      ativa: true,
    };

    (prisma.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockApiKey);
    (prisma.apiKey.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockApiKey);

    const req = new Request("https://grupo351.com/api/v1/companies", {
      headers: { Authorization: "Bearer pk351_abc123" },
    });
    const ctx = await validateApiKey(req);
    expect(ctx).not.toBeNull();
    expect(ctx!.userId).toBe("user-1");
    expect(ctx!.scopes).toContain("companies:read");
  });

  it("rejects inactive API key", async () => {
    const { validateApiKey } = await import("@/lib/api-auth");

    (prisma.apiKey.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "key-1",
      key: "pk351_abc123",
      userId: "user-1",
      scopes: ["companies:read"],
      ativa: false,
    });

    const req = new Request("https://grupo351.com/api/v1/companies", {
      headers: { Authorization: "Bearer pk351_abc123" },
    });
    const ctx = await validateApiKey(req);
    expect(ctx).toBeNull();
  });

  it("hasScope correctly checks for required scope", async () => {
    const { hasScope } = await import("@/lib/api-auth");
    const ctx = { userId: "u1", keyId: "k1", scopes: ["companies:read"] };
    expect(hasScope(ctx, "companies:read")).toBe(true);
    expect(hasScope(ctx, "opportunities:write")).toBe(false);
  });

  it("parses pagination parameters correctly", () => {
    const url = new URL("https://grupo351.com/api/v1/companies?page=2&limit=50");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    expect(page).toBe(2);
    expect(limit).toBe(50);
  });

  it("clamps limit to max 100", () => {
    const url = new URL("https://grupo351.com/api/v1/companies?limit=500");
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    expect(limit).toBe(100);
  });

  it("defaults page to 1 and limit to 20", () => {
    const url = new URL("https://grupo351.com/api/v1/companies");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
    expect(page).toBe(1);
    expect(limit).toBe(20);
  });
});
