/**
 * Tests for Zod validation schemas.
 *
 * @module schemas.test
 */

import { describe, it, expect } from "vitest";
import {
  emissionCategorySchema,
  actionLogEntrySchema,
  dailyLogSchema,
  categoryBreakdownSchema,
  nudgeCardSchema,
  toastSchema,
  persistedStateSchema,
  exportDataSchema,
} from "../../lib/schemas";

describe("emissionCategorySchema", () => {
  it("should accept valid categories", () => {
    expect(emissionCategorySchema.parse("transport")).toBe("transport");
    expect(emissionCategorySchema.parse("diet")).toBe("diet");
    expect(emissionCategorySchema.parse("home")).toBe("home");
    expect(emissionCategorySchema.parse("shopping")).toBe("shopping");
  });

  it("should reject invalid categories", () => {
    expect(() => emissionCategorySchema.parse("invalid")).toThrow();
    expect(() => emissionCategorySchema.parse("")).toThrow();
    expect(() => emissionCategorySchema.parse(123)).toThrow();
  });
});

describe("actionLogEntrySchema", () => {
  const validEntry = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: "2024-01-15T10:30:00.000Z",
    category: "transport",
    actionType: "public-transit",
    points: 20,
    description: "Used public transit",
  };

  it("should accept valid entries", () => {
    expect(() => actionLogEntrySchema.parse(validEntry)).not.toThrow();
  });

  it("should reject entries with missing fields", () => {
    const { id, ...withoutId } = validEntry;
    expect(() => actionLogEntrySchema.parse(withoutId)).toThrow();
  });

  it("should reject entries with invalid category", () => {
    expect(() =>
      actionLogEntrySchema.parse({ ...validEntry, category: "unknown" })
    ).toThrow();
  });

  it("should reject entries with negative points", () => {
    expect(() =>
      actionLogEntrySchema.parse({ ...validEntry, points: -5 })
    ).toThrow();
  });

  it("should reject entries with extra fields", () => {
    expect(() =>
      actionLogEntrySchema.parse({ ...validEntry, extraField: "bad" })
    ).toThrow();
  });
});

describe("dailyLogSchema", () => {
  it("should accept valid daily logs", () => {
    expect(() =>
      dailyLogSchema.parse({ date: "2024-01-15", actionCount: 5, totalPoints: 100 })
    ).not.toThrow();
  });

  it("should reject invalid date formats", () => {
    expect(() =>
      dailyLogSchema.parse({ date: "Jan 15 2024", actionCount: 5, totalPoints: 100 })
    ).toThrow();
  });

  it("should reject negative action counts", () => {
    expect(() =>
      dailyLogSchema.parse({ date: "2024-01-15", actionCount: -1, totalPoints: 0 })
    ).toThrow();
  });
});

describe("categoryBreakdownSchema", () => {
  it("should accept valid breakdowns", () => {
    expect(() =>
      categoryBreakdownSchema.parse({
        transport: 100,
        diet: 200,
        home: 150,
        shopping: 50,
      })
    ).not.toThrow();
  });

  it("should accept zero values", () => {
    expect(() =>
      categoryBreakdownSchema.parse({
        transport: 0,
        diet: 0,
        home: 0,
        shopping: 0,
      })
    ).not.toThrow();
  });

  it("should reject negative values", () => {
    expect(() =>
      categoryBreakdownSchema.parse({
        transport: -10,
        diet: 0,
        home: 0,
        shopping: 0,
      })
    ).toThrow();
  });
});

describe("nudgeCardSchema", () => {
  it("should accept valid nudge cards", () => {
    expect(() =>
      nudgeCardSchema.parse({
        id: "nudge-1",
        category: "transport",
        message: "Try biking more",
        priority: 0,
      })
    ).not.toThrow();
  });

  it("should reject missing message", () => {
    expect(() =>
      nudgeCardSchema.parse({
        id: "nudge-1",
        category: "transport",
        priority: 0,
      })
    ).toThrow();
  });
});

describe("toastSchema", () => {
  it("should accept valid toasts", () => {
    expect(() =>
      toastSchema.parse({
        id: "toast-1",
        message: "Action logged!",
        variant: "success",
        createdAt: Date.now(),
      })
    ).not.toThrow();
  });

  it("should reject invalid variants", () => {
    expect(() =>
      toastSchema.parse({
        id: "toast-1",
        message: "Bad",
        variant: "invalid",
        createdAt: Date.now(),
      })
    ).toThrow();
  });
});

describe("persistedStateSchema", () => {
  it("should accept valid persisted state", () => {
    expect(() =>
      persistedStateSchema.parse({
        totalScore: 500,
        monthlyTarget: 1000,
        categoryBreakdown: { transport: 100, diet: 150, home: 200, shopping: 50 },
        actionLog: [],
        dailyLogs: {},
        currentStreak: 5,
        longestStreak: 10,
      })
    ).not.toThrow();
  });
});

describe("exportDataSchema", () => {
  it("should accept valid export data", () => {
    expect(() =>
      exportDataSchema.parse({
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        totalScore: 500,
        monthlyTarget: 1000,
        categoryBreakdown: { transport: 100, diet: 150, home: 200, shopping: 50 },
        actionLog: [],
        currentStreak: 5,
        longestStreak: 10,
      })
    ).not.toThrow();
  });

  it("should reject wrong version", () => {
    expect(() =>
      exportDataSchema.parse({
        exportedAt: new Date().toISOString(),
        version: "2.0.0",
        totalScore: 500,
        monthlyTarget: 1000,
        categoryBreakdown: { transport: 0, diet: 0, home: 0, shopping: 0 },
        actionLog: [],
        currentStreak: 0,
        longestStreak: 0,
      })
    ).toThrow();
  });
});
