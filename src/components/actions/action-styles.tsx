/**
 * Style constants for ActionDock quick-action buttons.
 *
 * Extracted from ActionDock to keep each module under 200 lines
 * and maintain single responsibility.
 *
 * @module action-styles
 */

import React from "react";
import { Utensils, Bus, Zap, Recycle } from "lucide-react";
import type { QuickActionKey } from "../../lib/constants";

/** Map of action keys to Lucide icon components. */
export const ACTION_ICONS: Record<QuickActionKey, React.ReactNode> = {
  PLANT_MEAL: <Utensils className="w-5 h-5" aria-hidden="true" />,
  PUBLIC_TRANSIT: <Bus className="w-5 h-5" aria-hidden="true" />,
  RENEWABLE_ENERGY: <Zap className="w-5 h-5" aria-hidden="true" />,
  ZERO_WASTE: <Recycle className="w-5 h-5" aria-hidden="true" />,
};

/** Vibrant color styles for each action button. */
export const ACTION_STYLES: Record<QuickActionKey, {
  readonly bg: string;
  readonly hoverBg: string;
  readonly glow: string;
  readonly text: string;
}> = {
  PLANT_MEAL: {
    bg: "rgba(34, 197, 94, 0.12)",
    hoverBg: "rgba(34, 197, 94, 0.22)",
    glow: "0 0 20px rgba(34, 197, 94, 0.25)",
    text: "#22c55e",
  },
  PUBLIC_TRANSIT: {
    bg: "rgba(34, 211, 238, 0.12)",
    hoverBg: "rgba(34, 211, 238, 0.22)",
    glow: "0 0 20px rgba(34, 211, 238, 0.25)",
    text: "#22d3ee",
  },
  RENEWABLE_ENERGY: {
    bg: "rgba(251, 191, 36, 0.12)",
    hoverBg: "rgba(251, 191, 36, 0.22)",
    glow: "0 0 20px rgba(251, 191, 36, 0.25)",
    text: "#fbbf24",
  },
  ZERO_WASTE: {
    bg: "rgba(251, 113, 133, 0.12)",
    hoverBg: "rgba(251, 113, 133, 0.22)",
    glow: "0 0 20px rgba(251, 113, 133, 0.25)",
    text: "#fb7185",
  },
};

/** All action keys for iteration. */
export const ACTION_KEYS: ReadonlyArray<QuickActionKey> = [
  "PLANT_MEAL",
  "PUBLIC_TRANSIT",
  "RENEWABLE_ENERGY",
  "ZERO_WASTE",
] as const;
