import { describe, expect, it } from "vitest";
import { findProduct, queryCatalog } from "./catalog.js";
import { SEED_PRODUCTS } from "../data/seed.js";
import { productArraySchema } from "./schemas.js";
import type { Product } from "./types.js";

const products = SEED_PRODUCTS;

describe("seed data integrity", () => {
  it("validates every seed product against the schema", () => {
    const result = productArraySchema.safeParse(products);
    if (!result.success) {
      console.error(JSON.stringify(result.error.issues.slice(0, 10), null, 2));
    }
    expect(result.success).toBe(true);
  });

  it("has unique ids, slugs and skus", () => {
    const ids = new Set(products.map((p) => p.id));
    const slugs = new Set(products.map((p) => p.slug));
    const skus = new Set(products.map((p) => p.sku));
    expect(ids.size).toBe(products.length);
    expect(slugs.size).toBe(products.length);
    expect(skus.size).toBe(products.length);
  });

  it("never fabricates certificate numbers", () => {
    for (const product of products) {
      expect(product.specs?.certificateNumber ?? null).toBeNull();
      expect(product.specs?.lab ?? null).toBeNull();
    }
  });

  it("marks every product as development-seed data", () => {
    for (const product of products) {
      expect(product.dataSource).toBe("development-seed");
    }
  });

  it("carries lab-grown diamonds only", () => {
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.diamondType).toBe("lab-grown");
    }
  });

  it("carries only loose diamonds — no rings, settings or jewelry", () => {
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.kind).toBe("diamond");
      expect(product.category).toBe("loose-diamond");
    }
  });
});

describe("queryCatalog — scoping", () => {
  it("scopes to lab-grown diamonds", () => {
    const result = queryCatalog(products, { diamondType: "lab-grown", pageSize: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    for (const p of result.items) {
      expect(p.kind).toBe("diamond");
      expect(p.diamondType).toBe("lab-grown");
    }
  });

  it("scopes to a category", () => {
    const result = queryCatalog(products, { category: "loose-diamond", pageSize: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((p) => p.category === "loose-diamond")).toBe(true);
  });

  it("returns total matching the filtered set, not the page", () => {
    const result = queryCatalog(products, { category: "loose-diamond", pageSize: 5 });
    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(products.length);
    expect(result.totalPages).toBe(Math.ceil(products.length / 5));
  });
});

describe("queryCatalog — filters combine with AND", () => {
  it("combines shape + price range", () => {
    const result = queryCatalog(products, {
      diamondType: "lab-grown",
      shapes: ["round"],
      priceMax: 300000,
      pageSize: 100,
    });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.shape).toBe("round");
      expect(item.price.amount).toBeLessThanOrEqual(300000);
    }
  });

  it("ORs values inside one filter", () => {
    const result = queryCatalog(products, { shapes: ["oval", "pear"], pageSize: 100 });
    const shapes = new Set(result.items.map((p) => p.shape));
    expect(shapes.has("oval") || shapes.has("pear")).toBe(true);
    expect(shapes.has("round")).toBe(false);
  });

  it("produces zero results for contradictory filters", () => {
    const result = queryCatalog(products, { shapes: ["round"], caratMin: 3.5, pageSize: 100 });
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("filters by cut, color, clarity on loose diamonds", () => {
    const result = queryCatalog(products, {
      category: "loose-diamond",
      diamondType: "lab-grown",
      cuts: ["Excellent"],
      colors: ["E", "F"],
      clarities: ["VS1", "VVS2"],
      pageSize: 100,
    });
    for (const item of result.items) {
      expect(item.specs?.cut).toBe("Excellent");
      expect(["E", "F"]).toContain(item.specs?.color);
      expect(["VS1", "VVS2"]).toContain(item.specs?.clarity);
    }
  });

  it("filters by polish, symmetry and fluorescence", () => {
    const result = queryCatalog(products, {
      polishes: ["Excellent"],
      symmetries: ["Excellent", "Very Good"],
      fluorescences: ["None", "Faint"],
      pageSize: 100,
    });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.specs?.polish).toBe("Excellent");
      expect(["Excellent", "Very Good"]).toContain(item.specs?.symmetry);
      expect(["None", "Faint"]).toContain(item.specs?.fluorescence);
    }
  });

  it("combines shape + carat range", () => {
    const result = queryCatalog(products, {
      diamondType: "lab-grown",
      shapes: ["round"],
      caratMax: 1.5,
      pageSize: 100,
    });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.shape).toBe("round");
      expect(item.specs?.carat).toBeLessThanOrEqual(1.5);
    }
  });
});

describe("queryCatalog — search", () => {
  it("matches by name", () => {
    const result = queryCatalog(products, { q: "emerald", pageSize: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.name.toLowerCase()).toContain("emerald");
    }
  });

  it("matches by SKU exactly and ranks it first", () => {
    const result = queryCatalog(products, { q: "evl-rd-100" });
    expect(result.items[0]?.sku).toBe("EVL-RD-100");
  });

  it("returns nothing for an unknown term", () => {
    const result = queryCatalog(products, { q: "zzz-no-such-stone" });
    expect(result.total).toBe(0);
  });
});

describe("queryCatalog — sorting", () => {
  it("sorts price ascending", () => {
    const result = queryCatalog(products, { sort: "price-asc", pageSize: 100 });
    const amounts = result.items.map((p) => p.price.amount);
    expect([...amounts].sort((a, b) => a - b)).toEqual(amounts);
  });

  it("sorts price descending", () => {
    const result = queryCatalog(products, { sort: "price-desc", pageSize: 100 });
    const amounts = result.items.map((p) => p.price.amount);
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts);
  });

  it("sorts carat descending", () => {
    const result = queryCatalog(products, { category: "loose-diamond", sort: "carat-desc", pageSize: 100 });
    const carats = result.items.map((p) => p.specs?.carat ?? 0);
    expect([...carats].sort((a, b) => b - a)).toEqual(carats);
  });

  it("sorts newest first", () => {
    const result = queryCatalog(products, { sort: "newest", pageSize: 100 });
    const dates = result.items.map((p) => p.createdAt);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });
});

describe("queryCatalog — pagination", () => {
  it("clamps out-of-range pages to the last page", () => {
    const result = queryCatalog(products, { category: "loose-diamond", pageSize: 10, page: 99 });
    expect(result.page).toBe(result.totalPages);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("returns empty items for page beyond the end but keeps totals", () => {
    const result = queryCatalog(products, { q: "zzz-no-such-stone", page: 3 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("caps page size", () => {
    const result = queryCatalog(products, { pageSize: 5000 });
    expect(result.pageSize).toBeLessThanOrEqual(48);
  });
});

describe("queryCatalog — facets", () => {
  it("counts facet buckets on the scoped set", () => {
    const result = queryCatalog(products, {
      category: "loose-diamond",
      diamondType: "lab-grown",
      pageSize: 1,
    });
    const roundBucket = result.facets.shapes.find((b) => b.value === "round");
    expect(roundBucket?.count).toBe(3);
  });

  it("exposes price and carat ranges", () => {
    const result = queryCatalog(products, { category: "loose-diamond", pageSize: 1 });
    expect(result.facets.priceMin).toBeGreaterThan(0);
    expect(result.facets.priceMax).toBeGreaterThan(result.facets.priceMin!);
    expect(result.facets.caratMin).toBeGreaterThan(0);
  });

  it("buckets polish, symmetry and fluorescence", () => {
    const result = queryCatalog(products, { category: "loose-diamond", pageSize: 1 });
    const polishTotal = result.facets.polishes.reduce((sum, b) => sum + b.count, 0);
    const symmetryTotal = result.facets.symmetries.reduce((sum, b) => sum + b.count, 0);
    const fluorescenceTotal = result.facets.fluorescences.reduce((sum, b) => sum + b.count, 0);
    expect(polishTotal).toBe(result.total);
    expect(symmetryTotal).toBe(result.total);
    expect(fluorescenceTotal).toBe(result.total);
  });

  it("returns empty facets and null ranges for empty scopes", () => {
    const result = queryCatalog(products, { q: "zzz-no-such-stone" });
    expect(result.facets.shapes).toHaveLength(0);
    expect(result.facets.polishes).toHaveLength(0);
    expect(result.facets.symmetries).toHaveLength(0);
    expect(result.facets.fluorescences).toHaveLength(0);
    expect(result.facets.priceMin).toBeNull();
    expect(result.facets.caratMax).toBeNull();
  });
});

describe("findProduct", () => {
  it("finds by slug", () => {
    const found = findProduct(products, "evl-rd-100");
    expect(found?.sku).toBe("EVL-RD-100");
  });

  it("finds by id", () => {
    const first = products[0] as Product;
    expect(findProduct(products, first.id)).toBe(first);
  });

  it("returns undefined for unknown slug", () => {
    expect(findProduct(products, "does-not-exist")).toBeUndefined();
  });
});
