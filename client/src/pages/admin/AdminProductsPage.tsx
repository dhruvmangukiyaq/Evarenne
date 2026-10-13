import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../lib/api";
import { adminApi } from "../../lib/admin-api";
import { useApi } from "../../lib/useApi";
import { shapeLabel } from "../../lib/labels";
import type { Product } from "../../lib/api-types";
import { ProductArt } from "../../components/catalog/ProductArt";
import { Button } from "../../components/ui/Button";
import { Badge, EmptyState, ErrorState, Skeleton } from "../../components/ui/Display";
import { useToast } from "../../components/ui/toast-context";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * The admin dashboard: every diamond the owner has added, with edit and
 * delete actions. These are the entries the public catalogue serves as real
 * inventory — the development seed alongside them is untouched.
 */
export function AdminProductsPage() {
  const { data, loading, error, refetch } = useApi((signal) => adminApi.products(signal), []);
  const { toast } = useToast();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove(product: Product) {
    setDeleting(true);
    try {
      await adminApi.remove(product.id);
      toast(`“${product.name}” removed from the catalogue.`, "success");
      setConfirmingId(null);
      refetch();
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "That diamond couldn't be deleted.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  }

  const addButton = (
    <Link
      to="/admin/products/new"
      className="inline-flex h-11 items-center bg-olive px-5 font-sans text-sm font-medium text-ivory transition-colors hover:bg-olive-hover anim-shrink"
    >
      Add diamond
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-(--container-page) px-4 py-10 lg:px-8" aria-busy="true">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <ErrorState
          title="We couldn't load your diamonds"
          description={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  const products = data?.products ?? [];

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 text-charcoal">Diamonds</h1>
          <p className="mt-1.5 max-w-prose text-sm text-charcoal-soft">
            {products.length === 0
              ? "Diamonds you add here appear in the public catalogue straight away."
              : `${products.length} ${products.length === 1 ? "diamond" : "diamonds"} added by you, published to the public catalogue alongside the sample collection.`}
          </p>
        </div>
        {addButton}
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No diamonds added yet"
            description="Add your first stone — photographs, an optional video, and its grading details. It will appear in the catalogue as soon as you save it."
            action={addButton}
          />
        </div>
      ) : (
        <ul className="mt-8 border border-ivory-dim bg-white">
          {products.map((product, index) => {
            const confirming = confirmingId === product.id;
            const photoCount = product.images.length;
            const specs = product.specs;

            return (
              <li
                key={product.id}
                className={`flex flex-wrap items-center gap-4 p-4 ${
                  index > 0 ? "border-t border-ivory-dim" : ""
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden border border-ivory-dim bg-ivory-deep">
                  <ProductArt product={product} className="h-full w-full" />
                </div>

                <div className="min-w-0 flex-1 basis-56">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="font-display text-lg leading-snug text-charcoal underline-offset-4 hover:text-olive hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.diamondType && (
                      <Badge tone={product.diamondType === "natural" ? "olive" : "champagne"}>
                        {product.diamondType === "natural" ? "Natural" : "Lab-Grown"}
                      </Badge>
                    )}
                    {product.featured && <Badge tone="champagne">Homepage</Badge>}
                    {product.video && <Badge tone="neutral">Video</Badge>}
                  </div>

                  <p className="mt-1 truncate text-xs text-charcoal-soft">
                    SKU {product.sku}
                    {product.shape && ` · ${shapeLabel(product.shape)}`}
                    {specs && ` · ${specs.carat.toFixed(2)} ct`}
                    {` · ${photoCount} ${photoCount === 1 ? "photo" : "photos"}`}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal-faint">
                    Added {formatDate(product.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {confirming ? (
                    <>
                      <span className="text-sm text-danger">Delete permanently?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={deleting}
                        className="border border-ivory-dim px-3 py-1.5 font-sans text-sm text-charcoal transition-colors hover:border-charcoal-faint disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(product)}
                        disabled={deleting}
                        className="border border-danger bg-danger px-3 py-1.5 font-sans text-sm text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
                      >
                        {deleting ? "Deleting…" : "Delete"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="border border-olive px-4 py-1.5 font-sans text-sm font-medium text-olive transition-colors hover:bg-olive hover:text-ivory"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(product.id)}
                        className="border border-ivory-dim px-4 py-1.5 font-sans text-sm text-charcoal-soft transition-colors hover:border-danger hover:text-danger"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {products.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button variant="text" size="sm" onClick={refetch}>
            Refresh list
          </Button>
        </div>
      )}
    </div>
  );
}
