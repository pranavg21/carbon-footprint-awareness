/** Category donut chart — custom SVG implementation with arc segments, hover states, and icon legend. @module CategoryDonut */

import React, { useState, useMemo, useCallback } from "react";
import { useCarbonStore } from "../../store/carbon-store";
import { CATEGORY_COLORS, CATEGORY_LABELS, EMISSION_CATEGORIES, type EmissionCategory } from "../../lib/constants";
import { GlassCard } from "../shared/GlassCard";
import { CATEGORY_ICONS_SM } from "../../lib/category-icons";
import {
  DONUT_SIZE, DONUT_CENTER, DONUT_OUTER_RADIUS, DONUT_INNER_RADIUS,
  SEGMENT_GAP_DEGREES, describeArc, type ArcSegment,
} from "./donut-geometry";

/**
 * Donut chart showing emission breakdown by category.
 *
 * @returns Category donut chart element
 */
export function CategoryDonut(): React.JSX.Element {
  const categoryBreakdown = useCarbonStore((s) => s.categoryBreakdown);
  const [hoveredCategory, setHoveredCategory] = useState<EmissionCategory | null>(null);

  const total = useMemo(
    () => EMISSION_CATEGORIES.reduce((sum, cat) => sum + categoryBreakdown[cat], 0),
    [categoryBreakdown]
  );

  const segments = useMemo((): ReadonlyArray<ArcSegment> => {
    if (total === 0) return [];

    const totalGap = SEGMENT_GAP_DEGREES * EMISSION_CATEGORIES.length;
    const availableDegrees = 360 - totalGap;
    const result: ArcSegment[] = [];
    let currentAngle = 0;

    for (const cat of EMISSION_CATEGORIES) {
      const value = categoryBreakdown[cat];
      const percentage = (value / total) * 100;
      const sweep = (value / total) * availableDegrees;

      const startAngle = currentAngle;
      const endAngle = currentAngle + sweep;

      result.push({
        category: cat,
        value,
        percentage,
        startAngle,
        endAngle,
        path: describeArc(
          DONUT_CENTER,
          DONUT_CENTER,
          DONUT_OUTER_RADIUS,
          DONUT_INNER_RADIUS,
          startAngle,
          endAngle
        ),
        color: CATEGORY_COLORS[cat],
      });

      currentAngle = endAngle + SEGMENT_GAP_DEGREES;
    }

    return result;
  }, [categoryBreakdown, total]);

  const handleMouseEnter = useCallback((cat: EmissionCategory): void => {
    setHoveredCategory(cat);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setHoveredCategory(null);
  }, []);

  return (
    <GlassCard title="Emissions by Category" className="chart-section">
      {/* SVG Donut Chart */}
      <div
        className="flex justify-center py-2"
        role="img"
        aria-label={`Donut chart: ${segments.map((s) => `${CATEGORY_LABELS[s.category]} ${Math.round(s.percentage)}%`).join(", ")}`}
      >
        <svg
          width={DONUT_SIZE}
          height={DONUT_SIZE}
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          className="overflow-visible"
        >
          {/* Glow filter */}
          <defs>
            <filter id="segmentGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Segments */}
          {segments.map((seg) => {
            const isHovered = hoveredCategory === seg.category;
            const isOtherHovered = hoveredCategory !== null && !isHovered;
            return (
              <path
                key={seg.category}
                d={seg.path}
                fill={seg.color}
                opacity={isOtherHovered ? 0.3 : 1}
                filter={isHovered ? "url(#segmentGlow)" : undefined}
                style={{
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                  transformOrigin: `${DONUT_CENTER}px ${DONUT_CENTER}px`,
                  transform: isHovered ? "scale(1.06)" : "scale(1)",
                  cursor: "pointer",
                  outline: "none",
                }}
                tabIndex={0}
                role="button"
                aria-label={`${CATEGORY_LABELS[seg.category]}: ${seg.value.toLocaleString()} points, ${Math.round(seg.percentage)}%`}
                onMouseEnter={(): void => handleMouseEnter(seg.category)}
                onMouseLeave={handleMouseLeave}
                onFocus={(): void => handleMouseEnter(seg.category)}
                onBlur={handleMouseLeave}
              />
            );
          })}

          {/* Center content */}
          <text
            x={DONUT_CENTER}
            y={DONUT_CENTER - 4}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white font-mono font-black"
            style={{ fontSize: "24px" }}
          >
            {total.toLocaleString()}
          </text>
          <text
            x={DONUT_CENTER}
            y={DONUT_CENTER + 14}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-slate-500 font-semibold uppercase"
            style={{ fontSize: "9px", letterSpacing: "0.12em" }}
          >
            TOTAL PTS
          </text>
        </svg>
      </div>

      {/* Tooltip on hover */}
      {hoveredCategory && (
        <div className="text-center mb-2 animate-fade-in">
          <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[hoveredCategory] }}>
            {CATEGORY_LABELS[hoveredCategory]}
          </span>
          <span className="text-sm text-slate-400 mx-2">—</span>
          <span className="text-sm font-mono font-bold text-white">
            {categoryBreakdown[hoveredCategory].toLocaleString()} pts
          </span>
        </div>
      )}

      {/* Legend with thick progress bars */}
      <div className="flex flex-col gap-3 mt-4">
        {segments.map((seg) => {
          const pct = Math.round(seg.percentage);
          const isHovered = hoveredCategory === seg.category;
          return (
            <div
              key={seg.category}
              className={`cursor-pointer rounded-xl transition-all duration-200 ${
                isHovered ? "bg-white/[0.05]" : ""
              }`}
              style={{ padding: "10px 12px" }}
              onMouseEnter={(): void => handleMouseEnter(seg.category)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${seg.color}18` }}
                >
                  <span style={{ color: seg.color }}>
                    {CATEGORY_ICONS_SM[seg.category]}
                  </span>
                </div>
                <span className="text-[13px] text-slate-200 flex-1 font-medium">
                  {CATEGORY_LABELS[seg.category]}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: seg.color }}>
                  {seg.value.toLocaleString()} pts
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold w-9 text-right">
                  {pct}%
                </span>
              </div>
              {/* Progress bar — clear gap from label */}
              <div className="w-full h-2.5 bg-carbon-800/60 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                    boxShadow: isHovered ? `0 0 12px ${seg.color}50` : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
