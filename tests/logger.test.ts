import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "@/lib/logger";

describe("Structured logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info with timestamp and context", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message", "auth");
    expect(spy).toHaveBeenCalledOnce();
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("[INFO]");
    expect(output).toContain("[auth]");
    expect(output).toContain("test message");
    // ISO timestamp
    expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
  });

  it("logs warn to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("something wrong", "stripe");
    expect(spy).toHaveBeenCalledOnce();
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("[WARN]");
    expect(output).toContain("[stripe]");
  });

  it("logs error to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("critical failure", "db", { query: "SELECT 1" });
    expect(spy).toHaveBeenCalledOnce();
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("[ERROR]");
    expect(output).toContain("[db]");
    expect(output).toContain("critical failure");
    expect(output).toContain('"query":"SELECT 1"');
  });

  it("works without context", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("no context");
    expect(spy).toHaveBeenCalledOnce();
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain("[INFO]");
    expect(output).toContain("no context");
    expect(output).not.toContain("[]");
  });

  it("serializes data as JSON", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("with data", "test", { userId: "abc", count: 42 });
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain('"userId":"abc"');
    expect(output).toContain('"count":42');
  });
});
