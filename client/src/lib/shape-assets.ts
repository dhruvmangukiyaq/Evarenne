import type { DiamondShape } from "./api-types";

/**
 * Access to the bundled diamond-shape artwork.
 *
 * Two asset sets ship with the client, both keyed by `DiamondShape`:
 *
 *  - `assets/shapes/*.svg` — cut line-art icons. Every path in these files is
 *    `fill="currentColor"` with `fill-rule="evenodd"`, so they render as
 *    monochrome silhouettes that inherit the consumer's `color`.
 *  - `assets/photos/*.png|jpeg` — sample photographs of that cut, from the
 *    development asset pack. These are **shape reference images**, not
 *    photographs of a specific catalog stone; consumers must label them
 *    accordingly in their `alt` text.
 *
 * Both sets are resolved at build time via `import.meta.glob`, so a missing
 * asset fails the type check / build rather than 404-ing at runtime.
 */

export interface ShapeIconPath {
  d: string;
  fillRule?: "inherit" | "nonzero" | "evenodd";
  clipRule?: "inherit" | "nonzero" | "evenodd";
  opacity?: string;
  stroke?: string;
  strokeWidth?: string;
}

export interface ShapeIcon {
  /** Source `viewBox`, kept verbatim so each cut keeps its real proportions. */
  viewBox: string;
  paths: ShapeIconPath[];
}

const rawIcons = import.meta.glob("../assets/shapes/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const photoUrls = import.meta.glob("../assets/photos/*", {
  import: "default",
  eager: true,
}) as Record<string, string>;

/** `../assets/shapes/round.svg` → `round` */
const assetKey = (path: string) => path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");

const iconsByShape = new Map(Object.entries(rawIcons).map(([path, raw]) => [assetKey(path), raw]));
const photosByShape = new Map(Object.entries(photoUrls).map(([path, url]) => [assetKey(path), url]));

const parsedCache = new Map<string, ShapeIcon>();

/** Narrows an unparsed `fill-rule`/`clip-rule` value to the SVG union type. */
function fillRuleOf(value: string | undefined): ShapeIconPath["fillRule"] {
  return value === "evenodd" || value === "nonzero" || value === "inherit" ? value : undefined;
}

/**
 * Reads a source `<svg>` into a renderer-agnostic shape. Only the attributes
 * the source files actually use are carried over (verified: `d`, `fill`,
 * `fill-rule`, `clip-rule`, plus a single `opacity` / `stroke` pair).
 */
function parseIcon(raw: string): ShapeIcon {
  const viewBox = /viewBox="([^"]*)"/.exec(raw)?.[1] ?? "0 0 100 100";
  const paths: ShapeIconPath[] = [];

  const tagPattern = /<path\b[^>]*>/g;
  const attrPattern = /([\w-]+)="([^"]*)"/g;

  let tag: RegExpExecArray | null;
  while ((tag = tagPattern.exec(raw)) !== null) {
    const attrs = new Map<string, string>();
    let attr: RegExpExecArray | null;
    attrPattern.lastIndex = 0;
    while ((attr = attrPattern.exec(tag[0])) !== null) {
      attrs.set(attr[1]!, attr[2]!);
    }

    const d = attrs.get("d");
    if (!d) continue;

    paths.push({
      d,
      fillRule: fillRuleOf(attrs.get("fill-rule")),
      clipRule: fillRuleOf(attrs.get("clip-rule")),
      opacity: attrs.get("opacity"),
      stroke: attrs.get("stroke"),
      strokeWidth: attrs.get("stroke-width"),
    });
  }

  return { viewBox, paths };
}

/** Returns the parsed icon for a shape, or `null` when no asset is bundled. */
export function shapeIcon(shape: DiamondShape): ShapeIcon | null {
  const raw = iconsByShape.get(shape);
  if (!raw) return null;

  let icon = parsedCache.get(shape);
  if (!icon) {
    icon = parseIcon(raw);
    parsedCache.set(shape, icon);
  }
  return icon;
}

/** Returns the bundled sample photograph URL for a shape, or `null`. */
export function shapePhoto(shape: DiamondShape): string | null {
  return photosByShape.get(shape) ?? null;
}
