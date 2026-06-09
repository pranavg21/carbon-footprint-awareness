/**
 * Application top bar with page title and utility actions.
 *
 * Sidebar handles branding. This header shows the current page
 * title and utility actions (export, streak badge on mobile).
 *
 * @module Header
 */

import React, { useCallback } from "react";
import { Download, Flame } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { useToastStore } from "../../hooks/useToast";
import { logger } from "../../lib/logger";

/**
 * Exports the current store state as a JSON file download.
 *
 * @param state - Complete carbon store state snapshot
 */
function exportData(state: {
  totalScore: number;
  monthlyTarget: number;
  categoryBreakdown: Record<string, number>;
  actionLog: ReadonlyArray<unknown>;
  currentStreak: number;
  longestStreak: number;
}): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    ...state,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `carbontrack-export-${new Date().toISOString().split("T")[0] ?? "data"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  logger.info("Data exported", { component: "Header" });
}

/**
 * Top bar with page context and utility actions.
 *
 * @returns Header element
 */
export function Header(): React.JSX.Element {
  const totalScore = useCarbonStore((s) => s.totalScore);
  const monthlyTarget = useCarbonStore((s) => s.monthlyTarget);
  const categoryBreakdown = useCarbonStore((s) => s.categoryBreakdown);
  const actionLog = useCarbonStore((s) => s.actionLog);
  const currentStreak = useCarbonStore((s) => s.currentStreak);
  const longestStreak = useCarbonStore((s) => s.longestStreak);
  const addToast = useToastStore((s) => s.addToast);

  const handleExport = useCallback((): void => {
    exportData({ totalScore, monthlyTarget, categoryBreakdown, actionLog, currentStreak, longestStreak });
    addToast("📦 Data exported successfully!", "info");
  }, [totalScore, monthlyTarget, categoryBreakdown, actionLog, currentStreak, longestStreak, addToast]);

  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 py-2.5"
      style={{
        background: "rgba(5, 10, 21, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(52, 211, 153, 0.04)",
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Page title */}
        <h1 className="text-sm font-bold text-white tracking-tight">
          Dashboard
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Streak badge — mobile */}
          <div className="flex items-center gap-1.5 glass-panel-light px-3 py-1.5 rounded-full lg:hidden">
            <Flame className="w-3.5 h-3.5 text-eco-amber" aria-hidden="true" />
            <span className="text-xs font-bold text-eco-amber font-mono">
              {currentStreak}
            </span>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="action-btn flex items-center gap-2 glass-panel-light px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Export your carbon tracking data as JSON"
            type="button"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline text-xs font-medium">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
