import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Mock next/server
vi.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    _headers: Map<string, string>;
    _cookies: Map<string, unknown>;

    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status || 200;
      this._headers = new Map(Object.entries(init?.headers || {}));
      this._cookies = new Map();
    }

    get headers() {
      return {
        set: (key: string, value: string) => this._headers.set(key, value),
        get: (key: string) => this._headers.get(key),
      };
    }

    get cookies() {
      return {
        set: (name: string, value: unknown, options?: unknown) => {
          this._cookies.set(name, { value, options });
        },
      };
    }

    async json() {
      return this.body;
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      const resp = new MockNextResponse(data, init);
      return resp;
    }

    static next() {
      return new MockNextResponse(null, { status: 200 });
    }

    static redirect(url: URL | string) {
      const resp = new MockNextResponse(null, { status: 302 });
      resp._headers.set("location", url.toString());
      return resp;
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

// Mock prisma globally
vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminUser: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    company: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    companyMember: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    opportunity: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    match: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn() },
    candidatura: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    contato: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    projeto: { findUnique: vi.fn(), findMany: vi.fn() },
    subscription: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn() },
    apiKey: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
    adminNotification: { findMany: vi.fn(), create: vi.fn() },
    platformConfig: { findUnique: vi.fn() },
    parceiro: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    reuniaoDataset: { findUnique: vi.fn() },
  },
}));
