/**
 * Integration status display for the settings page.
 *
 * Shows the status of Google Cloud Run, Cloud Logging,
 * Firebase, and Gemini AI integrations.
 *
 * @module IntegrationStatus
 */

import React from "react";
import { Zap } from "lucide-react";
import { GlassCard } from "../shared/GlassCard";
import { isGeminiLive } from "../../lib/gemini";

/** Props for the IntegrationStatus component. */
interface IntegrationStatusProps {
  /** Whether a user is currently authenticated. */
  readonly isAuthenticated: boolean;
}

/**
 * Status badge component for integration rows.
 *
 * @param props - Badge label and color variant
 * @returns Badge element
 */
function StatusBadge({ label, variant }: {
  readonly label: string;
  readonly variant: "mint" | "amber" | "violet";
}): React.JSX.Element {
  const colorMap = {
    mint: "text-eco-mint bg-eco-mint/12",
    amber: "text-eco-amber bg-eco-amber/12",
    violet: "text-eco-violet bg-eco-violet/12",
  } as const;

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorMap[variant]}`}>
      {label}
    </span>
  );
}

/**
 * Displays the status of all integrations.
 *
 * @param props - Component props
 * @returns Integration status card
 */
export function IntegrationStatus({
  isAuthenticated,
}: IntegrationStatusProps): React.JSX.Element {
  return (
    <GlassCard>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-eco-lime" aria-hidden="true" />
        Integrations
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Google Cloud Run</span>
          <StatusBadge label="Active" variant="mint" />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Cloud Logging (JSON)</span>
          <StatusBadge label="Active" variant="mint" />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Firebase (Auth/Firestore/Analytics)</span>
          <StatusBadge
            label={isAuthenticated ? "Connected" : "Available"}
            variant={isAuthenticated ? "mint" : "amber"}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-300">Google Gemini AI</span>
          <StatusBadge
            label={isGeminiLive() ? "Live" : "Demo Mode"}
            variant={isGeminiLive() ? "violet" : "amber"}
          />
        </div>
      </div>
    </GlassCard>
  );
}
