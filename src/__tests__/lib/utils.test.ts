/**
 * Tests for utility functions.
 *
 * @module utils.test
 */

import { describe, it, expect } from "vitest";
import {
  cn,
  formatShortDate,
  formatNumber,
  getTodayDateString,
  getDateDaysAgo,
  generateId,
  clamp,
  percentage,
  getDayOfWeek,
} from "../../lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("should filter falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("should return empty string for no classes", () => {
    expect(cn()).toBe("");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });
});

describe("formatShortDate", () => {
  it("should format dates correctly", () => {
    const result = formatShortDate("2024-06-09");
    expect(result).toContain("Jun");
    expect(result).toContain("9");
  });
});

describe("formatNumber", () => {
  it("should format numbers with commas", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(0)).toBe("0");
  });

  it("should handle large numbers", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });
});

describe("getTodayDateString", () => {
  it("should return a valid YYYY-MM-DD format", () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getDateDaysAgo", () => {
  it("should return today for 0 days ago", () => {
    expect(getDateDaysAgo(0)).toBe(getTodayDateString());
  });

  it("should return a valid date format", () => {
    const result = getDateDaysAgo(7);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should return a date in the past", () => {
    const today = new Date(getTodayDateString());
    const weekAgo = new Date(getDateDaysAgo(7));
    expect(weekAgo.getTime()).toBeLessThan(today.getTime());
  });
});

describe("generateId", () => {
  it("should generate unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("should generate UUID-format strings", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});

describe("clamp", () => {
  it("should clamp below minimum", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("should clamp above maximum", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("should pass through values in range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("should handle edge values", () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe("percentage", () => {
  it("should calculate percentages correctly", () => {
    expect(percentage(50, 100)).toBe(50);
    expect(percentage(1, 4)).toBe(25);
  });

  it("should return 0 for zero total", () => {
    expect(percentage(50, 0)).toBe(0);
  });

  it("should handle 100%", () => {
    expect(percentage(100, 100)).toBe(100);
  });

  it("should handle over 100%", () => {
    expect(percentage(150, 100)).toBe(150);
  });
});

describe("getDayOfWeek", () => {
  it("should return Monday-based day index", () => {
    // 2024-01-15 is a Monday
    expect(getDayOfWeek("2024-01-15")).toBe(0);
    // 2024-01-21 is a Sunday
    expect(getDayOfWeek("2024-01-21")).toBe(6);
  });

  it("should return values between 0 and 6", () => {
    const day = getDayOfWeek("2024-06-09");
    expect(day).toBeGreaterThanOrEqual(0);
    expect(day).toBeLessThanOrEqual(6);
  });
});
