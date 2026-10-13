import type { CatalogFacets, CatalogQuery, CatalogResult, FacetBucket, Product } from "./types.js";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

/** Text used for relevance matching (name, sku, id, and safe descriptive terms). */
function searchText(product: Product): string {
  const parts = [product.name, product.sku, product.id, product.description];
  if (product.shape) parts.push(product.shape);
  if (product.diamondType) parts.push(product.diamondType);
  return parts.join(" ").toLowerCase();
}

function matchesQuery(product: Product, query: CatalogQuery, omitRange = false): boolean {
  if (query.category && product.category !== query.category) return false;
  if (query.diamondType) {
    // Diamond-type scope: only a loose diamond carries the type directly.
    // Anything that is not a loose diamond is out of scope for this filter.
    if (product.kind !== "diamond" || product.diamondType !== query.diamondType) return false;
  }
  if (query.q) {
    const needle = query.q.trim().toLowerCase();
    if (needle && !searchText(product).includes(needle)) return false;
  }
  if (query.shapes?.length) {
    const shape = product.shape;
    if (!shape || !query.shapes.includes(shape)) return false;
  }
  if (query.cuts?.length) {
    const cut = product.specs?.cut;
    if (!cut || !query.cuts.includes(cut)) return false;
  }
  if (query.colors?.length) {
    const color = product.specs?.color;
    if (!color || !query.colors.includes(color)) return false;
  }
  if (query.clarities?.length) {
    const clarity = product.specs?.clarity;
    if (!clarity || !query.clarities.includes(clarity)) return false;
  }
  if (query.polishes?.length) {
    const polish = product.specs?.polish;
    if (!polish || !query.polishes.includes(polish)) return false;
  }
  if (query.symmetries?.length) {
    const symmetry = product.specs?.symmetry;
    if (!symmetry || !query.symmetries.includes(symmetry)) return false;
  }
  if (query.fluorescences?.length) {
    const fluorescence = product.specs?.fluorescence;
    if (!fluorescence || !query.fluorescences.includes(fluorescence)) return false;
  }
  // `omitRange` skips the numeric range dimensions, so the price/carat facet
  // bounds describe the whole scope instead of collapsing onto the user's
  // current range (which would freeze a range slider inside itself).
  if (!omitRange) {
    if (query.caratMin !== undefined) {
      const carat = product.specs?.carat;
      if (carat === undefined || carat < query.caratMin) return false;
    }
    if (query.caratMax !== undefined) {
      const carat = product.specs?.carat;
      if (carat === undefined || carat > query.caratMax) return false;
    }
    if (query.priceMin !== undefined && product.price.amount < query.priceMin) return false;
    if (query.priceMax !== undefined && product.price.amount > query.priceMax) return false;
  }
  return true;
}

function bucketize(items: Product[], pick: (p: Product) => string | undefined): FacetBucket[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = pick(item);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts, ([value, count]) => ({ value, count })).sort(
    (a, b) => b.count - a.count || a.value.localeCompare(b.value),
  );
}

function rangeOf(items: Product[], pick: (p: Product) => number | undefined): {
  min: number | null;
  max: number | null;
} {
  let min: number | null = null;
  let max: number | null = null;
  for (const item of items) {
    const value = pick(item);
    if (value === undefined) continue;
    if (min === null || value < min) min = value;
    if (max === null || value > max) max = value;
  }
  return { min, max };
}

/**
 * Facet buckets come from the filtered set; the price/carat bounds come from
 * `rangeScope` (the same set with the numeric filters dropped) so a range
 * slider can always travel the full scope.
 */
function computeFacets(scoped: Product[], rangeScope: Product[] = scoped): CatalogFacets {
  const price = rangeOf(rangeScope, (p) => p.price.amount);
  const carat = rangeOf(rangeScope, (p) => p.specs?.carat);

  return {
    shapes: bucketize(scoped, (p) => p.shape),
    cuts: bucketize(scoped, (p) => p.specs?.cut),
    colors: bucketize(scoped, (p) => p.specs?.color),
    clarities: bucketize(scoped, (p) => p.specs?.clarity),
    polishes: bucketize(scoped, (p) => p.specs?.polish),
    symmetries: bucketize(scoped, (p) => p.specs?.symmetry),
    fluorescences: bucketize(scoped, (p) => p.specs?.fluorescence),
    priceMin: price.min,
    priceMax: price.max,
    caratMin: carat.min,
    caratMax: carat.max,
  };
}

function sortItems(items: Product[], sort: CatalogQuery["sort"], q?: string): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "carat-asc":
      sorted.sort(
        (a, b) =>
          (a.specs?.carat ?? Infinity) -
          (b.specs?.carat ?? Infinity),
      );
      break;
    case "carat-desc":
      sorted.sort(
        (a, b) =>
          (b.specs?.carat ?? -Infinity) -
          (a.specs?.carat ?? -Infinity),
      );
      break;
    case "newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "relevance":
    default: {
      if (q) {
        const needle = q.trim().toLowerCase();
        // Exact sku/id match first, then name prefix, then name contains.
        const rank = (p: Product): number => {
          if (p.sku.toLowerCase() === needle || p.id.toLowerCase() === needle) return 0;
          if (p.name.toLowerCase().startsWith(needle)) return 1;
          if (p.name.toLowerCase().includes(needle)) return 2;
          return 3;
        };
        sorted.sort((a, b) => rank(a) - rank(b));
      } else {
        // Without a query, "relevance" falls back to newest-first for stability.
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      break;
    }
  }
  return sorted;
}

/**
 * Pure catalog query: filter → facet → sort → paginate.
 * All filters combine with AND; values inside one filter combine with OR.
 */
export function queryCatalog(products: readonly Product[], query: CatalogQuery): CatalogResult {
  const filtered = products.filter((product) => matchesQuery(product, query));

  // Facets are computed on the filtered set minus the facet's own dimension,
  // so counts stay meaningful (standard e-commerce behaviour). Price/carat
  // bounds additionally ignore the numeric filters, keeping range sliders free.
  const rangeScope = products.filter((product) => matchesQuery(product, query, true));
  const facets = computeFacets(filtered, rangeScope);

  const pageSize = Math.min(Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const sorted = sortItems(filtered, query.sort ?? "relevance", query.q);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);

  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
    facets,
  };
}

/** Find a product by slug or id; used by product detail + cart validation. */
export function findProduct(products: readonly Product[], slugOrId: string): Product | undefined {
  return products.find((p) => p.slug === slugOrId || p.id === slugOrId);
}
