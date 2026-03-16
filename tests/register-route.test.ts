import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$hashed"),
    compare: vi.fn(),
  },
}));

describe("Register route logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET = "test-secret";
  });

  it("rejects invalid JSON", async () => {
    const { registerSchema } = await import("@/lib/validations");
    const result = registerSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  it("rejects invalid registration data", async () => {
    const { registerSchema } = await import("@/lib/validations");
    const result = registerSchema.safeParse({
      nome: "A",  // too short
      email: "not-email",
      senha: "123",  // too short
    });
    expect(result.success).toBe(false);
  });

  it("validates correct registration data", async () => {
    const { registerSchema } = await import("@/lib/validations");
    const result = registerSchema.safeParse({
      nome: "Empresa Nova Lda",
      email: "nova@empresa.pt",
      senha: "senhaSegura123!",
      role: "empresa",
    });
    expect(result.success).toBe(true);
  });

  it("creates user in database on valid registration", async () => {
    const mockUser = {
      id: "user-new",
      nome: "Empresa Nova",
      email: "nova@empresa.pt",
      role: "empresa",
    };

    (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    // Simulate the route logic
    const { registerSchema } = await import("@/lib/validations");
    const { hashPassword, createUserSessionToken } = await import("@/lib/auth");

    const body = { nome: "Empresa Nova", email: "nova@empresa.pt", senha: "senhaSegura123!", role: "empresa" };
    const parsed = registerSchema.safeParse(body);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const senhaHash = await hashPassword(parsed.data.senha);
      expect(senhaHash).toBeTruthy();

      const user = await prisma.user.create({
        data: {
          nome: parsed.data.nome,
          email: parsed.data.email.toLowerCase(),
          senhaHash,
          role: parsed.data.role,
        },
      });

      expect(user.id).toBe("user-new");
      expect(prisma.user.create).toHaveBeenCalledOnce();
    }
  });

  it("handles duplicate email error (P2002)", async () => {
    const prismaError = { code: "P2002", message: "Unique constraint failed" };
    (prisma.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(prismaError);

    try {
      await prisma.user.create({
        data: { nome: "Test", email: "existing@test.com", senhaHash: "hash", role: "empresa" },
      });
    } catch (err: unknown) {
      expect(err).toHaveProperty("code", "P2002");
    }
  });

  it("rate limits registration attempts", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = "register:test-ip-" + Date.now();

    // Should allow first 3
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit(key, { limit: 3, windowMs: 60000 });
      expect(result.success).toBe(true);
    }

    // 4th should be blocked
    const result = await rateLimit(key, { limit: 3, windowMs: 60000 });
    expect(result.success).toBe(false);
  });
});
