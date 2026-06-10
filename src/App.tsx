/**
 * Root application component for the CarbonTrack platform.
 *
 * Layout: Sidebar (expanded by default) + main content.
 * Action buttons are promoted to primary position right below
 * the hero score. Stats span full width. No empty voids.
 *
 * Uses React.lazy() for code-splitting below-the-fold components
 * and Suspense boundaries for progressive loading.
 *
 * @module App
 */

import React, { Suspense, useState, useEffect } from "react";
import { Sidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from "./components/layout/Sidebar";
import { SkipLink } from "./components/layout/SkipLink";
import { Header } from "./components/layout/Header";
import { HeroScore } from "./components/dashboard/HeroScore";
import { ActionDock } from "./components/actions/ActionDock";
import { StatsRow } from "./components/dashboard/StatsRow";
import { ToastContainer } from "./components/feedback/ToastContainer";
import { MAIN_CONTENT_ID } from "./lib/constants";
import { trackPageView } from "./lib/firebase";

// ── Lazy-loaded below-the-fold components ───────────────────────────

/** Lazy-loaded donut chart component for code splitting. */
const CategoryDonut = React.lazy(
  () => import("./components/dashboard/CategoryDonut").then((m) => ({ default: m.CategoryDonut }))
);

/** Lazy-loaded heatmap component for code splitting. */
const StreakHeatmap = React.lazy(
  () => import("./components/heatmap/StreakHeatmap").then((m) => ({ default: m.StreakHeatmap }))
);

/** Lazy-loaded nudge feed component for code splitting. */
const NudgeFeed = React.lazy(
  () => import("./components/nudges/NudgeFeed").then((m) => ({ default: m.NudgeFeed }))
);

/**
 * Loading placeholder for Suspense boundaries.
 *
 * @returns Loading skeleton element
 */
function SectionSkeleton(): React.JSX.Element {
  return (
    <div
      className="glass-panel animate-pulse"
      style={{ minHeight: "200px", padding: "20px" }}
      role="status"
      aria-label="Loading section"
    >
      <div className="h-4 w-32 bg-carbon-700 rounded mb-4" />
      <div className="h-32 bg-carbon-800/50 rounded-xl" />
    </div>
  );
}

/**
 * Root application component rendering the full dashboard.
 *
 * @returns Application root element
 */
function App(): React.JSX.Element {
  const [sidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  // Track page view in Firebase Analytics
  useEffect(() => {
    trackPageView("Dashboard");
  }, []);

  return (
    <>
      <SkipLink />
      <ToastContainer />

      {/* App shell: sidebar + main */}
      <div className="flex min-h-screen">
        {/* Sidebar navigation — expanded by default */}
        <Sidebar />

        {/* Main content area — offset by sidebar width */}
        <div
          className="flex-1 flex flex-col min-h-screen transition-[margin] duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <Header />

          <main id={MAIN_CONTENT_ID} className="flex-1">
            <div className="dashboard-grid">
              {/* 1. Hero Score — full width */}
              <HeroScore />

              {/* 2. Quick Actions — PRIMARY, right below hero */}
              <ActionDock />

              {/* 3. Stats — full width, 6-column grid */}
              <StatsRow />

              {/* 4. Chart + Heatmap row — lazy loaded */}
              <Suspense fallback={<SectionSkeleton />}>
                <CategoryDonut />
              </Suspense>
              <Suspense fallback={<SectionSkeleton />}>
                <StreakHeatmap />
              </Suspense>

              {/* 5. Insights — full width at bottom — lazy loaded */}
              <Suspense fallback={<SectionSkeleton />}>
                <NudgeFeed />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
