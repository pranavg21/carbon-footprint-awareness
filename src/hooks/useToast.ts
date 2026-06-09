/**
 * Custom hook for managing toast notifications.
 *
 * Provides functions to add and dismiss toast notifications with
 * auto-dismiss timing. Used globally via the ToastContainer component.
 *
 * @module useToast
 */

import { create } from "zustand";
import type { Toast } from "../lib/schemas";
import { TOAST_DURATION_MS, MAX_VISIBLE_TOASTS } from "../lib/constants";
import { generateId } from "../lib/utils";

/** Toast store state shape. */
interface ToastState {
  /** Array of active toast notifications. */
  readonly toasts: ReadonlyArray<Toast>;
}

/** Toast store actions. */
interface ToastActions {
  /**
   * Adds a new toast notification.
   *
   * @param message - Toast message content
   * @param variant - Visual style variant
   */
  readonly addToast: (message: string, variant?: Toast["variant"]) => void;

  /**
   * Removes a toast by its ID.
   *
   * @param id - Toast identifier to remove
   */
  readonly removeToast: (id: string) => void;
}

/** Combined toast store type. */
type ToastStore = ToastState & ToastActions;

/**
 * Zustand store for toast notification management.
 * Separate from carbon store to keep concerns isolated.
 */
export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  addToast: (message: string, variant: Toast["variant"] = "success"): void => {
    const id = generateId();
    const toast: Toast = {
      id,
      message,
      variant,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast].slice(-MAX_VISIBLE_TOASTS),
    }));

    // Auto-dismiss after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_DURATION_MS);
  },

  removeToast: (id: string): void => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
