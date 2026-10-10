import { Link, useNavigate } from "react-router-dom";
import { Drawer } from "../ui/Overlay";
import { Button } from "../ui/Button";
import { PriceDisplay } from "../ui/Display";
import { useCart } from "../../store/cart";
import { EmptyState } from "../ui/Display";

/**
 * Cart drawer: line items come from local state, but every price and the
 * total come from the server quote — never computed in the browser.
 */
export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, quote, quoteLoading, quoteError, count, setQuantity, removeItem, refreshQuote } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Your Bag (${count})`}
      widthClassName="w-full max-w-md"
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-sm text-ink-soft">Subtotal</span>
              {quote ? (
                <PriceDisplay price={quote.total} size="lg" />
              ) : quoteError ? (
                <button
                  type="button"
                  onClick={refreshQuote}
                  className="font-sans text-sm text-wine underline underline-offset-4"
                >
                  Recalculate
                </button>
              ) : (
                <span className="text-sm text-ink-soft" aria-busy={quoteLoading}>
                  Calculating…
                </span>
              )}
            </div>

            {quoteError && (
              <p role="alert" className="text-xs text-danger">
                {quoteError.message}
              </p>
            )}

            <p className="text-xs text-ink-soft">
              Taxes and shipping are calculated at checkout. Prices are confirmed by our server before
              any order is placed.
            </p>

            <Button
              fullWidth
              size="lg"
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
            >
              Review Bag & Checkout
            </Button>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="Your bag is empty"
          description="Explore natural and lab-grown diamonds, or start with a setting."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  onClose();
                  navigate("/diamonds/natural");
                }}
              >
                Browse Diamonds
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate("/create-your-ring");
                }}
              >
                Create a Ring
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-ivory-dim">
          {items.map((item) => {
            const line = quote?.lines.find((l) =>
              l.kind === "product" ? l.product.id === item.productId : l.setting.id === item.settingId && l.diamond.id === item.diamondId,
            );
            return (
              <li key={item.key} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.productId && (
                      <Link
                        to={`/products/${item.productId}`}
                        onClick={onClose}
                        className="text-sm font-medium text-ink underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                    )}
                    {!item.productId && <p className="text-sm font-medium text-ink">{item.title}</p>}
                    {item.subtitle && <p className="mt-0.5 text-xs text-ink-soft">{item.subtitle}</p>}
                    {line && (
                      <p className="mt-1 text-xs text-ink-soft">
                        <PriceDisplay price={line.kind === "product" ? line.product.price : line.setting.price} size="sm" compact /> each
                      </p>
                    )}
                  </div>
                  {line && <PriceDisplay price={line.lineTotal} size="sm" />}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-ivory-dim">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink"
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="min-w-10 text-center text-sm tabular-nums" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft hover:bg-ivory-deep hover:text-ink disabled:opacity-40"
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="font-sans text-xs text-ink-soft underline-offset-4 hover:text-wine hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
