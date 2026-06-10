/**
 * Stats grid — full-width, generous breathing room.
 *
 * 6 cards in a clean 6-column grid. "Today" shows points earned.
 * Each card has 16-20px internal padding and clear visual gaps
 * between label → value → suffix.
 *
 * @module StatsRow
 */

import React, { useMemo } from "react";
import { Zap, Flame, Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { AnimatedCounter } from "../shared/AnimatedCounter";
import { GlassCard } from "../shared/GlassCard";
import { getTodayDateString } from "../../lib/utils";

/** Stat card configuration shape. */
interface StatConfig {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly iconBg: string;
  readonly iconColor: string;
}

/** Static config for each stat card. */
const STAT_CONFIGS: ReadonlyArray<StatConfig> = [
  {
    label: "Today",
    icon: <Zap className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(52, 211, 153, 0.12)",
    iconColor: "#34d399",
  },
  {
    label: "Current Streak",
    icon: <Flame className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(251, 191, 36, 0.12)",
    iconColor: "#fbbf24",
  },
  {
    label: "Best Streak",
    icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(167, 139, 250, 0.12)",
    iconColor: "#a78bfa",
  },
  {
    label: "Left to Goal",
    icon: <Target className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(34, 211, 238, 0.12)",
    iconColor: "#22d3ee",
  },
  {
    label: "This Month",
    icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(251, 113, 133, 0.12)",
    iconColor: "#fb7185",
  },
  {
    label: "Avg Impact",
    icon: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
    iconBg: "rgba(163, 230, 53, 0.12)",
    iconColor: "#a3e635",
  },
] as const;

/**
 * Full-width 6-card stat grid with generous internal spacing.
 *
 * @returns Stats grid element
 */
export function StatsRow(): React.JSX.Element {
  const currentStreak = useCarbonStore((s) => s.currentStreak);
  const longestStreak = useCarbonStore((s) => s.longestStreak);
  const totalScore = useCarbonStore((s) => s.totalScore);
  const monthlyTarget = useCarbonStore((s) => s.monthlyTarget);
  const actionLog = useCarbonStore((s) => s.actionLog);
  const dailyLogs = useCarbonStore((s) => s.dailyLogs);

  const today = getTodayDateString();
  const todayPoints = dailyLogs[today]?.totalPoints ?? 0;
  const remaining = Math.max(monthlyTarget - totalScore, 0);
  const totalActions = actionLog.length;
  const avgPtsPerAction = useMemo(
    () => (totalActions > 0 ? Math.round(totalScore / totalActions) : 0),
    [totalScore, totalActions]
  );

  const values: ReadonlyArray<number> = [
    todayPoints,
    currentStreak,
    longestStreak,
    remaining,
    totalActions,
    avgPtsPerAction,
  ];

  /** Specific, unambiguous suffixes. */
  const suffixes: ReadonlyArray<string> = [
    "pts earned today",
    currentStreak === 1 ? "active day" : "active days",
    longestStreak === 1 ? "day record" : "days record",
    "pts remaining",
    totalActions === 1 ? "eco-action logged" : "eco-actions logged",
    "pts per action",
  ];

  return (
    <GlassCard title="Quick Stats" className="stats-section">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CONFIGS.map((config, index) => {
          const value = values[index] ?? 0;
          const suffix = suffixes[index] ?? "";
          return (
            <div
              key={config.label}
              className="stat-card glass-panel-light rounded-2xl group hover:scale-[1.03] transition-transform duration-200"
              style={{ padding: "16px 14px" }}
            >
              {/* Icon + Label row */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: config.iconBg,
                    color: config.iconColor,
                  }}
                >
                  {config.icon}
                </div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
                  {config.label}
                </p>
              </div>

              {/* Value — clear gap from label */}
              <AnimatedCounter
                value={value}
                className="text-2xl font-black font-mono text-white block leading-none mb-1.5"
              />

              {/* Specific suffix — readable */}
              <p className="text-[10px] text-slate-500 leading-snug">
                {suffix}
              </p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
