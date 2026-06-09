/**
 * Primary action dock for quick eco-action logging.
 *
 * This is the core interaction loop of the entire app.
 * Buttons are vibrant with solid color backgrounds, glow on hover,
 * and satisfying press animations. Not afterthoughts — primary UI.
 *
 * @module ActionDock
 */

import React, { useCallback } from "react";
import { Utensils, Bus, Zap, Recycle } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { useToastStore } from "../../hooks/useToast";
import { QUICK_ACTIONS } from "../../lib/constants";
import type { QuickActionKey } from "../../lib/constants";

/** Map of action keys to Lucide icon components. */
const ACTION_ICONS: Record<QuickActionKey, React.ReactNode> = {
  PLANT_MEAL: <Utensils className="w-5 h-5" aria-hidden="true" />,
  PUBLIC_TRANSIT: <Bus className="w-5 h-5" aria-hidden="true" />,
  RENEWABLE_ENERGY: <Zap className="w-5 h-5" aria-hidden="true" />,
  ZERO_WASTE: <Recycle className="w-5 h-5" aria-hidden="true" />,
};

/** Vibrant color styles for each action button. */
const ACTION_STYLES: Record<QuickActionKey, {
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
const ACTION_KEYS: ReadonlyArray<QuickActionKey> = [
  "PLANT_MEAL",
  "PUBLIC_TRANSIT",
  "RENEWABLE_ENERGY",
  "ZERO_WASTE",
] as const;

/**
 * Inline action dock — primary interaction surface.
 *
 * @returns Action dock element
 */
export function ActionDock(): React.JSX.Element {
  const logAction = useCarbonStore((s) => s.logAction);
  const addToast = useToastStore((s) => s.addToast);

  const handleAction = useCallback(
    (key: QuickActionKey): void => {
      logAction(key);
      const action = QUICK_ACTIONS[key];
      addToast(
        `${action.emoji} ${action.label} logged! +${action.points} pts`,
        "success"
      );
    },
    [logAction, addToast]
  );

  return (
    <nav className="action-dock-inline" aria-label="Quick action logging">
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Log Activity
          </h2>
          <span className="text-[10px] text-slate-500 font-medium">
            Tap to log an eco-action
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACTION_KEYS.map((key) => {
            const action = QUICK_ACTIONS[key];
            const style = ACTION_STYLES[key];
            return (
              <button
                key={key}
                onClick={(): void => handleAction(key)}
                className="action-dock-btn group flex items-center gap-3 py-3.5 px-4 rounded-2xl border transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: style.bg,
                  borderColor: `${style.text}20`,
                }}
                onMouseEnter={(e): void => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = style.hoverBg;
                  el.style.borderColor = `${style.text}40`;
                  el.style.boxShadow = style.glow;
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e): void => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = style.bg;
                  el.style.borderColor = `${style.text}20`;
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
                onMouseDown={(e): void => {
                  e.currentTarget.style.transform = "scale(0.95)";
                }}
                onMouseUp={(e): void => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                aria-label={`Log ${action.label}: earns ${action.points} points`}
                type="button"
              >
                {/* Icon bubble */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: `${style.text}18`,
                    color: style.text,
                  }}
                >
                  {ACTION_ICONS[key]}
                </div>
                {/* Label + points */}
                <div className="text-left">
                  <span
                    className="text-sm font-semibold leading-tight block"
                    style={{ color: style.text }}
                  >
                    {action.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold" style={{ color: `${style.text}90` }}>
                    +{action.points} pts
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
