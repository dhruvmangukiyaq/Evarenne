import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { Product } from "../lib/api-types";
import { ProductArt } from "../components/catalog/ProductArt";
import { shapeLabel } from "../lib/labels";
import { metalLabel, styleLabel } from "../lib/labels";
import { Badge, Breadcrumbs, ErrorState, PriceDisplay, Skeleton } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { useCart, useWishlist } from "../store/cart";
import { useToast } from "../components/ui/toast-context";

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  // Only render a row when the data supports it — never invent a value.
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ivory-dim py-2.5 last:border-b-0">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ProductDetailPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const { data, loading, error, refetch } = useApi<{ product: Product }>((signal) => {
    void signal;
    if (!slugOrId) return Promise.reject(new Error("Missing product"));
    return api.product(slugOrId);
  }, [slugOrId]);

  const { addProduct } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

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
          <h1 className="font-display text-h1 text-ink">Piece not found</h1>
          <p className="mt-3 text-ink-soft">
            This product may have been removed or the link may be incorrect.
          </p>
          <Link
            to="/engagement-rings"
            className="mt-6 inline-flex h-11 items-center bg-wine px-6 font-sans text-sm font-medium text-ivory hover:bg-wine-hover"
          >
            Continue shopping
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
  const saved = has(product.id);

  const specs = product.specs;
  const center = product.centerDiamond;

  const breadcrumbItems = [
    { label: "Home", to: "/" },
    { label: "Collection", to: "/engagement-rings" },
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-ivory-dim bg-white">
            <ProductArt product={product} className="aspect-square w-full" />
          </div>
          <p className="mt-2 text-center text-xs text-ink-faint">
            Illustrative artwork shown. Product photography is added once supplied.
          </p>
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2">
            {product.diamondType && (
              <Badge tone={product.diamondType === "natural" ? "wine" : "gold"}>
                {product.diamondType === "natural" ? "Natural" : "Lab-Grown"}
              </Badge>
            )}
            {product.kind === "setting" && <Badge tone="neutral">Setting only</Badge>}
            {product.dataSource === "development-seed" && (
              <Badge tone="neutral">Sample data</Badge>
            )}
          </div>

          <h1 className="mt-3 font-display text-h1 text-ink">{product.name}</h1>
          <p className="mt-2 font-sans text-xs tracking-wide text-ink-faint">
            SKU {product.sku}
          </p>

          <div className="mt-4">
            <PriceDisplay price={product.price} size="lg" />
            <p className="mt-1 text-xs text-ink-soft">
              Price shown is from the catalog. Taxes and shipping calculated at checkout.
            </p>
          </div>

          <p className="mt-5 leading-relaxed text-ink-soft">{product.description}</p>

          {product.compatibility && (
            <div className="mt-6 border border-gold/40 bg-gold/10 p-4">
              <h2 className="font-sans text-sm font-medium text-ink">Holds a centre stone of</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {product.compatibility.caratMin.toFixed(2)}–{product.compatibility.caratMax.toFixed(2)} ct ·{" "}
                {product.compatibility.shapes.map(shapeLabel).join(", ")}
              </p>
              <Link
                to="/create-your-ring"
                className="mt-3 inline-block font-sans text-sm font-medium text-wine underline-offset-4 hover:underline"
              >
                Pair with a diamond →
              </Link>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center border border-ivory-dim">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink"
              >
                <span aria-hidden="true">−</span>
              </button>
              <span className="min-w-10 text-center tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink disabled:opacity-40"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>

            <Button
              size="lg"
              onClick={() => {
                addProduct(
                  { id: product.id, name: product.name, subtitle: product.sku, sku: product.sku },
                  quantity,
                );
                toast(`${product.name} added to your bag`, "success");
              }}
            >
              Add to Bag
            </Button>

            <button
              type="button"
              onClick={() =>
                toggle({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  category: product.category,
                  shape: product.shape,
                })
              }
              aria-pressed={saved}
              className="inline-flex h-11 items-center gap-2 border border-wine px-5 font-sans text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5"
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Specifications */}
          {(specs || center || product.metal || product.style) && (
            <section className="mt-10">
              <h2 className="font-display text-h3 text-ink">Specifications</h2>
              <dl className="mt-3">
                {product.metal && <SpecRow label="Metal" value={metalLabel(product.metal)} />}
                {product.style && <SpecRow label="Style" value={styleLabel(product.style)} />}
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

                {center && (
                  <>
                    <SpecRow label="Centre shape" value={shapeLabel(center.shape)} />
                    <SpecRow label="Centre origin" value={center.type === "natural" ? "Natural" : "Lab-grown"} />
                    <SpecRow label="Carat" value={center.carat.toFixed(2)} />
                    <SpecRow label="Cut" value={center.cut} />
                    <SpecRow label="Colour" value={center.color} />
                    <SpecRow label="Clarity" value={center.clarity} />
                    <SpecRow label="Measurements" value={`${center.measurements} mm`} />
                  </>
                )}
              </dl>
            </section>
          )}

          {/* Grading report — only if real data exists */}
          <section className="mt-8 border border-ivory-dim p-5">
            <h2 className="font-display text-h3 text-ink">Grading Report</h2>
            {(() => {
              const report = specs ?? center;
              const cert = report?.certificateNumber;
              const url = report?.certificateUrl;
              const lab = report?.lab;
              if (cert && lab) {
                return (
                  <div className="mt-2">
                    <p className="text-sm text-ink-soft">
                      Graded by <span className="font-medium text-ink">{lab}</span> · Report{" "}
                      <span className="font-medium text-ink">{cert}</span>
                    </p>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-sans text-sm font-medium text-wine underline-offset-4 hover:underline"
                      >
                        View grading report ↗
                      </a>
                    )}
                  </div>
                );
              }
              return (
                <p className="mt-2 text-sm text-ink-soft">
                  A grading report for this piece has not been linked yet. Grading details depend on the
                  specific stone and the laboratory that graded it; we only display a report when a real,
                  verifiable document exists.
                </p>
              );
            })()}
          </section>

          {/* Delivery / returns note */}
          <p className="mt-6 text-xs text-ink-soft">
            See our{" "}
            <Link to="/shipping-returns" className="text-wine underline underline-offset-4">
              shipping &amp; returns
            </Link>{" "}
            page for current policies.
          </p>
        </div>
      </div>
    </div>
  );
}
