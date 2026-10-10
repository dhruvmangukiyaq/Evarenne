import type { DiamondShape } from "../../lib/api-types";
import { shapeLabel } from "../../lib/labels";

/**
 * ProductArt — brand-styled SVG artwork used when a product has no photography
 * in the catalog data. These are honest decorative placeholders (never fake
 * photos), rendered from the product's shape/category attributes.
 */

const WINE = "#541F32";
const GOLD = "#C4A36B";
const IVORY = "#F8F4EF";

/* Outline paths for each diamond shape, drawn in a 100×100 viewBox. */
const SHAPE_PATHS: Record<DiamondShape, { outline: string; facets: string[] }> = {
  round: {
    outline: "M50 8 A42 42 0 1 1 49.9 8 Z",
    facets: [
      "M50 8 L28 26 L50 20 L72 26 Z",
      "M28 26 L14 50 L28 74 L50 64 L50 20 Z",
      "M72 26 L86 50 L72 74 L50 64 L50 20 Z",
      "M28 74 L50 92 L72 74 L50 64 Z",
    ],
  },
  oval: {
    outline: "M50 6 C72 6 84 26 84 50 C84 74 72 94 50 94 C28 94 16 74 16 50 C16 26 28 6 50 6 Z",
    facets: [
      "M50 6 L32 26 L50 20 L68 26 Z",
      "M32 26 L20 50 L32 74 L50 66 L50 20 Z",
      "M68 26 L80 50 L68 74 L50 66 L50 20 Z",
      "M32 74 L50 94 L68 74 L50 66 Z",
    ],
  },
  princess: {
    outline: "M18 18 L82 18 L82 82 L18 82 Z",
    facets: [
      "M18 18 L50 34 L82 18 M18 82 L50 66 L82 82",
      "M18 18 L34 50 L18 82 M82 18 L66 50 L82 82",
      "M50 34 L66 50 L50 66 L34 50 Z",
    ],
  },
  emerald: {
    outline: "M32 10 L68 10 L90 32 L90 68 L68 90 L32 90 L10 68 L10 32 Z",
    facets: [
      "M32 10 L34 30 L66 30 L68 10 M90 32 L70 34 L70 66 L90 68",
      "M68 90 L66 70 L34 70 L32 90 M10 68 L30 66 L30 34 L10 32",
      "M34 30 L66 30 L70 34 L70 66 L66 70 L34 70 L30 66 L30 34 Z",
    ],
  },
  cushion: {
    outline: "M26 12 L74 12 Q88 12 88 26 L88 74 Q88 88 74 88 L26 88 Q12 88 12 74 L12 26 Q12 12 26 12 Z",
    facets: [
      "M26 12 L36 34 L64 34 L74 12",
      "M88 26 L66 36 L66 64 L88 74",
      "M74 88 L64 66 L36 66 L26 88",
      "M12 74 L34 64 L34 36 L12 26",
      "M34 36 L66 36 L66 64 L34 64 Z",
    ],
  },
  pear: {
    outline: "M50 6 C64 22 84 40 84 60 C84 80 68 94 50 94 C32 94 16 80 16 60 C16 40 36 22 50 6 Z",
    facets: [
      "M50 6 L38 40 L50 30 L62 40 Z",
      "M38 40 L22 58 L38 80 L50 68 L50 30 Z",
      "M62 40 L78 58 L62 80 L50 68 L50 30 Z",
      "M38 80 L50 94 L62 80 L50 68 Z",
    ],
  },
  radiant: {
    outline: "M30 12 L70 12 L88 30 L88 70 L70 88 L30 88 L12 70 L12 30 Z",
    facets: [
      "M30 12 L38 34 L62 34 L70 12",
      "M88 30 L66 38 L66 62 L88 70",
      "M70 88 L62 66 L38 66 L30 88",
      "M12 70 L34 62 L34 38 L12 30",
      "M38 38 L62 38 L62 62 L38 62 Z",
    ],
  },
  asscher: {
    outline: "M28 10 L72 10 L90 28 L90 72 L72 90 L28 90 L10 72 L10 28 Z",
    facets: [
      "M28 10 L34 32 L66 32 L72 10",
      "M90 28 L68 34 L68 66 L90 72",
      "M72 90 L66 68 L34 68 L28 90",
      "M10 72 L32 66 L32 34 L10 28",
      "M34 34 L66 34 L66 66 L34 66 Z",
    ],
  },
  marquise: {
    outline: "M50 6 C30 20 14 36 14 50 C14 64 30 80 50 94 C70 80 86 64 86 50 C86 36 70 20 50 6 Z",
    facets: [
      "M50 6 L36 36 L50 28 L64 36 Z",
      "M36 36 L20 50 L36 64 L50 58 L50 28 Z",
      "M64 36 L80 50 L64 64 L50 58 L50 28 Z",
      "M36 64 L50 94 L64 64 L50 58 Z",
    ],
  },
  heart: {
    outline: "M50 92 C24 70 10 56 10 38 C10 22 22 12 34 12 C42 12 48 17 50 24 C52 17 58 12 66 12 C78 12 90 22 90 38 C90 56 76 70 50 92 Z",
    facets: [
      "M50 24 L32 34 L24 50 L38 72",
      "M50 24 L68 34 L76 50 L62 72",
      "M50 24 L50 62 L38 72 M50 62 L62 72",
    ],
  },
};

export function DiamondArt({
  shape,
  className = "",
  title,
}: {
  shape: DiamondShape;
  className?: string;
  title?: string;
}) {
  const { outline, facets } = SHAPE_PATHS[shape] ?? { outline: "", facets: [] };
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label={title ?? `${shapeLabel(shape)} diamond illustration`}
      className={className}
    >
      <rect width="100" height="100" fill={IVORY} />
      <path d={outline} fill={WINE} fillOpacity="0.08" stroke={WINE} strokeWidth="1.6" />
      {facets.map((path, index) => (
        <path key={index} d={path} fill="none" stroke={GOLD} strokeWidth="1" strokeOpacity="0.85" />
      ))}
    </svg>
  );
}

/** Ring silhouette used for settings/rings without photography. */
export function RingArt({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Ring illustration"} className={className}>
      <rect width="100" height="100" fill={IVORY} />
      <circle cx="50" cy="62" r="26" fill="none" stroke={WINE} strokeWidth="2.4" />
      <path d="M50 16 L60 28 L50 38 L40 28 Z" fill={GOLD} fillOpacity="0.5" stroke={WINE} strokeWidth="1.4" />
      <path d="M40 28 L60 28" stroke={WINE} strokeWidth="1" />
    </svg>
  );
}

/** Generic fine-jewelry silhouette (earrings/pendant/bracelet). */
export function JewelryArt({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={title ?? "Jewelry illustration"} className={className}>
      <rect width="100" height="100" fill={IVORY} />
      <path d="M20 40 Q50 20 80 40" fill="none" stroke={WINE} strokeWidth="2" />
      <circle cx="32" cy="52" r="7" fill={GOLD} fillOpacity="0.5" stroke={WINE} strokeWidth="1.4" />
      <circle cx="50" cy="58" r="7" fill={GOLD} fillOpacity="0.5" stroke={WINE} strokeWidth="1.4" />
      <circle cx="68" cy="52" r="7" fill={GOLD} fillOpacity="0.5" stroke={WINE} strokeWidth="1.4" />
    </svg>
  );
}

/** Picks the right artwork for any product based on its data. */
export function ProductArt({ product, className = "" }: { product: { shape?: DiamondShape; kind: string; name: string; category: string }; className?: string }) {
  if (product.shape) {
    return <DiamondArt shape={product.shape} title={`${product.name} — ${shapeLabel(product.shape)} illustration`} className={className} />;
  }
  if (product.kind === "setting" || product.kind === "ring") {
    return <RingArt title={`${product.name} — ring illustration`} className={className} />;
  }
  return <JewelryArt title={`${product.name} — jewelry illustration`} className={className} />;
}
