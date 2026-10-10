import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState, PriceDisplay } from "../components/ui/Display";
import { useCart } from "../store/cart";
import { useToast } from "../components/ui/toast-context";

/**
 * Full cart page. As in the drawer, every price and the total come from the
 * server quote — the browser never computes money. Checkout is the next step
 * and is wired in Phase 7.
 */
export function CartPage() {
  const { items, quote, quoteLoading, quoteError, setQuantity, removeItem, refreshQuote } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-20 lg:px-8">
        <h1 className="mb-8 font-display text-h1 text-ink">Your Bag</h1>
        <EmptyState
          title="Your bag is empty"
          description="Browse loose diamonds, engagement rings, and fine jewelry — or start by creating your own ring."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/diamonds/natural"
                className="inline-flex h-11 items-center bg-wine px-6 font-sans text-sm font-medium text-ivory hover:bg-wine-hover"
              >
                Browse Diamonds
              </Link>
              <Link
                to="/create-your-ring"
                className="inline-flex h-11 items-center border border-wine px-6 font-sans text-sm font-medium text-wine hover:bg-wine hover:text-ivory"
              >
                Create a Ring
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-10 lg:px-8">
      <h1 className="font-display text-h1 text-ink">Your Bag</h1>
      <p className="mt-1.5 text-sm text-ink-soft" aria-live="polite">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        {/* Line items */}
        <ul className="flex flex-col divide-y divide-ivory-dim border-y border-ivory-dim">
          {items.map((item) => {
            const line = quote?.lines.find((l) =>
              l.kind === "product"
                ? l.product.id === item.productId
                : l.setting.id === item.settingId && l.diamond.id === item.diamondId,
            );
            return (
              <li key={item.key} className="flex flex-wrap items-start justify-between gap-4 py-5">
                <div className="min-w-0 flex-1">
                  {item.productId ? (
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-display text-lg text-ink underline-offset-4 hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <p className="font-display text-lg text-ink">{item.title}</p>
                  )}
                  {item.subtitle && <p className="mt-0.5 text-xs text-ink-soft">{item.subtitle}</p>}
                  {line && (
                    <p className="mt-1.5 text-sm text-ink-soft">
                      <PriceDisplay
                        price={line.kind === "product" ? line.product.price : line.setting.price}
                        size="sm"
                        compact
                      />{" "}
                      each
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {line && <PriceDisplay price={line.lineTotal} size="md" />}
                  <div className="inline-flex items-center border border-ivory-dim">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink"
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="min-w-10 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="flex h-9 w-9 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink disabled:opacity-40"
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.key);
                      toast(`Removed ${item.title}`, "info");
                    }}
                    className="font-sans text-xs text-ink-soft underline-offset-4 hover:text-wine hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <aside aria-label="Order summary" className="h-fit border border-ivory-dim bg-ivory-deep p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-h3 text-ink">Order Summary</h2>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm text-ink-soft">Subtotal</span>
            {quote ? (
              <PriceDisplay price={quote.total} size="lg" />
            ) : quoteError ? (
              <Button size="sm" variant="outline" onClick={refreshQuote}>
                Retry
              </Button>
            ) : (
              <span className="text-sm text-ink-soft" aria-busy={quoteLoading}>
                Calculating…
              </span>
            )}
          </div>

          {quoteError && (
            <p role="alert" className="mt-3 text-xs text-danger">
              {quoteError.message}
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Prices are confirmed by our server before any order is placed. Shipping and taxes are
            calculated at checkout. This preview does not process payments.
          </p>

          <Button
            fullWidth
            size="lg"
            className="mt-5"
            disabled={!quote || quoteLoading || Boolean(quoteError)}
          >
            Proceed to Checkout
          </Button>

          <Link
            to="/diamonds/natural"
            className="mt-4 block text-center font-sans text-sm text-wine underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
