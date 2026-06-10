/**
 * Sidebar navigation component with collapsible layout.
 *
 * Renders nav items, user profile badge, and collapse toggle.
 * Navigation is controlled via `activeView` + `onNavigate` props
 * from the parent App component.
 *
 * @module Sidebar
 */

import React, { useState } from "react";
import { Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useCarbonStore } from "../../store/carbon-store";
import {
  NAV_ITEMS, WIDTH_EXPANDED, WIDTH_COLLAPSED,
  getEcoLevel, type ViewId,
} from "./sidebar-config";

/** Props for the Sidebar component. */
interface SidebarProps {
  /** Currently active navigation view. */
  readonly activeView: ViewId;
  /** Callback when user clicks a nav item. */
  readonly onNavigate: (view: ViewId) => void;
}

/**
 * Sidebar navigation with working nav item clicks.
 *
 * @param props - Component props
 * @returns Sidebar element
 */
export function Sidebar({ activeView, onNavigate }: SidebarProps): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(false);
  const totalScore = useCarbonStore((s) => s.totalScore);

  const width = collapsed ? WIDTH_COLLAPSED : WIDTH_EXPANDED;

  return (
    <aside
      className="sidebar fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        width,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "rgba(5, 10, 21, 0.95)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(52, 211, 153, 0.06)",
      }}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eco-mint to-eco-lime flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4.5 h-4.5 text-carbon-950" aria-hidden="true" />
        </div>
        <span
          className={cn(
            "text-sm font-bold text-white whitespace-nowrap transition-opacity duration-200",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          CarbonTrack
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-2.5 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              onClick={(): void => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                "text-left w-full",
                collapsed ? "px-2.5 py-2.5 justify-center" : "py-2.5",
                isActive
                  ? "bg-eco-mint/12 text-eco-mint px-3"
                  : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] px-4 opacity-70 hover:opacity-100"
              )}
              aria-current={isActive ? "page" : undefined}
              type="button"
              aria-label={item.label}
            >
              {/* Active indicator bar */}
              {isActive ? (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-eco-mint"
                  style={{ boxShadow: "0 0 10px rgba(52, 211, 153, 0.5)" }}
                />
              ) : null}

              <span className="flex-shrink-0">{item.icon}</span>

              {/* Label — always visible when expanded */}
              <span
                className={cn(
                  "text-[13px] font-medium whitespace-nowrap transition-all duration-200",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"
                )}
              >
                {item.label}
              </span>

              {/* Badge */}
              {item.badge && !collapsed ? (
                <span className="text-[10px] font-bold bg-eco-amber/15 text-eco-amber px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}

              {/* Badge dot (collapsed) */}
              {item.badge && collapsed ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-eco-amber rounded-full" />
              ) : null}

              {/* Tooltip for collapsed state */}
              {collapsed ? (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-carbon-800 border border-carbon-700 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg z-50">
                  {item.label}
                </div>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Simulated User Profile card */}
      <div className="px-3.5 py-4 border-t border-white/[0.04] mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-eco-cyan to-eco-mint flex items-center justify-center text-[11px] font-black text-carbon-950 flex-shrink-0">
            PG
          </div>
          <div
            className={cn(
              "flex flex-col min-w-0 transition-opacity duration-200",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 flex-1"
            )}
          >
            <span className="text-xs font-bold text-white truncate">
              Pranav Ghadge
            </span>
            <span className="text-[10px] text-eco-mint font-semibold truncate">
              {getEcoLevel(totalScore)}
            </span>
          </div>
        </div>
      </div>

      {/* Collapse toggle at bottom */}
      <div className="px-2.5 pb-4">
        <button
          onClick={(): void => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[12px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/** Returns the current sidebar width for layout offset. */
export const SIDEBAR_WIDTH_EXPANDED = WIDTH_EXPANDED;
export const SIDEBAR_WIDTH_COLLAPSED = WIDTH_COLLAPSED;
export type { ViewId };
