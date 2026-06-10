/**
 * Category donut chart — custom SVG implementation.
 *
 * Renders a beautiful animated donut chart with smooth arc segments,
 * interactive hover states, and an icon-based legend. No external
 * charting library needed — full control over every pixel.
 *
 * @module CategoryDonut
 */

import React, { useState, useMemo, useCallback } from "react";
import { useCarbonStore } from "../../store/carbon-store";
import { CATEGORY_COLORS, CATEGORY_LABELS, EMISSION_CATEGORIES } from "../../lib/constants";
import type { EmissionCategory } from "../../lib/constants";
import { GlassCard } from "../shared/GlassCard";
import { Car, Utensils, Home, ShoppingBag } from "lucide-react";

/** Category icon map for legend. */
const LEGEND_ICONS: Record<EmissionCategory, React.ReactNode> = {
  transport: <Car className="w-3.5 h-3.5" aria-hidden="true" />,
  diet: <Utensils className="w-3.5 h-3.5" aria-hidden="true" />,
  home: <Home className="w-3.5 h-3.5" aria-hidden="true" />,
  shopping: <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />,
};

/** SVG donut configuration. */
const DONUT_SIZE = 200;
const DONUT_CENTER = DONUT_SIZE / 2;
const DONUT_OUTER_RADIUS = 88;
const DONUT_INNER_RADIUS = 58;
const SEGMENT_GAP_DEGREES = 3;

/** Shape for a computed arc segment. */
interface ArcSegment {
  readonly category: EmissionCategory;
  readonly value: number;
  readonly percentage: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly path: string;
  readonly color: string;
}

/**
 * Converts polar coordinates to SVG cartesian coordinates.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param radius - Arc radius
 * @param angleDeg - Angle in degrees
 * @returns Cartesian x, y point
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/**
 * Generates an SVG arc path string for a donut segment.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param outerR - Outer radius
 * @param innerR - Inner radius
 * @param startAngle - Start angle in degrees
 * @param endAngle - End angle in degrees
 * @returns SVG path d-string
 */
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const arcSweep = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${arcSweep} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${arcSweep} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

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
                }}
                onMouseEnter={(): void => handleMouseEnter(seg.category)}
                onMouseLeave={handleMouseLeave}
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
                    {LEGEND_ICONS[seg.category]}
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
