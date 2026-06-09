/**
 * Application-wide constants for the CarbonTrack platform.
 *
 * All magic numbers are extracted here as named constants to satisfy
 * code quality requirements. Grouped by domain concern.
 *
 * @module constants
 */

// ── Scoring ─────────────────────────────────────────────────────────

/** Default monthly carbon footprint target in points. */
export const MONTHLY_TARGET_SCORE = 1000 as const;

/** Initial monthly carbon budget (higher = more to reduce). */
export const INITIAL_MONTHLY_BUDGET = 850 as const;

/** Maximum score achievable in a month. */
export const MAX_MONTHLY_SCORE = 1500 as const;

// ── Action Points ───────────────────────────────────────────────────

/** Emission categories for carbon tracking. */
export const EMISSION_CATEGORIES = [
  "transport",
  "diet",
  "home",
  "shopping",
] as const;

/** Type representing valid emission category values. */
export type EmissionCategory = (typeof EMISSION_CATEGORIES)[number];

/** Quick-log action definitions with category mapping and point values. */
export const QUICK_ACTIONS = {
  PLANT_MEAL: {
    id: "plant-meal",
    label: "Plant-Based Meal",
    category: "diet" as const,
    points: 15,
    emoji: "🥗",
    description: "Logged a plant-based meal instead of meat",
  },
  PUBLIC_TRANSIT: {
    id: "public-transit",
    label: "Public Transit",
    category: "transport" as const,
    points: 20,
    emoji: "🚌",
    description: "Used public transportation instead of driving",
  },
  RENEWABLE_ENERGY: {
    id: "renewable-energy",
    label: "Renewable Energy",
    category: "home" as const,
    points: 25,
    emoji: "⚡",
    description: "Used renewable energy source at home",
  },
  ZERO_WASTE: {
    id: "zero-waste",
    label: "Zero Waste",
    category: "shopping" as const,
    points: 10,
    emoji: "♻️",
    description: "Avoided single-use products or recycled",
  },
} as const;

/** Type representing valid quick action keys. */
export type QuickActionKey = keyof typeof QUICK_ACTIONS;

// ── Category Display ────────────────────────────────────────────────

/** Color palette for emission categories in charts. */
export const CATEGORY_COLORS: Record<EmissionCategory, string> = {
  transport: "#06b6d4",
  diet: "#a3e635",
  home: "#f59e0b",
  shopping: "#f43f5e",
} as const;

/** Display labels for emission categories. */
export const CATEGORY_LABELS: Record<EmissionCategory, string> = {
  transport: "Transport",
  diet: "Diet",
  home: "Home Energy",
  shopping: "Shopping",
} as const;

/** Icons for emission categories (Lucide icon names). */
export const CATEGORY_ICONS: Record<EmissionCategory, string> = {
  transport: "Car",
  diet: "Utensils",
  home: "Home",
  shopping: "ShoppingBag",
} as const;

// ── Heatmap ─────────────────────────────────────────────────────────

/** Number of days to display in the streak heatmap. */
export const HEATMAP_DAYS = 30 as const;

/** Intensity levels for heatmap cells (0 = none, 4 = max). */
export const HEATMAP_INTENSITY_LEVELS = 4 as const;

/** Maximum daily actions to reach max heatmap intensity. */
export const HEATMAP_MAX_ACTIONS_PER_DAY = 8 as const;

// ── Animations ──────────────────────────────────────────────────────

/** Duration of toast notifications in milliseconds. */
export const TOAST_DURATION_MS = 3000 as const;

/** Maximum number of visible toasts at once. */
export const MAX_VISIBLE_TOASTS = 3 as const;

/** Duration of counter animation in milliseconds. */
export const COUNTER_ANIMATION_MS = 600 as const;

/** Scale factor for button press animation. */
export const BUTTON_PRESS_SCALE = 0.95 as const;

// ── Streaks ─────────────────────────────────────────────────────────

/** Maximum streak display value before showing "+". */
export const MAX_STREAK_DISPLAY = 365 as const;

/** Minimum actions per day to count toward streak. */
export const MIN_ACTIONS_FOR_STREAK = 1 as const;

// ── Nudges ──────────────────────────────────────────────────────────

/** Maximum number of nudge cards to display. */
export const MAX_NUDGE_CARDS = 4 as const;

/** Nudge tips organized by emission category. */
export const NUDGE_TIPS: Record<EmissionCategory, readonly string[]> = {
  transport: [
    "Your transport emissions are highest — try carpooling twice this week.",
    "A 30-min bike ride saves ~3.6 kg CO₂ compared to driving.",
    "Working from home 1 day/week can cut transport emissions by 20%.",
    "Electric scooters emit 90% less CO₂ per km than cars.",
  ],
  diet: [
    "Your diet category is growing — try Meatless Monday this week.",
    "Switching from beef to chicken cuts meal emissions by 50%.",
    "Locally sourced produce reduces food transport emissions by 25%.",
    "One plant-based day per week saves ~170 kg CO₂ per year.",
  ],
  home: [
    "Home energy is your top category — unplug idle electronics tonight.",
    "LED bulbs use 75% less energy than incandescent bulbs.",
    "Lowering thermostat by 1°C saves ~300 kg CO₂ per year.",
    "Air-drying clothes instead of using a dryer saves 2.4 kg CO₂ per load.",
  ],
  shopping: [
    "Shopping emissions are rising — bring reusable bags this week.",
    "Buying second-hand reduces fashion's carbon footprint by 82%.",
    "Choosing products with minimal packaging cuts waste by 40%.",
    "Repairing instead of replacing saves both money and carbon.",
  ],
} as const;

// ── Local Storage ───────────────────────────────────────────────────

/** Key for persisting Zustand store in localStorage. */
export const STORAGE_KEY = "carbontrack-store" as const;

// ── Accessibility ───────────────────────────────────────────────────

/** ID for the main content area (skip link target). */
export const MAIN_CONTENT_ID = "main-content" as const;

/** ID for the skip link element. */
export const SKIP_LINK_ID = "skip-link" as const;
