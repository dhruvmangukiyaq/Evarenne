import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { ToastContext, useToastState } from "./toast-context";
import type { ToastTone } from "./toast-context";

const toneStyles: Record<ToastTone, string> = {
  info: "border-ivory-dim bg-charcoal text-ivory",
  success: "border-success/40 bg-success text-white",
  error: "border-danger/40 bg-danger text-white",
};

const toneIcons: Record<ToastTone, string> = {
  info: "ⓘ",
  success: "✓",
  error: "⚠",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toast, dismiss, toasts } = useToastState();

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="pointer-events-none fixed bottom-4 left-1/2 z-(--z-toast) flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4"
        >
          {toasts.map((item) => (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 shadow-overlay ${toneStyles[item.tone]}`}
            >
              <span aria-hidden="true" className="mt-px leading-none">
                {toneIcons[item.tone]}
              </span>
              <p className="flex-1 text-sm">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="-mt-0.5 -mr-1 flex h-6 w-6 items-center justify-center text-base opacity-70 transition-opacity hover:opacity-100"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
