/**
 * Filesystem-backed stores for the local Express dev server: admin products in
 * a JSON file, uploads in a sibling directory. Both live outside `src/` (and
 * outside the compiled `dist/`) so runtime data never mixes with source, and
 * both are gitignored.
 *
 * Same `ProductStore` / `MediaStore` contracts the Cloudflare-backed adapters
 * implement, so nothing else in the app knows which runtime it is running on.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Product } from "../domain/types.js";
import type { ProductStore } from "./store.js";
import { type MediaObject, type MediaStore, isSafeMediaKey } from "./media.js";

/**
 * Resolved from this module's own URL so the path is identical under `tsx watch`
 * (server/src/admin) and the compiled build (server/dist/admin).
 */
const SERVER_ROOT = fileURLToPath(new URL("../../", import.meta.url));

export const ADMIN_DATA_FILE = path.join(SERVER_ROOT, "data", "admin-products.json");
export const UPLOAD_DIR = path.join(SERVER_ROOT, "uploads");

/* ---------------- Products ---------------- */

export class FileProductStore implements ProductStore {
  readonly #file: string;
  /** Serialises read-modify-write cycles; a single admin is never concurrent. */
  #queue: Promise<unknown> = Promise.resolve();

  constructor(file: string = ADMIN_DATA_FILE) {
    this.#file = file;
  }

  async #read(): Promise<Product[]> {
    let raw: string;
    try {
      raw = await fs.readFile(this.#file, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Product[]) : [];
    } catch {
      console.error(`admin data file ${this.#file} is not valid JSON; treating as empty`);
      return [];
    }
  }

  async #write(products: Product[]): Promise<void> {
    await fs.mkdir(path.dirname(this.#file), { recursive: true });
    const tmp = `${this.#file}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(products, null, 2)}\n`, "utf8");
    await fs.rename(tmp, this.#file);
  }

  #mutate<T>(fn: (products: Product[]) => Promise<T>): Promise<T> {
    const next = this.#queue.then(() => this.#read().then(fn));
    // Keep the chain alive after a failure so one bad write cannot wedge it.
    this.#queue = next.catch(() => undefined);
    return next;
  }

  async list(): Promise<Product[]> {
    const products = await this.#read();
    return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getById(id: string): Promise<Product | null> {
    return (await this.#read()).find((p) => p.id === id) ?? null;
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return (await this.#read()).find((p) => p.slug === slug) ?? null;
  }

  async save(product: Product): Promise<void> {
    await this.#mutate(async (products) => {
      const index = products.findIndex((p) => p.id === product.id);
      if (index === -1) products.unshift(product);
      else products[index] = product;
      await this.#write(products);
    });
  }

  async remove(id: string): Promise<boolean> {
    return this.#mutate(async (products) => {
      const next = products.filter((p) => p.id !== id);
      if (next.length === products.length) return false;
      await this.#write(next);
      return true;
    });
  }
}

/* ---------------- Media ---------------- */

export class FileMediaStore implements MediaStore {
  readonly #dir: string;

  constructor(dir: string = UPLOAD_DIR) {
    this.#dir = dir;
  }

  /** Rejects anything that could escape the uploads directory. */
  #resolve(key: string): string | null {
    if (!isSafeMediaKey(key)) return null;
    return path.join(this.#dir, key);
  }

  async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    const target = this.#resolve(key);
    if (!target) throw new Error("Unsafe media key");
    await fs.mkdir(this.#dir, { recursive: true });
    await Promise.all([
      fs.writeFile(target, bytes),
      fs.writeFile(`${target}.type`, contentType, "utf8"),
    ]);
  }

  async get(key: string): Promise<MediaObject | null> {
    const target = this.#resolve(key);
    if (!target) return null;
    try {
      const [bytes, contentType] = await Promise.all([
        fs.readFile(target),
        fs.readFile(`${target}.type`, "utf8").catch(() => null),
      ]);
      return { bytes, contentType };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
}
