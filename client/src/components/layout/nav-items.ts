import type { DiamondShape, Metal, RingStyle } from "../../lib/api-types";

/**
 * Single source of truth for primary navigation: every entry points at a real
 * route that exists in the router. Sub-menu groups build their links from the
 * same query-parameter contract the catalog page reads, so filters and nav can
 * never drift apart.
 */

export interface NavGroup {
  label: string;
  links: Array<{ label: string; to: string }>;
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

export const STYLES: RingStyle[] = [
  "solitaire",
  "halo",
  "pavé",
  "hidden-halo",
  "three-stone",
  "vintage",
  "bezel",
];

export const METALS: Metal[] = [
  "platinum",
  "18k-white-gold",
  "14k-white-gold",
  "18k-yellow-gold",
  "14k-yellow-gold",
  "18k-rose-gold",
  "14k-rose-gold",
];

const metalLabel = (metal: Metal) =>
  metal
    .split("-")
    .map((part) => (part === "k" ? "K" : part[0]!.toUpperCase() + part.slice(1)))
    .join(" ");

const shapeLabel = (shape: DiamondShape) =>
  shape === "round" ? "Round Brilliant" : shape[0]!.toUpperCase() + shape.slice(1);

const styleLabel = (style: RingStyle) =>
  style === "pavé" ? "Pavé" : style === "hidden-halo" ? "Hidden Halo" : style[0]!.toUpperCase() + style.slice(1);

export const navItems: NavItem[] = [
  {
    label: "Engagement Rings",
    to: "/engagement-rings",
    menu: [
      {
        label: "By Style",
        links: STYLES.map((style) => ({
          label: styleLabel(style),
          to: `/engagement-rings?styles=${encodeURIComponent(style)}`,
        })),
      },
      {
        label: "By Metal",
        links: METALS.map((metal) => ({
          label: metalLabel(metal),
          to: `/engagement-rings?metals=${encodeURIComponent(metal)}`,
        })),
      },
      {
        label: "Start Creating",
        links: [{ label: "Create Your Ring", to: "/create-your-ring" }],
      },
    ],
  },
  {
    label: "Wedding Rings",
    to: "/wedding-rings",
    menu: [
      {
        label: "By Style",
        links: [
          { label: "Classic Bands", to: "/wedding-rings?styles=solitaire" },
          { label: "Pavé Bands", to: `/wedding-rings?styles=${encodeURIComponent("pavé")}` },
        ],
      },
      {
        label: "By Metal",
        links: METALS.slice(0, 4).map((metal) => ({
          label: metalLabel(metal),
          to: `/wedding-rings?metals=${encodeURIComponent(metal)}`,
        })),
      },
    ],
  },
  {
    label: "Natural Diamonds",
    to: "/diamonds/natural",
    menu: [
      {
        label: "By Shape",
        links: SHAPES.map((shape) => ({
          label: shapeLabel(shape),
          to: `/diamonds/natural?shapes=${shape}`,
        })),
      },
    ],
  },
  {
    label: "Lab-Grown Diamonds",
    to: "/diamonds/lab-grown",
    menu: [
      {
        label: "By Shape",
        links: SHAPES.map((shape) => ({
          label: shapeLabel(shape),
          to: `/diamonds/lab-grown?shapes=${shape}`,
        })),
      },
    ],
  },
  {
    label: "Fine Jewelry",
    to: "/jewelry",
    menu: [
      {
        label: "Categories",
        links: [
          { label: "Earrings", to: "/jewelry?category=earrings" },
          { label: "Pendants", to: "/jewelry?category=pendant" },
          { label: "Bracelets", to: "/jewelry?category=bracelet" },
        ],
      },
    ],
  },
  { label: "The Diamond Guide", to: "/diamond-guide" },
  { label: "Our Story", to: "/our-story" },
  { label: "Book an Appointment", to: "/appointments" },
];
