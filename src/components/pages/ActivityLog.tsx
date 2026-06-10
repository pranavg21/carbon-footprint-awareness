/**
 * Activity Log page component.
 *
 * Displays a chronological feed of all logged eco-actions with
 * category badges, timestamps, and point values. Pulls data
 * directly from the Zustand store.
 *
 * @module ActivityLog
 */

import React, { useMemo, useState } from "react";
import { Clock, Filter, Trash2 } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { GlassCard } from "../shared/GlassCard";
import { CATEGORY_COLORS, CATEGORY_LABELS, EMISSION_CATEGORIES, type EmissionCategory } from "../../lib/constants";
import { CATEGORY_ICONS_SM } from "../../lib/category-icons";

/** Number of entries to show per page. */
const PAGE_SIZE = 20;

/**
 * Formats an ISO timestamp into a human-readable relative string.
 *
 * @param isoString - ISO 8601 date string
 * @returns Human-readable time string (e.g., "2 hours ago", "Yesterday")
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Activity Log page showing all logged eco-actions.
 *
 * @returns Activity log page element
 */
export function ActivityLog(): React.JSX.Element {
  const actionLog = useCarbonStore((s) => s.actionLog);
  const resetStore = useCarbonStore((s) => s.resetStore);
  const [filterCategory, setFilterCategory] = useState<EmissionCategory | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** Filtered + paginated actions. */
  const filteredActions = useMemo(() => {
    const sorted = [...actionLog].reverse();
    if (filterCategory === "all") return sorted;
    return sorted.filter((a) => a.category === filterCategory);
  }, [actionLog, filterCategory]);

  const visibleActions = filteredActions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActions.length;

  /** Category stats summary. */
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const action of actionLog) {
      counts[action.category] = (counts[action.category] ?? 0) + 1;
    }
    return counts;
  }, [actionLog]);

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-eco-mint" aria-hidden="true" />
            <h2 className="text-lg font-bold text-white">Activity Log</h2>
            <span className="text-xs text-slate-500 bg-carbon-800 px-2 py-0.5 rounded-full">
              {filteredActions.length} entries
            </span>
          </div>
          <button
            type="button"
            onClick={resetStore}
            className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
            aria-label="Reset all data"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by category">
          <Filter className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <button
            type="button"
            onClick={(): void => setFilterCategory("all")}
            className={`text-xs px-3 py-1 rounded-full transition-all ${
              filterCategory === "all"
                ? "bg-eco-mint/15 text-eco-mint border border-eco-mint/25"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
            aria-pressed={filterCategory === "all"}
          >
            All
          </button>
          {EMISSION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(): void => setFilterCategory(cat)}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-all ${
                filterCategory === cat
                  ? "border"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
              style={
                filterCategory === cat
                  ? { color: CATEGORY_COLORS[cat], backgroundColor: `${CATEGORY_COLORS[cat]}15`, borderColor: `${CATEGORY_COLORS[cat]}40` }
                  : undefined
              }
              aria-pressed={filterCategory === cat}
            >
              {CATEGORY_ICONS_SM[cat]}
              {CATEGORY_LABELS[cat]}
              <span className="text-[10px] opacity-60">({stats[cat] ?? 0})</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Action entries */}
      <GlassCard>
        <div className="flex flex-col gap-2">
          {visibleActions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No actions logged yet. Start tracking your eco-actions!
            </p>
          ) : null}

          {visibleActions.map((action) => {
            const color = CATEGORY_COLORS[action.category];
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}12` }}
                >
                  <span style={{ color }}>{CATEGORY_ICONS_SM[action.category]}</span>
                </div>

                {/* Action details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{action.description}</p>
                  <p className="text-[11px] text-slate-500">
                    {CATEGORY_LABELS[action.category]} · {formatRelativeTime(action.timestamp)}
                  </p>
                </div>

                {/* Points */}
                <span
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color }}
                >
                  +{action.points}
                </span>
              </div>
            );
          })}

          {/* Load more */}
          {hasMore ? (
            <button
              type="button"
              onClick={(): void => setVisibleCount((c) => c + PAGE_SIZE)}
              className="text-xs text-eco-mint/70 hover:text-eco-mint py-3 transition-colors"
              aria-label="Show more entries"
            >
              Show more ({filteredActions.length - visibleCount} remaining)
            </button>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}
