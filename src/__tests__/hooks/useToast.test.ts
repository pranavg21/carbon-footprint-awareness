/**
 * Tests for the useToast hook/store.
 *
 * @module useToast.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useToastStore } from "../../hooks/useToast";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.getState().toasts.forEach((t) => {
      useToastStore.getState().removeToast(t.id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start with no toasts", () => {
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(0);
  });

  it("should add a toast with addToast", () => {
    const { addToast } = useToastStore.getState();
    addToast("Test message", "success");

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Test message");
    expect(toasts[0]?.variant).toBe("success");
  });

  it("should remove a toast by id", () => {
    const { addToast } = useToastStore.getState();
    addToast("First", "info");
    addToast("Second", "warning");

    const toastId = useToastStore.getState().toasts[0]?.id ?? "";
    useToastStore.getState().removeToast(toastId);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Second");
  });

  it("should support all toast variants and cap at max visible", () => {
    const { addToast } = useToastStore.getState();
    addToast("Success", "success");
    addToast("Info", "info");
    addToast("Warning", "warning");
    addToast("Error", "error");

    const { toasts } = useToastStore.getState();
    // MAX_VISIBLE_TOASTS = 3, so the oldest toast is dropped
    expect(toasts).toHaveLength(3);
    expect(toasts.map((t) => t.variant)).toEqual([
      "info", "warning", "error",
    ]);
  });

  it("should generate unique ids for each toast", () => {
    const { addToast } = useToastStore.getState();
    addToast("A", "info");
    addToast("B", "info");

    const { toasts } = useToastStore.getState();
    expect(toasts[0]?.id).not.toBe(toasts[1]?.id);
  });

  it("should include createdAt timestamp", () => {
    const { addToast } = useToastStore.getState();
    addToast("Timestamped", "success");

    const { toasts } = useToastStore.getState();
    expect(toasts[0]?.createdAt).toBeTypeOf("number");
    expect(toasts[0]?.createdAt).toBeGreaterThan(0);
  });
});
