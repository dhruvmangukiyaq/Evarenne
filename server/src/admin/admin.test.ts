import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../app.js";
import { handleAdminApi } from "./api.js";
import { createSessionToken, resolveSessionSecret, SESSION_COOKIE } from "./auth.js";
import { MemoryMediaStore } from "./media.js";
import { MemoryProductStore } from "./store.js";

/**
 * Admin panel end-to-end behaviour, exercised over real HTTP against the
 * Express adapter. Because the Worker routes the same `handleAdminApi`, these
 * tests cover the production code path too — not a parallel implementation.
 */

const PASSWORD = "correct-horse-battery-staple";

let server: Server;
let base: string;

interface JsonResult<T = Record<string, unknown>> {
  status: number;
  body: T;
  headers: Headers;
}

async function json<T = Record<string, unknown>>(
  path: string,
  init: RequestInit = {},
): Promise<JsonResult<T>> {
  const res = await fetch(`${base}${path}`, init);
  const body = (await res.json()) as T;
  return { status: res.status, body, headers: res.headers };
}

async function login(): Promise<string> {
  const res = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  expect(res.status).toBe(200);
  const cookies = res.headers.getSetCookie();
  const session = cookies.find((c) => c.startsWith("evarenne_admin="));
  if (!session) throw new Error("No session cookie issued");
  return session.split(";")[0] ?? "";
}

/** A distinct source address per test so the login throttle never bleeds over. */
let ipCounter = 0;
function freshIp(): Record<string, string> {
  ipCounter += 1;
  return { "x-forwarded-for": `10.0.0.${ipCounter}` };
}

const validPayload = {
  name: "One-off Art Deco Emerald 1.75ct",
  description: "A single stone entered through the admin panel.",
  diamondType: "natural",
  shape: "emerald",
  specs: {
    carat: 1.75,
    cut: "Very Good",
    color: "F",
    clarity: "VVS2",
    polish: "Excellent",
    symmetry: "Excellent",
    fluorescence: "None",
    measurements: "7.60 × 5.40 × 3.60",
    lab: "GIA",
    certificateNumber: "2214887766",
    certificateUrl: null,
  },
  images: [{ src: "/api/media/2fj8k2-abc123def456.jpg", alt: "Art Deco emerald, face up" }],
  video: null,
  featured: true,
};

beforeAll(async () => {
  const app = createApp({
    store: new MemoryProductStore(),
    media: new MemoryMediaStore(),
    adminPassword: PASSWORD,
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("No port assigned");
  base = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe("admin session", () => {
  it("reports unauthenticated before login", async () => {
    const { status, body } = await json<{ authenticated: boolean }>(`/api/admin/session`);
    expect(status).toBe(200);
    expect(body.authenticated).toBe(false);
  });

  it("rejects a wrong password without issuing a cookie", async () => {
    const res = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json", ...freshIp() },
      body: JSON.stringify({ password: "not-the-password" }),
    });
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toHaveLength(0);
    expect(((await res.json()) as { error: string }).error).toMatch(/not correct/i);
  });

  it("issues a session cookie for the right password", async () => {
    const cookie = await login();
    expect(cookie.startsWith("evarenne_admin=")).toBe(true);

    const { body } = await json<{ authenticated: boolean }>(`/api/admin/session`, {
      headers: { cookie },
    });
    expect(body.authenticated).toBe(true);
  });

  it("clears the session on logout", async () => {
    const cookie = await login();
    const res = await fetch(`${base}/api/admin/logout`, {
      method: "POST",
      headers: { cookie },
    });
    expect(res.status).toBe(200);
    const cleared = res.headers.getSetCookie().find((c) => c.startsWith("evarenne_admin="));
    expect(cleared).toMatch(/Max-Age=0/);
  });

  it("requires a session for product routes", async () => {
    const { status } = await json(`/api/admin/products`);
    expect(status).toBe(401);
  });
});

describe("admin product CRUD", () => {
  it("creates a diamond the public catalogue then serves", async () => {
    const cookie = await login();

    const created = await json<{ product: { id: string; slug: string; dataSource: string } }>(
      `/api/admin/products`,
      {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify(validPayload),
      },
    );
    expect(created.status).toBe(201);
    expect(created.body.product.dataSource).toBe("admin");
    expect(created.body.product.slug).toBe("one-off-art-deco-emerald-1-75ct");

    // Visible on the public detail page…
    const detail = await json<{ product: { name: string; featured: boolean } }>(
      `/api/products/${created.body.product.slug}`,
    );
    expect(detail.status).toBe(200);
    expect(detail.body.product.name).toBe(validPayload.name);

    // …and picked up by search.
    const search = await json<{ items: Array<{ slug: string }> }>(
      `/api/search?q=${encodeURIComponent("art deco")}`,
    );
    expect(search.body.items.some((p) => p.slug === created.body.product.slug)).toBe(true);

    // …and by the homepage's featured rail.
    const home = await json<{ featured: Array<{ slug: string }> }>(`/api/home`);
    expect(home.body.featured.some((p) => p.slug === created.body.product.slug)).toBe(true);
  });

  it("refuses a slug the seed already owns", async () => {
    const cookie = await login();
    const { status, body } = await json<{ error: string }>(`/api/admin/products`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ ...validPayload, slug: "evn-rd-100" }),
    });
    expect(status).toBe(409);
    expect(body.error).toMatch(/already exists/);
  });

  it("reports field-level issues for invalid grading data", async () => {
    const cookie = await login();
    const { status, body } = await json<{ error: string; issues: Array<{ path: string }> }>(
      `/api/admin/products`,
      {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          ...validPayload,
          name: "Bad Grading Record",
          slug: undefined,
          specs: { ...validPayload.specs, clarity: "Pristine" },
        }),
      },
    );
    expect(status).toBe(400);
    expect(body.issues.some((issue) => issue.path.startsWith("specs"))).toBe(true);
  });

  it("edits and then deletes a diamond", async () => {
    const cookie = await login();

    const created = await json<{ product: { id: string; slug: string } }>(`/api/admin/products`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({
        ...validPayload,
        name: "Temporary Listing",
        featured: false,
        images: [],
      }),
    });
    expect(created.status).toBe(201);
    const { id, slug } = created.body.product;

    const updated = await json<{ product: { name: string; images: unknown[] } }>(
      `/api/admin/products/${id}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          ...validPayload,
          name: "Renamed Listing",
          slug,
          featured: false,
          images: [{ src: "/api/media/zz99yy-111222333444.png", alt: "Renamed" }],
        }),
      },
    );
    expect(updated.status).toBe(200);
    expect(updated.body.product.name).toBe("Renamed Listing");
    expect(updated.body.product.images).toHaveLength(1);

    const beforeDelete = await json(`/api/products/${slug}`);
    expect(beforeDelete.status).toBe(200);

    const removed = await json(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { cookie },
    });
    expect(removed.status).toBe(200);

    const afterDelete = await json(`/api/products/${slug}`);
    expect(afterDelete.status).toBe(404);
  });

  it("keeps the original slug when a diamond is renamed", async () => {
    const cookie = await login();

    const created = await json<{ product: { id: string; slug: string } }>(
      `/api/admin/products`,
      {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ ...validPayload, name: "Stable Link Stone" }),
      },
    );
    expect(created.status).toBe(201);
    const { id, slug } = created.body.product;
    expect(slug).toBe("stable-link-stone");

    // Rename with no slug override: the URL must not move, or every link
    // already shared for this stone would break.
    const updated = await json<{ product: { slug: string; name: string } }>(
      `/api/admin/products/${id}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ ...validPayload, name: "Renamed For Testing" }),
      },
    );
    expect(updated.status).toBe(200);
    expect(updated.body.product.name).toBe("Renamed For Testing");
    expect(updated.body.product.slug).toBe("stable-link-stone");

    const detail = await json(`/api/products/${slug}`);
    expect(detail.status).toBe(200);
  });

  it("404s edits to something that no longer exists", async () => {
    const cookie = await login();
    const { status } = await json(`/api/admin/products/does-not-exist`, {
      method: "PUT",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(validPayload),
    });
    expect(status).toBe(404);
  });
});

describe("admin media uploads", () => {
  it("stores a photo and serves it back with range support", async () => {
    const cookie = await login();
    const bytes = new TextEncoder().encode("not-really-a-jpeg-but-close-enough");

    const uploaded = await json<{ url: string; kind: string; size: number }>(
      `/api/admin/media`,
      {
        method: "POST",
        headers: { "content-type": "image/jpeg", cookie },
        body: bytes,
      },
    );
    expect(uploaded.status).toBe(201);
    expect(uploaded.body.kind).toBe("image");
    expect(uploaded.body.size).toBe(bytes.byteLength);
    expect(uploaded.body.url).toMatch(/^\/api\/media\//);

    const full = await fetch(`${base}${uploaded.body.url}`);
    expect(full.status).toBe(200);
    expect(full.headers.get("content-type")).toBe("image/jpeg");
    expect(full.headers.get("accept-ranges")).toBe("bytes");
    expect(new Uint8Array(await full.arrayBuffer())).toEqual(bytes);

    const partial = await fetch(`${base}${uploaded.body.url}`, {
      headers: { range: "bytes=0-3" },
    });
    expect(partial.status).toBe(206);
    expect(partial.headers.get("content-range")).toBe(
      `bytes 0-3/${bytes.byteLength}`,
    );
    expect((await partial.arrayBuffer()).byteLength).toBe(4);
  });

  it("rejects unsupported types and unauthenticated uploads", async () => {
    const cookie = await login();

    const unsupported = await json<{ error: string }>(`/api/admin/media`, {
      method: "POST",
      headers: { "content-type": "application/zip", cookie },
      body: new TextEncoder().encode("zzz"),
    });
    expect(unsupported.status).toBe(415);

    const anonymous = await json(`/api/admin/media`, {
      method: "POST",
      headers: { "content-type": "image/png" },
      body: new TextEncoder().encode("zzz"),
    });
    expect(anonymous.status).toBe(401);
  });
});

describe("unconfigured deployments", () => {
  const request = (path: string, init: RequestInit = {}): Request =>
    new Request(`http://example.test${path}`, init);

  it("disables login when no admin password is set", async () => {
    const response = await handleAdminApi(
      request("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: "anything" }),
      }),
      { store: new MemoryProductStore(), media: new MemoryMediaStore(), password: "" },
    );
    expect(response.status).toBe(503);
    expect(((await response.json()) as { error: string }).error).toMatch(/ADMIN_PASSWORD/);
  });

  it("answers 503 for admin routes when no database is bound", async () => {
    const response = await handleAdminApi(request("/api/admin/products"), {
      store: null,
      media: null,
      password: PASSWORD,
    });
    expect(response.status).toBe(503);
  });

  it("answers 503 for uploads when object storage is absent", async () => {
    // Auth runs first — an anonymous caller gets 401, not a config leak — so
    // this signs in properly to reach the media-storage branch.
    const secret = resolveSessionSecret(PASSWORD, undefined);
    const token = await createSessionToken(secret);
    const response = await handleAdminApi(
      request("/api/admin/media", {
        method: "POST",
        headers: {
          "content-type": "image/png",
          cookie: `${SESSION_COOKIE}=${token}`,
        },
        body: new TextEncoder().encode("png-bytes"),
      }),
      { store: new MemoryProductStore(), media: null, password: PASSWORD },
    );
    expect(response.status).toBe(503);
    expect(((await response.json()) as { error: string }).error).toMatch(/R2/);
  });
});
