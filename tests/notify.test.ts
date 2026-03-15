import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("notify module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("logs to console without webhook", async () => {
    delete process.env.NOTIFY_WEBHOOK_URL;
    const { notify } = await import("@/lib/notify");

    await notify({
      tipo: "candidatura",
      nome: "João Silva",
      email: "joao@test.com",
      resumo: "Candidatura de operador para JV",
    });

    expect(console.log).toHaveBeenCalled();
  });

  it("calls webhook when URL is configured", async () => {
    process.env.NOTIFY_WEBHOOK_URL = "https://hooks.slack.com/test";
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const { notify } = await import("@/lib/notify");

    await notify({
      tipo: "contato",
      nome: "Maria Costa",
      email: "maria@test.com",
      resumo: "Contato sobre parceria",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://hooks.slack.com/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("does not throw when webhook fails", async () => {
    process.env.NOTIFY_WEBHOOK_URL = "https://hooks.slack.com/test";
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { notify } = await import("@/lib/notify");

    // Should not throw
    await notify({
      tipo: "candidatura",
      nome: "Test",
      email: "test@test.com",
      resumo: "Test",
    });

    expect(console.error).toHaveBeenCalled();
  });

  it("webhook payload contains Slack-compatible blocks", async () => {
    process.env.NOTIFY_WEBHOOK_URL = "https://hooks.slack.com/test";
    let sentBody: string | undefined;
    global.fetch = vi.fn().mockImplementation((_url: string, opts: { body: string }) => {
      sentBody = opts.body;
      return Promise.resolve({ ok: true });
    });

    const { notify } = await import("@/lib/notify");
    await notify({
      tipo: "candidatura",
      nome: "Test User",
      email: "test@test.com",
      resumo: "Test summary",
    });

    const parsed = JSON.parse(sentBody!);
    expect(parsed.text).toContain("Test User");
    expect(parsed.blocks).toBeDefined();
    expect(parsed.blocks[0].type).toBe("section");
  });
});
