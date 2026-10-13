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

const OLIVE = "#606B45";
const IVORY = "#F7F4EC";

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
      style={{ color: OLIVE }}
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

/** Picks the right artwork for any product based on its data. */
export function ProductArt({
  product,
  className = "",
}: {
  product: { shape?: DiamondShape; kind: string; name: string; category: string };
  className?: string;
}) {
  // Diamonds carry the bundled sample photograph for their cut. Its alt text
  // says plainly what the image is: a reference shot of that cut, not of this
  // specific stone.
  if (product.shape) {
    return (
      <ShapePhoto
        shape={product.shape}
        alt={`${product.name} — sample image of the ${shapeLabel(product.shape)} cut`}
        className={className}
      />
    );
  }
  // Without a shape there is nothing honest to draw — show an empty panel
  // rather than inventing artwork for the piece.
  return (
    <div
      role="img"
      aria-label={`${product.name} — illustration not available`}
      className={`${className} bg-ivory-deep`}
    />
  );
}
