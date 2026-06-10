/**
 * Dynamic nudge feed component.
 *
 * Displays personalized insight cards. The section header shows
 * the top category on its own line below the title. Individual
 * cards have generous 14-16px padding for a card-like feel.
 *
 * @module NudgeFeed
 */

import React, { useMemo } from "react";
import {
  Car,
  Utensils,
  Home,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { GlassCard } from "../shared/GlassCard";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../../lib/constants";
import type { EmissionCategory } from "../../lib/constants";
import type { NudgeCard as NudgeCardType } from "../../lib/schemas";
import { getTopCategory } from "../../lib/seed-data";

/** Map of categories to Lucide icon components. */
const CATEGORY_ICON_MAP: Record<EmissionCategory, React.ReactNode> = {
  transport: <Car className="w-4 h-4" aria-hidden="true" />,
  diet: <Utensils className="w-4 h-4" aria-hidden="true" />,
  home: <Home className="w-4 h-4" aria-hidden="true" />,
  shopping: <ShoppingBag className="w-4 h-4" aria-hidden="true" />,
};

/** Props for the individual NudgeCard component. */
interface NudgeCardProps {
  /** Nudge data to display. */
  readonly nudge: NudgeCardType;
}

/**
 * Individual nudge card with generous padding.
 *
 * @param props - Component props
 * @returns Nudge card element
 */
function NudgeCardItem({ nudge }: NudgeCardProps): React.JSX.Element {
  const color = CATEGORY_COLORS[nudge.category];
  const icon = CATEGORY_ICON_MAP[nudge.category];
  const label = CATEGORY_LABELS[nudge.category];

  return (
    <article
      className="nudge-card glass-panel-light rounded-xl"
      style={{ padding: "14px 16px" }}
      aria-label={`${label} tip: ${nudge.message}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-slate-200 leading-relaxed">
            {nudge.message}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * Vertical feed of personalized eco-nudge cards.
 *
 * @returns Nudge feed element
 */
export function NudgeFeed(): React.JSX.Element {
  const nudges = useCarbonStore((s) => s.nudges);
  const categoryBreakdown = useCarbonStore((s) => s.categoryBreakdown);
  const topCategory = useMemo(
    () => getTopCategory(categoryBreakdown),
    [categoryBreakdown]
  );

  return (
    <GlassCard className="nudge-section">
      {/* Title row */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-eco-amber" aria-hidden="true" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Smart Insights
        </h2>
      </div>

      {/* Top category badge — on its own line, clearly a filter indicator */}
      <div className="mb-5">
        <span
          className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            color: CATEGORY_COLORS[topCategory],
            backgroundColor: `${CATEGORY_COLORS[topCategory]}12`,
            border: `1px solid ${CATEGORY_COLORS[topCategory]}25`,
          }}
        >
          Top category: {CATEGORY_LABELS[topCategory]}
        </span>
      </div>

      <div className="flex flex-col gap-3 stagger-children">
        {nudges.map((nudge) => (
          <NudgeCardItem
            key={nudge.id}
            nudge={nudge}
          />
        ))}
      </div>
    </GlassCard>
  );
}
