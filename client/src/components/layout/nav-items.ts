import type { DiamondShape } from "../../lib/api-types";

/**
 * Single source of truth for primary navigation: every entry points at a real
 * route that exists in the router. Sub-menu groups build their links from the
 * same query-parameter contract the catalog page reads, so filters and nav can
 * never drift apart.
 *
 * Scope note: the primary nav intentionally exposes only the two diamond
 * catalogs plus brand/utility links. Ring, jewelry and education destinations
 * remain reachable by direct URL (and from the homepage) — they are not
 * surfaced here.
 */

export interface NavGroup {
  label: string;
  links: Array<{ label: string; to: string; /** Present for diamond-shape links; drives the menu glyph. */ shape?: DiamondShape }>;
}

export interface NavItem {
  label: string;
  to: string;
  /** Desktop mega-menu groups; absent = plain link. */
  menu?: NavGroup[];
}

export const SHAPES: DiamondShape[] = [
  "round",
  "oval",
  "princess",
  "emerald",
  "cushion",
  "pear",
  "radiant",
  "asscher",
  "marquise",
  "heart",
];

const shapeLabel = (shape: DiamondShape) =>
  shape === "round" ? "Round Brilliant" : shape[0]!.toUpperCase() + shape.slice(1);

const diamondShapeLinks = (path: string) =>
  SHAPES.map((shape) => ({
    label: shapeLabel(shape),
    to: `${path}?shapes=${shape}`,
    shape,
  }));

export const navItems: NavItem[] = [
  {
    label: "Natural Diamonds",
    to: "/diamonds/natural",
    menu: [{ label: "By Shape", links: diamondShapeLinks("/diamonds/natural") }],
  },
  {
    label: "Lab-Grown Diamonds",
    to: "/diamonds/lab-grown",
    menu: [{ label: "By Shape", links: diamondShapeLinks("/diamonds/lab-grown") }],
  },
  { label: "Our Story", to: "/our-story" },
  { label: "Book an Appointment", to: "/appointments" },
];
