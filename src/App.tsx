/**
 * Root application component for the CarbonTrack platform.
 *
 * Layout: Sidebar (expanded by default) + main content.
 * Sidebar nav items route between Dashboard, Activity Log,
 * and Settings views. Uses React.lazy() for code-splitting.
 *
 * @module App
 */

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { Sidebar, SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED, type ViewId } from "./components/layout/Sidebar";
import { SkipLink } from "./components/layout/SkipLink";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { Header } from "./components/layout/Header";
import { HeroScore } from "./components/dashboard/HeroScore";
import { ActionDock } from "./components/actions/ActionDock";
import { StatsRow } from "./components/dashboard/StatsRow";
import { ToastContainer } from "./components/feedback/ToastContainer";
import { MAIN_CONTENT_ID } from "./lib/constants";
import { trackPageView } from "./lib/firebase";

// ── Lazy-loaded components ──────────────────────────────────────────

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

/** Lazy-loaded activity log page for code splitting. */
const ActivityLog = React.lazy(
  () => import("./components/pages/ActivityLog").then((m) => ({ default: m.ActivityLog }))
);

/** Lazy-loaded settings page for code splitting. */
const SettingsPage = React.lazy(
  () => import("./components/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

/** Lazy-loaded Gemini AI chat component for code splitting. */
const GeminiChat = React.lazy(
  () => import("./components/dashboard/GeminiChat")
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
 * Dashboard view — the main eco-tracking dashboard.
 *
 * @returns Dashboard content element
 */
function DashboardView(): React.JSX.Element {
  return (
    <div className="dashboard-grid">
      <HeroScore />
      <ActionDock />
      <StatsRow />
      <Suspense fallback={<SectionSkeleton />}>
        <GeminiChat />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CategoryDonut />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <StreakHeatmap />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <NudgeFeed />
      </Suspense>
    </div>
  );
}

/**
 * Coming Soon placeholder for unbuilt pages.
 *
 * @param props - Component props
 * @returns Placeholder element
 */
function ComingSoon({ title }: { readonly title: string }): React.JSX.Element {
  return (
    <div className="dashboard-grid">
      <div className="glass-panel flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          This feature is coming soon. Check back for updates on your eco-journey!
        </p>
      </div>
    </div>
  );
}

/**
 * Root application component with sidebar navigation.
 *
 * @returns Application root element
 */
function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [sidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  /** Handle navigation with page view tracking. */
  const handleNavigate = useCallback((view: ViewId): void => {
    setActiveView(view);
    trackPageView(view);
  }, []);

  // Track initial page view
  useEffect(() => {
    trackPageView("dashboard");
  }, []);

  /**
   * Renders the active view based on sidebar selection.
   *
   * @returns Active view element
   */
  function renderActiveView(): React.JSX.Element {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "activity":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <ActivityLog />
          </Suspense>
        );
      case "settings":
        return (
          <Suspense fallback={<SectionSkeleton />}>
            <SettingsPage />
          </Suspense>
        );
      case "achievements":
        return <ComingSoon title="Achievements" />;
      case "community":
        return <ComingSoon title="Community" />;
    }
  }

  return (
    <ErrorBoundary>
      <SkipLink />
      <ToastContainer />

      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />

        <div
          className="flex-1 flex flex-col min-h-screen transition-[margin] duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <Header />

          <main id={MAIN_CONTENT_ID} className="flex-1">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
