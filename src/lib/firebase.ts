/**
 * Firebase integration for the CarbonTrack platform.
 *
 * Initializes Firebase App, Firestore, Analytics, and Auth.
 * Auth and analytics operations are in firebase-auth.ts and
 * firebase-analytics.ts respectively.
 *
 * @module firebase
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { logger } from "./logger";
import type { ActionLogEntry } from "./schemas";
import { createAnalyticsTracker } from "./firebase-analytics";
import { createAuthOperations, type User } from "./firebase-auth";

// Re-export User type for consumers
export type { User };

// ── Configuration ───────────────────────────────────────────────────

/** Firebase project configuration from environment variables. */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "",
} as const;

/** Whether Firebase is configured with valid credentials. */
const isFirebaseConfigured: boolean =
  firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;

// ── Initialization ──────────────────────────────────────────────────

/** Firestore database instance. */
let db: Firestore | null = null;

/** Analytics tracker (bound after init). */
let tracker = createAnalyticsTracker(null);

/** Auth operations (bound after init). */
let authOps = createAuthOperations(null);

if (isFirebaseConfigured) {
  try {
    const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);

    const auth = getAuth(firebaseApp);
    const analytics =
      typeof window !== "undefined" ? getAnalytics(firebaseApp) : null;

    tracker = createAnalyticsTracker(analytics);
    authOps = createAuthOperations(auth, (method) => {
      tracker.trackLogin(method);
    });

    logger.info("Firebase initialized", {
      component: "firebase",
      projectId: firebaseConfig.projectId,
    });
  } catch (error: unknown) {
    logger.error("Firebase initialization failed", {
      component: "firebase",
      error: error instanceof Error ? error.message : String(error),
    });
  }
} else {
  logger.warn("Firebase not configured — offline mode", {
    component: "firebase",
  });
}

// ── Firestore Operations ────────────────────────────────────────────

/** Firestore collection name for action logs. */
const ACTIONS_COLLECTION = "action_logs" as const;

/**
 * Persists an action log entry to Firestore.
 *
 * @param entry - The action log entry to persist
 */
export async function persistActionToFirestore(
  entry: ActionLogEntry
): Promise<void> {
  if (!db) return;

  try {
    await addDoc(collection(db, ACTIONS_COLLECTION), {
      ...entry,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error("Firestore write failed", {
      component: "firebase",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Fetches recent action logs from Firestore.
 *
 * @param maxResults - Maximum results to return
 * @returns Action log entries from Firestore
 */
export async function fetchRecentActions(
  maxResults: number = 50
): Promise<ReadonlyArray<Record<string, unknown>>> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, ACTIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: unknown) {
    logger.error("Firestore read failed", {
      component: "firebase",
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

// ── Re-exports (delegated to sub-modules) ───────────────────────────

/** @see {@link createAnalyticsTracker} */
export const trackActionEvent = (
  ...args: Parameters<typeof tracker.trackActionEvent>
): void => tracker.trackActionEvent(...args);

/** @see {@link createAnalyticsTracker} */
export const trackPageView = (
  ...args: Parameters<typeof tracker.trackPageView>
): void => tracker.trackPageView(...args);

/** @see {@link createAnalyticsTracker} */
export const trackExportEvent = (): void => tracker.trackExportEvent();

/** @see {@link createAuthOperations} */
export const signInWithGoogle = (): Promise<User | null> =>
  authOps.signInWithGoogle();

/** @see {@link createAuthOperations} */
export const signOutUser = (): Promise<void> => authOps.signOutUser();

/** @see {@link createAuthOperations} */
export const onAuthChange = (
  callback: (user: User | null) => void
): (() => void) => authOps.onAuthChange(callback);
