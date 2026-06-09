/**
 * Zod validation schemas for all data structures in the CarbonTrack platform.
 *
 * Every data shape that crosses a boundary (store, localStorage, export)
 * is validated through these schemas. No `as` casts — only `.parse()`.
 *
 * @module schemas
 */

import { z } from "zod";

// ── Emission Category ───────────────────────────────────────────────

/** Schema for valid emission categories. */
export const emissionCategorySchema = z.enum([
  "transport",
  "diet",
  "home",
  "shopping",
]);

/** Inferred type for emission category values. */
export type EmissionCategoryType = z.infer<typeof emissionCategorySchema>;

// ── Action Log Entry ────────────────────────────────────────────────

/** Schema for a single logged eco-action. */
export const actionLogEntrySchema = z
  .object({
    /** Unique identifier for the action. */
    id: z.string().uuid(),
    /** ISO 8601 timestamp of when the action was logged. */
    timestamp: z.string().datetime(),
    /** Category this action belongs to. */
    category: emissionCategorySchema,
    /** Human-readable action type identifier. */
    actionType: z.string().min(1),
    /** Points deducted from footprint. */
    points: z.number().int().positive(),
    /** Human-readable description. */
    description: z.string(),
  })
  .strict();

/** Inferred type for action log entries. */
export type ActionLogEntry = z.infer<typeof actionLogEntrySchema>;

// ── Daily Log ───────────────────────────────────────────────────────

/** Schema for aggregated daily activity. */
export const dailyLogSchema = z
  .object({
    /** ISO date string (YYYY-MM-DD). */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Total actions logged on this day. */
    actionCount: z.number().int().nonnegative(),
    /** Total points earned on this day. */
    totalPoints: z.number().int().nonnegative(),
  })
  .strict();

/** Inferred type for daily log entries. */
export type DailyLog = z.infer<typeof dailyLogSchema>;

// ── Category Breakdown ──────────────────────────────────────────────

/** Schema for emission breakdown by category. */
export const categoryBreakdownSchema = z.object({
  transport: z.number().nonnegative(),
  diet: z.number().nonnegative(),
  home: z.number().nonnegative(),
  shopping: z.number().nonnegative(),
});

/** Inferred type for category breakdown. */
export type CategoryBreakdown = z.infer<typeof categoryBreakdownSchema>;

// ── Nudge Card ──────────────────────────────────────────────────────

/** Schema for a dynamic nudge/insight card. */
export const nudgeCardSchema = z
  .object({
    /** Unique identifier for the nudge. */
    id: z.string(),
    /** Category this nudge targets. */
    category: emissionCategorySchema,
    /** The tip/insight message. */
    message: z.string(),
    /** Priority for display ordering. */
    priority: z.number().int().nonnegative(),
  })
  .strict();

/** Inferred type for nudge card data. */
export type NudgeCard = z.infer<typeof nudgeCardSchema>;

// ── Toast Notification ──────────────────────────────────────────────

/** Schema for toast notification data. */
export const toastSchema = z
  .object({
    /** Unique identifier for the toast. */
    id: z.string(),
    /** Toast message content. */
    message: z.string(),
    /** Visual variant for the toast. */
    variant: z.enum(["success", "info", "warning", "error"]),
    /** Timestamp when the toast was created. */
    createdAt: z.number(),
  })
  .strict();

/** Inferred type for toast notification data. */
export type Toast = z.infer<typeof toastSchema>;

// ── Persisted Store State ───────────────────────────────────────────

/** Schema for the complete persisted store state (used for rehydration validation). */
export const persistedStateSchema = z.object({
  totalScore: z.number().nonnegative(),
  monthlyTarget: z.number().positive(),
  categoryBreakdown: categoryBreakdownSchema,
  actionLog: z.array(actionLogEntrySchema),
  dailyLogs: z.record(z.string(), dailyLogSchema),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
});

/** Inferred type for persisted store state. */
export type PersistedState = z.infer<typeof persistedStateSchema>;

// ── Data Export ──────────────────────────────────────────────────────

/** Schema for exported user data. */
export const exportDataSchema = z
  .object({
    exportedAt: z.string().datetime(),
    version: z.literal("1.0.0"),
    totalScore: z.number(),
    monthlyTarget: z.number(),
    categoryBreakdown: categoryBreakdownSchema,
    actionLog: z.array(actionLogEntrySchema),
    currentStreak: z.number().int().nonnegative(),
    longestStreak: z.number().int().nonnegative(),
  })
  .strict();

/** Inferred type for exported data. */
export type ExportData = z.infer<typeof exportDataSchema>;
