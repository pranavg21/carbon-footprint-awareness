/**
 * Global Zustand store for the CarbonTrack platform.
 *
 * Single source of truth for all carbon tracking state. Every
 * component reads from this store — no isolated useState for
 * data that affects other components. Persisted to localStorage
 * with Zod-validated rehydration. Syncs to Firestore when configured.
 *
 * @module carbon-store
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStateSchema, type ActionLogEntry, type DailyLog, type CategoryBreakdown, type NudgeCard } from "../lib/schemas";
import {
  MONTHLY_TARGET_SCORE,
  STORAGE_KEY,
  QUICK_ACTIONS,
  MAX_NUDGE_CARDS,
  NUDGE_TIPS,
  EMISSION_CATEGORIES,
  type QuickActionKey,
  type EmissionCategory,
} from "../lib/constants";
import { generateId, getTodayDateString } from "../lib/utils";
import {
  generateSeedState,
  computeCurrentStreak,
  computeLongestStreak,
  getTopCategory,
} from "../lib/seed-data";
import { logger } from "../lib/logger";
import { persistActionToFirestore, trackActionEvent } from "../lib/firebase";

// ── Store Types ─────────────────────────────────────────────────────

/** Complete store state shape. */
interface CarbonState {
  /** Total eco-points earned this month. */
  readonly totalScore: number;
  /** Monthly target score. */
  readonly monthlyTarget: number;
  /** Points breakdown by emission category. */
  readonly categoryBreakdown: CategoryBreakdown;
  /** Full log of all recorded actions. */
  readonly actionLog: ReadonlyArray<ActionLogEntry>;
  /** Per-day aggregated activity. */
  readonly dailyLogs: Record<string, DailyLog>;
  /** Current consecutive-day activity streak. */
  readonly currentStreak: number;
  /** Longest streak ever achieved. */
  readonly longestStreak: number;
  /** Dynamic nudge/insight cards. */
  readonly nudges: ReadonlyArray<NudgeCard>;
}

/** Store actions for mutating state. */
interface CarbonActions {
  /**
   * Logs a quick eco-action and atomically updates all derived state.
   *
   * @param actionKey - Key from QUICK_ACTIONS constant
   */
  readonly logAction: (actionKey: QuickActionKey) => void;

  /**
   * Logs a custom eco-action with category, points, and description.
   *
   * @param category - Emission category
   * @param points - Impact points
   * @param description - Description of the action
   */
  readonly logCustomAction: (
    category: EmissionCategory,
    points: number,
    description: string
  ) => void;

  /**
   * Resets the store to fresh seed data.
   */
  readonly resetStore: () => void;
}

/** Combined store type. */
type CarbonStore = CarbonState & CarbonActions;

// ── Shared State Update Helper ──────────────────────────────────────

/**
 * Atomically applies an action entry to the store state.
 * Extracted to eliminate code duplication between logAction and logCustomAction.
 *
 * @param state - Current store state
 * @param entry - The action log entry to apply
 * @returns Partial state update with all derived fields recomputed
 */
function applyActionToState(
  state: CarbonState,
  entry: ActionLogEntry
): Partial<CarbonState> {
  const today = entry.timestamp.split("T")[0] ?? getTodayDateString();

  // Update category breakdown
  const newBreakdown = { ...state.categoryBreakdown };
  newBreakdown[entry.category] += entry.points;

  // Update daily log
  const newDailyLogs = { ...state.dailyLogs };
  const existingDaily = newDailyLogs[today];
  if (existingDaily) {
    newDailyLogs[today] = {
      ...existingDaily,
      actionCount: existingDaily.actionCount + 1,
      totalPoints: existingDaily.totalPoints + entry.points,
    };
  } else {
    newDailyLogs[today] = {
      date: today,
      actionCount: 1,
      totalPoints: entry.points,
    };
  }

  // Update streaks
  const newCurrentStreak = computeCurrentStreak(newDailyLogs);
  const newLongestStreak = Math.max(
    computeLongestStreak(newDailyLogs),
    state.longestStreak
  );

  // Regenerate nudges based on new breakdown
  const newNudges = generateNudges(newBreakdown);

  return {
    totalScore: state.totalScore + entry.points,
    categoryBreakdown: newBreakdown,
    actionLog: [...state.actionLog, entry],
    dailyLogs: newDailyLogs,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    nudges: newNudges,
  };
}

// ── Nudge Generator ─────────────────────────────────────────────────

/**
 * Generates personalized nudge cards based on the top emission category.
 *
 * @param breakdown - Current category breakdown
 * @returns Array of nudge cards
 */
function generateNudges(breakdown: CategoryBreakdown): NudgeCard[] {
  const topCat = getTopCategory(breakdown);
  const tips = NUDGE_TIPS[topCat];
  const nudges: NudgeCard[] = [];

  for (let i = 0; i < Math.min(MAX_NUDGE_CARDS, tips.length); i++) {
    const tip = tips[i];
    if (!tip) continue;

    nudges.push({
      id: `nudge-${topCat}-${i}`,
      category: topCat,
      message: tip,
      priority: i,
    });
  }

  // Add one nudge from a secondary category for variety
  const secondaryCats = EMISSION_CATEGORIES.filter((c) => c !== topCat);
  const secondaryCat = secondaryCats[Math.floor(Math.random() * secondaryCats.length)];
  if (secondaryCat) {
    const secondaryTips = NUDGE_TIPS[secondaryCat];
    const secondaryTip = secondaryTips[0];
    if (secondaryTip && nudges.length < MAX_NUDGE_CARDS) {
      nudges.push({
        id: `nudge-${secondaryCat}-secondary`,
        category: secondaryCat,
        message: secondaryTip,
        priority: MAX_NUDGE_CARDS,
      });
    }
  }

  return nudges;
}

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
 * All components read from this single store. logAction atomically
 * updates score, category breakdown, daily log, streak, and nudges.
 * Data is synced to Firestore and Analytics when configured.
 */
export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set) => ({
      ...createInitialState(),

      logAction: (actionKey: QuickActionKey): void => {
        const action = QUICK_ACTIONS[actionKey];
        const now = new Date().toISOString();

        const newEntry: ActionLogEntry = {
          id: generateId(),
          timestamp: now,
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

        // Async side effects — Firestore persistence + Analytics
        void persistActionToFirestore(newEntry);
        trackActionEvent(action.id, action.category, action.points);
      },

      logCustomAction: (
        category: EmissionCategory,
        points: number,
        description: string
      ): void => {
        const now = new Date().toISOString();

        const newEntry: ActionLogEntry = {
          id: generateId(),
          timestamp: now,
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

        // Async side effects
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
      /**
       * Validates persisted state from localStorage using Zod schema.
       * Falls back to fresh seed data if validation fails.
       */
      merge: (persistedState, currentState) => {
        const result = persistedStateSchema.safeParse(persistedState);

        if (result.success) {
          logger.debug("Persisted state rehydrated successfully", {
            component: "carbon-store",
          });
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
 * Selector: Get chart data formatted for Recharts PieChart.
 *
 * @param state - Current store state
 * @returns Array of category data objects for Recharts
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
 * Selector: Get today's action count.
 *
 * @param state - Current store state
 * @returns Number of actions logged today
 */
export function selectTodayActionCount(state: CarbonState): number {
  const today = getTodayDateString();
  return state.dailyLogs[today]?.actionCount ?? 0;
}

/**
 * Selector: Get the top emission category.
 *
 * @param state - Current store state
 * @returns The highest-emission category string
 */
export function selectTopCategory(state: CarbonState): EmissionCategory {
  return getTopCategory(state.categoryBreakdown);
}
