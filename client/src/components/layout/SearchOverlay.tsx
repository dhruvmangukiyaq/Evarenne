import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClickOutside, useEscapeKey, useFocusTrap, useLockBodyScroll } from "../../lib/a11y";
import { useApi } from "../../lib/useApi";
import { api } from "../../lib/api";
import { useDebounced } from "../../lib/a11y";
import { ProductArt } from "../catalog/ProductArt";
import { shapeLabel } from "../../lib/labels";

/**
 * Search overlay: queries the real catalog API with a debounce, announces
 * result counts politely, and degrades to a clear error message.
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useFocusTrap(open);
  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  const debounced = useDebounced(term, 250);

  const { data, loading, error } = useApi(
    (signal) => {
      void signal;
      return api.search(debounced);
    },
    [debounced],
  );

  // Clear the query when reopened — adjusted during render (React's
  // "adjusting state when a prop changes" pattern), not in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setTerm("");
  }

  useClickOutside(open, panelRef, onClose);

  if (!open) return null;

  const results = debounced.trim() ? data?.items ?? [] : [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="fixed inset-0 z-(--z-overlay)">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-charcoal/55 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Evarenne"
        className="relative mx-auto mt-0 max-h-[100dvh] w-full max-w-2xl overflow-y-auto scroll-slim bg-ivory shadow-overlay sm:mt-24"
      >
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-ivory-dim px-5 py-4">
          <span aria-hidden="true" className="text-charcoal-soft">
            ⌕
          </span>
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search diamonds by shape, cut or carat…"
            aria-label="Search products"
            autoComplete="off"
            className="h-12 flex-1 bg-transparent text-base text-charcoal placeholder:text-charcoal-faint focus:outline-none"
          />
          <button
            type="submit"
            className="font-sans text-sm font-medium text-olive underline-offset-4 hover:underline"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-9 w-9 items-center justify-center text-xl text-charcoal-soft hover:text-olive"
          >
            <span aria-hidden="true">×</span>
          </button>
        </form>

        <div className="px-5 py-4" aria-live="polite">
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}

          {loading && debounced.trim() && (
            <p className="text-sm text-charcoal-soft" aria-busy="true">
              Searching…
            </p>
          )}

          {!loading && debounced.trim() && !error && results.length === 0 && (
            <p className="text-sm text-charcoal-soft">
              No results for “{debounced.trim()}”. Try a shape (oval), style (solitaire), or SKU.
            </p>
          )}

          {results.length > 0 && (
            <>
              <p className="mb-3 text-xs tracking-wide text-charcoal-soft uppercase">
                {data?.total ?? results.length} result{results.length === 1 ? "" : "s"}
              </p>
              <ul className="flex flex-col divide-y divide-ivory-dim">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 transition-colors hover:bg-ivory-deep/60"
                    >
                      <ProductArt product={product} className="h-14 w-14 shrink-0 border border-ivory-dim" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-charcoal">{product.name}</span>
                        <span className="block text-xs text-charcoal-soft">
                          {product.shape ? `${shapeLabel(product.shape)} · ` : ""}
                          {product.specs ? `${product.specs.carat.toFixed(2)} ct · ` : ""}
                          {product.sku}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/search?q=${encodeURIComponent(debounced.trim())}`);
                }}
                className="mt-4 font-sans text-sm font-medium text-olive underline-offset-4 hover:underline"
              >
                See all results →
              </button>
            </>
          )}

          {!debounced.trim() && (
            <p className="text-sm text-charcoal-soft">
              Search by product name, shape, style, or SKU — for example “oval”, “pavé”, or “EVN-RD-100”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
