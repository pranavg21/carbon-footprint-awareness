/**
 * Sidebar navigation item configuration and types.
 *
 * @module sidebar-config
 */

import React from "react";
import {
  LayoutDashboard,
  Activity,
  Trophy,
  Users,
  Settings,
} from "lucide-react";
import { ECO_LEVEL_THRESHOLDS } from "../../lib/constants";

/** Valid navigation view identifiers. */
export type ViewId = "dashboard" | "activity" | "achievements" | "community" | "settings";

/** Shape for a navigation item. */
export interface NavItem {
  readonly id: ViewId;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly badge?: string;
}

/** Navigation items configuration. */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "activity", label: "Activity Log", icon: <Activity className="w-5 h-5" /> },
  { id: "achievements", label: "Achievements", icon: <Trophy className="w-5 h-5" />, badge: "3" },
  { id: "community", label: "Community", icon: <Users className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

/** Sidebar width when expanded. */
export const WIDTH_EXPANDED = "200px";

/** Sidebar width when collapsed. */
export const WIDTH_COLLAPSED = "64px";

/**
 * Computes an eco-hero level label based on point thresholds.
 *
 * @param points - Current total eco-points
 * @returns Human-readable level string
 */
export function getEcoLevel(points: number): string {
  if (points >= ECO_LEVEL_THRESHOLDS.LEVEL_5) return "Lvl 5 Green Legend";
  if (points >= ECO_LEVEL_THRESHOLDS.LEVEL_4) return "Lvl 4 Earth Guardian";
  if (points >= ECO_LEVEL_THRESHOLDS.LEVEL_3) return "Lvl 3 Planet Friend";
  if (points >= ECO_LEVEL_THRESHOLDS.LEVEL_2) return "Lvl 2 Carbon Crusader";
  return "Lvl 1 Eco Novice";
}
