import { describe, it, expect } from "vitest";
import { locales, defaultLocale, localeNames } from "@/i18n/config";

describe("i18n config", () => {
  it("should have 4 locales", () => {
    expect(locales).toHaveLength(4);
    expect(locales).toContain("pt-BR");
    expect(locales).toContain("pt-PT");
    expect(locales).toContain("en");
    expect(locales).toContain("es");
  });

  it("should default to pt-PT", () => {
    expect(defaultLocale).toBe("pt-PT");
  });

  it("should have names for all locales", () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy();
    }
  });
});

describe("i18n message files", () => {
  const requiredKeys = ["nav", "header", "dashboard", "ai", "common", "team", "opportunities", "plan", "verification"];

  for (const locale of locales) {
    it(`${locale} should have all required top-level keys`, async () => {
      const messages = (await import(`@/messages/${locale}.json`)).default;
      for (const key of requiredKeys) {
        expect(messages).toHaveProperty(key);
      }
    });
  }

  it("all locales should have the same keys as pt-PT", async () => {
    const base = (await import("@/messages/pt-PT.json")).default;
    const baseKeys = Object.keys(base);

    for (const locale of locales) {
      if (locale === "pt-PT") continue;
      const messages = (await import(`@/messages/${locale}.json`)).default;
      const msgKeys = Object.keys(messages);
      expect(msgKeys.sort()).toEqual(baseKeys.sort());
    }
  });
});
