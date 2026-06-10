/** Primary action dock for quick eco-action logging and custom logs. @module ActionDock */

import React, { useState, useCallback } from "react";
import { useCarbonStore } from "../../store/carbon-store";
import { useToastStore } from "../../hooks/useToast";
import { QUICK_ACTIONS, type QuickActionKey, type EmissionCategory } from "../../lib/constants";
import { emissionCategorySchema } from "../../lib/schemas";
import { sanitizeInput } from "../../lib/sanitize";
import { z } from "zod";
import { ACTION_ICONS, ACTION_STYLES, ACTION_KEYS } from "./action-styles";

/** Schema for validating custom eco-actions. */
const customActionSchema = z.object({
  category: z.enum(["transport", "diet", "home", "shopping"]),
  points: z.number().int().min(1, "Min 1").max(100, "Max 100"),
  description: z.string().min(3, "Min 3 chars").max(50, "Max 50 chars"),
});

/**
 * Inline action dock — primary interaction surface for logging.
 *
 * @returns Action dock element
 */
export function ActionDock(): React.JSX.Element {
  const logAction = useCarbonStore((s) => s.logAction);
  const logCustomAction = useCarbonStore((s) => s.logCustomAction);
  const addToast = useToastStore((s) => s.addToast);

  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [category, setCategory] = useState<EmissionCategory>("transport");
  const [points, setPoints] = useState(10);
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  /** Logs a quick action and shows toast. */
  const handleAction = useCallback(
    (key: QuickActionKey): void => {
      logAction(key);
      const action = QUICK_ACTIONS[key];
      addToast(`${action.emoji} ${action.label} logged! +${action.points} pts`, "success");
    },
    [logAction, addToast]
  );

  /** Handles custom form submission with Zod validation. */
  const handleCustomSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      setValidationError("");

      const sanitized = sanitizeInput(description);
      const result = customActionSchema.safeParse({
        category,
        points,
        description: sanitized,
      });

      if (!result.success) {
        setValidationError(result.error.issues[0]?.message ?? "Invalid");
        return;
      }

      logCustomAction(category, points, sanitized);
      addToast(`🌱 "${sanitized}" logged! +${points} pts`, "success");
      setDescription("");
      setPoints(10);
      setIsCustomOpen(false);
    },
    [category, points, description, logCustomAction, addToast]
  );

  /** Toggles between quick actions and custom form. */
  const handleToggle = useCallback((): void => {
    setIsCustomOpen((prev) => !prev);
    setValidationError("");
  }, []);

  /** Closes custom form and clears errors. */
  const handleCancel = useCallback((): void => {
    setIsCustomOpen(false);
    setValidationError("");
  }, []);

  /** Handles category change with Zod validation. */
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      const parsed = emissionCategorySchema.safeParse(e.target.value);
      if (parsed.success) {
        setCategory(parsed.data);
      }
    },
    []
  );

  return (
    <nav className="action-dock-inline" aria-label="Action logger">
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Log Activity
          </h2>
          <button
            onClick={handleToggle}
            className="text-xs font-bold text-eco-mint hover:underline bg-transparent border-0 cursor-pointer outline-none focus:ring-1 focus:ring-eco-mint rounded px-1.5 py-0.5"
            type="button"
            aria-expanded={isCustomOpen}
            aria-label={isCustomOpen ? "Switch to quick action logging" : "Switch to custom action logging"}
          >
            {isCustomOpen ? "Quick Actions" : "Log Custom Action"}
          </button>
        </div>

        {isCustomOpen ? (
          <form onSubmit={handleCustomSubmit} className="flex flex-col gap-4 animate-slide-up">
            {validationError ? (
              <p className="text-xs text-eco-rose font-semibold bg-eco-rose/10 p-2.5 rounded-xl border border-eco-rose/25" role="alert">
                ⚠️ {validationError}
              </p>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="custom-category" className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Category
                </label>
                <select
                  id="custom-category"
                  value={category}
                  onChange={handleCategoryChange}
                  className="bg-carbon-900 border border-glass-border rounded-xl text-xs text-white p-2.5 outline-none focus:border-eco-mint focus:ring-1 focus:ring-eco-mint transition-all"
                >
                  <option value="transport">Transport</option>
                  <option value="diet">Diet</option>
                  <option value="home">Home Energy</option>
                  <option value="shopping">Shopping</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="custom-desc" className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Description
                </label>
                <input
                  id="custom-desc"
                  type="text"
                  placeholder="e.g., Composted household waste"
                  value={description}
                  onChange={(e): void => setDescription(e.target.value)}
                  className="bg-carbon-900 border border-glass-border rounded-xl text-xs text-white p-2.5 outline-none focus:border-eco-mint focus:ring-1 focus:ring-eco-mint transition-all"
                />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 mt-1">
              <div className="flex flex-col gap-1.5 w-32">
                <label htmlFor="custom-points" className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Impact Points
                </label>
                <input
                  id="custom-points"
                  type="number"
                  min="1"
                  max="100"
                  value={points}
                  onChange={(e): void => setPoints(parseInt(e.target.value) || 0)}
                  className="bg-carbon-900 border border-glass-border rounded-xl text-xs text-white p-2.5 outline-none focus:border-eco-mint focus:ring-1 focus:ring-eco-mint transition-all"
                />
              </div>
              <div className="flex gap-2.5">
                <button type="button" onClick={handleCancel} className="px-4 py-2.5 border border-glass-border rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-eco-mint to-eco-lime rounded-xl text-xs text-carbon-950 font-bold hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-eco-mint">
                  Log Action
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTION_KEYS.map((key) => {
              const action = QUICK_ACTIONS[key];
              const style = ACTION_STYLES[key];
              return (
                <button
                  key={key}
                  onClick={(): void => handleAction(key)}
                  className="action-dock-btn group flex items-center justify-center gap-3 rounded-2xl border transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: style.bg, borderColor: `${style.text}20`, padding: "14px 16px", minHeight: "60px" }}
                  onMouseEnter={(e): void => { const el = e.currentTarget; el.style.backgroundColor = style.hoverBg; el.style.borderColor = `${style.text}40`; el.style.boxShadow = style.glow; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e): void => { const el = e.currentTarget; el.style.backgroundColor = style.bg; el.style.borderColor = `${style.text}20`; el.style.boxShadow = "none"; el.style.transform = "translateY(0)"; }}
                  onMouseDown={(e): void => { e.currentTarget.style.transform = "scale(0.96)"; }}
                  onMouseUp={(e): void => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  aria-label={`Log ${action.label}: earns ${action.points} points`}
                  type="button"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: `${style.text}18`, color: style.text }}>
                    {ACTION_ICONS[key]}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-sm font-semibold leading-tight block truncate" style={{ color: style.text }}>{action.label}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: `${style.text}90` }}>+{action.points} pts</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
