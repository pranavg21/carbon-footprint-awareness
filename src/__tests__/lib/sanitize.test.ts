/**
 * Tests for the input sanitization module.
 *
 * @module sanitize.test
 */

import { describe, it, expect } from "vitest";
import { sanitizeInput, containsDangerousContent } from "../../lib/sanitize";

describe("sanitizeInput", () => {
  it("should pass through clean text unchanged", () => {
    expect(sanitizeInput("Hello world")).toBe("Hello world");
  });

  it("should strip HTML tags", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe("alert('xss')");
  });

  it("should strip nested HTML tags", () => {
    expect(sanitizeInput("<div><b>bold</b></div>")).toBe("bold");
  });

  it("should strip dangerous URI schemes", () => {
    expect(sanitizeInput("javascript:alert(1)")).toBe("alert(1)");
    expect(sanitizeInput("data:text/html,<h1>Bad</h1>")).toBe("text/html,Bad");
  });

  it("should trim whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("should enforce max length", () => {
    const longInput = "a".repeat(300);
    expect(sanitizeInput(longInput)).toHaveLength(200);
  });

  it("should enforce custom max length", () => {
    const input = "a".repeat(50);
    expect(sanitizeInput(input, 10)).toHaveLength(10);
  });

  it("should handle empty strings", () => {
    expect(sanitizeInput("")).toBe("");
  });

  it("should handle strings with only HTML tags", () => {
    expect(sanitizeInput("<br/><hr/>")).toBe("");
  });
});

describe("containsDangerousContent", () => {
  it("should detect HTML tags", () => {
    expect(containsDangerousContent("<script>")).toBe(true);
  });

  it("should detect javascript: URIs", () => {
    expect(containsDangerousContent("javascript:void(0)")).toBe(true);
  });

  it("should detect data: URIs", () => {
    expect(containsDangerousContent("data:text/html")).toBe(true);
  });

  it("should return false for clean input", () => {
    expect(containsDangerousContent("Hello world")).toBe(false);
  });

  it("should be case insensitive for URI schemes", () => {
    expect(containsDangerousContent("JAVASCRIPT:alert(1)")).toBe(true);
  });
});
