import { describe, it, expect, vi } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    opportunity: { count: vi.fn() },
    companyMember: { count: vi.fn() },
  },
}));

// Mock stripe
vi.mock("@/lib/stripe", () => ({
  getCompanyPlan: vi.fn(),
  PLANS: {
    free: { limites: { oportunidades: 2, membros: 1, matchesIA: false, apiAccess: false } },
    growth: { limites: { oportunidades: 10, membros: 5, matchesIA: true, apiAccess: false } },
    enterprise: { limites: { oportunidades: -1, membros: -1, matchesIA: true, apiAccess: true } },
  },
}));

describe("plan-gates", () => {
  it("should export getCompanyLimits function", async () => {
    const mod = await import("@/lib/plan-gates");
    expect(typeof mod.getCompanyLimits).toBe("function");
  });

  it("should export formatLimitMessage function", async () => {
    const mod = await import("@/lib/plan-gates");
    expect(typeof mod.formatLimitMessage).toBe("function");
  });
});
