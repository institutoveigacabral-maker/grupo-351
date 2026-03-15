import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Resend
vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = {
      send: vi.fn().mockResolvedValue({ id: "email-1" }),
    };
  },
}));

describe("email module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sendContatoEmails does nothing without RESEND_API_KEY", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendContatoEmails } = await import("@/lib/email");

    // Should not throw
    await sendContatoEmails({
      nome: "Test",
      email: "test@test.com",
      tipo: "parceria",
      mensagem: "Test message",
    });
  });

  it("sendCandidaturaEmails does nothing without RESEND_API_KEY", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendCandidaturaEmails } = await import("@/lib/email");

    // Should not throw
    await sendCandidaturaEmails({
      nome: "Test",
      email: "test@test.com",
      perfil: "operador",
      modelo: ["sushi-rao"],
      capitalDisponivel: "50k-200k",
      motivacao: "Test motivation",
    });
  });

  it("sendContatoEmails sends when RESEND_API_KEY is set", async () => {
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.ADMIN_NOTIFICATION_EMAIL = "admin@grupo351.com";
    const { sendContatoEmails } = await import("@/lib/email");

    // Should not throw - it will use the mocked Resend
    await sendContatoEmails({
      nome: "Maria Costa",
      email: "maria@empresa.pt",
      tipo: "investimento",
      empresa: "ACME",
      orcamento: "100k-500k",
      mensagem: "Mensagem de teste sobre investimento",
    });
  });
});
