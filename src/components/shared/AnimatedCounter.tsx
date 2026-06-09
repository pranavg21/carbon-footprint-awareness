/**
 * Animated counter component that interpolates between values.
 *
 * When the target value changes, the display smoothly counts
 * up or down to the new value. Respects prefers-reduced-motion.
 *
 * @module AnimatedCounter
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { COUNTER_ANIMATION_MS } from "../../lib/constants";
import { cn } from "../../lib/utils";

/** Props for the AnimatedCounter component. */
interface AnimatedCounterProps {
  /** Target value to display/animate to. */
  readonly value: number;
  /** Additional CSS class names. */
  readonly className?: string;
  /** Number of decimal places. */
  readonly decimals?: number;
  /** Prefix string (e.g., currency symbol). */
  readonly prefix?: string;
  /** Suffix string (e.g., unit). */
  readonly suffix?: string;
}

/**
 * Displays a number that smoothly animates when its value changes.
 *
 * @param props - Component props
 * @returns Animated counter element
 */
export function AnimatedCounter({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps): React.JSX.Element {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevValue = useRef(value);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const animate = useCallback(
    (from: number, to: number): void => {
      if (prefersReducedMotion) {
        setDisplayValue(to);
        return;
      }

      const startTime = performance.now();
      const duration = COUNTER_ANIMATION_MS;

      const step = (currentTime: number): void => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = from + (to - from) * eased;

        setDisplayValue(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(step);
    },
    [prefersReducedMotion, decimals]
  );

  useEffect(() => {
    if (prevValue.current !== value) {
      animate(prevValue.current, value);
      setIsPulsing(true);
      const timeout = setTimeout(() => {
        setIsPulsing(false);
      }, COUNTER_ANIMATION_MS);
      prevValue.current = value;
      return (): void => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [value, animate]);

  useEffect(() => {
    return (): void => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const formatted = displayValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      className={cn(
        "font-mono tabular-nums transition-transform",
        isPulsing && "animate-counter-pulse",
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
