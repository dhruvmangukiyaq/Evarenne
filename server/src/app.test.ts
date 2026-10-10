import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import type { CatalogResult } from "./domain/types.js";

let server: Server;
let base: string;

async function getJson<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; body: T }> {
  const res = await fetch(url, init);
  const body = (await res.json()) as T;
  return { status: res.status, body };
}

function postJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
): Promise<{ status: number; body: T }> {
  return getJson<T>(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

beforeAll(async () => {
  const app = createApp();
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

describe("GET /api/health", () => {
  it("responds ok", async () => {
    const { status, body } = await getJson(`${base}/api/health`);
    expect(status).toBe(200);
    expect(body).toMatchObject({ status: "ok" });
  });
});

describe("GET /api/catalog", () => {
  it("returns paginated results with dataset disclosure", async () => {
    const { status, body } = await getJson<CatalogResult & { dataSource: string }>(`${base}/api/catalog?pageSize=5`);
    expect(status).toBe(200);
    expect(body.items).toHaveLength(5);
    expect(body.dataSource).toBe("development-seed");
    expect(typeof body.total).toBe("number");
  });

  it("applies filters from the query string", async () => {
    const { body } = await getJson<CatalogResult & { dataSource: string }>(
      `${base}/api/catalog?category=loose-diamond&diamondType=lab-grown&shapes=round`,
    );
    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.diamondType).toBe("lab-grown");
      expect(item.shape).toBe("round");
    }
  });

  it("rejects invalid enum values with 400", async () => {
    const { status, body } = await getJson<{ error: string }>(`${base}/api/catalog?shapes=triangle`);
    expect(status).toBe(400);
    expect(body.error).toBe("Invalid catalog query");
  });

  it("rejects contradictory ranges with 400", async () => {
    const { status } = await getJson(`${base}/api/catalog?caratMin=2&caratMax=1`);
    expect(status).toBe(400);
  });
});

describe("GET /api/products/:slugOrId", () => {
  it("returns a product by slug", async () => {
    const { status, body } = await getJson<{ product: { sku: string; specs: { certificateNumber: string | null } } }>(
      `${base}/api/products/evn-rd-100`,
    );
    expect(status).toBe(200);
    expect(body.product.sku).toBe("EVN-RD-100");
    expect(body.product.specs.certificateNumber).toBeNull();
  });

  it("returns JSON 404 for unknown products", async () => {
    const { status, body } = await getJson(`${base}/api/products/no-such-product`);
    expect(status).toBe(404);
    expect(body).toEqual({ error: "Product not found" });
  });
});

describe("GET /api/search", () => {
  it("returns ranked matches", async () => {
    const { body } = await getJson<{ items: unknown[]; total: number }>(`${base}/api/search?q=oval`);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
  });

  it("returns empty for blank queries", async () => {
    const { body } = await getJson<{ items: unknown[] }>(`${base}/api/search?q=`);
    expect(body.items).toHaveLength(0);
  });
});

describe("POST /api/pricing/quote", () => {
  it("prices a single product from the server catalog", async () => {
    const { status, body } = await postJson<{ total: { amount: number; currency: string }; status: string }>(
      `${base}/api/pricing/quote`,
      { items: [{ productId: "evn-rd-100", quantity: 1 }] },
    );
    expect(status).toBe(200);
    expect(body.total).toEqual({ amount: 620000, currency: "USD" });
    expect(body.status).toBe("quote-only");
  });

  it("multiplies by quantity", async () => {
    const { body } = await postJson<{ total: { amount: number } }>(`${base}/api/pricing/quote`, {
      items: [{ productId: "evw-plain-pla", quantity: 2 }],
    });
    expect(body.total.amount).toBe(178000);
  });

  it("prices a configured ring as setting + diamond", async () => {
    const { status, body } = await postJson<{ total: { amount: number } }>(`${base}/api/pricing/quote`, {
      items: [{ settingId: "evs-sol-pla", diamondId: "evn-rd-100", quantity: 1 }],
    });
    expect(status).toBe(200);
    // 125000 (setting) + 620000 (diamond)
    expect(body.total.amount).toBe(745000);
  });

  it("rejects incompatible setting + diamond combinations", async () => {
    // Bezel setting supports max 1.5ct; the 2ct lab oval exceeds it
    const { status } = await postJson(`${base}/api/pricing/quote`, {
      items: [{ settingId: "evs-bez-pla", diamondId: "evl-ov-200", quantity: 1 }],
    });
    expect(status).toBe(409);
  });

  it("rejects unknown products with 409", async () => {
    const { status } = await postJson(`${base}/api/pricing/quote`, {
      items: [{ productId: "not-a-product", quantity: 1 }],
    });
    expect(status).toBe(409);
  });

  it("rejects invalid payloads with 400", async () => {
    const { status } = await postJson(`${base}/api/pricing/quote`, { items: [] });
    expect(status).toBe(400);
  });

  it("rejects a line with neither productId nor a ring pair", async () => {
    const { status } = await postJson(`${base}/api/pricing/quote`, {
      items: [{ quantity: 1 }],
    });
    expect(status).toBe(400);
  });
});
