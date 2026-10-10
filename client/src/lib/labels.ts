/** Human-readable labels for catalog enum values.
 *
 * Kept in a non-component module so that component files (ProductCard,
 * ProductArt) export only components and fast-refresh stays intact.
 */

import type { DiamondShape } from "./api-types";

/** "18k-white-gold" → "18k White Gold" */
export function metalLabel(metal: string): string {
  return metal
    .split("-")
    .map((part) => (part === "k" ? "K" : (part[0]?.toUpperCase() ?? "") + part.slice(1)))
    .join(" ");
}

/** "hidden-halo" → "Hidden Halo", "pavé" → "Pavé" */
export function styleLabel(style: string): string {
  if (style === "hidden-halo") return "Hidden Halo";
  return (style[0]?.toUpperCase() ?? "") + style.slice(1);
}

/** Human labels for diamond shapes, keyed off the catalog enum. */
const SHAPE_LABELS: Record<DiamondShape, string> = {
  round: "Round brilliant",
  oval: "Oval",
  princess: "Princess",
  emerald: "Emerald",
  cushion: "Cushion",
  pear: "Pear",
  radiant: "Radiant",
  asscher: "Asscher",
  marquise: "Marquise",
  heart: "Heart",
};

export function shapeLabel(shape: DiamondShape): string {
  return SHAPE_LABELS[shape] ?? "Round brilliant";
}
