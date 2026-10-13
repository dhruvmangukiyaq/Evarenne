import { Router } from "express";
import { findProduct, queryCatalog } from "../domain/catalog.js";
import { catalogQuerySchema } from "../domain/schemas.js";
import { SEED_GENERATED_AT } from "../data/seed.js";
import { withSeedProducts, type ProductStore } from "../admin/store.js";

/**
 * Catalog API — the bundled development seed merged with whatever the admin
 * panel has added (read from the store on each request, so a diamond saved a
 * second ago is already visible).
 *
 * Every response includes `dataSource` metadata so clients can surface the
 * "sample data" disclosure honestly; the per-product `dataSource` field is what
 * decides whether an individual card shows the badge.
 */

/** Same disclosure metadata the Worker returns on every payload. */
export const datasetMeta = {
  dataSource: "development-seed" as const,
  generatedAt: SEED_GENERATED_AT,
  notice: "Development preview catalog. Not verified inventory.",
};

export function createCatalogRouter(store: ProductStore): Router {
  const router = Router();

  router.get("/catalog", async (req, res, next) => {
    try {
      const parsed = catalogQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid catalog query",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      const products = withSeedProducts(await store.list());
      const result = queryCatalog(products, parsed.data);
      res.json({ ...result, ...datasetMeta });
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/:slugOrId", async (req, res, next) => {
    try {
      const products = withSeedProducts(await store.list());
      const product = findProduct(products, req.params.slugOrId);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json({ product, ...datasetMeta });
    } catch (error) {
      next(error);
    }
  });

  router.get("/search", async (req, res, next) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.slice(0, 200) : "";
      if (!q.trim()) {
        res.json({ items: [], total: 0, q, ...datasetMeta });
        return;
      }
      const products = withSeedProducts(await store.list());
      const result = queryCatalog(products, { q, pageSize: 8, sort: "relevance" });
      res.json({ items: result.items, total: result.total, q, ...datasetMeta });
    } catch (error) {
      next(error);
    }
  });

  router.get("/home", async (_req, res, next) => {
    try {
      const products = withSeedProducts(await store.list());
      res.json({
        featured: products.filter((p) => p.featured === true),
        counts: {
          diamonds: products.filter((p) => p.kind === "diamond").length,
        },
        ...datasetMeta,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
