/**
 * Store types and shared helper functions for the carbon store.
 *
 * Extracted from carbon-store.ts to keep each module under
 * 200 lines and maintain single responsibility.
 *
 * @module store-helpers
 */

import type { ActionLogEntry, DailyLog, CategoryBreakdown, NudgeCard } from "../lib/schemas";
import {
  MAX_NUDGE_CARDS,
  NUDGE_TIPS,
  EMISSION_CATEGORIES,
  type QuickActionKey,
  type EmissionCategory,
} from "../lib/constants";
import { getTodayDateString } from "../lib/utils";
import { computeCurrentStreak, computeLongestStreak, getTopCategory } from "../lib/seed-data";

// ── Store Types ─────────────────────────────────────────────────────

/** Complete store state shape. */
export interface CarbonState {
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
export interface CarbonActions {
  /**
   * Logs a quick eco-action.
   *
   * @param actionKey - Key from QUICK_ACTIONS constant
   */
  readonly logAction: (actionKey: QuickActionKey) => void;

  /**
   * Logs a custom eco-action.
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

  /** Resets the store to fresh seed data. */
  readonly resetStore: () => void;
}

/** Combined store type. */
export type CarbonStore = CarbonState & CarbonActions;

// ── State Update Helper ─────────────────────────────────────────────

/**
 * Atomically applies an action entry to the store state.
 *
 * @param state - Current store state
 * @param entry - The action log entry to apply
 * @returns Partial state update with all derived fields recomputed
 */
export function applyActionToState(
  state: CarbonState,
  entry: ActionLogEntry
): Partial<CarbonState> {
  const today = entry.timestamp.split("T")[0] ?? getTodayDateString();

  const newBreakdown = { ...state.categoryBreakdown };
  newBreakdown[entry.category] += entry.points;

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

  const newCurrentStreak = computeCurrentStreak(newDailyLogs);
  const newLongestStreak = Math.max(
    computeLongestStreak(newDailyLogs),
    state.longestStreak
  );

  return {
    totalScore: state.totalScore + entry.points,
    categoryBreakdown: newBreakdown,
    actionLog: [...state.actionLog, entry],
    dailyLogs: newDailyLogs,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    nudges: generateNudges(newBreakdown),
  };
}

// ── Nudge Generator ─────────────────────────────────────────────────

/**
 * Generates personalized nudge cards based on emission breakdown.
 *
 * @param breakdown - Current category breakdown
 * @returns Array of nudge cards
 */
export function generateNudges(breakdown: CategoryBreakdown): NudgeCard[] {
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

  const secondaryCats = EMISSION_CATEGORIES.filter((c) => c !== topCat);
  const secondaryCat = secondaryCats[Math.floor(Math.random() * secondaryCats.length)];
  if (secondaryCat) {
    const secondaryTip = NUDGE_TIPS[secondaryCat][0];
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
