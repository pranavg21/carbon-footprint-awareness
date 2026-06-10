/**
 * Utility to register the application Service Worker.
 *
 * Enables offline PWA capabilities when running in production.
 *
 * @module registerServiceWorker
 */

import { logger } from "./logger";

/**
 * Registers the service worker if supported by the browser.
 *
 * @returns void
 */
export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", (): void => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration): void => {
          logger.info("ServiceWorker registered successfully", {
            component: "registerServiceWorker",
            scope: registration.scope,
          });
        })
        .catch((error: unknown): void => {
          logger.error("ServiceWorker registration failed", {
            component: "registerServiceWorker",
            error: error instanceof Error ? error.message : String(error),
          });
        });
    });
  }
}
