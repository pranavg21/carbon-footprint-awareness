/**
 * Settings page component.
 *
 * Provides user-facing controls for data management, export,
 * accessibility preferences, and Firebase authentication.
 * Each setting group is displayed in its own glass card.
 *
 * @module SettingsPage
 */

import React, { useState, useCallback } from "react";
import { Settings, Download, Trash2, Shield, Moon, Zap, LogIn, LogOut, User } from "lucide-react";
import { useCarbonStore } from "../../store/carbon-store";
import { useToastStore } from "../../hooks/useToast";
import { GlassCard } from "../shared/GlassCard";
import { signInWithGoogle, signOutUser, onAuthChange, type User as FirebaseUser } from "../../lib/firebase";
import { isGeminiLive } from "../../lib/gemini";
import { logger } from "../../lib/logger";

/**
 * Settings page with data management, auth, and preferences.
 *
 * @returns Settings page element
 */
export function SettingsPage(): React.JSX.Element {
  const resetStore = useCarbonStore((s) => s.resetStore);
  const totalScore = useCarbonStore((s) => s.totalScore);
  const actionLog = useCarbonStore((s) => s.actionLog);
  const addToast = useToastStore((s) => s.addToast);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Listen for auth state
  React.useEffect(() => {
    const unsubscribe = onAuthChange(setCurrentUser);
    return unsubscribe;
  }, []);

  /** Exports data as JSON file download. */
  const handleExport = useCallback((): void => {
    const state = useCarbonStore.getState();
    const exportData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      totalScore: state.totalScore,
      categoryBreakdown: state.categoryBreakdown,
      actionLog: state.actionLog,
      dailyLogs: state.dailyLogs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `carbontrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    addToast("📦 Data exported successfully", "success");
    logger.info("Data exported from settings", { component: "SettingsPage" });
  }, [addToast]);

  /** Handles store reset with confirmation. */
  const handleReset = useCallback((): void => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetStore();
    setConfirmReset(false);
    addToast("🔄 All data has been reset", "warning");
  }, [confirmReset, resetStore, addToast]);

  /** Handles Google sign-in. */
  const handleSignIn = useCallback((): void => {
    void signInWithGoogle().then((user) => {
      if (user) {
        addToast(`👋 Welcome, ${user.displayName ?? "User"}!`, "success");
      }
    });
  }, [addToast]);

  /** Handles sign out. */
  const handleSignOut = useCallback((): void => {
    void signOutUser().then(() => {
      addToast("👋 Signed out successfully", "info");
    });
  }, [addToast]);

  return (
    <div className="dashboard-grid">
      {/* Page header */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-eco-mint" aria-hidden="true" />
          <h2 className="text-lg font-bold text-white">Settings</h2>
        </div>
        <p className="text-sm text-slate-500">
          Manage your data, preferences, and integrations.
        </p>
      </GlassCard>

      {/* Account */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-eco-violet" aria-hidden="true" />
          Account
        </h3>

        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-eco-mint/15 flex items-center justify-center">
                  <User className="w-5 h-5 text-eco-mint" aria-hidden="true" />
                </div>
              )}
              <div>
                <p className="text-sm text-white font-medium">{currentUser.displayName ?? "User"}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="flex items-center gap-2 text-sm text-white bg-eco-mint/12 hover:bg-eco-mint/20 border border-eco-mint/25 px-4 py-2.5 rounded-xl transition-all"
            aria-label="Sign in with Google"
          >
            <LogIn className="w-4 h-4 text-eco-mint" aria-hidden="true" />
            Sign in with Google
          </button>
        )}
      </GlassCard>

      {/* Data Management */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-eco-amber" aria-hidden="true" />
          Data Management
        </h3>

        <div className="space-y-3">
          {/* Stats summary */}
          <div className="flex gap-4 text-xs text-slate-500 mb-2">
            <span>Total Score: <strong className="text-slate-300">{totalScore.toLocaleString()}</strong></span>
            <span>Actions: <strong className="text-slate-300">{actionLog.length}</strong></span>
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 w-full text-sm text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] px-4 py-3 rounded-xl transition-all"
            aria-label="Export data as JSON"
          >
            <Download className="w-4 h-4 text-eco-mint" aria-hidden="true" />
            Export data as JSON
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-2 w-full text-sm px-4 py-3 rounded-xl transition-all ${
              confirmReset
                ? "text-red-300 bg-red-500/15 border border-red-500/30"
                : "text-slate-400 bg-white/[0.02] hover:bg-red-500/10 border border-white/[0.04]"
            }`}
            aria-label={confirmReset ? "Confirm data reset" : "Reset all data"}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            {confirmReset ? "Click again to confirm reset" : "Reset all data"}
          </button>
        </div>
      </GlassCard>

      {/* Integrations Status */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-eco-lime" aria-hidden="true" />
          Integrations
        </h3>

        <div className="space-y-3">
          {/* Cloud Run */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Google Cloud Run</span>
            <span className="text-[10px] font-bold text-eco-mint bg-eco-mint/12 px-2 py-0.5 rounded-full">Active</span>
          </div>

          {/* Cloud Logging */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Cloud Logging (JSON)</span>
            <span className="text-[10px] font-bold text-eco-mint bg-eco-mint/12 px-2 py-0.5 rounded-full">Active</span>
          </div>

          {/* Firebase */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Firebase (Auth/Firestore/Analytics)</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentUser
                ? "text-eco-mint bg-eco-mint/12"
                : "text-eco-amber bg-eco-amber/12"
            }`}>
              {currentUser ? "Connected" : "Available"}
            </span>
          </div>

          {/* Gemini */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300">Google Gemini AI</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isGeminiLive()
                ? "text-eco-violet bg-eco-violet/12"
                : "text-eco-amber bg-eco-amber/12"
            }`}>
              {isGeminiLive() ? "Live" : "Demo Mode"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Accessibility */}
      <GlassCard>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-eco-sky" aria-hidden="true" />
          Accessibility
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Reduced Motion
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">Respects your system preference</p>
            </div>
            <span className="text-[10px] font-bold text-eco-mint bg-eco-mint/12 px-2 py-0.5 rounded-full">
              Auto
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-slate-300">Skip Navigation Link</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Press Tab on page load</p>
            </div>
            <span className="text-[10px] font-bold text-eco-mint bg-eco-mint/12 px-2 py-0.5 rounded-full">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-slate-300">Keyboard Navigation</span>
              <p className="text-[11px] text-slate-500 mt-0.5">All interactive elements are focusable</p>
            </div>
            <span className="text-[10px] font-bold text-eco-mint bg-eco-mint/12 px-2 py-0.5 rounded-full">
              Enabled
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
