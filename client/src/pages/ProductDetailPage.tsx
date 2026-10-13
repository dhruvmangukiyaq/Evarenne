import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { Product } from "../lib/api-types";
import { ProductArt } from "../components/catalog/ProductArt";
import { shapeLabel } from "../lib/labels";
import { Badge, Breadcrumbs, ErrorState, Skeleton } from "../components/ui/Display";
import { Reveal } from "../components/ui/Reveal";

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  // Only render a row when the data supports it — never invent a value.
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ivory-dim py-2.5 last:border-b-0">
      <dt className="text-sm text-charcoal-soft">{label}</dt>
      <dd className="text-right text-sm font-medium text-charcoal">{value}</dd>
    </div>
  );
}

export function ProductDetailPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  // Declared before the early returns below: React hooks may not be
  // conditional, and this picks which supplied photograph is on show.
  const [activePhoto, setActivePhoto] = useState(0);
  const { data, loading, error, refetch } = useApi<{ product: Product }>((signal) => {
    void signal;
    if (!slugOrId) return Promise.reject(new Error("Missing product"));
    return api.product(slugOrId);
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-(--container-page) px-4 py-10 lg:px-8" aria-busy="true">
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="mt-4 h-8 w-40" />
            <Skeleton className="mt-6 h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.status === 404) {
      return (
        <div className="mx-auto max-w-(--container-lg) px-4 py-20 text-center">
          <h1 className="font-display text-h1 text-charcoal">Piece not found</h1>
          <p className="mt-3 text-charcoal-soft">
            This product may have been removed or the link may be incorrect.
          </p>
          <Link
            to="/diamonds"
            className="mt-6 inline-flex h-11 items-center bg-olive px-6 font-sans text-sm font-medium text-ivory hover:bg-olive-hover anim-shrink"
          >
            Browse diamonds
          </Link>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <ErrorState title="We couldn't load this piece" description={error.message} onRetry={refetch} />
      </div>
    );
  }

  if (!data) return null;
  const product = data.product;

  const specs = product.specs;

  // Supplied photography (admin-added listings) beats the bundled cut reference.
  const photos = product.images ?? [];
  const hasPhotos = photos.length > 0;
  const photo = photos[Math.min(activePhoto, photos.length - 1)];

  const breadcrumbItems = [
    { label: "Home", to: "/" },
    { label: "Diamonds", to: "/diamonds" },
    { label: product.name },
  ];

  // Carried into the inquiry form so the specialist knows which stone prompted it.
  const inquiryTo =
    `/appointments?product=${encodeURIComponent(product.name)}` +
    (product.sku ? `&sku=${encodeURIComponent(product.sku)}` : "");

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <Reveal delay={100} variant="fade" className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-ivory-dim bg-white">
            {hasPhotos && photo ? (
              <img
                src={photo.src}
                alt={photo.alt}
                className="aspect-square w-full object-cover"
                decoding="async"
              />
            ) : (
              <ProductArt product={product} className="aspect-square w-full" />
            )}

            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-ivory-dim p-2">
                {photos.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setActivePhoto(index)}
                    aria-label={`Show photograph ${index + 1}`}
                    aria-current={index === activePhoto}
                    className={`h-16 w-16 shrink-0 overflow-hidden border transition-colors ${
                      index === activePhoto
                        ? "border-olive"
                        : "border-ivory-dim hover:border-charcoal-faint"
                    }`}
                  >
                    <img src={item.src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mt-2 text-center text-xs text-charcoal-faint">
            {hasPhotos
              ? "Photographs of this specific stone."
              : product.shape
                ? "Sample image of this cut. Not a photograph of this specific stone — individual photography is added once supplied."
                : "Illustrative artwork shown. Product photography is added once supplied."}
          </p>

          {product.video && (
            <div className="mt-6 border border-ivory-dim bg-white">
              <video
                src={product.video}
                controls
                preload="metadata"
                playsInline
                className="aspect-video w-full bg-charcoal object-contain"
              >
                Your browser can't play this video.{" "}
                <a href={product.video} className="text-olive underline">
                  Open the file directly
                </a>
                .
              </video>
              <p className="border-t border-ivory-dim p-3 text-center text-xs text-charcoal-faint">
                Video of this specific stone, supplied with the listing.
              </p>
            </div>
          )}
        </Reveal>

        {/* Details */}
        <Reveal delay={250} variant="soft">
          <div className="flex flex-wrap gap-2">
            {product.diamondType && <Badge tone="champagne">Lab-Grown</Badge>}
            {product.dataSource === "development-seed" && (
              <Badge tone="neutral">Sample data</Badge>
            )}
          </div>

          <h1 className="mt-3 font-display text-h1 text-charcoal">{product.name}</h1>
          <p className="mt-2 font-sans text-xs tracking-wide text-charcoal-faint">
            SKU {product.sku}
          </p>

          <p className="mt-5 leading-relaxed text-charcoal-soft">{product.description}</p>

          {/* Inquiry CTA — the catalogue never sells online, so interest in a
              stone always opens a conversation with a specialist. */}
          <div className="mt-8 border border-ivory-dim bg-ivory-deep p-6">
            <h2 className="font-display text-h3 text-charcoal">Interested in this diamond?</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
              Send an inquiry and a specialist will come prepared with this stone's grading details,
              comparable options and viewing times.
            </p>
            <Link
              to={inquiryTo}
              className="mt-5 inline-flex h-[3.25rem] items-center bg-olive px-8 font-sans text-base font-medium text-ivory hover:bg-olive-hover anim-shrink"
            >
              Inquire Now
            </Link>
          </div>

          {/* Specifications */}
          {(specs || product.shape) && (
            <section className="mt-10">
              <h2 className="font-display text-h3 text-charcoal">Specifications</h2>
              <dl className="mt-3">
                {product.shape && <SpecRow label="Shape" value={shapeLabel(product.shape)} />}

                {specs && (
                  <>
                    <SpecRow label="Carat" value={specs.carat.toFixed(2)} />
                    <SpecRow label="Cut" value={specs.cut} />
                    <SpecRow label="Colour" value={specs.color} />
                    <SpecRow label="Clarity" value={specs.clarity} />
                    <SpecRow label="Polish" value={specs.polish} />
                    <SpecRow label="Symmetry" value={specs.symmetry} />
                    <SpecRow label="Fluorescence" value={specs.fluorescence} />
                    <SpecRow label="Measurements" value={`${specs.measurements} mm`} />
                  </>
                )}
              </dl>
            </section>
          )}

          {/* Grading report — only if real data exists */}
          <section className="mt-8 border border-ivory-dim p-5">
            <h2 className="font-display text-h3 text-charcoal">Grading Report</h2>
            {(() => {
              const report = specs;
              const cert = report?.certificateNumber;
              const url = report?.certificateUrl;
              const lab = report?.lab;
              if (cert && lab) {
                return (
                  <div className="mt-2">
                    <p className="text-sm text-charcoal-soft">
                      Graded by <span className="font-medium text-charcoal">{lab}</span> · Report{" "}
                      <span className="font-medium text-charcoal">{cert}</span>
                    </p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-sans text-sm font-medium text-olive underline-offset-4 hover:underline"
                      >
                        View grading report ↗
                      </a>
                    )}
                  </div>
                );
              }
              return (
                <p className="mt-2 text-sm text-charcoal-soft">
                  A grading report for this piece has not been linked yet. Grading details depend on the
                  specific stone and the laboratory that graded it; we only display a report when a real,
                  verifiable document exists.
                </p>
              );
            })()}
          </section>

        </Reveal>
      </div>
    </div>
  );
}
