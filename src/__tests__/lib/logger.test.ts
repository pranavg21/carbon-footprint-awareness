/**
 * Tests for the structured logger module.
 *
 * @module logger.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../../lib/logger";

describe("logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should log debug messages to stdout", () => {
    logger.debug("test debug message");
    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
    expect(output.severity).toBe("DEBUG");
    expect(output.message).toBe("test debug message");
    expect(output.timestamp).toBeDefined();
  });

  it("should log info messages to stdout", () => {
    logger.info("test info message");
    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
    expect(output.severity).toBe("INFO");
  });

  it("should log warn messages to stdout", () => {
    logger.warn("test warning");
    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
    expect(output.severity).toBe("WARNING");
  });

  it("should log error messages to stderr", () => {
    logger.error("test error");
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleErrorSpy.mock.calls[0]?.[0] as string);
    expect(output.severity).toBe("ERROR");
  });

  it("should log critical messages to stderr", () => {
    logger.critical("test critical");
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    const output = JSON.parse(consoleErrorSpy.mock.calls[0]?.[0] as string);
    expect(output.severity).toBe("CRITICAL");
  });

  it("should include metadata in log entries", () => {
    logger.info("with meta", { component: "test", userId: "123" });
    const output = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
    expect(output.component).toBe("test");
    expect(output.userId).toBe("123");
  });

  it("should include ISO timestamp in every entry", () => {
    logger.info("timestamp check");
    const output = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
    expect(() => new Date(output.timestamp)).not.toThrow();
    expect(output.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("should produce valid JSON output", () => {
    logger.debug("json check", { nested: { key: "value" } });
    const raw = consoleSpy.mock.calls[0]?.[0] as string;
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});
