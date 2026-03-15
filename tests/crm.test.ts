import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("CRM module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isCrmConfigured", () => {
    it("returns false when no provider configured", async () => {
      delete process.env.CRM_PROVIDER;
      const { isCrmConfigured } = await import("@/lib/crm");
      expect(isCrmConfigured()).toBe(false);
    });

    it("returns true for hubspot with API key", async () => {
      process.env.CRM_PROVIDER = "hubspot";
      process.env.HUBSPOT_API_KEY = "pat-test-key";
      const { isCrmConfigured } = await import("@/lib/crm");
      expect(isCrmConfigured()).toBe(true);
    });

    it("returns false for hubspot without API key", async () => {
      process.env.CRM_PROVIDER = "hubspot";
      delete process.env.HUBSPOT_API_KEY;
      const { isCrmConfigured } = await import("@/lib/crm");
      expect(isCrmConfigured()).toBe(false);
    });

    it("returns true for pipedrive with token", async () => {
      process.env.CRM_PROVIDER = "pipedrive";
      process.env.PIPEDRIVE_API_TOKEN = "test-token";
      const { isCrmConfigured } = await import("@/lib/crm");
      expect(isCrmConfigured()).toBe(true);
    });

    it("returns false for pipedrive without token", async () => {
      process.env.CRM_PROVIDER = "pipedrive";
      delete process.env.PIPEDRIVE_API_TOKEN;
      const { isCrmConfigured } = await import("@/lib/crm");
      expect(isCrmConfigured()).toBe(false);
    });
  });

  describe("crmSyncContact", () => {
    it("does nothing when no provider configured", async () => {
      delete process.env.CRM_PROVIDER;
      const { crmSyncContact } = await import("@/lib/crm");
      // Should not throw
      await crmSyncContact({
        nome: "Test",
        email: "test@test.com",
      });
    });
  });

  describe("crmSyncDeal", () => {
    it("does nothing when no provider configured", async () => {
      delete process.env.CRM_PROVIDER;
      const { crmSyncDeal } = await import("@/lib/crm");
      // Should not throw
      await crmSyncDeal({
        nome: "Test",
        email: "test@test.com",
        titulo: "Test Deal",
      });
    });
  });
});
