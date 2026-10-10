import type { ReactNode } from "react";
import {
  CartContext,
  WishlistContext,
  useCartState,
  useWishlistState,
} from "./cart";

/**
 * Provider components for cart and wishlist state.
 *
 * All hooks and context objects live in ./cart (a non-component module) so
 * this file exports only components and fast-refresh stays intact.
 */

export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartState();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const value = useWishlistState();
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
