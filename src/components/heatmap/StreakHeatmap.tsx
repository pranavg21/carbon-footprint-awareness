/**
 * GitHub-style streak heatmap component.
 *
 * Displays a 30-day activity matrix with month labels across
 * the top, all 7 day labels on the left, and a Less→More
 * legend at the bottom. No clipping.
 *
 * @module StreakHeatmap
 */

import React, { useMemo } from "react";
import { useCarbonStore } from "../../store/carbon-store";
import { GlassCard } from "../shared/GlassCard";
import { Activity } from "lucide-react";
import {
  HEATMAP_DAYS,
  HEATMAP_INTENSITY_LEVELS,
  HEATMAP_MAX_ACTIONS_PER_DAY,
} from "../../lib/constants";
import { getDateDaysAgo, formatShortDate, getDayOfWeek } from "../../lib/utils";

/** Color values for heatmap intensity levels (0 = none). */
const INTENSITY_COLORS: ReadonlyArray<string> = [
  "rgba(30, 45, 82, 0.4)",
  "rgba(52, 211, 153, 0.15)",
  "rgba(52, 211, 153, 0.35)",
  "rgba(52, 211, 153, 0.6)",
  "#34d399",
] as const;

/** Day labels for the Y-axis. */
const DAY_LABELS: ReadonlyArray<string> = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
] as const;

/** Month name abbreviations. */
const MONTH_NAMES: ReadonlyArray<string> = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Shape for individual heatmap cell data. */
interface HeatmapCellData {
  readonly date: string;
  readonly actionCount: number;
  readonly intensity: number;
  readonly dayOfWeek: number;
  readonly month: number;
  readonly day: number;
}

/**
 * Computes intensity level from action count.
 *
 * @param actionCount - Number of actions on the day
 * @returns Intensity level (0 to HEATMAP_INTENSITY_LEVELS)
 */
function getIntensity(actionCount: number): number {
  if (actionCount === 0) return 0;
  const step = HEATMAP_MAX_ACTIONS_PER_DAY / HEATMAP_INTENSITY_LEVELS;
  return Math.min(
    Math.ceil(actionCount / step),
    HEATMAP_INTENSITY_LEVELS
  );
}

/**
 * Streak heatmap showing 30-day activity matrix with month labels.
 *
 * @returns Streak heatmap element
 */
export function StreakHeatmap(): React.JSX.Element {
  const dailyLogs = useCarbonStore((s) => s.dailyLogs);
  const currentStreak = useCarbonStore((s) => s.currentStreak);

  const cells = useMemo((): ReadonlyArray<HeatmapCellData> => {
    const result: HeatmapCellData[] = [];

    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const date = getDateDaysAgo(i);
      const log = dailyLogs[date];
      const actionCount = log?.actionCount ?? 0;
      const dateObj = new Date(date + "T00:00:00");

      result.push({
        date,
        actionCount,
        intensity: getIntensity(actionCount),
        dayOfWeek: getDayOfWeek(date),
        month: dateObj.getMonth(),
        day: dateObj.getDate(),
      });
    }

    return result;
  }, [dailyLogs]);

  // Organize into columns (weeks)
  const columns = useMemo((): ReadonlyArray<ReadonlyArray<HeatmapCellData | null>> => {
    const cols: Array<Array<HeatmapCellData | null>> = [];
    let currentCol: Array<HeatmapCellData | null> = [];

    const firstCell = cells[0];
    if (firstCell) {
      for (let i = 0; i < firstCell.dayOfWeek; i++) {
        currentCol.push(null);
      }
    }

    for (const cell of cells) {
      currentCol.push(cell);
      if (cell.dayOfWeek === 6) {
        cols.push(currentCol);
        currentCol = [];
      }
    }

    if (currentCol.length > 0) {
      while (currentCol.length < 7) {
        currentCol.push(null);
      }
      cols.push(currentCol);
    }

    return cols;
  }, [cells]);

  // Compute month labels for the top header
  const monthLabels = useMemo((): ReadonlyArray<{ label: string; colIndex: number }> => {
    const labels: Array<{ label: string; colIndex: number }> = [];
    let lastMonth = -1;

    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const col = columns[colIdx];
      if (!col) continue;
      // Find the first real cell in this column
      const firstCell = col.find((c): c is HeatmapCellData => c !== null);
      if (firstCell && firstCell.month !== lastMonth) {
        labels.push({
          label: MONTH_NAMES[firstCell.month] ?? "",
          colIndex: colIdx,
        });
        lastMonth = firstCell.month;
      }
    }

    return labels;
  }, [columns]);

  const activeDays = cells.filter((c) => c.actionCount > 0).length;

  return (
    <GlassCard className="heatmap-section">
      {/* Custom header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-eco-mint" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Activity Heatmap
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">
            <span className="font-mono font-bold text-eco-mint">{activeDays}</span>
            <span className="hidden sm:inline"> active days</span>
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-400">
            <span className="font-mono font-bold text-eco-amber">{currentStreak}</span> day streak
          </span>
        </div>
      </div>

      {/* Heatmap with day labels + month header */}
      <div>
        <div className="flex">
          {/* Day labels spacer */}
          <div className="flex-shrink-0 w-9" />
          {/* Month labels — flex to fill */}
          <div className="flex flex-1 gap-1">
            {columns.map((_, colIdx) => {
              const monthLabel = monthLabels.find((m) => m.colIndex === colIdx);
              return (
                <div key={colIdx} className="flex-1 text-center">
                  {monthLabel ? (
                    <span className="text-[9px] text-slate-500 font-medium">
                      {monthLabel.label}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid rows */}
        <div className="flex mt-1">
          {/* Day labels column */}
          <div className="flex flex-col flex-shrink-0 w-9 gap-1">
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="flex items-center justify-end pr-2 h-0 flex-1"
              >
                <span className="text-[9px] text-slate-500 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Cell columns — flex-1 to fill space */}
          <div className="flex flex-1 gap-1">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col flex-1 gap-1">
                {column.map((cell, rowIndex) => {
                  if (!cell) {
                    return (
                      <div
                        key={`empty-${colIndex}-${rowIndex}`}
                        className="flex-1 aspect-square"
                      />
                    );
                  }

                  const color = INTENSITY_COLORS[cell.intensity] ?? INTENSITY_COLORS[0];
                  return (
                    <div
                      key={cell.date}
                      className="flex-1 aspect-square rounded-[4px] cursor-pointer transition-all duration-150 hover:scale-[1.3] hover:z-10"
                      style={{ backgroundColor: color }}
                      title={`${formatShortDate(cell.date)}: ${cell.actionCount} actions`}
                      role="gridcell"
                      aria-label={`${formatShortDate(cell.date)}: ${cell.actionCount} actions logged`}
                      tabIndex={0}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Intensity legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-slate-500 font-medium">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="rounded-[3px]"
            style={{ width: "14px", height: "14px", backgroundColor: color }}
            aria-hidden="true"
          />
        ))}
        <span className="text-[10px] text-slate-500 font-medium">More</span>
      </div>
    </GlassCard>
  );
}
