import { useEffect, useRef, useState } from "react";

/**
 * Traps keyboard focus inside a container while it is open, restores focus to
 * the previously focused element on close, and moves initial focus inside.
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    // Move focus into the container (first focusable, else the container itself)
    const first = focusables()[0];
    (first ?? container).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0]!;
      const lastItem = items[items.length - 1]!;
      const activeEl = document.activeElement;
      if (event.shiftKey && (activeEl === firstItem || activeEl === container)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeEl === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [active]);

  return containerRef;
}

/** Prevents body scroll while an overlay is open. Restores prior overflow. */
export function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}

/** Calls `handler` when Escape is pressed while `active`. */
export function useEscapeKey(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handler();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, handler]);
}

/** Calls `handler` on a pointer press outside the referenced element. */
export function useClickOutside(
  active: boolean,
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [active, ref, handler]);
}

/** Stable id generator for accessible label wiring (React 18+ useId wrapper). */
export { useId } from "react";

/** Debounce a value; used for search-as-you-type without hammering the API. */
export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
