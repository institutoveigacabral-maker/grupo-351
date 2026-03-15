import { describe, it, expect } from "vitest";
import { PLANS, canUseFeature, getOpportunityLimit, type PlanConfig } from "@/lib/stripe";

describe("PLANS configuration", () => {
  it("has three plans: free, growth, enterprise", () => {
    expect(Object.keys(PLANS)).toEqual(["free", "growth", "enterprise"]);
  });

  it("free plan costs 0", () => {
    expect(PLANS.free.preco).toBe(0);
  });

  it("growth plan costs 4900 cents (49 EUR)", () => {
    expect(PLANS.growth.preco).toBe(4900);
  });

  it("enterprise plan costs 19900 cents (199 EUR)", () => {
    expect(PLANS.enterprise.preco).toBe(19900);
  });

  it("free plan allows 1 opportunity", () => {
    expect(PLANS.free.limites.oportunidades).toBe(1);
  });

  it("growth plan allows 10 opportunities", () => {
    expect(PLANS.growth.limites.oportunidades).toBe(10);
  });

  it("enterprise plan allows unlimited opportunities (-1)", () => {
    expect(PLANS.enterprise.limites.oportunidades).toBe(-1);
  });

  it("free plan does not have AI matches", () => {
    expect(PLANS.free.limites.matchesIA).toBe(false);
  });

  it("growth plan has AI matches", () => {
    expect(PLANS.growth.limites.matchesIA).toBe(true);
  });

  it("only enterprise has API access", () => {
    expect(PLANS.free.limites.apiAccess).toBe(false);
    expect(PLANS.growth.limites.apiAccess).toBe(false);
    expect(PLANS.enterprise.limites.apiAccess).toBe(true);
  });

  it("all plans have monthly interval", () => {
    Object.values(PLANS).forEach((plan) => {
      expect(plan.intervalo).toBe("month");
    });
  });

  it("all plans have features array", () => {
    Object.values(PLANS).forEach((plan) => {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });
});

describe("canUseFeature", () => {
  it("free plan cannot use matchesIA", () => {
    expect(canUseFeature(PLANS.free, "matchesIA")).toBe(false);
  });

  it("growth plan can use matchesIA", () => {
    expect(canUseFeature(PLANS.growth, "matchesIA")).toBe(true);
  });

  it("free plan cannot use apiAccess", () => {
    expect(canUseFeature(PLANS.free, "apiAccess")).toBe(false);
  });

  it("enterprise plan can use apiAccess", () => {
    expect(canUseFeature(PLANS.enterprise, "apiAccess")).toBe(true);
  });
});

describe("getOpportunityLimit", () => {
  it("returns 1 for free plan", () => {
    expect(getOpportunityLimit(PLANS.free)).toBe(1);
  });

  it("returns 10 for growth plan", () => {
    expect(getOpportunityLimit(PLANS.growth)).toBe(10);
  });

  it("returns -1 for enterprise plan (unlimited)", () => {
    expect(getOpportunityLimit(PLANS.enterprise)).toBe(-1);
  });
});
