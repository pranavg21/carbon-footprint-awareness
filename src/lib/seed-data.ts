/**
 * Seed data generator for the CarbonTrack platform.
 *
 * Creates realistic initial state with 30 days of variance
 * to populate the heatmap, charts, and score on first load.
 * All generated data conforms to Zod schemas.
 *
 * @module seed-data
 */

import type { ActionLogEntry, DailyLog, CategoryBreakdown } from "./schemas";
import {
  QUICK_ACTIONS,
  EMISSION_CATEGORIES,
  HEATMAP_DAYS,
  MIN_ACTIONS_FOR_STREAK,
} from "./constants";
import { getDateDaysAgo, generateId } from "./utils";

/** Seed random number between min and max inclusive. */
function seedRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** All quick action entries as an array for random selection. */
const ACTION_ENTRIES = Object.values(QUICK_ACTIONS);

/**
 * Generates a realistic 30-day action log with natural variance.
 *
 * @returns Array of action log entries spanning the last 30 days
 */
export function generateSeedActionLog(): ActionLogEntry[] {
  const actions: ActionLogEntry[] = [];

  for (let dayOffset = HEATMAP_DAYS - 1; dayOffset >= 0; dayOffset--) {
    const dateStr = getDateDaysAgo(dayOffset);
    const actionsToday = seedRandom(0, 6);

    for (let j = 0; j < actionsToday; j++) {
      const actionIndex = seedRandom(0, ACTION_ENTRIES.length - 1);
      const action = ACTION_ENTRIES[actionIndex];
      if (!action) continue;

      const hour = seedRandom(7, 22);
      const minute = seedRandom(0, 59);

      actions.push({
        id: generateId(),
        timestamp: `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`,
        category: action.category,
        actionType: action.id,
        points: action.points,
        description: action.description,
      });
    }
  }

  return actions;
}

/**
 * Computes daily log summaries from an action log.
 *
 * @param actions - Full action log array
 * @returns Record mapping date strings to daily logs
 */
export function computeDailyLogs(
  actions: ReadonlyArray<ActionLogEntry>
): Record<string, DailyLog> {
  const logs: Record<string, DailyLog> = {};

  for (const action of actions) {
    const date = action.timestamp.split("T")[0] ?? "";
    const existing = logs[date];

    if (existing) {
      existing.actionCount += 1;
      existing.totalPoints += action.points;
    } else {
      logs[date] = {
        date,
        actionCount: 1,
        totalPoints: action.points,
      };
    }
  }

  return logs;
}

/**
 * Computes category breakdown totals from an action log.
 *
 * @param actions - Full action log array
 * @returns Points totals grouped by emission category
 */
export function computeCategoryBreakdown(
  actions: ReadonlyArray<ActionLogEntry>
): CategoryBreakdown {
  const breakdown: CategoryBreakdown = {
    transport: 0,
    diet: 0,
    home: 0,
    shopping: 0,
  };

  for (const action of actions) {
    breakdown[action.category] += action.points;
  }

  return breakdown;
}

/**
 * Computes the current consecutive-day streak from daily logs.
 *
 * @param dailyLogs - Record of date strings to daily logs
 * @returns Current streak count (number of consecutive days with activity)
 */
export function computeCurrentStreak(
  dailyLogs: Record<string, DailyLog>
): number {
  let streak = 0;

  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const dateStr = getDateDaysAgo(i);
    const log = dailyLogs[dateStr];

    if (log && log.actionCount >= MIN_ACTIONS_FOR_STREAK) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

/**
 * Computes the longest streak from daily logs across all tracked days.
 *
 * @param dailyLogs - Record of date strings to daily logs
 * @returns Longest streak count
 */
export function computeLongestStreak(
  dailyLogs: Record<string, DailyLog>
): number {
  let longest = 0;
  let current = 0;

  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const dateStr = getDateDaysAgo(i);
    const log = dailyLogs[dateStr];

    if (log && log.actionCount >= MIN_ACTIONS_FOR_STREAK) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

/**
 * Generates the complete initial seed state for the store.
 *
 * @returns Object containing all seed data fields
 */
export function generateSeedState(): {
  actionLog: ActionLogEntry[];
  dailyLogs: Record<string, DailyLog>;
  categoryBreakdown: CategoryBreakdown;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
} {
  const actionLog = generateSeedActionLog();
  const dailyLogs = computeDailyLogs(actionLog);
  const categoryBreakdown = computeCategoryBreakdown(actionLog);
  const totalScore = Object.values(categoryBreakdown).reduce(
    (sum, val) => sum + val,
    0
  );
  const currentStreak = computeCurrentStreak(dailyLogs);
  const longestStreak = computeLongestStreak(dailyLogs);

  return {
    actionLog,
    dailyLogs,
    categoryBreakdown,
    totalScore,
    currentStreak,
    longestStreak,
  };
}

/**
 * Determines the highest-emission category from a breakdown.
 *
 * @param breakdown - Category breakdown object
 * @returns The emission category with the highest value
 */
export function getTopCategory(
  breakdown: CategoryBreakdown
): (typeof EMISSION_CATEGORIES)[number] {
  let topCategory: (typeof EMISSION_CATEGORIES)[number] = "transport";
  let topValue = 0;

  for (const cat of EMISSION_CATEGORIES) {
    if (breakdown[cat] > topValue) {
      topValue = breakdown[cat];
      topCategory = cat;
    }
  }

  return topCategory;
}
