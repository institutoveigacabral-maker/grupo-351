import { describe, it, expect } from "vitest";
import { tagColors, getTagColor, prioConfig, statusConfig, catIconColors } from "@/lib/reunioes/constants";

describe("tagColors", () => {
  it("has entries for common tags", () => {
    expect(tagColors.IPO).toBeTruthy();
    expect(tagColors.IA).toBeTruthy();
    expect(tagColors.China).toBeTruthy();
    expect(tagColors.Franquia).toBeTruthy();
    expect(tagColors.Portugal).toBeTruthy();
  });

  it("all values contain Tailwind color classes", () => {
    Object.values(tagColors).forEach((value) => {
      expect(value).toMatch(/bg-/);
      expect(value).toMatch(/text-/);
    });
  });
});

describe("getTagColor", () => {
  it("returns matching color for known tag", () => {
    expect(getTagColor("IPO")).toBe(tagColors.IPO);
  });

  it("matches case-insensitively", () => {
    expect(getTagColor("ipo")).toBe(tagColors.IPO);
    expect(getTagColor("china")).toBe(tagColors.China);
  });

  it("matches partial tag", () => {
    // "Estrategia empresarial" contains "ia" which matches "IA" first in iteration
    // Test with a tag that uniquely matches
    expect(getTagColor("Supply Chain global")).toBe(tagColors["Supply Chain"]);
  });

  it("returns default for unknown tag", () => {
    const result = getTagColor("unknown-tag-xyz");
    expect(result).toBe("bg-black/[0.04] text-foreground/70");
  });
});

describe("prioConfig", () => {
  it("has all priority levels", () => {
    expect(prioConfig.critica).toBeDefined();
    expect(prioConfig.alta).toBeDefined();
    expect(prioConfig.media).toBeDefined();
    expect(prioConfig.baixa).toBeDefined();
  });

  it("each priority has label, color, and dot", () => {
    Object.values(prioConfig).forEach((config) => {
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.dot).toBeTruthy();
    });
  });
});

describe("statusConfig", () => {
  it("has all status values", () => {
    expect(statusConfig.planejamento).toBeDefined();
    expect(statusConfig.em_desenvolvimento).toBeDefined();
    expect(statusConfig.em_andamento).toBeDefined();
    expect(statusConfig.pausado).toBeDefined();
    expect(statusConfig.concluido).toBeDefined();
  });

  it("each status has label, color, and bg", () => {
    Object.values(statusConfig).forEach((config) => {
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.bg).toBeTruthy();
    });
  });
});

describe("catIconColors", () => {
  it("has category color mappings", () => {
    expect(Object.keys(catIconColors).length).toBeGreaterThan(0);
  });

  it("all values are Tailwind text color classes", () => {
    Object.values(catIconColors).forEach((value) => {
      expect(value).toMatch(/^text-/);
    });
  });
});
