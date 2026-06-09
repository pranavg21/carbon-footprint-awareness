/**
 * Accessibility skip link component for keyboard navigation.
 *
 * Renders a hidden link that becomes visible on focus,
 * allowing keyboard users to skip directly to main content.
 *
 * @module SkipLink
 */

import React from "react";
import { MAIN_CONTENT_ID, SKIP_LINK_ID } from "../../lib/constants";

/**
 * Skip link that becomes visible when focused via keyboard.
 *
 * @returns Skip link element
 */
export function SkipLink(): React.JSX.Element {
  return (
    <a
      id={SKIP_LINK_ID}
      href={`#${MAIN_CONTENT_ID}`}
      className="skip-link"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
