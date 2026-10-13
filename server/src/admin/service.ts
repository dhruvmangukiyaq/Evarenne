/**
 * Admin product service: turns validated form input into a full `Product`,
 * enforcing the invariants the HTTP layer cannot see — unique slug and SKU
 * against both the bundled seed and other admin entries, and the fields the
 * server owns (id, price, createdAt, dataSource) never coming from a client.
 *
 * Runtime-agnostic: it takes a `ProductStore`, so Express and the Worker share
 * one implementation exactly as they share the domain query layer.
 */

import {
  adminProductInputSchema,
  productSchema,
  type AdminProductInput,
} from "../domain/schemas.js";
import type { Product, ProductImage } from "../domain/types.js";
import { SEED_PRODUCTS } from "../data/seed.js";
import type { ProductStore } from "./store.js";

/** Thrown for domain-level rejections; the HTTP layer maps it to a status. */
export class AdminError extends Error {
  readonly status: number;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(status: number, message: string, issues: Array<{ path: string; message: string }> = []) {
    super(message);
    this.name = "AdminError";
    this.status = status;
    this.issues = issues;
  }
}

/** `Natural Oval 1.50ct VVS1` → `natural-oval-1-50ct-vvs1`. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** `ADM-` + 6 uppercase hex chars; collision-checked below before use. */
function randomSku(): string {
  const hex = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `ADM-${hex}`;
}

async function isSlugTaken(store: ProductStore, slug: string, exceptId?: string): Promise<boolean> {
  if (SEED_PRODUCTS.some((p) => p.slug === slug)) return true;
  const existing = await store.getBySlug(slug);
  return existing !== null && existing.id !== exceptId;
}

async function isSkuTaken(store: ProductStore, sku: string, exceptId?: string): Promise<boolean> {
  if (SEED_PRODUCTS.some((p) => p.sku === sku)) return true;
  const products = await store.list();
  return products.some((p) => p.sku === sku && p.id !== exceptId);
}

/**
 * Resolves the slug: an explicit one must be free, otherwise the name is
 * slugified and `-2`, `-3`, … appended until unique.
 */
async function resolveSlug(
  store: ProductStore,
  input: AdminProductInput,
  exceptId?: string,
): Promise<string> {
  if (input.slug) {
    if (await isSlugTaken(store, input.slug, exceptId)) {
      throw new AdminError(409, `A product with the slug "${input.slug}" already exists`, [
        { path: "slug", message: "Slug is already in use" },
      ]);
    }
    return input.slug;
  }

  const base = slugify(input.name) || "diamond";
  if (!(await isSlugTaken(store, base, exceptId))) return base;

  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await isSlugTaken(store, candidate, exceptId))) return candidate;
  }
  throw new AdminError(409, "Could not derive a unique slug from the product name");
}

/** SKU: an explicit one must be free, otherwise a random unique one is minted. */
async function resolveSku(
  store: ProductStore,
  input: AdminProductInput,
  exceptId?: string,
): Promise<string> {
  if (input.sku) {
    if (await isSkuTaken(store, input.sku, exceptId)) {
      throw new AdminError(409, `A product with the SKU "${input.sku}" already exists`, [
        { path: "sku", message: "SKU is already in use" },
      ]);
    }
    return input.sku;
  }

  for (let n = 0; n < 50; n += 1) {
    const candidate = randomSku();
    if (!(await isSkuTaken(store, candidate, exceptId))) return candidate;
  }
  throw new AdminError(409, "Could not derive a unique SKU");
}

/** Parses the form payload or raises a 400 carrying zod's issue list. */
function parseInput(payload: unknown): AdminProductInput {
  const parsed = adminProductInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AdminError(
      400,
      "Some fields need attention before this diamond can be saved",
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return parsed.data;
}

/**
 * Builds the storable product. `existing` is passed on update so the id,
 * createdAt and — crucially — the slug/sku survive an edit: a slug is a URL
 * other people may already hold, so it only changes when the form explicitly
 * overrides it, never as a side effect of renaming a stone. The final object
 * still goes through `productSchema`, so what we persist is exactly what the
 * public API serves.
 */
async function build(
  store: ProductStore,
  payload: unknown,
  existing?: Product,
): Promise<Product> {
  const input = parseInput(payload);

  const candidate: Product = {
    id: existing?.id ?? crypto.randomUUID(),
    slug:
      existing && !input.slug
        ? existing.slug
        : await resolveSlug(store, input, existing?.id),
    sku: existing && !input.sku ? existing.sku : await resolveSku(store, input, existing?.id),
    name: input.name,
    kind: "diamond",
    category: "loose-diamond",
    description: input.description,
    // The catalogue is view-only: no price is collected or shown anywhere, so
    // admin entries carry a zero amount to satisfy the shared money shape.
    price: existing?.price ?? { amount: 0, currency: "USD" },
    dataSource: "admin",
    images: input.images as ProductImage[],
    video: input.video ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    diamondType: input.diamondType,
    shape: input.shape,
    specs: {
      ...input.specs,
      lab: input.specs.lab ?? null,
      certificateNumber: input.specs.certificateNumber ?? null,
      certificateUrl: input.specs.certificateUrl ?? null,
    },
    featured: input.featured,
  };

  const validated = productSchema.safeParse(candidate);
  if (!validated.success) {
    throw new AdminError(
      400,
      "Some fields need attention before this diamond can be saved",
      validated.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return validated.data as Product;
}

export interface AdminDeps {
  store: ProductStore;
}

export async function listProducts(deps: AdminDeps): Promise<Product[]> {
  return deps.store.list();
}

export async function createProduct(deps: AdminDeps, payload: unknown): Promise<Product> {
  const product = await build(deps.store, payload);
  await deps.store.save(product);
  return product;
}

export async function updateProduct(
  deps: AdminDeps,
  id: string,
  payload: unknown,
): Promise<Product> {
  const existing = await deps.store.getById(id);
  if (!existing) {
    throw new AdminError(404, "That product no longer exists");
  }
  const product = await build(deps.store, payload, existing);
  await deps.store.save(product);
  return product;
}

export async function deleteProduct(deps: AdminDeps, id: string): Promise<void> {
  const removed = await deps.store.remove(id);
  if (!removed) throw new AdminError(404, "That product no longer exists");
}
