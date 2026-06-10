/**
 * Shared category icon mapping for the CarbonTrack platform.
 *
 * Provides a single source of truth for emission category icons
 * used across multiple components (donut chart, nudge feed, etc.).
 * Eliminates icon map duplication flagged in code quality audits.
 *
 * @module category-icons
 */

import React from "react";
import { Car, Utensils, Home, ShoppingBag } from "lucide-react";
import type { EmissionCategory } from "./constants";

/** Shared icon size class for category icons. */
const ICON_SIZE_SM = "w-3.5 h-3.5" as const;

/** Shared icon size class for larger category icons. */
const ICON_SIZE_MD = "w-4 h-4" as const;

/**
 * Small category icons (14px) for legends and compact displays.
 * All icons include `aria-hidden="true"` for accessibility.
 */
export const CATEGORY_ICONS_SM: Readonly<Record<EmissionCategory, React.ReactNode>> = {
  transport: React.createElement(Car, { className: ICON_SIZE_SM, "aria-hidden": true }),
  diet: React.createElement(Utensils, { className: ICON_SIZE_SM, "aria-hidden": true }),
  home: React.createElement(Home, { className: ICON_SIZE_SM, "aria-hidden": true }),
  shopping: React.createElement(ShoppingBag, { className: ICON_SIZE_SM, "aria-hidden": true }),
} as const;

/**
 * Medium category icons (16px) for cards and section headers.
 * All icons include `aria-hidden="true"` for accessibility.
 */
export const CATEGORY_ICONS_MD: Readonly<Record<EmissionCategory, React.ReactNode>> = {
  transport: React.createElement(Car, { className: ICON_SIZE_MD, "aria-hidden": true }),
  diet: React.createElement(Utensils, { className: ICON_SIZE_MD, "aria-hidden": true }),
  home: React.createElement(Home, { className: ICON_SIZE_MD, "aria-hidden": true }),
  shopping: React.createElement(ShoppingBag, { className: ICON_SIZE_MD, "aria-hidden": true }),
} as const;
