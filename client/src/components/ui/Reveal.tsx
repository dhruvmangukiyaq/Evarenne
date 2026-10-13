import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

export type RevealVariant = "up" | "soft" | "fade";

interface RevealProps {
  children: ReactNode;
  /**
   * Intrinsic element to render ("li", "section", "article", …) so reveal
   * wrappers never break list/grid semantics. React components are not
   * supported — the ref is attached directly to the rendered node.
   */
  as?: ElementType;
  /**
   * Stagger before the animation starts, in milliseconds. The reference site
   * steps these in 100ms increments from 100 up to 1000.
   */
  delay?: number;
  /** Motion style — see the `.reveal-*` notes in index.css. */
  variant?: RevealVariant;
  className?: string;
}

/**
 * Reveals its children with a fadeInUp the first time they enter the viewport.
 *
 * The element is hidden until observed, so this must never wrap content that
 * has to be readable without the animation running. Three guards cover that:
 * reveal state is dropped entirely under `prefers-reduced-motion`, an
 * environment with no IntersectionObserver renders straight to the shown
 * state, and content already scrolled past — such as a restored scroll
 * position — is shown from the observer's first report rather than left
 * invisible.
 */
export function Reveal({
  children,
  as,
  delay = 0,
  variant = "up",
  className = "",
}: RevealProps) {
  // Cast to the default tag so the shared ref/prop types stay concrete while
  // the runtime still renders whatever intrinsic element was asked for.
  const Tag = (as ?? "div") as "div";
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  // Nothing will ever report an intersection without an observer, so skip the
  // hidden state entirely rather than strand the content at opacity 0.
  const canObserve = typeof IntersectionObserver !== "undefined";

  useEffect(() => {
    if (!canObserve || shown) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Reveal on entry, or when the element is already above the viewport:
        // a restored scroll position would never intersect again.
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canObserve, shown]);

  const revealClass = canObserve
    ? `reveal reveal-${variant}${shown ? " is-visible" : ""}`
    : "";

  return (
    <Tag
      ref={ref}
      className={`${revealClass}${className ? ` ${className}` : ""}`}
      style={canObserve && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
