import { findProduct, queryCatalog } from "./domain/catalog.js";
import { catalogQuerySchema } from "./domain/schemas.js";
import { SEED_GENERATED_AT, SEED_PRODUCTS } from "./data/seed.js";

/**
 * Cloudflare Worker entry point.
 *
 * The same domain logic that powers the local Express dev server
 * (`src/app.ts` + `src/routes/catalog.routes.ts`) is exposed here as a fetch
 * handler so the site can run on Cloudflare Workers:
 *
 *  - `/api/*`  → catalog / product / search / home / health JSON, with the
 *                exact response shapes the client expects.
 *  - anything else → the built React client from `client/dist`, served via the
 *                static-assets binding (see `wrangler.jsonc`). The assets
 *                config uses a single-page-application fallback so client-side
 *                routes such as `/products/:slug` render the app shell.
 *
 * The Express server remains for local development; this Worker is the
 * production runtime on Cloudflare. Both read from the shared domain layer.
 */

interface Env {
  /** Static-assets binding for the built client (`client/dist`). */
  ASSETS: { fetch(request: Request): Promise<Response> };
}

/** Same disclosure metadata the Express API returns on every payload. */
const datasetMeta = {
  dataSource: "development-seed" as const,
  generatedAt: SEED_GENERATED_AT,
  notice: "Development preview catalog. Not verified inventory.",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Route an `/api/*` request to the matching handler. */
function handleApi(request: Request, pathname: string): Response {
  const url = new URL(request.url);

  if (pathname === "/api/health") {
    return json({ status: "ok", service: "evarenne-api" });
  }

  if (pathname === "/api/catalog") {
    // The client sends arrays as comma-joined params and numbers as strings;
    // the schema coerces both, exactly as it does for Express's `req.query`.
    const parsed = catalogQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return json(
        {
          error: "Invalid catalog query",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }
    const result = queryCatalog(SEED_PRODUCTS, parsed.data);
    return json({ ...result, ...datasetMeta });
  }

  if (pathname.startsWith("/api/products/")) {
    const slugOrId = decodeURIComponent(pathname.slice("/api/products/".length));
    const product = findProduct(SEED_PRODUCTS, slugOrId);
    if (!product) {
      return json({ error: "Product not found" }, 404);
    }
    return json({ product, ...datasetMeta });
  }

  if (pathname === "/api/search") {
    const raw = url.searchParams.get("q");
    const q = raw ? raw.slice(0, 200) : "";
    if (!q.trim()) {
      return json({ items: [], total: 0, q, ...datasetMeta });
    }
    const result = queryCatalog(SEED_PRODUCTS, { q, pageSize: 8, sort: "relevance" });
    return json({ items: result.items, total: result.total, q, ...datasetMeta });
  }

  if (pathname === "/api/home") {
    const featured = SEED_PRODUCTS.filter((p) => p.featured === true);
    return json({
      featured,
      counts: { diamonds: SEED_PRODUCTS.filter((p) => p.kind === "diamond").length },
      ...datasetMeta,
    });
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/api")) {
      return handleApi(request, pathname);
    }

    // Non-API requests: serve the built client. The assets binding applies the
    // single-page-application fallback for unknown paths, so client routes
    // always get the app shell.
    return env.ASSETS.fetch(request);
  },
};
