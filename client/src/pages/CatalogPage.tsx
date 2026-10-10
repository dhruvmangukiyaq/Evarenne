import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { CatalogResponse, DiamondShape, Metal, RingStyle } from "../lib/api-types";
import { ProductCard } from "../components/catalog/ProductCard";
import { DiamondArt } from "../components/catalog/ProductArt";
import { metalLabel, styleLabel } from "../lib/labels";
import { shapeLabel } from "../lib/labels";
import { Breadcrumbs, EmptyState, ErrorState, Skeleton } from "../components/ui/Display";
import type { Crumb } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Form";
import { Drawer } from "../components/ui/Overlay";
import { useState } from "react";

/**
 * Catalog page — one component powers /diamonds/:type, /engagement-rings,
 * /wedding-rings, /jewelry and /search. All filter/sort/page state lives in
 * the URL query string, so links are shareable and back/forward works.
 */

type ParamKey =
  | "shapes"
  | "metals"
  | "styles"
  | "cuts"
  | "colors"
  | "clarities"
  | "priceMin"
  | "priceMax"
  | "caratMin"
  | "caratMax"
  | "sort"
  | "page"
  | "category"
  | "q";

const SHAPE_ALL: DiamondShape[] = [
  "round", "oval", "princess", "emerald", "cushion", "pear", "radiant", "asscher", "marquise", "heart",
];
const METAL_ALL: Metal[] = [
  "platinum", "18k-white-gold", "14k-white-gold", "18k-yellow-gold", "14k-yellow-gold", "18k-rose-gold", "14k-rose-gold",
];
const STYLE_ALL: RingStyle[] = ["solitaire", "halo", "pavé", "hidden-halo", "three-stone", "vintage", "bezel"];
const CUT_ALL = ["Excellent", "Very Good", "Good"];
const COLOR_ALL = ["D", "E", "F", "G", "H", "I", "J"];
const CLARITY_ALL = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];

const SORT_CHOICES = [
  { value: "relevance", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "carat-asc", label: "Carat: Low to High" },
  { value: "carat-desc", label: "Carat: High to Low" },
  { value: "newest", label: "Newest" },
];

function csvList(params: URLSearchParams, key: ParamKey): string[] {
  const raw = params.get(key);
  return raw ? raw.split(",").filter(Boolean) : [];
}

interface FilterSectionProps {
  legend: string;
  children: React.ReactNode;
}

function FilterSection({ legend, children }: FilterSectionProps) {
  return (
    <fieldset className="border-b border-ivory-dim py-5 last:border-b-0">
      <legend className="mb-3 text-eyebrow text-ink">{legend}</legend>
      <div className="flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

function FilterCheck({
  label,
  count,
  checked,
  onToggle,
  icon,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onToggle: () => void;
  /** Optional leading icon (shape filters render their cut glyph). */
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-wine"
      />
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-ink-faint tabular-nums">{count}</span>}
    </label>
  );
}

export function CatalogPage() {
  const { diamondType } = useParams<{ diamondType?: string }>();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Route → base scope
  const pathname = window.location.pathname;
  const isDiamondsRoute = pathname.startsWith("/diamonds/");
  const isSearchRoute = pathname === "/search";

  const scopeCategory = useMemo(() => {
    if (pathname === "/engagement-rings") return "engagement-ring";
    if (pathname === "/wedding-rings") return "wedding-band";
    if (isDiamondsRoute) return "loose-diamond";
    const categoryParam = params.get("category");
    if (pathname === "/jewelry" && categoryParam) return categoryParam;
    if (pathname === "/jewelry") return undefined; // all jewelry categories
    return undefined;
  }, [pathname, params, isDiamondsRoute]);

  const showDiamondFilters = isDiamondsRoute || pathname === "/engagement-rings";
  const showMetalFilters = !isDiamondsRoute;
  const showStyleFilters = pathname === "/engagement-rings" || pathname === "/wedding-rings";
  const showCaratFilters = isDiamondsRoute || pathname === "/engagement-rings";

  // Read filter state from URL
  const shapes = csvList(params, "shapes");
  const metals = csvList(params, "metals");
  const styles = csvList(params, "styles");
  const cuts = csvList(params, "cuts");
  const colors = csvList(params, "colors");
  const clarities = csvList(params, "clarities");
  const priceMin = params.get("priceMin") ?? undefined;
  const priceMax = params.get("priceMax") ?? undefined;
  const caratMin = params.get("caratMin") ?? undefined;
  const caratMax = params.get("caratMax") ?? undefined;
  const sort = params.get("sort") ?? "relevance";
  const page = Number(params.get("page") ?? "1");
  const q = params.get("q") ?? undefined;

  const activeCount =
    shapes.length +
    metals.length +
    styles.length +
    cuts.length +
    colors.length +
    clarities.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0) +
    (caratMin ? 1 : 0) +
    (caratMax ? 1 : 0);

  const update = useCallback(
    (key: ParamKey, value: string | null, resetPage = true) => {
      const next = new URLSearchParams(params);
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      if (resetPage) next.delete("page");
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  const toggleMulti = useCallback(
    (key: ParamKey, value: string) => {
      const current = csvList(params, key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      update(key, next.length ? next.join(",") : null);
    },
    [params, update],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (isDiamondsRoute && diamondType) {
      // keep route-derived type; nothing in query to keep
    }
    setParams(next);
  }, [q, isDiamondsRoute, diamondType, setParams]);

  // Build API params from URL state
  const apiParams = useMemo(() => {
    const p: Record<string, unknown> = {};
    if (isDiamondsRoute && diamondType) p.diamondType = diamondType;
    if (scopeCategory) p.category = scopeCategory;
    if (q) p.q = q;
    if (shapes.length) p.shapes = shapes;
    if (metals.length) p.metals = metals;
    if (styles.length) p.styles = styles;
    if (cuts.length) p.cuts = cuts;
    if (colors.length) p.colors = colors;
    if (clarities.length) p.clarities = clarities;
    if (priceMin) p.priceMin = priceMin;
    if (priceMax) p.priceMax = priceMax;
    if (caratMin) p.caratMin = caratMin;
    if (caratMax) p.caratMax = caratMax;
    p.sort = sort;
    p.page = page;
    p.pageSize = 12;
    return p;
  }, [isDiamondsRoute, diamondType, scopeCategory, q, shapes, metals, styles, cuts, colors, clarities, priceMin, priceMax, caratMin, caratMax, sort, page]);

  const { data, loading, error, refetch } = useApi<CatalogResponse>(
    (signal) => {
      void signal;
      return api.catalog(apiParams as Parameters<typeof api.catalog>[0]);
    },
    [JSON.stringify(apiParams)],
  );

  // Page titles per route
  const pageTitle = useMemo(() => {
    if (isSearchRoute) return q ? `Search: “${q}”` : "Search";
    if (isDiamondsRoute) return diamondType === "lab-grown" ? "Lab-Grown Diamonds" : "Natural Diamonds";
    if (pathname === "/engagement-rings") return "Engagement Rings";
    if (pathname === "/wedding-rings") return "Wedding Rings";
    if (pathname === "/jewelry") return "Fine Jewelry";
    return "Collection";
  }, [isSearchRoute, isDiamondsRoute, diamondType, pathname, q]);

  const breadcrumbItems = useMemo<Crumb[]>(() => {
    const crumbs: Crumb[] = [{ label: "Home", to: "/" }];
    if (isSearchRoute) crumbs.push({ label: "Search" });
    else if (isDiamondsRoute) {
      crumbs.push({ label: "Diamonds" });
      crumbs.push({ label: diamondType === "lab-grown" ? "Lab-Grown" : "Natural" });
    } else if (pathname === "/engagement-rings") crumbs.push({ label: "Engagement Rings" });
    else if (pathname === "/wedding-rings") crumbs.push({ label: "Wedding Rings" });
    else if (pathname === "/jewelry") crumbs.push({ label: "Fine Jewelry" });
    return crumbs;
  }, [isSearchRoute, isDiamondsRoute, diamondType, pathname]);

  const filterPanel = (
    <div>
      {activeCount > 0 && (
        <div className="mb-4 flex items-center justify-between border-b border-ivory-dim pb-3">
          <span className="text-sm text-ink-soft">{activeCount} filter{activeCount === 1 ? "" : "s"} applied</span>
          <button
            type="button"
            onClick={clearAll}
            className="font-sans text-sm font-medium text-wine underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {showDiamondFilters && (
        <>
          <FilterSection legend="Shape">
            {SHAPE_ALL.map((shape) => {
              const bucket = data?.facets.shapes.find((b) => b.value === shape);
              return (
                <FilterCheck
                  key={shape}
                  label={shapeLabel(shape)}
                  count={bucket?.count ?? 0}
                  checked={shapes.includes(shape)}
                  onToggle={() => toggleMulti("shapes", shape)}
                  icon={
                    <DiamondArt
                      shape={shape}
                      framed={false}
                      className="h-5 w-5 shrink-0"
                      title=""
                    />
                  }
                />
              );
            })}
          </FilterSection>

          <FilterSection legend="Cut Grade">
            {CUT_ALL.map((cut) => (
              <FilterCheck
                key={cut}
                label={cut}
                checked={cuts.includes(cut)}
                onToggle={() => toggleMulti("cuts", cut)}
              />
            ))}
          </FilterSection>

          <FilterSection legend="Color Grade">
            {COLOR_ALL.map((color) => (
              <FilterCheck
                key={color}
                label={color}
                checked={colors.includes(color)}
                onToggle={() => toggleMulti("colors", color)}
              />
            ))}
          </FilterSection>

          <FilterSection legend="Clarity">
            {CLARITY_ALL.map((clarity) => (
              <FilterCheck
                key={clarity}
                label={clarity}
                checked={clarities.includes(clarity)}
                onToggle={() => toggleMulti("clarities", clarity)}
              />
            ))}
          </FilterSection>
        </>
      )}

      {showStyleFilters && (
        <FilterSection legend="Style">
          {STYLE_ALL.map((style) => (
            <FilterCheck
              key={style}
              label={styleLabel(style)}
              checked={styles.includes(style)}
              onToggle={() => toggleMulti("styles", style)}
            />
          ))}
        </FilterSection>
      )}

      {showMetalFilters && (
        <FilterSection legend="Metal">
          {METAL_ALL.map((metal) => (
            <FilterCheck
              key={metal}
              label={metalLabel(metal)}
              checked={metals.includes(metal)}
              onToggle={() => toggleMulti("metals", metal)}
            />
          ))}
        </FilterSection>
      )}

      <FilterSection legend="Price (USD)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum price in dollars"
            value={priceMin ? Math.round(Number(priceMin) / 100) : ""}
            onChange={(event) => {
              const dollars = Number(event.target.value);
              update("priceMin", event.target.value ? String(Math.round(dollars * 100)) : null);
            }}
            className="h-10 w-full border border-ivory-dim bg-white px-2.5 text-sm focus:border-wine focus:outline-none"
          />
          <span aria-hidden="true" className="text-ink-faint">
            –
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum price in dollars"
            value={priceMax ? Math.round(Number(priceMax) / 100) : ""}
            onChange={(event) => {
              const dollars = Number(event.target.value);
              update("priceMax", event.target.value ? String(Math.round(dollars * 100)) : null);
            }}
            className="h-10 w-full border border-ivory-dim bg-white px-2.5 text-sm focus:border-wine focus:outline-none"
          />
        </div>
      </FilterSection>

      {showCaratFilters && (
        <FilterSection legend="Carat">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              placeholder="Min"
              aria-label="Minimum carat"
              value={caratMin ?? ""}
              onChange={(event) => update("caratMin", event.target.value || null)}
              className="h-10 w-full border border-ivory-dim bg-white px-2.5 text-sm focus:border-wine focus:outline-none"
            />
            <span aria-hidden="true" className="text-ink-faint">
              –
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              placeholder="Max"
              aria-label="Maximum carat"
              value={caratMax ?? ""}
              onChange={(event) => update("caratMax", event.target.value || null)}
              className="h-10 w-full border border-ivory-dim bg-white px-2.5 text-sm focus:border-wine focus:outline-none"
            />
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 text-ink">{pageTitle}</h1>
          {data && (
            <p className="mt-1.5 text-sm text-ink-soft" aria-live="polite">
              {loading ? "Loading…" : `${data.total} ${data.total === 1 ? "piece" : "pieces"}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)} className="lg:hidden">
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
          <div className="w-56">
            <Select
              label="Sort by"
              options={SORT_CHOICES}
              value={sort}
              onChange={(event) => update("sort", event.target.value)}
            />
          </div>
        </div>
      </div>

      {data && (
        <p className="mb-4 border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold-deep">
          {data.notice}
        </p>
      )}

      <div className="flex gap-8">
        <aside aria-label="Filters" className="hidden w-72 shrink-0 lg:block">
          {filterPanel}
        </aside>

        <div className="min-w-0 flex-1">
          {loading && (
            <div aria-busy="true" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="border border-ivory-dim p-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="mt-4 h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <ErrorState
              title="We couldn't load this collection"
              description={error.message}
              onRetry={refetch}
            />
          )}

          {!loading && !error && data && data.items.length === 0 && (
            <EmptyState
              title="No pieces match your filters"
              description="Try removing a filter or widening your price range."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear all filters
                </Button>
              }
            />
          )}

          {!loading && !error && data && data.items.length > 0 && (
            <>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>

              {data.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page <= 1}
                    onClick={() => update("page", String(data.page - 1), false)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-ink-soft tabular-nums">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page >= data.totalPages}
                    onClick={() => update("page", String(data.page + 1), false)}
                  >
                    Next →
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="left"
        widthClassName="w-full max-w-sm"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={clearAll}>
              Clear all
            </Button>
            <Button fullWidth onClick={() => setFiltersOpen(false)}>
              Show {data?.total ?? 0} results
            </Button>
          </div>
        }
      >
        {filterPanel}
      </Drawer>
    </div>
  );
}
