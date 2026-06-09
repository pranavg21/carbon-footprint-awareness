/**
 * Toast notification components.
 *
 * Renders a fixed-position toast stack with slide-in animations,
 * auto-dismiss, and accessible ARIA attributes.
 *
 * @module ToastContainer
 */

import React, { useCallback } from "react";
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { useToastStore } from "../../hooks/useToast";
import type { Toast } from "../../lib/schemas";
import { cn } from "../../lib/utils";

/** Toast variant color/icon mappings. */
const VARIANT_CONFIG: Record<
  Toast["variant"],
  {
    readonly icon: React.ReactNode;
    readonly borderColor: string;
    readonly textColor: string;
  }
> = {
  success: {
    icon: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
    borderColor: "border-l-eco-mint",
    textColor: "text-eco-mint",
  },
  info: {
    icon: <Info className="w-4 h-4" aria-hidden="true" />,
    borderColor: "border-l-eco-cyan",
    textColor: "text-eco-cyan",
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
    borderColor: "border-l-eco-amber",
    textColor: "text-eco-amber",
  },
  error: {
    icon: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
    borderColor: "border-l-eco-rose",
    textColor: "text-eco-rose",
  },
};

/** Props for individual toast item. */
interface ToastItemProps {
  /** Toast data to render. */
  readonly toast: Toast;
  /** Callback to dismiss the toast. */
  readonly onDismiss: (id: string) => void;
}

/**
 * Individual toast notification item.
 *
 * @param props - Component props
 * @returns Toast item element
 */
function ToastItem({ toast, onDismiss }: ToastItemProps): React.JSX.Element {
  const config = VARIANT_CONFIG[toast.variant];

  const handleDismiss = useCallback((): void => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "glass-panel animate-slide-in-right",
        "flex items-center gap-3 px-4 py-3 rounded-xl",
        "border-l-4",
        config.borderColor
      )}
      role="status"
      aria-live="polite"
    >
      <span className={config.textColor}>{config.icon}</span>
      <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-white transition-colors p-1 rounded"
        aria-label="Dismiss notification"
        type="button"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Fixed-position toast notification container.
 *
 * @returns Toast container element
 */
export function ToastContainer(): React.JSX.Element {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
