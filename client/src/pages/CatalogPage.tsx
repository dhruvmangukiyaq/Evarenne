import { useCallback, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import type { CatalogResponse, DiamondShape, FacetBucket } from "../lib/api-types";
import { ProductCard } from "../components/catalog/ProductCard";
import { DiamondArt } from "../components/catalog/ProductArt";
import { FilterBar } from "../components/catalog/FilterBar";
import type { CheckFilter, FilterSpec, RangeFilter, ScaleFilter } from "../components/catalog/FilterBar";
import { shapeLabel } from "../lib/labels";
import { Breadcrumbs, EmptyState, ErrorState, Skeleton } from "../components/ui/Display";
import type { Crumb } from "../components/ui/Display";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";

/**
 * Catalog page — one component powers /diamonds/:type and /search. All
 * filter/sort/page state lives in the URL query string, so links are
 * shareable and back/forward works.
 *
 * Filters are a horizontal pill toolbar (each pill opens a dropdown panel)
 * instead of a sidebar, mirroring the reference diamond storefront.
 */

type ParamKey =
  | "shapes"
  | "cuts"
  | "colors"
  | "clarities"
  | "polishes"
  | "symmetries"
  | "fluorescences"
  | "caratMin"
  | "caratMax"
  | "sort"
  | "page"
  | "q";

const SHAPE_ALL: DiamondShape[] = [
  "round", "oval", "princess", "emerald", "cushion", "pear", "radiant", "asscher", "marquise", "heart",
];
const CUT_ALL = ["Excellent", "Very Good", "Good"];
const COLOR_ALL = ["D", "E", "F", "G", "H", "I", "J"];
const CLARITY_ALL = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];
const POLISH_ALL = ["Excellent", "Very Good", "Good"];
const SYMMETRY_ALL = ["Excellent", "Very Good", "Good"];
const FLUORESCENCE_ALL = ["None", "Faint", "Medium", "Strong"];

const SORT_CHOICES = [
  { value: "relevance", label: "Featured" },
  { value: "carat-asc", label: "Carat: Low to High" },
  { value: "carat-desc", label: "Carat: High to Low" },
  { value: "newest", label: "Newest" },
];

function csvList(params: URLSearchParams, key: ParamKey): string[] {
  const raw = params.get(key);
  return raw ? raw.split(",").filter(Boolean) : [];
}

/** Facet count for one value in one bucket list (undefined while loading). */
function facetCount(buckets: FacetBucket[] | undefined, value: string): number | undefined {
  return buckets?.find((bucket) => bucket.value === value)?.count;
}

/** Map a CSV selection back onto inclusive [low, high] indices of a grade scale. */
function gradeSpan(grades: string[], selected: string[]): [number, number] {
  const indices = selected
    .map((value) => grades.indexOf(value))
    .filter((index) => index >= 0);
  if (indices.length === 0) return [0, grades.length - 1];
  return [Math.min(...indices), Math.max(...indices)];
}

/** One per pill that holds any value (a slider range counts once). */
function gradeActive(grades: string[], selected: string[]): number {
  const [low, high] = gradeSpan(grades, selected);
  return low > 0 || high < grades.length - 1 ? 1 : 0;
}

/** Evenly spaced, rounded stops for a numeric slider's tick row. */
function scaleTicks(min: number, max: number, format: (value: number) => string): string[] {
  if (max <= min) return [format(min)];
  return [0, 0.25, 0.5, 0.75, 1].map((step) => format(min + (max - min) * step));
}

export function CatalogPage() {
  const { diamondType } = useParams<{ diamondType?: string }>();
  const [params, setParams] = useSearchParams();

  // Route → base scope: the diamonds routes are pinned to loose stones,
  // search stays open across the catalog.
  const pathname = window.location.pathname;
  const isDiamondsRoute = pathname.startsWith("/diamonds/");
  const isSearchRoute = pathname === "/search";

  const scopeCategory = useMemo(
    () => (isDiamondsRoute ? "loose-diamond" : undefined),
    [isDiamondsRoute],
  );

  const showDiamondFilters = isDiamondsRoute || isSearchRoute;
  const showCaratFilters = isDiamondsRoute || isSearchRoute;

  // Read filter state from URL
  const shapes = csvList(params, "shapes");
  const cuts = csvList(params, "cuts");
  const colors = csvList(params, "colors");
  const clarities = csvList(params, "clarities");
  const polishes = csvList(params, "polishes");
  const symmetries = csvList(params, "symmetries");
  const fluorescences = csvList(params, "fluorescences");
  const caratMin = params.get("caratMin") ?? undefined;
  const caratMax = params.get("caratMax") ?? undefined;
  const sort = params.get("sort") ?? "relevance";
  const page = Number(params.get("page") ?? "1");
  const q = params.get("q") ?? undefined;

  const activeCount =
    shapes.length +
    gradeActive(COLOR_ALL, colors) +
    gradeActive(CLARITY_ALL, clarities) +
    gradeActive(CUT_ALL, cuts) +
    gradeActive(POLISH_ALL, polishes) +
    gradeActive(SYMMETRY_ALL, symmetries) +
    gradeActive(FLUORESCENCE_ALL, fluorescences) +
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
    setParams(next);
  }, [q, setParams]);

  /** Drop every value of one pill — range pills clear their min and max. */
  const clearFilter = useCallback(
    (key: string) => {
      const next = new URLSearchParams(params);
      if (key === "carat") {
        next.delete("caratMin");
        next.delete("caratMax");
      } else {
        next.delete(key);
      }
      next.delete("page");
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  // Build API params from URL state
  const apiParams = useMemo(() => {
    const p: Record<string, unknown> = {};
    if (isDiamondsRoute && diamondType) p.diamondType = diamondType;
    if (scopeCategory) p.category = scopeCategory;
    if (q) p.q = q;
    if (shapes.length) p.shapes = shapes;
    if (cuts.length) p.cuts = cuts;
    if (colors.length) p.colors = colors;
    if (clarities.length) p.clarities = clarities;
    if (polishes.length) p.polishes = polishes;
    if (symmetries.length) p.symmetries = symmetries;
    if (fluorescences.length) p.fluorescences = fluorescences;
    if (caratMin) p.caratMin = caratMin;
    if (caratMax) p.caratMax = caratMax;
    p.sort = sort;
    p.page = page;
    p.pageSize = 12;
    return p;
  }, [
    isDiamondsRoute, diamondType, scopeCategory, q,
    shapes, cuts, colors, clarities, polishes, symmetries, fluorescences,
    caratMin, caratMax, sort, page,
  ]);

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
    return "Collection";
  }, [isSearchRoute, isDiamondsRoute, diamondType, q]);

  const breadcrumbItems = useMemo<Crumb[]>(() => {
    const crumbs: Crumb[] = [{ label: "Home", to: "/" }];
    if (isSearchRoute) crumbs.push({ label: "Search" });
    else if (isDiamondsRoute) {
      crumbs.push({ label: "Diamonds" });
      crumbs.push({ label: diamondType === "lab-grown" ? "Lab-Grown" : "Natural" });
    }
    return crumbs;
  }, [isSearchRoute, isDiamondsRoute, diamondType]);

  const facets = data?.facets;

  const shapeFilter: CheckFilter = {
    kind: "check",
    key: "shapes",
    label: "Shape",
    selected: shapes,
    options: SHAPE_ALL.map((shape) => ({
      value: shape,
      label: shapeLabel(shape),
      count: facetCount(facets?.shapes, shape),
      icon: <DiamondArt shape={shape} framed={false} className="h-5 w-5 shrink-0" title="" />,
    })),
  };

  /** Ordered grade scales → dual-handle slider pills (reference storefront). */
  const scaleFilter = (key: ParamKey, label: string, grades: string[], selected: string[]): ScaleFilter => {
    const [low, high] = gradeSpan(grades, selected);
    return {
      kind: "scale",
      key,
      label,
      grades,
      minIdx: low,
      maxIdx: high,
      onRangeChange: (minIdx, maxIdx) =>
        update(key, minIdx === 0 && maxIdx === grades.length - 1 ? null : grades.slice(minIdx, maxIdx + 1).join(",")),
    };
  };

  const colourFilter = scaleFilter("colors", "Colour", COLOR_ALL, colors);
  const clarityFilter = scaleFilter("clarities", "Clarity", CLARITY_ALL, clarities);
  const polishFilter = scaleFilter("polishes", "Polish", POLISH_ALL, polishes);
  const symmetryFilter = scaleFilter("symmetries", "Symmetry", SYMMETRY_ALL, symmetries);
  const fluorescenceFilter = scaleFilter("fluorescences", "Fluorescence", FLUORESCENCE_ALL, fluorescences);
  const cutFilter = scaleFilter("cuts", "Cut", CUT_ALL, cuts);

  // Numeric sliders speak display units (carats); the URL keeps carat in
  // carats, as the API expects.
  const caratLo = facets?.caratMin != null ? Math.floor(facets.caratMin * 20) / 20 : 0;
  const caratHi = facets?.caratMax != null ? Math.ceil(facets.caratMax * 20) / 20 : 5;

  const caratFilter: RangeFilter = {
    kind: "range",
    key: "carat",
    label: "Carat",
    min: caratMin,
    max: caratMax,
    slider: {
      min: caratLo,
      max: Math.max(caratHi, caratLo + 0.05),
      step: 0.05,
      ticks: scaleTicks(caratLo, Math.max(caratHi, caratLo + 0.05), (value) =>
        `${(Math.round(value * 100) / 100).toFixed(2)}`,
      ),
    },
    minLabel: "Minimum carat",
    maxLabel: "Maximum carat",
    format: (value) => `${(Math.round(value * 100) / 100).toFixed(2)} ct`,
    onMinChange: (value) => update("caratMin", value),
    onMaxChange: (value) => update("caratMax", value),
  };

  // Pill order mirrors the reference bar: SHAPE, COLOUR, CLARITY, CARAT,
  // POLISH, SYMMETRY, FLUORESCENCE, CUT.
  const filters: FilterSpec[] = [];
  if (showDiamondFilters) filters.push(shapeFilter, colourFilter, clarityFilter);
  if (showCaratFilters) filters.push(caratFilter);
  if (showDiamondFilters) {
    filters.push(polishFilter, symmetryFilter, fluorescenceFilter, cutFilter);
  }

  const isNatural = diamondType !== "lab-grown";
  // Sentence-case display type, generous padding: the reference toggle.
  const segmentClass = (active: boolean) =>
    `inline-flex h-[3.25rem] items-center rounded-[5px] border px-9 font-display text-base transition-colors ${
      active
        ? "border-olive bg-olive text-ivory"
        : "border-charcoal/25 bg-white text-charcoal hover:border-olive hover:text-olive"
    }`;

  return (
    <div className="mx-auto max-w-(--container-page) px-4 py-8 lg:px-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-5" />

      <Reveal delay={100} className="mb-6">
        <h1 className="font-display text-h1 text-charcoal">{pageTitle}</h1>
        {data && (
          <p className="mt-1.5 text-sm text-charcoal-soft" aria-live="polite">
            {loading ? "Loading…" : `${data.total} ${data.total === 1 ? "piece" : "pieces"}`}
          </p>
        )}
      </Reveal>

      <Reveal delay={200} className="mb-7">
        {isDiamondsRoute && (
          <div className="mb-6 flex justify-center">
            <nav aria-label="Diamond type" className="flex flex-wrap justify-center gap-4">
              <Link
                to={{
                  pathname: "/diamonds/natural",
                  search: params.size ? `?${params.toString()}` : "",
                }}
                aria-current={isNatural ? "page" : undefined}
                className={segmentClass(isNatural)}
              >
                Natural Diamond
              </Link>
              <Link
                to={{
                  pathname: "/diamonds/lab-grown",
                  search: params.size ? `?${params.toString()}` : "",
                }}
                aria-current={!isNatural ? "page" : undefined}
                className={segmentClass(!isNatural)}
              >
                Lab-Grown
              </Link>
            </nav>
          </div>
        )}

        <FilterBar
          filters={filters}
          onToggle={(key, value) => toggleMulti(key as ParamKey, value)}
          onClear={clearFilter}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-4 text-sm">
            {activeCount > 0 && (
              <>
                <span className="text-charcoal-soft" aria-live="polite">
                  {activeCount} filter{activeCount === 1 ? "" : "s"} applied
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-sans text-sm font-medium text-olive underline-offset-4 hover:underline"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 font-display text-sm text-charcoal-soft">
            <span aria-hidden="true">Sort by</span>
            <div className="relative inline-flex items-center">
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(event) => update("sort", event.target.value)}
                className="cursor-pointer appearance-none border-0 bg-transparent pr-5 font-display text-sm text-charcoal focus:outline-none"
              >
                {SORT_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 text-charcoal-soft"
              >
                ⌄
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={250}>
        {loading && (
          <div aria-busy="true" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
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
            description="Try removing a filter or widening your carat range."
            action={
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            }
          />
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((product, index) => (
                <Reveal as="li" key={product.id} delay={(index % 4) * 100 + 100}>
                  <ProductCard product={product} />
                </Reveal>
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
                <span className="text-sm text-charcoal-soft tabular-nums">
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
      </Reveal>
    </div>
  );
}
