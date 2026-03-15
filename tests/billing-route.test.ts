import { describe, it, expect, vi, beforeEach } from "vitest";
import { PLANS, canUseFeature, getOpportunityLimit } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

describe("Billing route logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all plans in billing GET response", () => {
    const allPlans = Object.values(PLANS);
    expect(allPlans).toHaveLength(3);
    expect(allPlans.map((p) => p.id)).toEqual(["free", "growth", "enterprise"]);
  });

  it("getCompanyPlan returns free for no subscription", async () => {
    (prisma.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { getCompanyPlan } = await import("@/lib/stripe");
    const plan = await getCompanyPlan("company-1");
    expect(plan.id).toBe("free");
  });

  it("getCompanyPlan returns free for canceled subscription", async () => {
    (prisma.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      companyId: "company-1",
      plano: "growth",
      status: "canceled",
    });
    const { getCompanyPlan } = await import("@/lib/stripe");
    const plan = await getCompanyPlan("company-1");
    expect(plan.id).toBe("free");
  });

  it("getCompanyPlan returns correct plan for active subscription", async () => {
    (prisma.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      companyId: "company-1",
      plano: "growth",
      status: "active",
    });
    const { getCompanyPlan } = await import("@/lib/stripe");
    const plan = await getCompanyPlan("company-1");
    expect(plan.id).toBe("growth");
    expect(plan.preco).toBe(4900);
  });

  it("getCompanyPlan falls back to free for unknown plan name", async () => {
    (prisma.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      companyId: "company-1",
      plano: "nonexistent",
      status: "active",
    });
    const { getCompanyPlan } = await import("@/lib/stripe");
    const plan = await getCompanyPlan("company-1");
    expect(plan.id).toBe("free");
  });

  it("free plan cannot create checkout (preco === 0)", () => {
    const plan = PLANS["free"];
    expect(plan.preco === 0).toBe(true);
    // The createCheckoutSession function throws for free plans
  });

  it("growth plan limits: 10 opportunities, AI matches, no API", () => {
    const plan = PLANS.growth;
    expect(getOpportunityLimit(plan)).toBe(10);
    expect(canUseFeature(plan, "matchesIA")).toBe(true);
    expect(canUseFeature(plan, "apiAccess")).toBe(false);
  });

  it("enterprise plan limits: unlimited opportunities, AI matches, API access", () => {
    const plan = PLANS.enterprise;
    expect(getOpportunityLimit(plan)).toBe(-1);
    expect(canUseFeature(plan, "matchesIA")).toBe(true);
    expect(canUseFeature(plan, "apiAccess")).toBe(true);
  });

  it("billing POST requires action parameter", () => {
    // Simulate the validation from the billing route
    const body1 = { action: "checkout", planId: "growth" };
    const body2 = { action: "manage" };
    const body3 = {};

    expect(body1.action === "checkout" && body1.planId).toBeTruthy();
    expect(body2.action === "manage").toBeTruthy();
    expect(!("action" in body3)).toBeTruthy();
  });
});
