import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api-client";

// Mock fetch globally for these tests
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ApiError", () => {
  it("has correct name and properties", () => {
    const err = new ApiError(404, "Not found", { code: "MISSING" });
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.data).toEqual({ code: "MISSING" });
  });

  it("is instanceof Error", () => {
    const err = new ApiError(500, "Server error");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("api-client request handling", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    });

    const { api } = await import("@/lib/api-client");
    await expect(api.me()).rejects.toThrow(ApiError);
  });

  it("parses JSON response on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: "1", nome: "Test" }),
    });

    const { api } = await import("@/lib/api-client");
    const result = await api.me();
    expect(result).toEqual({ id: "1", nome: "Test" });
  });
});
