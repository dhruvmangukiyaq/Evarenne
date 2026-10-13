import type { DiamondShape } from "../../lib/api-types";

/**
 * Single source of truth for primary navigation: every entry points at a real
 * route that exists in the router. Sub-menu links build their hrefs from the
 * same query-parameter contract the catalog page reads, so filters and nav can
 * never drift apart.
 *
 * Scope note: the primary nav intentionally exposes a single "Diamond" entry.
 * Its mega panel carries both loose catalogs — natural and lab-grown — as side
 * by side shape columns, so a shopper picks the stone type from one surface
 * instead of two nav items. Education and support destinations remain
 * reachable from the footer and the homepage — they are not surfaced here.
 */

export interface NavLink {
  label: string;
  to: string;
  /** Present for diamond-shape links; drives the menu glyph. */
  shape?: DiamondShape;
}

/** One column of the mega panel: a heading, its links, and a browse-all link. */
export interface NavGroup {
  label: string;
  links: NavLink[];
  /** Whole-catalog button pinned to the bottom of the column. */
  allLabel: string;
  allTo: string;
}

export interface NavMenu {
  groups: NavGroup[];
  /** Sample photograph shown at the right edge of the desktop panel. */
  image: { shape: DiamondShape; alt: string };
}

export interface NavItem {
  label: string;
  to: string;
  /** Desktop mega-menu panel; absent = plain link. */
  menu?: NavMenu;
}

/**
 * Cuts listed in the mega panel, in the order they read across the two-column
 * grid (Round | Pear, Oval | Emerald, …). Always a subset of the catalog enum,
 * so every entry resolves to a filtered list rather than an empty result.
 */
export const SHAPES: DiamondShape[] = [
  "round",
  "pear",
  "oval",
  "emerald",
  "princess",
  "radiant",
  "marquise",
  "asscher",
  "cushion",
  "heart",
];

const shapeLabel = (shape: DiamondShape) => shape[0]!.toUpperCase() + shape.slice(1);

const diamondShapeLinks = (path: string): NavLink[] =>
  SHAPES.map((shape) => ({
    label: shapeLabel(shape),
    to: `${path}?shapes=${shape}`,
    shape,
  }));

const looseGroup = (label: string, allLabel: string, path: string): NavGroup => ({
  label,
  links: diamondShapeLinks(path),
  allLabel,
  allTo: path,
});

export const navItems: NavItem[] = [
  {
    label: "Diamond",
    to: "/diamonds/natural",
    menu: {
      groups: [
        looseGroup("Loose Natural Shape", "All Loose Natural", "/diamonds/natural"),
        looseGroup("Loose Lab-Grown Shape", "All Loose Lab-Grown", "/diamonds/lab-grown"),
      ],
      image: {
        shape: "round",
        alt: "Sample photograph of a round brilliant cut, shown as a shape reference",
      },
    },
  },
  { label: "Our Story", to: "/our-story" },
  { label: "Book an Appointment", to: "/appointments" },
];
