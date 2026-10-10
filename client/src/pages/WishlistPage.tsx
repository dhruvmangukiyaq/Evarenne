import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState, PriceDisplay } from "../components/ui/Display";
import { useWishlist } from "../store/cart";

export function WishlistPage() {
  const { entries, remove } = useWishlist();

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-20 lg:px-8">
        <h1 className="mb-8 font-display text-h1 text-ink">Wishlist</h1>
        <EmptyState
          title="No saved pieces yet"
          description="Tap the heart on any product to save it here for later."
          action={
            <Link
              to="/engagement-rings"
              className="inline-flex h-11 items-center bg-wine px-6 font-sans text-sm font-medium text-ivory hover:bg-wine-hover"
            >
              Browse the collection
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-10 lg:px-8">
      <h1 className="font-display text-h1 text-ink">Wishlist</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {entries.length} saved {entries.length === 1 ? "piece" : "pieces"}
      </p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col border border-ivory-dim bg-white p-5">
            <Link
              to={`/products/${entry.slug}`}
              className="font-display text-lg text-ink underline-offset-4 hover:underline"
            >
              {entry.name}
            </Link>
            <p className="mt-1 text-xs tracking-wide text-ink-faint">SKU {entry.sku}</p>
            <div className="mt-3">
              <PriceDisplay price={entry.price} size="md" compact />
            </div>
            <div className="mt-4 flex gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => remove(entry.id)}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
