/**
 * Firebase Authentication operations.
 *
 * Google sign-in, sign-out, and auth state subscription.
 * Extracted from firebase.ts for single responsibility.
 *
 * @module firebase-auth
 */

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type Auth,
  type User,
} from "firebase/auth";
import { logger } from "./logger";

/** Google Auth provider instance. */
const googleProvider = new GoogleAuthProvider();

/**
 * Creates auth operation functions bound to an Auth instance.
 *
 * @param auth - Firebase Auth instance (or null)
 * @param onLogin - Optional callback for login tracking
 * @returns Object with auth methods
 */
export function createAuthOperations(
  auth: Auth | null,
  onLogin?: (method: string) => void
): {
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  onAuthChange: (callback: (user: User | null) => void) => () => void;
} {
  return {
    /**
     * Signs in the user with Google popup.
     *
     * @returns The authenticated user, or null on failure
     */
    async signInWithGoogle(): Promise<User | null> {
      if (!auth) {
        logger.warn("Auth not available", { component: "firebase" });
        return null;
      }

      try {
        const result = await signInWithPopup(auth, googleProvider);
        logger.info("User signed in via Google", {
          component: "firebase",
          uid: result.user.uid,
        });
        onLogin?.("google");
        return result.user;
      } catch (error: unknown) {
        logger.error("Google sign-in failed", {
          component: "firebase",
          error: error instanceof Error ? error.message : String(error),
        });
        return null;
      }
    },

    /**
     * Signs out the current user.
     *
     * @returns Promise that resolves when sign-out completes
     */
    async signOutUser(): Promise<void> {
      if (!auth) return;

      try {
        await signOut(auth);
        logger.info("User signed out", { component: "firebase" });
      } catch (error: unknown) {
        logger.error("Sign-out failed", {
          component: "firebase",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },

    /**
     * Subscribes to authentication state changes.
     *
     * @param callback - Function called with user or null
     * @returns Unsubscribe function
     */
    onAuthChange(callback: (user: User | null) => void): () => void {
      if (!auth) {
        callback(null);
        return (): void => {};
      }
      return onAuthStateChanged(auth, callback);
    },
  };
}

/** Re-export User type for consumers. */
export type { User } from "firebase/auth";
