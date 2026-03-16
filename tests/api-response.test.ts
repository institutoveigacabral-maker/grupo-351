import { describe, it, expect } from "vitest";
import {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
  validationMessage,
} from "@/lib/api-response";

describe("API Response helpers", () => {
  it("ok returns 200 with data", async () => {
    const res = ok({ foo: "bar" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ foo: "bar" });
  });

  it("ok accepts custom status", async () => {
    const res = ok({ ok: true }, 202);
    expect(res.status).toBe(202);
  });

  it("created returns 201", async () => {
    const res = created({ id: "1" });
    expect(res.status).toBe(201);
  });

  it("noContent returns 204", () => {
    const res = noContent();
    expect(res.status).toBe(204);
  });

  it("badRequest returns 400 with error message", async () => {
    const res = badRequest("Custom error");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Custom error" });
  });

  it("badRequest uses default message", async () => {
    const res = badRequest();
    expect(await res.json()).toEqual({ error: "Dados invalidos" });
  });

  it("unauthorized returns 401", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
  });

  it("forbidden returns 403 with extra fields", async () => {
    const res = forbidden("Upgrade needed", { upgrade: true });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Upgrade needed", upgrade: true });
  });

  it("notFound returns 404", async () => {
    const res = notFound();
    expect(res.status).toBe(404);
  });

  it("tooManyRequests returns 429", async () => {
    const res = tooManyRequests();
    expect(res.status).toBe(429);
  });

  it("serverError returns 500", async () => {
    const res = serverError();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Erro interno" });
  });
});

describe("validationMessage", () => {
  it("extracts first field error", () => {
    const mockError = {
      flatten: () => ({
        fieldErrors: {
          email: ["Email invalido"],
          nome: ["Muito curto"],
        },
      }),
    };
    const msg = validationMessage(mockError);
    expect(msg).toContain("email");
  });

  it("returns default for empty errors", () => {
    const mockError = {
      flatten: () => ({ fieldErrors: {} }),
    };
    expect(validationMessage(mockError)).toBe("Dados invalidos");
  });
});
