-- Admin-added diamonds (Cloudflare D1).
--
-- `data` holds the full product JSON exactly as the public API serves it —
-- the shape evolves with `domain/schemas.ts`, so a document column keeps the
-- table from needing a migration every time a display field is added. The
-- columns alongside it exist for lookup and ordering only.

CREATE TABLE IF NOT EXISTS admin_products (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_products_created_at
  ON admin_products (created_at DESC);
