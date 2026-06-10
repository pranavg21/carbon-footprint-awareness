/**
 * Dynamic nudge feed component with Gemini AI integration.
 *
 * Displays personalized insight cards. When Gemini AI is configured,
 * generates contextual tips based on the user's actual emission data.
 * Falls back to hardcoded tips when API is unavailable.
 *
 * @module NudgeFeed
 */

import React, { useMemo, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { GlassCard } from "../shared/GlassCard";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../../lib/constants";
import type { NudgeCard as NudgeCardType } from "../../lib/schemas";
import { getTopCategory } from "../../lib/seed-data";
import { CATEGORY_ICONS_MD } from "../../lib/category-icons";
import { generateGeminiInsights, isGeminiAvailable } from "../../lib/gemini";

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
  const icon = CATEGORY_ICONS_MD[nudge.category];
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
 * Uses Gemini AI when available, otherwise falls back to store nudges.
 *
 * @returns Nudge feed element
 */
export function NudgeFeed(): React.JSX.Element {
  const nudges = useCarbonStore((s) => s.nudges);
  const categoryBreakdown = useCarbonStore((s) => s.categoryBreakdown);
  const totalScore = useCarbonStore((s) => s.totalScore);
  const topCategory = useMemo(
    () => getTopCategory(categoryBreakdown),
    [categoryBreakdown]
  );

  // Gemini AI-powered insights
  const [aiInsights, setAiInsights] = useState<ReadonlyArray<NudgeCardType>>([]);
  const [isAiLoading, setIsAiLoading] = useState(() => isGeminiAvailable());

  useEffect(() => {
    if (!isGeminiAvailable()) return;

    let cancelled = false;

    void generateGeminiInsights(categoryBreakdown, totalScore, topCategory)
      .then((insights) => {
        if (!cancelled && insights.length > 0) {
          setAiInsights(insights);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAiLoading(false);
        }
      });

    return (): void => {
      cancelled = true;
    };
  }, [categoryBreakdown, totalScore, topCategory]);

  /** Display AI insights when available, otherwise fallback to store nudges. */
  const displayNudges = aiInsights.length > 0 ? aiInsights : nudges;
  const isAiPowered = aiInsights.length > 0;

  return (
    <GlassCard className="nudge-section">
      {/* Title row */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-eco-amber" aria-hidden="true" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Smart Insights
        </h2>
        {isAiPowered ? (
          <span className="text-[9px] font-bold text-eco-violet bg-eco-violet/12 px-2 py-0.5 rounded-full border border-eco-violet/25 uppercase tracking-wider">
            Gemini AI
          </span>
        ) : null}
        {isAiLoading ? (
          <span className="text-[9px] text-slate-500 animate-pulse">Generating…</span>
        ) : null}
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
        {displayNudges.map((nudge) => (
          <NudgeCardItem
            key={nudge.id}
            nudge={nudge}
          />
        ))}
      </div>
    </GlassCard>
  );
}
