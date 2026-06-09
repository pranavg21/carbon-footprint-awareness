/**
 * Reusable glassmorphism card wrapper.
 *
 * Provides consistent glass-panel styling, optional section title,
 * and slide-up entrance animation.
 *
 * @module GlassCard
 */

import React from "react";
import { cn } from "../../lib/utils";

/** Props for the GlassCard component. */
interface GlassCardProps {
  /** Child content to render inside the card. */
  readonly children?: React.ReactNode;
  /** Additional CSS class names. */
  readonly className?: string;
  /** Section title for the card header. */
  readonly title?: string;
}

/**
 * Glassmorphism container with optional title.
 *
 * @param props - Component props
 * @returns Glass card element
 */
export function GlassCard({
  children,
  className,
  title,
}: GlassCardProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "glass-panel p-5 sm:p-6 animate-slide-up",
        className
      )}
    >
      {title ? (
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
