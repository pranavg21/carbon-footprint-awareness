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
import { downloadAsJSON } from "../../lib/export";
import { trackExportEvent } from "../../lib/firebase";

/**
 * Top bar with page context and utility actions.
 *
 * @returns Header element
 */
export function Header(): React.JSX.Element {
  const currentStreak = useCarbonStore((s) => s.currentStreak);
  const addToast = useToastStore((s) => s.addToast);

  /** Exports all store data and shows a confirmation toast. */
  const handleExport = useCallback((): void => {
    const state = useCarbonStore.getState();
    downloadAsJSON(
      {
        totalScore: state.totalScore,
        monthlyTarget: state.monthlyTarget,
        categoryBreakdown: state.categoryBreakdown,
        actionLog: state.actionLog,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      },
      "Header"
    );
    trackExportEvent();
    addToast("📦 Data exported successfully!", "info");
  }, [addToast]);

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
