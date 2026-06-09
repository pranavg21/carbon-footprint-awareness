/**
 * Shared utility functions for the CarbonTrack platform.
 *
 * Contains pure helper functions used across components and modules.
 * All functions have explicit return types and JSDoc.
 *
 * @module utils
 */

/**
 * Merges CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx for conditional class application.
 *
 * @param classes - Array of class name strings or falsy values
 * @returns Merged class name string
 */
export function cn(
  ...classes: ReadonlyArray<string | boolean | undefined | null>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats an ISO date string into a human-readable short date.
 *
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Jun 9")
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Formats a number with comma separators for display.
 *
 * @param value - Numeric value to format
 * @returns Formatted string (e.g., "1,234")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 *
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/**
 * Returns a date string N days ago from today.
 *
 * @param daysAgo - Number of days to subtract
 * @returns ISO date string (YYYY-MM-DD) for the computed date
 */
export function getDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Generates a v4-style UUID for unique identifiers.
 * Uses crypto.randomUUID when available, falls back to manual generation.
 *
 * @returns UUID string
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Clamps a numeric value between a minimum and maximum.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the percentage of a value relative to a total.
 *
 * @param value - The partial value
 * @param total - The total value
 * @returns Percentage (0-100), or 0 if total is 0
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Returns the day-of-week index (0 = Monday, 6 = Sunday) for an ISO date string.
 *
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Day-of-week index (0-6, Monday-based)
 */
export function getDayOfWeek(isoDate: string): number {
  const date = new Date(isoDate + "T00:00:00");
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
