/**
 * Firebase integration for the CarbonTrack platform.
 *
 * Initializes Firebase App, Firestore (cloud persistence),
 * Firebase Analytics (event tracking), and Firebase Auth
 * (Google sign-in). All Google Cloud services are consolidated here.
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
import {
  getAnalytics,
  logEvent,
  type Analytics,
} from "firebase/analytics";
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type Auth,
  type User,
} from "firebase/auth";
import { logger } from "./logger";
import type { ActionLogEntry } from "./schemas";

// ── Firebase Configuration ──────────────────────────────────────────

/**
 * Firebase project configuration.
 * Values sourced from environment variables for security.
 */
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

/** Firebase Analytics instance. */
let analytics: Analytics | null = null;

/** Firebase Auth instance. */
let auth: Auth | null = null;

/** Google Auth provider. */
const googleProvider = new GoogleAuthProvider();

if (isFirebaseConfigured) {
  try {
    const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    // Analytics only works in browser, not SSR
    if (typeof window !== "undefined") {
      analytics = getAnalytics(firebaseApp);
    }

    logger.info("Firebase initialized successfully", {
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
  logger.warn("Firebase not configured — running in offline mode", {
    component: "firebase",
  });
}

// ── Firestore Operations ────────────────────────────────────────────

/** Firestore collection name for action logs. */
const ACTIONS_COLLECTION = "action_logs" as const;

/**
 * Persists an action log entry to Firestore.
 * No-op if Firebase is not configured.
 *
 * @param entry - The action log entry to persist
 * @returns Promise that resolves when write completes
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
    logger.debug("Action persisted to Firestore", {
      component: "firebase",
      actionId: entry.id,
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
 * @param maxResults - Maximum number of results to return
 * @returns Array of action log entries from Firestore
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

// ── Analytics Operations ────────────────────────────────────────────

/**
 * Tracks an eco-action event in Firebase Analytics.
 *
 * @param actionType - The type of action logged
 * @param category - The emission category
 * @param points - Points earned
 */
export function trackActionEvent(
  actionType: string,
  category: string,
  points: number
): void {
  if (!analytics) return;

  logEvent(analytics, "eco_action_logged", {
    action_type: actionType,
    category,
    points,
  });
}

/**
 * Tracks a page view in Firebase Analytics.
 *
 * @param pageName - Name of the page viewed
 */
export function trackPageView(pageName: string): void {
  if (!analytics) return;

  logEvent(analytics, "page_view", {
    page_title: pageName,
  });
}

/**
 * Tracks a data export event in Firebase Analytics.
 */
export function trackExportEvent(): void {
  if (!analytics) return;

  logEvent(analytics, "data_exported", {
    timestamp: new Date().toISOString(),
  });
}

// ── Auth Operations ─────────────────────────────────────────────────

/**
 * Signs in the user with Google popup authentication.
 *
 * @returns The authenticated user, or null on failure
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    logger.warn("Auth not available — Firebase not configured", {
      component: "firebase",
    });
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    logger.info("User signed in via Google", {
      component: "firebase",
      uid: result.user.uid,
    });

    if (analytics) {
      logEvent(analytics, "login", { method: "google" });
    }

    return result.user;
  } catch (error: unknown) {
    logger.error("Google sign-in failed", {
      component: "firebase",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Signs out the current user.
 *
 * @returns Promise that resolves when sign-out completes
 */
export async function signOutUser(): Promise<void> {
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
}

/**
 * Subscribes to authentication state changes.
 *
 * @param callback - Function called with user or null on auth change
 * @returns Unsubscribe function
 */
export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  if (!auth) {
    callback(null);
    return (): void => {};
  }

  return onAuthStateChanged(auth, callback);
}

/** Re-export User type for consumers. */
export type { User } from "firebase/auth";
