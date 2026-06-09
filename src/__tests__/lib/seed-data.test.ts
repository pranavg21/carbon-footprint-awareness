/**
 * Tests for seed data generation.
 *
 * @module seed-data.test
 */

import { describe, it, expect } from "vitest";
import {
  generateSeedActionLog,
  computeDailyLogs,
  computeCategoryBreakdown,
  computeCurrentStreak,
  computeLongestStreak,
  generateSeedState,
  getTopCategory,
} from "../../lib/seed-data";
import { actionLogEntrySchema } from "../../lib/schemas";
import { EMISSION_CATEGORIES } from "../../lib/constants";

describe("generateSeedActionLog", () => {
  it("should generate an array of actions", () => {
    const log = generateSeedActionLog();
    expect(Array.isArray(log)).toBe(true);
    expect(log.length).toBeGreaterThan(0);
  });

  it("should generate schema-valid entries", () => {
    const log = generateSeedActionLog();
    for (const entry of log.slice(0, 5)) {
      expect(() => actionLogEntrySchema.parse(entry)).not.toThrow();
    }
  });

  it("should include entries from various categories", () => {
    const log = generateSeedActionLog();
    const categories = new Set(log.map((e) => e.category));
    expect(categories.size).toBeGreaterThanOrEqual(2);
  });
});

describe("computeDailyLogs", () => {
  it("should aggregate actions by date", () => {
    const log = generateSeedActionLog();
    const daily = computeDailyLogs(log);
    expect(Object.keys(daily).length).toBeGreaterThan(0);
  });

  it("should compute correct totals", () => {
    const log = generateSeedActionLog();
    const daily = computeDailyLogs(log);
    for (const day of Object.values(daily)) {
      expect(day.actionCount).toBeGreaterThan(0);
      expect(day.totalPoints).toBeGreaterThan(0);
    }
  });
});

describe("computeCategoryBreakdown", () => {
  it("should return all four categories", () => {
    const log = generateSeedActionLog();
    const breakdown = computeCategoryBreakdown(log);
    for (const cat of EMISSION_CATEGORIES) {
      expect(typeof breakdown[cat]).toBe("number");
    }
  });

  it("should return non-negative values", () => {
    const log = generateSeedActionLog();
    const breakdown = computeCategoryBreakdown(log);
    for (const cat of EMISSION_CATEGORIES) {
      expect(breakdown[cat]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("computeCurrentStreak", () => {
  it("should return a non-negative number", () => {
    const log = generateSeedActionLog();
    const daily = computeDailyLogs(log);
    expect(computeCurrentStreak(daily)).toBeGreaterThanOrEqual(0);
  });
});

describe("computeLongestStreak", () => {
  it("should be >= current streak", () => {
    const log = generateSeedActionLog();
    const daily = computeDailyLogs(log);
    const current = computeCurrentStreak(daily);
    const longest = computeLongestStreak(daily);
    expect(longest).toBeGreaterThanOrEqual(current);
  });
});

describe("generateSeedState", () => {
  it("should return complete state with all fields", () => {
    const state = generateSeedState();
    expect(state.actionLog).toBeDefined();
    expect(state.dailyLogs).toBeDefined();
    expect(state.categoryBreakdown).toBeDefined();
    expect(typeof state.totalScore).toBe("number");
    expect(typeof state.currentStreak).toBe("number");
    expect(typeof state.longestStreak).toBe("number");
  });

  it("should have totalScore matching category sum", () => {
    const state = generateSeedState();
    const categorySum = Object.values(state.categoryBreakdown).reduce(
      (a, b) => a + b,
      0
    );
    expect(state.totalScore).toBe(categorySum);
  });
});

describe("getTopCategory", () => {
  it("should return the highest category", () => {
    const breakdown = { transport: 100, diet: 200, home: 50, shopping: 150 };
    expect(getTopCategory(breakdown)).toBe("diet");
  });

  it("should return a valid emission category", () => {
    const state = generateSeedState();
    const top = getTopCategory(state.categoryBreakdown);
    expect(EMISSION_CATEGORIES).toContain(top);
  });
});
