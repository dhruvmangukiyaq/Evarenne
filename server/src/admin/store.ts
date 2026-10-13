/**
 * Persistence for catalogue entries added through the admin panel.
 *
 * The bundled development seed (`data/seed.ts`) stays in code; admin-created
 * products live behind this interface so the two runtimes can back it with
 * different storage:
 *
 *  - Express (local dev) → `file-stores.ts` (a JSON file on disk)
 *  - Cloudflare Worker   → `d1-stores.ts`  (a D1 database)
 *
 * Nothing in here touches Node or Cloudflare APIs, so it is safe to import
 * from either runtime.
 */

import type { Product } from "../domain/types.js";
import { SEED_PRODUCTS } from "../data/seed.js";

export interface ProductStore {
  /** Every admin-created product, newest first. */
  list(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  /** Creates or replaces the product with the same id. */
  save(product: Product): Promise<void>;
  /** Returns false when there was nothing to delete. */
  remove(id: string): Promise<boolean>;
}

/**
 * Merges admin-created products ahead of the bundled seed.
 *
 * Lab-grown only: any stored record that is not lab-grown (a listing saved
 * before the natural line was dropped) never reaches the public catalogue.
 * It is still listed in the admin panel, where it can be deleted.
 */
export function withSeedProducts(adminProducts: Product[]): Product[] {
  const visible = adminProducts.filter((product) => product.diamondType === "lab-grown");
  return visible.length > 0 ? [...visible, ...SEED_PRODUCTS] : SEED_PRODUCTS;
}

/** In-memory store: used by tests and as a safe fallback when no store is bound. */
export class MemoryProductStore implements ProductStore {
  readonly #items = new Map<string, Product>();

  constructor(seed: Product[] = []) {
    for (const product of seed) this.#items.set(product.id, product);
  }

  async list(): Promise<Product[]> {
    return [...this.#items.values()];
  }

  async getById(id: string): Promise<Product | null> {
    return this.#items.get(id) ?? null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    for (const product of this.#items.values()) {
      if (product.slug === slug) return product;
    }
    return null;
  }

  async save(product: Product): Promise<void> {
    this.#items.set(product.id, product);
  }

  async remove(id: string): Promise<boolean> {
    return this.#items.delete(id);
  }
}
