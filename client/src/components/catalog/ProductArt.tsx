import type { DiamondShape } from "../../lib/api-types";
import { shapeLabel } from "../../lib/labels";
import { shapeIcon, shapePhoto } from "../../lib/shape-assets";

/**
 * ProductArt — artwork used when a product has no photography in the catalog
 * data. Diamonds render the bundled sample photograph for their cut, clearly
 * labelled as a shape reference in its alt text (never as a photo of that
 * specific stone). Everything else renders honest line art built from the
 * bundled shape icons — never a fake photograph.
 */

const WINE = "#541F32";
const GOLD = "#C4A36B";
const IVORY = "#F8F4EF";

export function DiamondArt({
  shape,
  className = "",
  title,
  framed = true,
}: {
  shape: DiamondShape;
  className?: string;
  title?: string;
  /** Draws the ivory card behind the icon. Off for icons used inline. */
  framed?: boolean;
}) {
  const icon = shapeIcon(shape);
  if (!icon) return null;

  // `title=""` means "decorative" (the homepage moodboard passes it): hide it
  // from assistive tech rather than emitting an empty, unusable label.
  const decorative = title === "";
  const label = title ?? `${shapeLabel(shape)} diamond illustration`;

  return (
    <svg
      viewBox={icon.viewBox}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={className}
      style={{ color: WINE }}
    >
      {framed && <rect width="100%" height="100%" fill={IVORY} />}
      {icon.paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill="currentColor"
          fillRule={path.fillRule}
          clipRule={path.clipRule}
          opacity={path.opacity}
          stroke={path.stroke ? "currentColor" : undefined}
          strokeWidth={path.stroke ? path.strokeWidth : undefined}
        />
      ))}
    </svg>
  );
}

/**
 * Sample photograph of a cut, from the development asset pack. Falls back to
 * line art when a shape has no bundled photo.
 */
export function ShapePhoto({
  shape,
  alt,
  className = "",
  loading = "lazy",
}: {
  shape: DiamondShape;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const src = shapePhoto(shape);
  if (!src) return <DiamondArt shape={shape} title={alt} className={className} />;

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`object-contain ${className}`}
    />
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
export function ProductArt({
  product,
  className = "",
}: {
  product: { shape?: DiamondShape; kind: string; name: string; category: string };
  className?: string;
}) {
  // Loose diamonds are the only products carrying a top-level `shape`, so this
  // branch is where the bundled sample photograph belongs. Its alt text says
  // plainly what the image is: a reference shot of that cut, not of this stone.
  if (product.shape) {
    return (
      <ShapePhoto
        shape={product.shape}
        alt={`${product.name} — sample image of the ${shapeLabel(product.shape)} cut`}
        className={className}
      />
    );
  }
  if (product.kind === "setting" || product.kind === "ring") {
    return <RingArt title={`${product.name} — ring illustration`} className={className} />;
  }
  return <JewelryArt title={`${product.name} — jewelry illustration`} className={className} />;
}
