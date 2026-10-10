import express from "express";
import { catalogRouter } from "./routes/catalog.routes.js";
import { pricingRouter } from "./routes/pricing.routes.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "100kb" }));

  // Security headers for API responses
  app.disable("x-powered-by");

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "evarenne-api" });
  });

  app.use("/api", catalogRouter);
  app.use("/api/pricing", pricingRouter);

  // Unknown API route -> JSON 404 (never HTML)
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

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
