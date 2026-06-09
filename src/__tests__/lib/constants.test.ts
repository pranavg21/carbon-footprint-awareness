/**
 * Tests for constants module.
 *
 * @module constants.test
 */

import { describe, it, expect } from "vitest";
import {
  MONTHLY_TARGET_SCORE,
  INITIAL_MONTHLY_BUDGET,
  EMISSION_CATEGORIES,
  QUICK_ACTIONS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  HEATMAP_DAYS,
  TOAST_DURATION_MS,
  MAX_VISIBLE_TOASTS,
  COUNTER_ANIMATION_MS,
  NUDGE_TIPS,
  STORAGE_KEY,
  MAIN_CONTENT_ID,
} from "../../lib/constants";

describe("scoring constants", () => {
  it("should have positive monthly target", () => {
    expect(MONTHLY_TARGET_SCORE).toBeGreaterThan(0);
  });

  it("should have positive initial budget", () => {
    expect(INITIAL_MONTHLY_BUDGET).toBeGreaterThan(0);
  });
});

describe("emission categories", () => {
  it("should have exactly 4 categories", () => {
    expect(EMISSION_CATEGORIES).toHaveLength(4);
  });

  it("should include transport, diet, home, shopping", () => {
    expect(EMISSION_CATEGORIES).toContain("transport");
    expect(EMISSION_CATEGORIES).toContain("diet");
    expect(EMISSION_CATEGORIES).toContain("home");
    expect(EMISSION_CATEGORIES).toContain("shopping");
  });
});

describe("quick actions", () => {
  it("should have 4 quick actions", () => {
    expect(Object.keys(QUICK_ACTIONS)).toHaveLength(4);
  });

  it("should have positive point values for all actions", () => {
    for (const action of Object.values(QUICK_ACTIONS)) {
      expect(action.points).toBeGreaterThan(0);
    }
  });

  it("should have valid categories for all actions", () => {
    for (const action of Object.values(QUICK_ACTIONS)) {
      expect(EMISSION_CATEGORIES).toContain(action.category);
    }
  });

  it("should have non-empty labels and descriptions", () => {
    for (const action of Object.values(QUICK_ACTIONS)) {
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.description.length).toBeGreaterThan(0);
    }
  });
});

describe("display constants", () => {
  it("should have colors for all categories", () => {
    for (const cat of EMISSION_CATEGORIES) {
      expect(CATEGORY_COLORS[cat]).toBeDefined();
      expect(CATEGORY_COLORS[cat]).toMatch(/^#/);
    }
  });

  it("should have labels for all categories", () => {
    for (const cat of EMISSION_CATEGORIES) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }
  });
});

describe("timing constants", () => {
  it("should have reasonable heatmap days", () => {
    expect(HEATMAP_DAYS).toBeGreaterThanOrEqual(7);
    expect(HEATMAP_DAYS).toBeLessThanOrEqual(365);
  });

  it("should have reasonable toast duration", () => {
    expect(TOAST_DURATION_MS).toBeGreaterThanOrEqual(1000);
    expect(TOAST_DURATION_MS).toBeLessThanOrEqual(10000);
  });

  it("should have positive max visible toasts", () => {
    expect(MAX_VISIBLE_TOASTS).toBeGreaterThan(0);
  });

  it("should have positive animation duration", () => {
    expect(COUNTER_ANIMATION_MS).toBeGreaterThan(0);
  });
});

describe("nudge tips", () => {
  it("should have tips for all categories", () => {
    for (const cat of EMISSION_CATEGORIES) {
      expect(NUDGE_TIPS[cat]).toBeDefined();
      expect(NUDGE_TIPS[cat].length).toBeGreaterThan(0);
    }
  });
});

describe("storage key", () => {
  it("should be a non-empty string", () => {
    expect(STORAGE_KEY.length).toBeGreaterThan(0);
  });
});

describe("accessibility constants", () => {
  it("should have main content ID", () => {
    expect(MAIN_CONTENT_ID.length).toBeGreaterThan(0);
  });
});
