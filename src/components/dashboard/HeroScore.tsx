/**
 * Hero score display component.
 *
 * Score is the undisputed hero — one giant number, full width.
 * Letter grade is a small inline badge. No isolated streak badge
 * floating in the corner (streak is in Quick Stats). Progress bar
 * fills the horizontal space so there are no dark voids.
 *
 * @module HeroScore
 */

import React, { useMemo } from "react";
import { useCarbonStore } from "../../store/carbon-store";
import { AnimatedCounter } from "../shared/AnimatedCounter";
import { CheckCircle } from "lucide-react";
import { percentage } from "../../lib/utils";

/** Letter grade thresholds (percentage of target). */
interface GradeInfo {
  readonly grade: string;
  readonly color: string;
  readonly label: string;
}

/**
 * Computes a letter grade from percentage of target achieved.
 *
 * @param pct - Percentage of target (can exceed 100)
 * @returns Grade info object
 */
function getGrade(pct: number): GradeInfo {
  if (pct >= 100) return { grade: "A+", color: "#34d399", label: "Target exceeded" };
  if (pct >= 90) return { grade: "A", color: "#34d399", label: "Excellent" };
  if (pct >= 75) return { grade: "B", color: "#a3e635", label: "Great progress" };
  if (pct >= 60) return { grade: "C", color: "#fbbf24", label: "Good start" };
  if (pct >= 40) return { grade: "D", color: "#fb923c", label: "Keep going" };
  return { grade: "F", color: "#fb7185", label: "Just starting" };
}

/**
 * Hero score with full-width progress bar and no empty voids.
 *
 * @returns Hero score element
 */
export function HeroScore(): React.JSX.Element {
  const totalScore = useCarbonStore((s) => s.totalScore);
  const monthlyTarget = useCarbonStore((s) => s.monthlyTarget);

  const pct = percentage(totalScore, monthlyTarget);
  const barPct = Math.min(pct, 100);
  const gradeInfo = useMemo(() => getGrade(pct), [pct]);
  const isOverTarget = totalScore >= monthlyTarget;

  return (
    <div className="hero-section glass-panel animate-pulse-glow p-4 sm:p-5">
      {/* Top row: label + grade + target status */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.15em]">
            Monthly Carbon Score
          </p>
          <span
            className="inline-flex items-center text-[11px] font-black px-2 py-0.5 rounded-full"
            style={{
              color: gradeInfo.color,
              backgroundColor: `${gradeInfo.color}15`,
              border: `1px solid ${gradeInfo.color}30`,
            }}
            role="img"
            aria-label={`Grade: ${gradeInfo.grade}, ${gradeInfo.label}`}
          >
            {gradeInfo.grade}
          </span>
        </div>

        {isOverTarget ? (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-eco-mint" aria-hidden="true" />
            <span className="text-[11px] font-bold text-eco-mint">Target exceeded!</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">
            <span className="font-mono font-bold text-eco-cyan">
              {(monthlyTarget - totalScore).toLocaleString()}
            </span>{" "}pts to go
          </span>
        )}
      </div>

      {/* Score row: giant number + target */}
      <div className="flex items-baseline gap-3 mb-3">
        <AnimatedCounter
          value={totalScore}
          className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight leading-none"
        />
        <span className="text-lg text-slate-600 font-medium font-mono">
          / {monthlyTarget.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500 ml-auto font-mono">
          <span className="font-bold" style={{ color: gradeInfo.color }}>{Math.round(pct)}%</span> of target
        </span>
      </div>

      {/* Full-width progress bar — fills the void */}
      <div className="w-full h-2.5 bg-carbon-800/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${barPct}%`,
            background: `linear-gradient(90deg, ${gradeInfo.color}, ${gradeInfo.color}cc)`,
            boxShadow: `0 0 12px ${gradeInfo.color}40`,
          }}
        />
      </div>
    </div>
  );
}
