import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateShort,
  formatMonth,
  daysSince,
  slugify,
  cleanName,
  healthScore,
  healthColor,
} from "@/lib/reunioes/utils";

describe("formatDate", () => {
  it("formats a date in pt-BR format", () => {
    const result = formatDate("2025-01-15");
    // Should contain day, month abbrev, year
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });
});

describe("formatDateShort", () => {
  it("formats date without year", () => {
    const result = formatDateShort("2025-06-20");
    expect(result).toMatch(/20/);
    expect(result).not.toMatch(/2025/);
  });
});

describe("formatMonth", () => {
  it("formats month and year", () => {
    const result = formatMonth("2025-03-10");
    expect(result).toMatch(/2025/);
  });
});

describe("daysSince", () => {
  it("returns 0 for today", () => {
    const today = new Date().toISOString().split("T")[0];
    const days = daysSince(today);
    expect(days).toBeLessThanOrEqual(1);
    expect(days).toBeGreaterThanOrEqual(0);
  });

  it("returns positive number for past dates", () => {
    const pastDate = "2024-01-01";
    expect(daysSince(pastDate)).toBeGreaterThan(0);
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("João José")).toBe("joao-jose");
  });

  it("replaces special characters with hyphens", () => {
    expect(slugify("food & drink")).toBe("food-drink");
  });

  it("removes leading/trailing hyphens", () => {
    expect(slugify(" -test- ")).toBe("test");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });

  it("handles Portuguese characters", () => {
    expect(slugify("Ação Rápida")).toBe("acao-rapida");
  });
});

describe("cleanName", () => {
  it("removes parenthetical content", () => {
    expect(cleanName("João (CEO)")).toBe("João");
  });

  it("handles multiple parentheticals", () => {
    expect(cleanName("Maria (CTO) (Parceiro)")).toBe("Maria");
  });

  it("trims whitespace", () => {
    expect(cleanName("  Test  ")).toBe("Test");
  });

  it("returns unchanged if no parentheses", () => {
    expect(cleanName("Simple Name")).toBe("Simple Name");
  });
});

describe("healthScore", () => {
  it("gives high score for active, complete project", () => {
    const today = new Date().toISOString().split("T")[0];
    const score = healthScore({
      dataUltima: today,
      prioridade: "alta",
      checkDone: 10,
      checkTotal: 10,
      totalAcoes: 15,
      responsavel: "João",
    });
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it("gives low score for stale project with no progress", () => {
    const score = healthScore({
      dataUltima: "2023-01-01",
      prioridade: "baixa",
      checkDone: 0,
      checkTotal: 10,
      totalAcoes: 0,
      responsavel: "",
    });
    expect(score).toBeLessThan(40);
  });

  it("caps at 100", () => {
    const today = new Date().toISOString().split("T")[0];
    const score = healthScore({
      dataUltima: today,
      prioridade: "critica",
      checkDone: 50,
      checkTotal: 50,
      totalAcoes: 100,
      responsavel: "Admin",
    });
    expect(score).toBeLessThanOrEqual(100);
  });

  it("handles zero checkTotal", () => {
    const today = new Date().toISOString().split("T")[0];
    const score = healthScore({
      dataUltima: today,
      prioridade: "media",
      checkDone: 0,
      checkTotal: 0,
      totalAcoes: 5,
      responsavel: "Test",
    });
    // Should give default 10 for checklist when total is 0
    expect(score).toBeGreaterThan(0);
  });

  it("recency: recent date gets more points", () => {
    const today = new Date().toISOString().split("T")[0];
    const baseProject = {
      prioridade: "media",
      checkDone: 0,
      checkTotal: 0,
      totalAcoes: 0,
      responsavel: "",
    };
    const recent = healthScore({ ...baseProject, dataUltima: today });
    const old = healthScore({ ...baseProject, dataUltima: "2020-01-01" });
    expect(recent).toBeGreaterThan(old);
  });
});

describe("healthColor", () => {
  it("returns emerald for score >= 70", () => {
    const color = healthColor(85);
    expect(color.ring).toContain("emerald");
  });

  it("returns amber for score 40-69", () => {
    const color = healthColor(55);
    expect(color.ring).toContain("amber");
  });

  it("returns red for score < 40", () => {
    const color = healthColor(20);
    expect(color.ring).toContain("red");
  });
});
