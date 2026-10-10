import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import type { Money, QuoteResponse } from "../lib/api-types";

/**
 * CART — client-persisted line items, server-priced totals.
 *
 * The browser stores only *what* the user picked (product ids / ring
 * configuration + quantity). Every price shown in the cart comes from
 * POST /api/pricing/quote; the client never computes or trusts its own total.
 * On checkout the same quote is re-validated server-side (Phase 7).
 *
 * This module holds no components so that fast-refresh stays intact; the
 * provider component lives in commerce.tsx.
 */

export interface CartItem {
  /** Stable per-line key. */
  key: string;
  productId?: string;
  /** Ring builder configuration line. */
  settingId?: string;
  diamondId?: string;
  /** Human-readable summary captured for display before the quote returns. */
  title: string;
  subtitle?: string;
  quantity: number;
}

const STORAGE_KEY = "evarenne.cart.v1";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).key === "string" &&
        typeof (item as CartItem).title === "string" &&
        typeof (item as CartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export interface CartContextValue {
  items: CartItem[];
  /** Live server quote for current items; null while loading or on error. */
  quote: QuoteResponse | null;
  quoteLoading: boolean;
  quoteError: ApiError | null;
  count: number;
  addProduct: (
    product: { id: string; name: string; subtitle?: string; sku: string },
    quantity?: number,
  ) => void;
  addConfiguredRing: (
    config: { settingId: string; diamondId: string; settingName: string; diamondName: string },
    quantity?: number,
  ) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  refreshQuote: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function useCartState(): CartContextValue {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  // Start in the loading state whenever a basket already exists (e.g. a
  // refresh with persisted items) so a stale total is never shown.
  const [quoteLoading, setQuoteLoading] = useState(() => loadCart().length > 0);
  const [quoteError, setQuoteError] = useState<ApiError | null>(null);
  const [quoteVersion, setQuoteVersion] = useState(0);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isEmpty = items.length === 0;
  // Serialise the basket into a stable dependency for the pricing effect.
  const itemsKey = JSON.stringify(items);

  // Re-quote whenever the basket changes. The effect only kicks off async
  // work; state updates happen in the promise callbacks (allowed), never
  // synchronously in the effect body. Emptying the basket simply leaves the
  // last quote untouched — callers gate on `isEmpty`.
  useEffect(() => {
    if (isEmpty) return;
    const controller = new AbortController();
    const parsed = JSON.parse(itemsKey) as CartItem[];

    api
      .quote(
        parsed.map((item) => ({
          productId: item.productId,
          settingId: item.settingId,
          diamondId: item.diamondId,
          quantity: item.quantity,
        })),
      )
      .then((result) => {
        if (!controller.signal.aborted) {
          setQuote(result);
          setQuoteLoading(false);
          setQuoteError(null);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setQuoteError(
            error instanceof ApiError ? error : new ApiError(0, "Could not price your bag."),
          );
          setQuoteLoading(false);
        }
      });

    return () => controller.abort();
  }, [itemsKey, isEmpty, quoteVersion]);

  const addProduct = useCallback(
    (
      product: { id: string; name: string; subtitle?: string; sku: string },
      quantity = 1,
    ) => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) =>
            item.key === existing.key ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [
          ...current,
          {
            key: `p:${product.id}`,
            productId: product.id,
            title: product.name,
            subtitle: product.subtitle,
            quantity,
          },
        ];
      });
    },
    [],
  );

  const addConfiguredRing = useCallback(
    (
      config: { settingId: string; diamondId: string; settingName: string; diamondName: string },
      quantity = 1,
    ) => {
      setItems((current) => {
        const key = `r:${config.settingId}:${config.diamondId}`;
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) =>
            item.key === existing.key ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [
          ...current,
          {
            key,
            settingId: config.settingId,
            diamondId: config.diamondId,
            title: `${config.settingName} + ${config.diamondName}`,
            subtitle: "Custom ring configuration",
            quantity,
          },
        ];
      });
    },
    [],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) =>
            item.key === key ? { ...item, quantity: Math.min(quantity, 10) } : item,
          ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const refreshQuote = useCallback(() => setQuoteVersion((v) => v + 1), []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return useMemo<CartContextValue>(
    () => ({
      items,
      quote,
      quoteLoading,
      quoteError,
      count,
      addProduct,
      addConfiguredRing,
      setQuantity,
      removeItem,
      clear,
      refreshQuote,
    }),
    [
      items,
      quote,
      quoteLoading,
      quoteError,
      count,
      addProduct,
      addConfiguredRing,
      setQuantity,
      removeItem,
      clear,
      refreshQuote,
    ],
  );
}

export { CartContext };

/* ---------------- Wishlist ---------------- */

const WISHLIST_KEY = "evarenne.wishlist.v1";

export interface WishlistEntry {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: Money;
  category: string;
  shape?: string;
  addedAt: string;
}

export interface WishlistContextValue {
  entries: WishlistEntry[];
  has: (id: string) => boolean;
  toggle: (entry: Omit<WishlistEntry, "addedAt">) => void;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

function loadWishlist(): WishlistEntry[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishlistEntry[]) : [];
  } catch {
    return [];
  }
}

export function useWishlistState(): WishlistContextValue {
  const [entries, setEntries] = useState<WishlistEntry[]>(() => loadWishlist());

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(entries));
  }, [entries]);

  const has = useCallback((id: string) => entries.some((entry) => entry.id === id), [entries]);

  const toggle = useCallback((entry: Omit<WishlistEntry, "addedAt">) => {
    setEntries((current) => {
      if (current.some((existing) => existing.id === entry.id)) {
        return current.filter((existing) => existing.id !== entry.id);
      }
      return [...current, { ...entry, addedAt: new Date().toISOString() }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return useMemo(() => ({ entries, has, toggle, remove }), [entries, has, toggle, remove]);
}

export { WishlistContext };
