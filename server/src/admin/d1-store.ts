/**
 * Cloudflare-backed stores: D1 for admin products, R2 for uploaded media.
 *
 * The structural types below describe only the slice of the D1 and R2 APIs we
 * use, so this file typechecks without `@cloudflare/workers-types` and stays
 * assignable from the real bindings in `worker.ts`.
 */

import type { Product } from "../domain/types.js";
import type { ProductStore } from "./store.js";
import { MEDIA_CACHE_CONTROL, type MediaObject, type MediaStore, isSafeMediaKey } from "./media.js";

/* ---------------- Structural Cloudflare types ---------------- */

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
  first<T = unknown>(): Promise<T | null>;
}

export interface D1Like {
  prepare(sql: string): D1Statement;
}

interface R2ObjectBody {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
  size: number;
}

export interface R2Like {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
}

export const MEDIA_CACHE_HEADER = MEDIA_CACHE_CONTROL;

/* ---------------- D1 ---------------- */

interface AdminRow {
  id: string;
  slug: string;
  data: string;
}

function parseRow(row: AdminRow): Product | null {
  try {
    return JSON.parse(row.data) as Product;
  } catch {
    // A single unreadable row must never take the public catalogue down.
    console.error(`admin_products row ${row.id} could not be parsed; skipping`);
    return null;
  }
}

export class D1ProductStore implements ProductStore {
  readonly #db: D1Like;

  constructor(db: D1Like) {
    this.#db = db;
  }

  async list(): Promise<Product[]> {
    const result = await this.#db
      .prepare("SELECT data FROM admin_products ORDER BY created_at DESC, id ASC")
      .all<AdminRow>();
    return result.results.map(parseRow).filter((p): p is Product => p !== null);
  }

  async getById(id: string): Promise<Product | null> {
    const row = await this.#db
      .prepare("SELECT data FROM admin_products WHERE id = ?")
      .bind(id)
      .first<AdminRow>();
    return row ? parseRow(row) : null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const row = await this.#db
      .prepare("SELECT data FROM admin_products WHERE slug = ?")
      .bind(slug)
      .first<AdminRow>();
    return row ? parseRow(row) : null;
  }

  async save(product: Product): Promise<void> {
    const now = new Date().toISOString();
    const existing = await this.#db
      .prepare("SELECT id FROM admin_products WHERE id = ?")
      .bind(product.id)
      .first<{ id: string }>();
    const data = JSON.stringify(product);

    if (existing) {
      await this.#db
        .prepare("UPDATE admin_products SET slug = ?, data = ?, updated_at = ? WHERE id = ?")
        .bind(product.slug, data, now, product.id)
        .run();
      return;
    }

    await this.#db
      .prepare(
        "INSERT INTO admin_products (id, slug, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(product.id, product.slug, data, product.createdAt || now, now)
      .run();
  }

  async remove(id: string): Promise<boolean> {
    const existing = await this.#db
      .prepare("SELECT id FROM admin_products WHERE id = ?")
      .bind(id)
      .first<{ id: string }>();
    if (!existing) return false;
    await this.#db.prepare("DELETE FROM admin_products WHERE id = ?").bind(id).run();
    return true;
  }
}

/* ---------------- R2 ---------------- */

export class R2MediaStore implements MediaStore {
  readonly #bucket: R2Like;

  constructor(bucket: R2Like) {
    this.#bucket = bucket;
  }

  async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    await this.#bucket.put(key, bytes, { httpMetadata: { contentType } });
  }

  async get(key: string): Promise<MediaObject | null> {
    if (!isSafeMediaKey(key)) return null;
    const object = await this.#bucket.get(key);
    if (!object) return null;
    return {
      bytes: new Uint8Array(await object.arrayBuffer()),
      contentType: object.httpMetadata?.contentType ?? null,
    };
  }
}
