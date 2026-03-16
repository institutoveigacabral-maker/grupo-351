import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Environment validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports env object with DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
    vi.stubEnv("ADMIN_SECRET", "test-secret-at-least-16-chars");
    vi.stubEnv("NODE_ENV", "test");

    const { env } = await import("@/lib/env");
    expect(env.DATABASE_URL).toBe("postgresql://test:test@localhost/test");
  });

  it("validates ADMIN_SECRET minimum length", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
    vi.stubEnv("ADMIN_SECRET", "short");
    vi.stubEnv("NODE_ENV", "test");

    // In non-production, should warn but not throw
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await import("@/lib/env");
    consoleSpy.mockRestore();
  });
});
