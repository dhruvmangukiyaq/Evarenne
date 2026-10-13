/**
 * The admin HTTP surface, expressed once against the standard `Request` /
 * `Response` types so the Express dev server and the Cloudflare Worker run the
 * exact same code (including authentication — a divergence there would be a
 * security bug, not a quirk).
 *
 * Routes, all JSON unless noted:
 *   POST   /api/admin/login      {password}      → sets the session cookie
 *   POST   /api/admin/logout                     → clears it
 *   GET    /api/admin/session                    → {authenticated}
 *   GET    /api/admin/products                   → {products}
 *   POST   /api/admin/products   (AdminProductInput) → 201 {product}
 *   GET    /api/admin/products/:id               → {product}
 *   PUT    /api/admin/products/:id               → {product}
 *   DELETE /api/admin/products/:id               → 200
 *   POST   /api/admin/media      raw bytes, `Content-Type` = file type → 201 {…}
 *   GET    /api/media/:key       raw bytes, public — the catalogue displays these
 */

import { adminLoginSchema } from "../domain/schemas.js";
import {
  buildClearCookie,
  buildSessionCookie,
  createSessionToken,
  isValidSessionToken,
  readCookie,
  resolveSessionSecret,
  SESSION_COOKIE,
  verifyPassword,
} from "./auth.js";
import {
  MEDIA_CACHE_CONTROL,
  isSafeMediaKey,
  mediaKind,
  mediaLimit,
  newMediaKey,
  type MediaStore,
} from "./media.js";
import type { ProductStore } from "./store.js";
import {
  AdminError,
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "./service.js";

export interface AdminApiDeps {
  /** Null when no backing database is bound — admin routes then answer 503. */
  store: ProductStore | null;
  /** Null when object storage is unbound (R2 not yet enabled) — uploads 503. */
  media: MediaStore | null;
  password: string;
  sessionSecret?: string;
}

/* ---------------- helpers ---------------- */

function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function issuesOf(error: unknown): Array<{ path: string; message: string }> {
  return error instanceof AdminError ? error.issues : [];
}

function clientKey(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return (forwarded.split(",")[0] ?? "").trim() || "local";
  return "local";
}

/* ---------------- failed-login throttling ---------------- */

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_FAILURES = 8;
/**
 * Per-isolate memory: imperfect across Workers isolates, but it costs nothing
 * and blunts the realistic attack — one client hammering one connection.
 */
const failures = new Map<string, { count: number; resetAt: number }>();

function isThrottled(key: string): boolean {
  const entry = failures.get(key);
  if (!entry) return false;
  if (entry.resetAt <= Date.now()) {
    failures.delete(key);
    return false;
  }
  return entry.count >= RATE_MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

function clearFailures(key: string): void {
  failures.delete(key);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------- auth gate ---------------- */

async function requireAdmin(request: Request, deps: AdminApiDeps): Promise<Response | null> {
  if (!deps.password) {
    return json(
      { error: "Admin access is not configured. Set ADMIN_PASSWORD on this deployment." },
      503,
    );
  }
  if (!deps.store) {
    return json({ error: "Admin storage is not configured on this deployment." }, 503);
  }
  const token = readCookie(request.headers.get("cookie") ?? undefined, SESSION_COOKIE);
  const secret = resolveSessionSecret(deps.password, deps.sessionSecret);
  const ok = await isValidSessionToken(secret, token);
  return ok ? null : json({ error: "Sign in to the admin panel first." }, 401);
}

/* ---------------- media serving (public) ---------------- */

function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (rawStart === "" && rawEnd === "") return null;

  let start: number;
  let end: number;
  if (rawStart === "") {
    // Suffix range: the last N bytes.
    const suffix = Number(rawEnd);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Number(rawEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }
  if (start > end) return null;
  return { start, end };
}

async function serveMedia(request: Request, deps: AdminApiDeps, key: string): Promise<Response> {
  if (!deps.media || !isSafeMediaKey(key)) return json({ error: "Not found" }, 404);
  const object = await deps.media.get(key);
  if (!object) return json({ error: "Not found" }, 404);

  const baseHeaders: Record<string, string> = {
    "content-type": object.contentType ?? "application/octet-stream",
    "accept-ranges": "bytes",
    "cache-control": MEDIA_CACHE_CONTROL,
  };

  // <video> seeks with Range requests; honour them so scrubbing works.
  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const range = parseRange(rangeHeader, object.bytes.byteLength);
    if (range) {
      // subarray is a view — no copy of a potentially 30 MB body.
      const slice = object.bytes.subarray(range.start, range.end + 1);
      return new Response(slice, {
        status: 206,
        headers: {
          ...baseHeaders,
          "content-length": String(slice.byteLength),
          "content-range": `bytes ${range.start}-${range.end}/${object.bytes.byteLength}`,
        },
      });
    }
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, "content-range": `bytes */${object.bytes.byteLength}` },
    });
  }

  return new Response(object.bytes, {
    status: 200,
    headers: { ...baseHeaders, "content-length": String(object.bytes.byteLength) },
  });
}

/* ---------------- upload ---------------- */

async function uploadMedia(request: Request, deps: AdminApiDeps): Promise<Response> {
  if (!deps.media) {
    return json(
      { error: "Media storage is not configured. Enable Cloudflare R2 for this Worker." },
      503,
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const kind = mediaKind(contentType);
  if (!kind) {
    return json(
      { error: "Unsupported file type. Use JPEG, PNG, WebP, AVIF, MP4 or WebM." },
      415,
    );
  }

  const limit = mediaLimit(kind);
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > limit) {
    return json({ error: `File is too large (limit ${Math.floor(limit / 1024 / 1024)} MB).` }, 413);
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > limit) {
    return json({ error: `File is too large (limit ${Math.floor(limit / 1024 / 1024)} MB).` }, 413);
  }
  if (bytes.byteLength === 0) {
    return json({ error: "The uploaded file is empty." }, 400);
  }

  const key = newMediaKey(contentType);
  if (!key) return json({ error: "Unsupported file type." }, 415);

  await deps.media.put(key, bytes, contentType);
  return json({ key, url: `/api/media/${key}`, kind, contentType, size: bytes.byteLength }, 201);
}

/* ---------------- router ---------------- */

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AdminError(400, "Request body must be valid JSON");
  }
}

export async function handleAdminApi(
  request: Request,
  deps: AdminApiDeps,
): Promise<Response> {
  const { pathname } = new URL(request.url);
  const method = request.method.toUpperCase();

  /* ---- public media serving ---- */
  if (pathname.startsWith("/api/media/")) {
    if (method !== "GET" && method !== "HEAD") return json({ error: "Not found" }, 404);
    const key = decodeURIComponent(pathname.slice("/api/media/".length));
    return serveMedia(request, deps, key);
  }

  if (!pathname.startsWith("/api/admin")) return json({ error: "Not found" }, 404);

  try {
    /* ---- login / session ---- */
    if (pathname === "/api/admin/login" && method === "POST") {
      if (!deps.password) {
        return json(
          { error: "Admin access is not configured. Set ADMIN_PASSWORD on this deployment." },
          503,
        );
      }
      const key = clientKey(request);
      if (isThrottled(key)) {
        return json({ error: "Too many failed attempts. Try again in 15 minutes." }, 429);
      }

      const parsed = adminLoginSchema.safeParse(await readJson(request));
      if (!parsed.success) {
        return json({ error: "Enter your password." }, 400);
      }

      const ok = await verifyPassword(parsed.data.password, deps.password);
      if (!ok) {
        recordFailure(key);
        await sleep(600); // make online guessing painfully slow
        return json({ error: "That password is not correct." }, 401);
      }

      clearFailures(key);
      const secret = resolveSessionSecret(deps.password, deps.sessionSecret);
      const token = await createSessionToken(secret);
      const secure = new URL(request.url).protocol === "https:";
      return json({ ok: true }, 200, { "set-cookie": buildSessionCookie(token, secure) });
    }

    if (pathname === "/api/admin/logout" && method === "POST") {
      const secure = new URL(request.url).protocol === "https:";
      return json({ ok: true }, 200, { "set-cookie": buildClearCookie(secure) });
    }

    if (pathname === "/api/admin/session" && method === "GET") {
      if (!deps.password) return json({ authenticated: false, configured: false });
      const token = readCookie(request.headers.get("cookie") ?? undefined, SESSION_COOKIE);
      const secret = resolveSessionSecret(deps.password, deps.sessionSecret);
      const authenticated = await isValidSessionToken(secret, token);
      return json({ authenticated, configured: true });
    }

    /* ---- everything below requires a session ---- */
    const denied = await requireAdmin(request, deps);
    if (denied) return denied;
    const store = deps.store as ProductStore; // requireAdmin proved it is set

    if (pathname === "/api/admin/products") {
      if (method === "GET") return json({ products: await listProducts({ store }) });
      if (method === "POST") {
        const product = await createProduct({ store }, await readJson(request));
        return json({ product }, 201);
      }
      return json({ error: "Method not allowed" }, 405);
    }

    const productMatch = /^\/api\/admin\/products\/([^/]+)$/.exec(pathname);
    if (productMatch) {
      const id = decodeURIComponent(productMatch[1] ?? "");
      if (method === "GET") {
        const product = await store.getById(id);
        if (!product) throw new AdminError(404, "That product no longer exists");
        return json({ product });
      }
      if (method === "PUT") {
        const product = await updateProduct({ store }, id, await readJson(request));
        return json({ product });
      }
      if (method === "DELETE") {
        await deleteProduct({ store }, id);
        return json({ ok: true });
      }
      return json({ error: "Method not allowed" }, 405);
    }

    if (pathname === "/api/admin/media" && method === "POST") {
      return uploadMedia(request, deps);
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    if (error instanceof AdminError) {
      return json({ error: error.message, issues: issuesOf(error) }, error.status);
    }
    if (error instanceof SyntaxError) {
      return json({ error: "Request body must be valid JSON" }, 400);
    }
    console.error("admin api error", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}
