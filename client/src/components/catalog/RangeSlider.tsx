import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dual-handle range slider — two stacked native `input[type=range]` over a
 * shared track, so keyboard, touch, and screen readers keep working. Thumb
 * styling is done with Tailwind arbitrary variants (WebKit + Firefox).
 *
 * The thumbs move live while dragging, but the parent only hears about the
 * change on release (or per step for keyboard/assistive input), so one long
 * drag doesn't fire a URL update — and a catalog refetch — per pixel.
 */

const thumbClasses =
  "pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 " +
  "[&::-webkit-slider-thumb]:border-charcoal [&::-webkit-slider-thumb]:bg-white " +
  "[&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-[18px] " +
  "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-charcoal " +
  "[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive";

export interface DualRangeProps {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  /** Optional labels spread under the track (ordered grades). */
  ticks?: string[];
}

export function DualRange({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
  minLabel,
  maxLabel,
  ticks,
}: DualRangeProps) {
  const span = max - min || 1;
  const percent = (value: number) => `${((value - min) / span) * 100}%`;

  // Live thumb positions; the committed values reach the parent on release.
  const [draftMin, setDraftMin] = useState(valueMin);
  const [draftMax, setDraftMax] = useState(valueMax);
  // State (not a ref) so render can read it: a live drag ignores parent sync.
  const [dragging, setDragging] = useState(false);
  // Ref mirror for the window-level listeners, which must not re-subscribe
  // on every render; only handlers and effects touch it.
  const draggingRef = useRef(false);

  const draftMinRef = useRef(valueMin);
  const draftMaxRef = useRef(valueMax);
  const boundsRef = useRef({ min, max });
  const committedRef = useRef({ valueMin, valueMax });
  const handlersRef = useRef({ onMinChange, onMaxChange });
  const settleRef = useRef<() => void>(() => {});

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  // Mirror render values into refs for the window-level drag listeners.
  useEffect(() => {
    draftMinRef.current = draftMin;
    draftMaxRef.current = draftMax;
  }, [draftMin, draftMax]);

  useEffect(() => {
    boundsRef.current = { min, max };
    committedRef.current = { valueMin, valueMax };
    handlersRef.current = { onMinChange, onMaxChange };
  });

  // Follow the parent back-propagation unless a drag is in flight. React's
  // "adjust state when a prop changes" pattern: compare during render, not in
  // an effect (which the lint rules flag as a cascading render).
  const [prevValueMin, setPrevValueMin] = useState(valueMin);
  const [prevValueMax, setPrevValueMax] = useState(valueMax);
  if (!dragging) {
    if (prevValueMin !== valueMin) {
      setPrevValueMin(valueMin);
      setDraftMin(valueMin);
    }
    if (prevValueMax !== valueMax) {
      setPrevValueMax(valueMax);
      setDraftMax(valueMax);
    }
  }

  /** Commit the dragged thumbs; min stays ≤ max. One stable identity so the
   *  window listener added on pointer-down is always the one removed. */
  const settle = useCallback(() => {
    window.removeEventListener("pointerup", settleRef.current);
    window.removeEventListener("pointercancel", settleRef.current);
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const { min: lo, max: hi } = boundsRef.current;
    const clamp = (value: number) => Math.min(hi, Math.max(lo, value));
    const nextMin = clamp(Math.min(draftMinRef.current, draftMaxRef.current));
    const nextMax = clamp(Math.max(draftMinRef.current, draftMaxRef.current));
    const { valueMin: committedMin, valueMax: committedMax } = committedRef.current;
    if (nextMin !== committedMin) handlersRef.current.onMinChange(nextMin);
    if (nextMax !== committedMax) handlersRef.current.onMaxChange(nextMax);
  }, []);

  useEffect(() => {
    settleRef.current = settle;
  }, [settle]);

  const beginDrag = useCallback(() => {
    if (draggingRef.current) return;
    draggingRef.current = true;
    setDragging(true);
    window.addEventListener("pointerup", settleRef.current);
    window.addEventListener("pointercancel", settleRef.current);
  }, []);

  // Never leave a pending window listener behind on unmount.
  useEffect(
    () => () => {
      window.removeEventListener("pointerup", settleRef.current);
      window.removeEventListener("pointercancel", settleRef.current);
    },
    [],
  );

  const handleMinInput = (raw: string) => {
    const { min: lo, max: hi } = boundsRef.current;
    const value = Math.min(hi, Math.max(lo, Math.min(Number(raw), draftMaxRef.current)));
    setDraftMin(value);
    // Keyboard / assistive-tech changes carry no pointer → commit per step.
    if (!draggingRef.current) handlersRef.current.onMinChange(value);
  };
  const handleMaxInput = (raw: string) => {
    const { min: lo, max: hi } = boundsRef.current;
    const value = Math.min(hi, Math.max(lo, Math.max(Number(raw), draftMinRef.current)));
    setDraftMax(value);
    if (!draggingRef.current) handlersRef.current.onMaxChange(value);
  };

  return (
    <div>
      <div className="relative h-6 select-none">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-charcoal/80"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-(100%_-_var(--pct-max)) left-(--pct-min) h-[3px] -translate-y-1/2 rounded-full bg-olive"
          style={
            {
              "--pct-min": percent(draftMin),
              "--pct-max": percent(draftMax),
            } as React.CSSProperties
          }
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={draftMin}
          aria-label={minLabel}
          onPointerDown={beginDrag}
          onChange={(event) => handleMinInput(event.target.value)}
          onBlur={() => settleRef.current()}
          style={{ zIndex: draftMin >= draftMax ? 3 : 1 }}
          className={thumbClasses}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={draftMax}
          aria-label={maxLabel}
          onPointerDown={beginDrag}
          onChange={(event) => handleMaxInput(event.target.value)}
          onBlur={() => settleRef.current()}
          style={{ zIndex: 2 }}
          className={thumbClasses}
        />
      </div>

      {ticks && (
        <div className="mt-2 flex justify-between gap-1">
          {ticks.map((tick, index) => (
            <span
              key={`${tick}-${index}`}
              className="text-center text-xs whitespace-nowrap text-charcoal-soft"
            >
              {tick}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
