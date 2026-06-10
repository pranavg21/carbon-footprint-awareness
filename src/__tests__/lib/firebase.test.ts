/**
 * Tests for the Firebase integration module.
 *
 * Verifies all Firebase operations work without throwing,
 * regardless of whether Firebase is configured or not.
 * Tests are environment-agnostic — they pass both locally
 * (with .env) and in CI (without .env).
 *
 * @module firebase.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  persistActionToFirestore,
  fetchRecentActions,
  trackActionEvent,
  trackPageView,
  trackExportEvent,
  signInWithGoogle,
  signOutUser,
  onAuthChange,
} from "../../lib/firebase";

describe("firebase integration", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not throw when persisting an action to Firestore", async () => {
    await expect(
      persistActionToFirestore({
        id: "test-id",
        timestamp: new Date().toISOString(),
        category: "transport",
        actionType: "public-transit",
        points: 20,
        description: "Test action",
      })
    ).resolves.toBeUndefined();
  }, 15_000);

  it("should return an array when fetching recent actions", async () => {
    const results = await fetchRecentActions();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should not throw when tracking action events", () => {
    expect(() => trackActionEvent("test", "transport", 10)).not.toThrow();
  });

  it("should not throw when tracking page views", () => {
    expect(() => trackPageView("Dashboard")).not.toThrow();
  });

  it("should not throw when tracking export events", () => {
    expect(() => trackExportEvent()).not.toThrow();
  });

  it("should not throw when signing in with Google", async () => {
    // signInWithGoogle may return null (unconfigured) or throw popup error (no browser)
    // Either way it should not crash the app
    const user = await signInWithGoogle();
    expect(user === null || typeof user === "object").toBe(true);
  });

  it("should not throw when signing out", async () => {
    await expect(signOutUser()).resolves.toBeUndefined();
  });

  it("should return an unsubscribe function from onAuthChange", () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });
});
