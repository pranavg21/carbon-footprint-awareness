/**
 * Custom hook to detect user's `prefers-reduced-motion` preference.
 *
 * Used to disable animations for accessibility compliance.
 * Both CSS media queries AND JavaScript animations should respect this.
 *
 * @module useReducedMotion
 */

import { useState, useEffect } from "react";

/** Media query string for reduced motion preference. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Detects whether the user prefers reduced motion.
 *
 * @returns `true` if the user prefers reduced motion, `false` otherwise
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia(REDUCED_MOTION_QUERY).matches;
    }
  );

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };
    mql.addEventListener("change", handler);
    return (): void => {
      mql.removeEventListener("change", handler);
    };
  }, []);

  return prefersReducedMotion;
}
