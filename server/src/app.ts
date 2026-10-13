import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalogRouter } from "./routes/catalog.routes.js";

/**
 * Built client bundle (`client/dist`). Resolved from this module's own URL so
 * it resolves identically under `tsx watch` (server/src) and the compiled
 * build (server/dist). Absent in development — the Vite dev server owns the
 * UI there — so every static handler below degrades gracefully.
 */
const CLIENT_DIST = fileURLToPath(new URL("../../client/dist", import.meta.url));
const CLIENT_INDEX = path.join(CLIENT_DIST, "index.html");
const hasClientBuild = fs.existsSync(CLIENT_INDEX);

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "100kb" }));

  // Security headers for API responses
  app.disable("x-powered-by");

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "evarenne-api" });
  });

  app.use("/api", catalogRouter);

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
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
