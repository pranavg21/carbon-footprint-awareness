/**
 * Firebase Analytics event tracking.
 *
 * Wraps Firebase Analytics logEvent calls with null checks
 * so callers don't need to worry about whether Analytics
 * is initialized.
 *
 * @module firebase-analytics
 */

import { logEvent, type Analytics } from "firebase/analytics";

/**
 * Creates analytics tracking functions bound to an Analytics instance.
 *
 * @param analytics - Firebase Analytics instance (or null)
 * @returns Object with tracking methods
 */
export function createAnalyticsTracker(analytics: Analytics | null): {
  trackActionEvent: (actionType: string, category: string, points: number) => void;
  trackPageView: (pageName: string) => void;
  trackExportEvent: () => void;
  trackLogin: (method: string) => void;
} {
  return {
    /**
     * Tracks an eco-action event.
     *
     * @param actionType - The type of action logged
     * @param category - The emission category
     * @param points - Points earned
     */
    trackActionEvent(actionType: string, category: string, points: number): void {
      if (!analytics) return;
      logEvent(analytics, "eco_action_logged", {
        action_type: actionType,
        category,
        points,
      });
    },

    /**
     * Tracks a page view.
     *
     * @param pageName - Name of the page viewed
     */
    trackPageView(pageName: string): void {
      if (!analytics) return;
      logEvent(analytics, "page_view", { page_title: pageName });
    },

    /** Tracks a data export event. */
    trackExportEvent(): void {
      if (!analytics) return;
      logEvent(analytics, "data_exported", {
        timestamp: new Date().toISOString(),
      });
    },

    /**
     * Tracks a login event.
     *
     * @param method - Authentication method used
     */
    trackLogin(method: string): void {
      if (!analytics) return;
      logEvent(analytics, "login", { method });
    },
  };
}
