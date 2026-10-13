import { Router } from "express";
import { findProduct, queryCatalog } from "../domain/catalog.js";
import { catalogQuerySchema } from "../domain/schemas.js";
import { SEED_GENERATED_AT, SEED_PRODUCTS } from "../data/seed.js";

/**
 * Catalog API — served from the development seed dataset.
 * Every response includes `dataSource` metadata so clients can surface the
 * "sample data" disclosure honestly.
 */

export const catalogRouter = Router();

const datasetMeta = {
  dataSource: "development-seed" as const,
  generatedAt: SEED_GENERATED_AT,
  notice: "Development preview catalog. Not verified inventory.",
};

catalogRouter.get("/catalog", (req, res) => {
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

  const result = queryCatalog(SEED_PRODUCTS, parsed.data);
  res.json({ ...result, ...datasetMeta });
});

catalogRouter.get("/products/:slugOrId", (req, res) => {
  const product = findProduct(SEED_PRODUCTS, req.params.slugOrId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product, ...datasetMeta });
});

catalogRouter.get("/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.slice(0, 200) : "";
  if (!q.trim()) {
    res.json({ items: [], total: 0, q, ...datasetMeta });
    return;
  }
  const result = queryCatalog(SEED_PRODUCTS, { q, pageSize: 8, sort: "relevance" });
  res.json({ items: result.items, total: result.total, q, ...datasetMeta });
});

catalogRouter.get("/home", (_req, res) => {
  const featured = SEED_PRODUCTS.filter((p) => p.featured === true);
  res.json({
    featured,
    counts: {
      diamonds: SEED_PRODUCTS.filter((p) => p.kind === "diamond").length,
    },
    ...datasetMeta,
  });
});
