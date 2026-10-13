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

  it("applies polish/symmetry/fluorescence filters from the query string", async () => {
    const { status, body } = await getJson<CatalogResult & { dataSource: string }>(
      `${base}/api/catalog?polishes=Excellent&symmetries=Excellent&fluorescences=None`,
    );
    expect(status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.specs?.polish).toBe("Excellent");
      expect(item.specs?.symmetry).toBe("Excellent");
      expect(item.specs?.fluorescence).toBe("None");
    }
    expect(body.facets.polishes.length).toBeGreaterThan(0);
  });

  it("rejects invalid enum values with 400", async () => {
    const { status, body } = await getJson<{ error: string }>(`${base}/api/catalog?shapes=triangle`);
    expect(status).toBe(400);
    expect(body.error).toBe("Invalid catalog query");
  });

  it("rejects an unknown polish grade with 400", async () => {
    const { status } = await getJson(`${base}/api/catalog?polishes=Mirror`);
    expect(status).toBe(400);
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
