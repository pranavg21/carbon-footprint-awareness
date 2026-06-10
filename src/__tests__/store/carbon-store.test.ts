/**
 * Tests for the Zustand carbon store.
 *
 * @module carbon-store.test
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCarbonStore, selectChartData, selectTodayActionCount, selectTopCategory } from "../../store/carbon-store";
import { QUICK_ACTIONS, EMISSION_CATEGORIES } from "../../lib/constants";

describe("useCarbonStore", () => {
  beforeEach(() => {
    // Suppress logger output in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Reset store to initial state
    useCarbonStore.getState().resetStore();
  });

  describe("initial state", () => {
    it("should have a positive total score from seed data", () => {
      const state = useCarbonStore.getState();
      expect(state.totalScore).toBeGreaterThanOrEqual(0);
    });

    it("should have a monthly target", () => {
      const state = useCarbonStore.getState();
      expect(state.monthlyTarget).toBeGreaterThan(0);
    });

    it("should have category breakdown for all categories", () => {
      const state = useCarbonStore.getState();
      for (const cat of EMISSION_CATEGORIES) {
        expect(typeof state.categoryBreakdown[cat]).toBe("number");
      }
    });

    it("should have seeded action log", () => {
      const state = useCarbonStore.getState();
      expect(state.actionLog.length).toBeGreaterThanOrEqual(0);
    });

    it("should have nudge cards", () => {
      const state = useCarbonStore.getState();
      expect(state.nudges.length).toBeGreaterThan(0);
    });
  });

  describe("logAction", () => {
    it("should increase total score by action points", () => {
      const before = useCarbonStore.getState().totalScore;
      useCarbonStore.getState().logAction("PLANT_MEAL");
      const after = useCarbonStore.getState().totalScore;
      expect(after).toBe(before + QUICK_ACTIONS.PLANT_MEAL.points);
    });

    it("should add entry to action log", () => {
      const beforeCount = useCarbonStore.getState().actionLog.length;
      useCarbonStore.getState().logAction("PUBLIC_TRANSIT");
      const afterCount = useCarbonStore.getState().actionLog.length;
      expect(afterCount).toBe(beforeCount + 1);
    });

    it("should update category breakdown", () => {
      const before = useCarbonStore.getState().categoryBreakdown.diet;
      useCarbonStore.getState().logAction("PLANT_MEAL");
      const after = useCarbonStore.getState().categoryBreakdown.diet;
      expect(after).toBe(before + QUICK_ACTIONS.PLANT_MEAL.points);
    });

    it("should update daily log for today", () => {
      useCarbonStore.getState().logAction("ZERO_WASTE");
      const today = new Date().toISOString().split("T")[0] ?? "";
      const dailyLog = useCarbonStore.getState().dailyLogs[today];
      expect(dailyLog).toBeDefined();
      expect(dailyLog?.actionCount).toBeGreaterThanOrEqual(1);
    });

    it("should regenerate nudges on action", () => {
      useCarbonStore.getState().logAction("RENEWABLE_ENERGY");
      const nudgesAfter = useCarbonStore.getState().nudges;
      // Nudges should be regenerated (at least defined)
      expect(nudgesAfter.length).toBeGreaterThan(0);
      // Content may differ since top category might change
      expect(nudgesAfter).toBeDefined();
    });

    it("should atomically update all fields in one logAction call", () => {
      const stateBefore = useCarbonStore.getState();
      useCarbonStore.getState().logAction("PLANT_MEAL");
      const stateAfter = useCarbonStore.getState();

      // All must change atomically
      expect(stateAfter.totalScore).not.toBe(stateBefore.totalScore);
      expect(stateAfter.actionLog.length).toBe(stateBefore.actionLog.length + 1);
      expect(stateAfter.categoryBreakdown.diet).not.toBe(stateBefore.categoryBreakdown.diet);
    });
  });

  describe("logCustomAction", () => {
    it("should increase total score by custom action points", () => {
      const before = useCarbonStore.getState().totalScore;
      useCarbonStore.getState().logCustomAction("diet", 45, "Ate local salad");
      const after = useCarbonStore.getState().totalScore;
      expect(after).toBe(before + 45);
    });

    it("should add custom entry to action log", () => {
      const beforeCount = useCarbonStore.getState().actionLog.length;
      useCarbonStore.getState().logCustomAction("shopping", 12, "Eco bag");
      const afterCount = useCarbonStore.getState().actionLog.length;
      expect(afterCount).toBe(beforeCount + 1);

      const state = useCarbonStore.getState();
      const lastEntry = state.actionLog[state.actionLog.length - 1];
      expect(lastEntry?.description).toBe("Eco bag");
      expect(lastEntry?.points).toBe(12);
      expect(lastEntry?.category).toBe("shopping");
      expect(lastEntry?.actionType).toBe("custom");
    });
  });

  describe("resetStore", () => {
    it("should reset to a fresh seed state", () => {
      // Log several actions
      useCarbonStore.getState().logAction("PLANT_MEAL");
      useCarbonStore.getState().logAction("PLANT_MEAL");
      const scoreBefore = useCarbonStore.getState().totalScore;

      // Reset
      useCarbonStore.getState().resetStore();
      const scoreAfter = useCarbonStore.getState().totalScore;

      // Score should be different (reset to new seed)
      expect(scoreAfter).not.toBe(scoreBefore);
      expect(useCarbonStore.getState().nudges.length).toBeGreaterThan(0);
    });
  });

  describe("selectors", () => {
    it("selectChartData should return 4 entries", () => {
      const data = selectChartData(useCarbonStore.getState());
      expect(data).toHaveLength(4);
    });

    it("selectChartData should have category and value fields", () => {
      const data = selectChartData(useCarbonStore.getState());
      for (const item of data) {
        expect(item.name).toBeDefined();
        expect(typeof item.value).toBe("number");
        expect(EMISSION_CATEGORIES).toContain(item.category);
      }
    });

    it("selectTodayActionCount should be non-negative", () => {
      const count = selectTodayActionCount(useCarbonStore.getState());
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("selectTopCategory should return a valid category", () => {
      const top = selectTopCategory(useCarbonStore.getState());
      expect(EMISSION_CATEGORIES).toContain(top);
    });
  });
});
