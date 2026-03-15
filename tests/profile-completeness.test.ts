import { describe, it, expect } from "vitest";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";

describe("profile-completeness", () => {
  it("should return 0% for empty company", () => {
    const result = calculateProfileCompleteness({} as Parameters<typeof calculateProfileCompleteness>[0]);
    expect(result.percentage).toBe(0);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("should return 100% for fully complete company", () => {
    const result = calculateProfileCompleteness({
      nome: "Test Corp",
      descricao: "A great company",
      setor: "Tech",
      pais: "Portugal",
      cidade: "Lisboa",
      linkedin: "https://linkedin.com/company/test",
      website: "https://test.com",
      interesses: ["AI", "SaaS"],
      tagline: "We build stuff",
      logo: "https://logo.png",
    });
    expect(result.percentage).toBe(100);
    expect(result.missing).toHaveLength(0);
  });

  it("should calculate partial completion", () => {
    const result = calculateProfileCompleteness({
      nome: "Test Corp",
      setor: "Tech",
      pais: "Portugal",
    } as Parameters<typeof calculateProfileCompleteness>[0]);
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.percentage).toBeLessThan(100);
  });
});
