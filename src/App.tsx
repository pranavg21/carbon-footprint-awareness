/**
 * Root application component for the CarbonTrack platform.
 *
 * Layout: Sidebar (expanded by default) + main content.
 * Action buttons are promoted to primary position right below
 * the hero score. Stats span full width. No empty voids.
 *
 * @module App
 */

import React, { useState } from "react";
import { Sidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED } from "./components/layout/Sidebar";
import { SkipLink } from "./components/layout/SkipLink";
import { Header } from "./components/layout/Header";
import { HeroScore } from "./components/dashboard/HeroScore";
import { CategoryDonut } from "./components/dashboard/CategoryDonut";
import { StatsRow } from "./components/dashboard/StatsRow";
import { ActionDock } from "./components/actions/ActionDock";
import { StreakHeatmap } from "./components/heatmap/StreakHeatmap";
import { NudgeFeed } from "./components/nudges/NudgeFeed";
import { ToastContainer } from "./components/feedback/ToastContainer";
import { MAIN_CONTENT_ID } from "./lib/constants";

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

              {/* 4. Chart + Heatmap row */}
              <CategoryDonut />
              <StreakHeatmap />

              {/* 5. Insights — full width at bottom */}
              <NudgeFeed />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;
