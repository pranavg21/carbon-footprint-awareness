/**
 * Global Zustand store for the CarbonTrack platform.
 *
 * Single source of truth for all carbon tracking state.
 * Persisted to localStorage with Zod-validated rehydration.
 * Types and helpers are in store-helpers.ts.
 *
 * @module carbon-store
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStateSchema, type ActionLogEntry } from "../lib/schemas";
import {
  MONTHLY_TARGET_SCORE,
  STORAGE_KEY,
  QUICK_ACTIONS,
  EMISSION_CATEGORIES,
  type QuickActionKey,
  type EmissionCategory,
} from "../lib/constants";
import { generateId, getTodayDateString } from "../lib/utils";
import { generateSeedState, getTopCategory } from "../lib/seed-data";
import { logger } from "../lib/logger";
import { persistActionToFirestore, trackActionEvent } from "../lib/firebase";
import {
  type CarbonState,
  type CarbonStore,
  applyActionToState,
  generateNudges,
} from "./store-helpers";

// Re-export types for consumers
export type { CarbonState, CarbonStore };

// ── Initial State ───────────────────────────────────────────────────

/**
 * Creates fresh initial state with realistic seed data.
 *
 * @returns Initial store state
 */
function createInitialState(): CarbonState {
  const seed = generateSeedState();
  return {
    totalScore: seed.totalScore,
    monthlyTarget: MONTHLY_TARGET_SCORE,
    categoryBreakdown: seed.categoryBreakdown,
    actionLog: seed.actionLog,
    dailyLogs: seed.dailyLogs,
    currentStreak: seed.currentStreak,
    longestStreak: seed.longestStreak,
    nudges: generateNudges(seed.categoryBreakdown),
  };
}

// ── Store ───────────────────────────────────────────────────────────

/**
 * Main Zustand store with persistence middleware.
 * logAction atomically updates score, breakdown, streak, and nudges.
 */
export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set) => ({
      ...createInitialState(),

      logAction: (actionKey: QuickActionKey): void => {
        const action = QUICK_ACTIONS[actionKey];

        const newEntry: ActionLogEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          category: action.category,
          actionType: action.id,
          points: action.points,
          description: action.description,
        };

        logger.info("Action logged", {
          component: "carbon-store",
          actionKey,
          category: action.category,
          points: action.points,
        });

        set((state) => applyActionToState(state, newEntry));
        void persistActionToFirestore(newEntry);
        trackActionEvent(action.id, action.category, action.points);
      },

      logCustomAction: (
        category: EmissionCategory,
        points: number,
        description: string
      ): void => {
        const newEntry: ActionLogEntry = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          category,
          actionType: "custom",
          points,
          description,
        };

        logger.info("Custom action logged", {
          component: "carbon-store",
          category,
          points,
        });

        set((state) => applyActionToState(state, newEntry));
        void persistActionToFirestore(newEntry);
        trackActionEvent("custom", category, points);
      },

      resetStore: (): void => {
        logger.info("Store reset", { component: "carbon-store" });
        set(createInitialState());
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        totalScore: state.totalScore,
        monthlyTarget: state.monthlyTarget,
        categoryBreakdown: state.categoryBreakdown,
        actionLog: state.actionLog,
        dailyLogs: state.dailyLogs,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      }),
      /** Validates persisted state with Zod on rehydration. */
      merge: (persistedState, currentState) => {
        const result = persistedStateSchema.safeParse(persistedState);

        if (result.success) {
          return {
            ...currentState,
            ...result.data,
            nudges: generateNudges(result.data.categoryBreakdown),
          };
        }

        logger.warn("Persisted state validation failed — using fresh data", {
          component: "carbon-store",
          errors: result.error.issues.map((i) => i.message),
        });
        return currentState;
      },
    }
  )
);

// ── Selectors ───────────────────────────────────────────────────────

/**
 * Selector: Chart data formatted for donut chart.
 *
 * @param state - Current store state
 * @returns Category data objects
 */
export function selectChartData(
  state: CarbonState
): Array<{ name: string; value: number; category: EmissionCategory }> {
  return EMISSION_CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: state.categoryBreakdown[cat],
    category: cat,
  }));
}

/**
 * Selector: Today's action count.
 *
 * @param state - Current store state
 * @returns Number of actions logged today
 */
export function selectTodayActionCount(state: CarbonState): number {
  const today = getTodayDateString();
  return state.dailyLogs[today]?.actionCount ?? 0;
}

/**
 * Selector: Top emission category.
 *
 * @param state - Current store state
 * @returns The highest-emission category
 */
export function selectTopCategory(state: CarbonState): EmissionCategory {
  return getTopCategory(state.categoryBreakdown);
}
