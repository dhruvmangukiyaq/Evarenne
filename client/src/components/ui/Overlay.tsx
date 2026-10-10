import { useId } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "../../lib/a11y";

/* ---------------- Portal ---------------- */

function Portal({ children }: { children: ReactNode }) {
  // This app is a client-only SPA (no SSR), so document.body is always available.
  return createPortal(children, document.body);
}

/* ---------------- Dialog (centered modal) ---------------- */

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const dialogSizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const containerRef = useFocusTrap(open);
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-(--z-overlay) flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-[2px]"
        />
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={`relative w-full ${dialogSizes[size]} max-h-[85vh] overflow-y-auto scroll-slim bg-ivory shadow-overlay`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-ivory-dim px-6 py-5">
            <div>
              <h2 id={titleId} className="font-display text-2xl text-ink">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-ink-soft">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center text-xl text-ink-soft transition-colors hover:text-wine"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {children && <div className="px-6 py-5">{children}</div>}
          {footer && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-ivory-dim px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ---------------- Drawer (side panel) ---------------- */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  side = "right",
  children,
  footer,
  widthClassName = "w-full max-w-md",
}: DrawerProps) {
  const titleId = useId();
  const containerRef = useFocusTrap(open);
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  if (!open) return null;

  const sideClass = side === "right" ? "right-0 shadow-drawer" : "left-0 -shadow-drawer";

  return (
    <Portal>
      <div className="fixed inset-0 z-(--z-drawer)">
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-[2px]"
        />
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`absolute top-0 bottom-0 ${sideClass} flex flex-col bg-ivory ${widthClassName}`}
        >
          <div className="flex items-center justify-between border-b border-ivory-dim px-5 py-4">
            <h2 id={titleId} className="font-display text-xl text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center text-xl text-ink-soft transition-colors hover:text-wine"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scroll-slim px-5 py-4">{children}</div>
          {footer && (
            <div className="border-t border-ivory-dim px-5 py-4 shadow-hairline">{footer}</div>
          )}
        </div>
      </div>
    </Portal>
  );
}
