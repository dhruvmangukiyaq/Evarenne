import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCatalogRouter } from "./routes/catalog.routes.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { FileMediaStore, FileProductStore } from "./admin/file-store.js";
import type { MediaStore } from "./admin/media.js";
import type { ProductStore } from "./admin/store.js";

/**
 * Built client bundle (`client/dist`). Resolved from this module's own URL so
 * it resolves identically under `tsx watch` (server/src) and the compiled
 * build (server/dist). Absent in development — the Vite dev server owns the
 * UI there — so every static handler below degrades gracefully.
 */
const CLIENT_DIST = fileURLToPath(new URL("../../client/dist", import.meta.url));
const CLIENT_INDEX = path.join(CLIENT_DIST, "index.html");
const hasClientBuild = fs.existsSync(CLIENT_INDEX);

export interface AppOptions {
  /**
   * Admin panel password. Defaults to `ADMIN_PASSWORD`; an empty value keeps
   * the admin routes answering 503 rather than letting anyone sign in.
   */
  adminPassword?: string;
  sessionSecret?: string;
  /** Backing store for admin-added products; defaults to the local JSON file. */
  store?: ProductStore;
  /** Backing store for uploads; defaults to the local uploads directory. */
  media?: MediaStore;
}

export function createApp(options: AppOptions = {}) {
  const store = options.store ?? new FileProductStore();
  const media = options.media ?? new FileMediaStore();
  const adminPassword = options.adminPassword ?? process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = options.sessionSecret ?? process.env.SESSION_SECRET;

  const app = express();

  app.use(express.json({ limit: "100kb" }));

  // Security headers for API responses
  app.disable("x-powered-by");

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "evarenne-api" });
  });

  // Admin + media share one adapter mounted at both prefixes; `originalUrl`
  // always carries the full path the shared router dispatches on.
  const adminDeps = { store, media, password: adminPassword, sessionSecret };
  const adminRouter = createAdminRouter(adminDeps);
  app.use("/api/admin", adminRouter);
  app.use("/api/media", adminRouter);

  app.use("/api", createCatalogRouter(store));

  // Unknown API route -> JSON 404 (never HTML)
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // ---- Built client (production: one server serves the whole site) ----
  if (hasClientBuild) {
    app.use(express.static(CLIENT_DIST, { index: "index.html" }));
    // SPA fallback: every non-API GET renders the client, which owns its own
    // 404 route. API paths never reach here (handled above).
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(CLIENT_INDEX);
    });
  } else {
    // Development: no build present, so `/` on this port is almost certainly a
    // browser pointed at the API instead of the Vite dev server. Say so plainly.
    app.get("/", (_req, res) => {
      res
        .status(404)
        .type("text/plain")
        .send(
          "This is the Evarenne API (no client build found).\n" +
            "Run `npm run dev` and open http://localhost:5173/ for the site,\n" +
            "or `npm run build` to serve the built site from this port.\n",
        );
    });
  }

  // Central error handler
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      const status = (err as { status?: number }).status;
      if (typeof status === "number" && status >= 400 && status < 500) {
        res.status(status).json({ error: (err as Error).message ?? "Bad request" });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
