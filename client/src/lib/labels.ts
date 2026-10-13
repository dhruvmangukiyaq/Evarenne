/** Human-readable labels for catalog enum values.
 *
 * Kept in a non-component module so that component files (ProductCard,
 * ProductArt) export only components and fast-refresh stays intact.
 */

import type { DiamondShape } from "./api-types";

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
