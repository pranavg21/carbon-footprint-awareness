/**
 * Tests for the Firebase integration module.
 *
 * Verifies graceful degradation when Firebase is not configured
 * (which is the case in test environments).
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

describe("firebase (unconfigured — graceful degradation)", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should no-op when persisting to Firestore without config", async () => {
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
  });

  it("should return empty array when fetching from Firestore without config", async () => {
    const results = await fetchRecentActions();
    expect(results).toEqual([]);
  });

  it("should no-op when tracking action events without config", () => {
    expect(() => trackActionEvent("test", "transport", 10)).not.toThrow();
  });

  it("should no-op when tracking page views without config", () => {
    expect(() => trackPageView("Dashboard")).not.toThrow();
  });

  it("should no-op when tracking export events without config", () => {
    expect(() => trackExportEvent()).not.toThrow();
  });

  it("should return null when signing in without config", async () => {
    const user = await signInWithGoogle();
    expect(user).toBeNull();
  });

  it("should no-op when signing out without config", async () => {
    await expect(signOutUser()).resolves.toBeUndefined();
  });

  it("should call callback with null when subscribing to auth changes without config", () => {
    const callback = vi.fn();
    const unsubscribe = onAuthChange(callback);

    expect(callback).toHaveBeenCalledWith(null);
    expect(typeof unsubscribe).toBe("function");

    unsubscribe();
  });
});
