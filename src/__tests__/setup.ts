/**
 * Test setup file for Vitest + React Testing Library.
 *
 * Extends expect with jest-dom matchers and provides
 * global test utilities and browser API mocks.
 *
 * @module test-setup
 */

import "@testing-library/jest-dom/vitest";

// Mock window.matchMedia for JSDOM (required by useReducedMotion)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
