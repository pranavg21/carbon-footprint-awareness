/**
 * React Error Boundary for graceful crash recovery.
 *
 * Catches render-time exceptions in child components and
 * shows a recovery UI instead of a white screen.
 *
 * @module ErrorBoundary
 */

import React from "react";
import { logger } from "../../lib/logger";

/** Error boundary component state. */
interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/** Error boundary component props. */
interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
}

/**
 * Top-level error boundary wrapping the application.
 *
 * Logs caught errors via structured logger and displays
 * a friendly fallback UI with a reload button.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  /** @param props - Component props */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Derives state from caught errors.
   *
   * @returns Updated state with error flag
   */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  /**
   * Logs caught errors to structured logger.
   *
   * @param error - The caught error
   * @param info - React error info with component stack
   */
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("Unhandled render error", {
      component: "ErrorBoundary",
      error: error.message,
      stack: info.componentStack ?? "",
    });
  }

  /** @returns Fallback UI or children */
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-carbon-950 text-white p-8"
          role="alert"
        >
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              CarbonTrack encountered an unexpected error. Your data
              is safely stored and will be restored on reload.
            </p>
            <button
              type="button"
              onClick={(): void => { window.location.reload(); }}
              className="px-6 py-2.5 bg-eco-mint/15 text-eco-mint rounded-xl hover:bg-eco-mint/25 transition-colors text-sm font-medium"
              aria-label="Reload the application"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
