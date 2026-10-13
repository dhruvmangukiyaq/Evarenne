import { findProduct, queryCatalog } from "./domain/catalog.js";
import { catalogQuerySchema } from "./domain/schemas.js";
import { SEED_GENERATED_AT } from "./data/seed.js";
import { handleAdminApi, type AdminApiDeps } from "./admin/api.js";
import { D1ProductStore, R2MediaStore, type D1Like, type R2Like } from "./admin/d1-store.js";
import { withSeedProducts, type ProductStore } from "./admin/store.js";

/**
 * Cloudflare Worker entry point.
 *
 * The same domain logic that powers the local Express dev server
 * (`src/app.ts` + `src/routes/*.routes.ts`) is exposed here as a fetch
 * handler so the site can run on Cloudflare Workers:
 *
 *  - `/api/admin/*` + `/api/media/*` → the shared admin router: password
 *    login, diamond CRUD, photo/video upload and public media serving.
 *  - `/api/*`  → catalog / product / search / home / health JSON, with the
 *                exact response shapes the client expects. The bundled seed is
 *    merged with whatever the admin panel has stored in D1, so a
 *    diamond saved a moment ago is immediately visible to visitors.
 *  - anything else → the built React client from `client/dist`, served via the
 *                static-assets binding (see `wrangler.jsonc`). The assets
 *                config uses a single-page-application fallback so client-side
 *                routes such as `/products/:slug` render the app shell.
 *
 * The Express server remains for local development; this Worker is the
 * production runtime on Cloudflare. Both read from the shared domain layer —
 * including the admin API itself, which is one implementation, not two.
 *
 * Bindings (see `wrangler.jsonc`):
 *   DB      → D1 database holding admin-added products
 *   MEDIA   → R2 bucket holding uploaded photos and video (optional until R2
 *             is enabled; admin uploads then answer 503 with a clear message)
 *   ADMIN_PASSWORD / SESSION_SECRET → secrets, set with `wrangler secret put`
 */

interface Env {
  /** Static-assets binding for the built client (`client/dist`). */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** D1 database (`evarenne-admin`). */
  DB?: D1Like;
  /** R2 bucket for admin uploads. Absent until R2 is enabled on the account. */
  MEDIA?: R2Like;
  /** Admin panel password. Required for login; unset means admin is disabled. */
  ADMIN_PASSWORD?: string;
  /** Optional session signing secret; falls back to the admin password. */
  SESSION_SECRET?: string;
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

function buildDeps(env: Env): AdminApiDeps {
  return {
    store: env.DB ? new D1ProductStore(env.DB) : null,
    media: env.MEDIA ? new R2MediaStore(env.MEDIA) : null,
    password: env.ADMIN_PASSWORD ?? "",
    sessionSecret: env.SESSION_SECRET,
  };
}

/** The catalogue: bundled seed plus anything stored in D1. */
async function catalogProducts(store: ProductStore | null): Promise<ReturnType<typeof withSeedProducts>> {
  return withSeedProducts(store ? await store.list() : []);
}

/** Route an `/api/*` request to the matching handler. */
async function handleApi(request: Request, pathname: string, env: Env): Promise<Response> {
  const deps = buildDeps(env);

  // Admin + media: one shared implementation, identical to Express.
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/media")) {
    return handleAdminApi(request, deps);
  }

  const url = new URL(request.url);
  const products = await catalogProducts(deps.store);

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
    const result = queryCatalog(products, parsed.data);
    return json({ ...result, ...datasetMeta });
  }

  if (pathname.startsWith("/api/products/")) {
    const slugOrId = decodeURIComponent(pathname.slice("/api/products/".length));
    const product = findProduct(products, slugOrId);
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
    const result = queryCatalog(products, { q, pageSize: 8, sort: "relevance" });
    return json({ items: result.items, total: result.total, q, ...datasetMeta });
  }

  if (pathname === "/api/home") {
    return json({
      featured: products.filter((p) => p.featured === true),
      counts: { diamonds: products.filter((p) => p.kind === "diamond").length },
      ...datasetMeta,
    });
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/api")) {
      return handleApi(request, pathname, env);
    }

    // Non-API requests: serve the built client. The assets binding applies the
    // single-page-application fallback for unknown paths, so client routes
    // always get the app shell.
    return env.ASSETS.fetch(request);
  },
};
