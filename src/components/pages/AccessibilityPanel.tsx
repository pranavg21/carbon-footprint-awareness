/**
 * Accessibility settings display panel.
 *
 * Shows current a11y feature status (reduced motion,
 * skip nav, keyboard navigation).
 *
 * @module AccessibilityPanel
 */

import React from "react";
import { Shield, Moon } from "lucide-react";
import { GlassCard } from "../shared/GlassCard";

/**
 * Accessibility settings panel.
 *
 * @returns Panel element
 */
export function AccessibilityPanel(): React.JSX.Element {
  return (
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
  );
}
