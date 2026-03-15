import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to mock bcryptjs and crypto before importing auth
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

describe("auth module", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ADMIN_SECRET = "test-secret-key-for-unit-tests";
  });

  it("createSessionToken returns token and expires", async () => {
    const { createSessionToken } = await import("@/lib/auth");
    const result = createSessionToken("Admin Test");
    expect(result.token).toBeTruthy();
    expect(result.expires).toBeInstanceOf(Date);
    expect(result.expires.getTime()).toBeGreaterThan(Date.now());
  });

  it("verifySessionToken validates a valid token", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
    const { token } = createSessionToken("Admin Test");
    expect(verifySessionToken(token)).toBe(true);
  });

  it("verifySessionToken rejects tampered token", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/auth");
    const { token } = createSessionToken("Admin Test");
    const tampered = token.slice(0, -10) + "0000000000";
    expect(verifySessionToken(tampered)).toBe(false);
  });

  it("verifySessionToken rejects garbage input", async () => {
    const { verifySessionToken } = await import("@/lib/auth");
    expect(verifySessionToken("garbage-data")).toBe(false);
    expect(verifySessionToken("")).toBe(false);
  });

  it("getSessionName extracts name from token", async () => {
    const { createSessionToken, getSessionName } = await import("@/lib/auth");
    const { token } = createSessionToken("Maria Admin");
    const name = getSessionName(token);
    expect(name).toBe("Maria Admin");
  });

  it("getSessionRole extracts role from token", async () => {
    const { createSessionToken, getSessionRole } = await import("@/lib/auth");
    const { token } = createSessionToken("Test");
    const role = getSessionRole(token);
    expect(role).toBe("admin");
  });

  it("createUserSessionToken creates token with correct role", async () => {
    const { createUserSessionToken, getSessionRole, getSessionName } = await import("@/lib/auth");
    const { token } = createUserSessionToken({ id: "user-1", nome: "Empresa X", role: "empresa" });
    expect(getSessionRole(token)).toBe("empresa");
    expect(getSessionName(token)).toBe("Empresa X");
  });

  it("createUserSessionToken works with parceiro role", async () => {
    const { createUserSessionToken, getSessionRole } = await import("@/lib/auth");
    const { token } = createUserSessionToken({ id: "p1", nome: "Parceiro", role: "parceiro" });
    expect(getSessionRole(token)).toBe("parceiro");
  });

  it("hashPassword returns a hash string", async () => {
    const bcrypt = await import("bcryptjs");
    (bcrypt.default.hash as ReturnType<typeof vi.fn>).mockResolvedValue("$2b$12$hashedvalue");
    const { hashPassword } = await import("@/lib/auth");
    const hash = await hashPassword("testpassword");
    expect(hash).toBeTruthy();
    expect(bcrypt.default.hash).toHaveBeenCalledWith("testpassword", 12);
  });

  it("token expires in 24 hours", async () => {
    const { createSessionToken } = await import("@/lib/auth");
    const { expires } = createSessionToken("Test");
    const diff = expires.getTime() - Date.now();
    // Should be approximately 24 hours (86400000 ms)
    expect(diff).toBeGreaterThan(86000000);
    expect(diff).toBeLessThanOrEqual(86400000);
  });
});
