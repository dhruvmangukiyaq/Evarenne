import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { DualRange } from "./RangeSlider";

/**
 * Horizontal filter toolbar — a wrapping row of content-sized pills spread
 * across the sheet, each showing a dropdown panel. Mirrors the reference
 * storefront's diamond filter bar: uppercase pills with a solid caret, hover
 * previews the panel, a click pins it until you click away, press Escape, or
 * pick another pill.
 *
 * Panels come in three shapes, matching the reference one-for-one:
 * - "check" → icon/checkbox list (shape),
 * - "scale" → dual-handle slider over an ordered grade scale with tick
 *   labels (colour, clarity, polish, symmetry, fluorescence, cut),
 * - "range" → dual-handle slider over a numeric span (carat).
 *
 * The panel is `position: fixed`, measured from its own pill and clamped to
 * the viewport, so it never pushes a horizontal scrollbar on small screens.
 * It is portaled to `document.body`, because the page's scroll-reveal wrapper
 * carries a CSS transform that would otherwise make `fixed` position relative
 * to that wrapper instead of the viewport (the panel would drift off its pill).
 */

/** One selectable value inside a dropdown filter. */
export interface FilterOption {
  value: string;
  /** Display label; falls back to the raw value. */
  label?: string;
  /** Facet count for the current scope (omitted when unknown). */
  count?: number;
  /** Optional leading glyph (shape filters render their cut outline). */
  icon?: ReactNode;
}

/** Checkbox-style filter (shape). */
export interface CheckFilter {
  kind: "check";
  key: string;
  label: string;
  selected: string[];
  options: FilterOption[];
}

/** Ordered-grade slider filter (colour, clarity, cut, …). */
export interface ScaleFilter {
  kind: "scale";
  key: string;
  label: string;
  /** Ordered low → high grade values; the slider snaps to these stops. */
  grades: string[];
  /** Inclusive index of the lowest selected grade. */
  minIdx: number;
  /** Inclusive index of the highest selected grade. */
  maxIdx: number;
  onRangeChange: (minIdx: number, maxIdx: number) => void;
}

/** Numeric slider filter (carat). */
export interface RangeFilter {
  kind: "range";
  key: string;
  label: string;
  /** Current URL value as a string (in the unit the slider speaks). */
  min: string | undefined;
  max: string | undefined;
  /** Slider bounds, step, and pre-formatted tick labels. */
  slider: {
    min: number;
    max: number;
    step: number;
    ticks: string[];
  };
  minLabel: string;
  maxLabel: string;
  /** Formats one value for the panel header summary (e.g. "$2,850"). */
  format: (value: number) => string;
  onMinChange: (value: string | null) => void;
  onMaxChange: (value: string | null) => void;
}

export type FilterSpec = CheckFilter | ScaleFilter | RangeFilter;

interface FilterBarProps {
  /** Pills render in exactly this order. */
  filters: FilterSpec[];
  /** Toggle one checkbox value inside the filter identified by `key`. */
  onToggle: (key: string, value: string) => void;
  /** Remove every value of the filter identified by `key`. */
  onClear: (key: string) => void;
}

interface PanelPos {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

interface OpenPanel {
  key: string;
  pos: PanelPos;
  /**
   * "hover" previews the panel and closes it once the pointer leaves;
   * "click" pins it until an outside click, Escape, or another pill.
   */
  by: "hover" | "click";
}

/** Slider panels are wider than the checkbox list, like the reference bar. */
function panelWidthFor(filter: FilterSpec): number {
  if (filter.kind === "scale") return 480;
  if (filter.kind === "range") return 400;
  return 320;
}

/** Viewport-clamped position for the panel hanging off a pill. */
function measurePanel(button: HTMLButtonElement, width: number): PanelPos {
  const rect = button.getBoundingClientRect();
  const clampedWidth = Math.min(width, window.innerWidth - 16);
  const left = Math.min(
    Math.max(rect.left, 8),
    Math.max(8, window.innerWidth - clampedWidth - 8),
  );
  const top = rect.bottom + 8;
  return {
    top,
    left,
    width: clampedWidth,
    maxHeight: Math.max(180, window.innerHeight - top - 12),
  };
}

/** How many values a pill is currently holding (drives its active state). */
function selectedCount(filter: FilterSpec): number {
  if (filter.kind === "check") return filter.selected.length;
  if (filter.kind === "scale") {
    return filter.minIdx > 0 || filter.maxIdx < filter.grades.length - 1 ? 1 : 0;
  }
  return (filter.min ? 1 : 0) + (filter.max ? 1 : 0);
}

/** Short "FL – VS2" style summary shown in the panel header when narrowed. */
function activeSummary(filter: FilterSpec): string | null {
  if (filter.kind === "scale") {
    if (filter.minIdx === 0 && filter.maxIdx === filter.grades.length - 1) return null;
    return `${filter.grades[filter.minIdx]} – ${filter.grades[filter.maxIdx]}`;
  }
  if (filter.kind === "range") {
    const lo = filter.min !== undefined ? Number(filter.min) : undefined;
    const hi = filter.max !== undefined ? Number(filter.max) : undefined;
    if (lo === undefined && hi === undefined) return null;
    if (lo !== undefined && hi !== undefined) {
      return lo === hi ? filter.format(lo) : `${filter.format(lo)} – ${filter.format(hi)}`;
    }
    return lo !== undefined ? `≥ ${filter.format(lo)}` : `≤ ${filter.format(hi!)}`;
  }
  return null;
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 10 6"
      aria-hidden="true"
      focusable="false"
      className={`h-1.5 w-2.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="currentColor"
    >
      <path d="M0 0h10L5 6z" />
    </svg>
  );
}

function CheckRow({
  option,
  checked,
  onToggle,
}: {
  option: FilterOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-charcoal hover:text-olive">
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-olive" />
      {option.icon}
      <span className="flex-1">{option.label ?? option.value}</span>
      {option.count !== undefined && (
        <span className="text-xs text-charcoal-faint tabular-nums">{option.count}</span>
      )}
    </label>
  );
}

function RangeFields({ filter }: { filter: RangeFilter }) {
  const clamp = (value: number) =>
    Math.min(filter.slider.max, Math.max(filter.slider.min, value));
  const lo = clamp(filter.min !== undefined ? Number(filter.min) : filter.slider.min);
  const hi = clamp(filter.max !== undefined ? Number(filter.max) : filter.slider.max);
  return (
    <DualRange
      min={filter.slider.min}
      max={filter.slider.max}
      step={filter.slider.step}
      valueMin={lo}
      valueMax={hi}
      onMinChange={(value) => filter.onMinChange(String(value))}
      onMaxChange={(value) => filter.onMaxChange(String(value))}
      minLabel={filter.minLabel}
      maxLabel={filter.maxLabel}
      ticks={filter.slider.ticks}
    />
  );
}

function ScaleFields({ filter }: { filter: ScaleFilter }) {
  return (
    <DualRange
      min={0}
      max={filter.grades.length - 1}
      valueMin={filter.minIdx}
      valueMax={filter.maxIdx}
      onMinChange={(value) => filter.onRangeChange(value, Math.max(value, filter.maxIdx))}
      onMaxChange={(value) => filter.onRangeChange(Math.min(value, filter.minIdx), value)}
      minLabel={`${filter.label}: ${filter.grades[0]}`}
      maxLabel={`${filter.label}: ${filter.grades[filter.grades.length - 1]}`}
      ticks={filter.grades}
    />
  );
}

export function FilterBar({ filters, onToggle, onClear }: FilterBarProps) {
  const [open, setOpen] = useState<OpenPanel | null>(null);
  const openKey = open?.key ?? null;
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRef = useRef<HTMLDivElement | null>(null);

  const openFilter = filters.find((filter) => filter.key === openKey) ?? null;
  const openCount = openFilter ? selectedCount(openFilter) : 0;
  const openSummary = openFilter ? activeSummary(openFilter) : null;

  const closeTimer = useRef<number | null>(null);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimer.current === null) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  // Never leave a pending timer behind on unmount.
  useEffect(() => cancelScheduledClose, [cancelScheduledClose]);

  /** Hover preview: open this pill's panel, keeping the pinned state if it is already showing. */
  const showOnHover = (filter: FilterSpec, button: HTMLButtonElement | null | undefined) => {
    if (!button) return;
    cancelScheduledClose();
    const pos = measurePanel(button, panelWidthFor(filter));
    setOpen((prev) => ({ key: filter.key, pos, by: prev?.key === filter.key ? prev.by : "hover" }));
  };

  /** Pointer left the pill: close shortly after, unless it ducked into the panel. */
  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen((prev) => (prev && prev.by === "click" ? prev : null));
    }, 180);
  };

  // Keep the panel glued to its pill while the page scrolls or resizes.
  useEffect(() => {
    if (!openKey) return;
    const button = buttonRefs.current.get(openKey);
    if (!button) return;
    const filter = filters.find((candidate) => candidate.key === openKey);
    const width = filter ? panelWidthFor(filter) : 320;
    const place = () =>
      setOpen((prev) => (prev ? { ...prev, pos: measurePanel(button, width) } : prev));
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [openKey, filters]);

  // Click-away and Escape close the panel; Escape returns focus to the pill.
  useEffect(() => {
    if (!openKey) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (buttonRefs.current.get(openKey)?.contains(target)) return;
      setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const button = buttonRefs.current.get(openKey);
      setOpen(null);
      button?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey]);

  return (
    <div
      className="flex flex-wrap justify-between gap-x-4 gap-y-3"
      role="group"
      aria-label="Filter diamonds"
    >
      {filters.map((filter) => {
        const key = filter.key;
        const isOpen = openKey === key;
        const isActive = selectedCount(filter) > 0;
        return (
          <div
            key={key}
            className="relative"
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse") return;
              showOnHover(filter, buttonRefs.current.get(key));
            }}
            onPointerLeave={(event) => {
              if (event.pointerType !== "mouse") return;
              scheduleClose();
            }}
          >
            <button
              type="button"
              ref={(node) => {
                if (node) buttonRefs.current.set(key, node);
                else buttonRefs.current.delete(key);
              }}
              onClick={(event) => {
                // Capture now: `currentTarget` is nulled by the time React
                // runs the lazy state updater.
                const button = event.currentTarget;
                cancelScheduledClose();
                setOpen((prev) => {
                  if (prev?.key === key) {
                    // A hover preview pins on click; a pinned panel closes.
                    return prev.by === "hover" ? { ...prev, by: "click" } : null;
                  }
                  return { key, pos: measurePanel(button, panelWidthFor(filter)), by: "click" };
                });
              }}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={`flex h-10 items-center gap-2 rounded-[4px] border px-4 font-sans text-xs font-medium tracking-[0.09em] whitespace-nowrap uppercase transition-colors ${
                isActive || isOpen
                  ? "border-olive bg-olive text-ivory hover:bg-olive-hover hover:text-ivory"
                  : "border-charcoal/25 bg-white text-charcoal hover:border-olive hover:text-olive"
              }`}
            >
              <span>{filter.label}</span>
              <Caret open={isOpen} />
            </button>

            {isOpen &&
              open &&
              openFilter &&
              createPortal(
                <div
                  ref={panelRef}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    cancelScheduledClose();
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== "mouse") return;
                    scheduleClose();
                  }}
                  style={{
                    top: open.pos.top,
                    left: open.pos.left,
                    width: open.pos.width,
                    maxHeight: open.pos.maxHeight,
                  }}
                  className="fixed z-50 overflow-y-auto scroll-slim rounded-[4px] border border-ivory-dim bg-white p-5 shadow-card"
                >
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-ivory-dim pb-2.5">
                    <span className="text-xs font-medium tracking-[0.14em] uppercase text-charcoal">
                      {openFilter.label}
                    </span>
                    <span className="flex items-center gap-3">
                      {openSummary && (
                        <span className="text-xs font-medium text-charcoal-soft tabular-nums">
                          {openSummary}
                        </span>
                      )}
                      {openCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onClear(openFilter.key);
                            const pill = buttonRefs.current.get(openFilter.key);
                            setOpen(null);
                            pill?.focus();
                          }}
                          className="text-xs font-medium text-olive underline-offset-4 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </span>
                  </div>

                  {openFilter.kind === "check" && (
                    <div className="flex flex-col gap-0.5">
                      {openFilter.options.map((option) => (
                        <CheckRow
                          key={option.value}
                          option={option}
                          checked={openFilter.selected.includes(option.value)}
                          onToggle={() => onToggle(openFilter.key, option.value)}
                        />
                      ))}
                    </div>
                  )}

                  {openFilter.kind === "scale" && <ScaleFields filter={openFilter} />}

                  {openFilter.kind === "range" && <RangeFields filter={openFilter} />}
                </div>,
                document.body,
              )}
          </div>
        );
      })}
    </div>
  );
}
