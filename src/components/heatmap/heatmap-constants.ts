/**
 * Heatmap display constants and types.
 *
 * Extracted from StreakHeatmap for single responsibility.
 *
 * @module heatmap-constants
 */

import { HEATMAP_INTENSITY_LEVELS, HEATMAP_MAX_ACTIONS_PER_DAY } from "../../lib/constants";

/** Color values for heatmap intensity levels (0 = none). */
export const INTENSITY_COLORS: ReadonlyArray<string> = [
  "rgba(30, 45, 82, 0.4)",
  "rgba(52, 211, 153, 0.15)",
  "rgba(52, 211, 153, 0.35)",
  "rgba(52, 211, 153, 0.6)",
  "#34d399",
] as const;

/** Day labels for the Y-axis. */
export const DAY_LABELS: ReadonlyArray<string> = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
] as const;

/** Month name abbreviations. */
export const MONTH_NAMES: ReadonlyArray<string> = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Shape for individual heatmap cell data. */
export interface HeatmapCellData {
  readonly date: string;
  readonly actionCount: number;
  readonly intensity: number;
  readonly dayOfWeek: number;
  readonly month: number;
  readonly day: number;
}

/**
 * Computes intensity level from action count.
 *
 * @param actionCount - Number of actions on the day
 * @returns Intensity level (0 to HEATMAP_INTENSITY_LEVELS)
 */
export function getIntensity(actionCount: number): number {
  if (actionCount === 0) return 0;
  const step = HEATMAP_MAX_ACTIONS_PER_DAY / HEATMAP_INTENSITY_LEVELS;
  return Math.min(
    Math.ceil(actionCount / step),
    HEATMAP_INTENSITY_LEVELS
  );
}
