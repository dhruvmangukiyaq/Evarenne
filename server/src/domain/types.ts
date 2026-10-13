/**
 * EVARENNE DOMAIN MODEL
 *
 * The Express API is the single source of truth for catalog data. The client
 * mirrors these shapes in `client/src/lib/api-types.ts`.
 *
 * IMPORTANT: The current dataset is a DEVELOPMENT SEED (see src/data/seed.ts
 * and /DATA_CONTRACT.md). It is not verified inventory. Certificate numbers,
 * lab reports, stock, and prices are placeholder data and are displayed by the
 * UI only where the data supports them.
 */

export const DIAMOND_SHAPES = [
  "round",
  "oval",
  "princess",
  "emerald",
  "cushion",
  "pear",
  "radiant",
  "asscher",
  "marquise",
  "heart",
] as const;
export type DiamondShape = (typeof DIAMOND_SHAPES)[number];

export const CUT_GRADES = ["Excellent", "Very Good", "Good"] as const;
export type CutGrade = (typeof CUT_GRADES)[number];

export const COLOR_GRADES = ["D", "E", "F", "G", "H", "I", "J"] as const;
export type ColorGrade = (typeof COLOR_GRADES)[number];

export const CLARITY_GRADES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"] as const;
export type ClarityGrade = (typeof CLARITY_GRADES)[number];

export const POLISH_GRADES = ["Excellent", "Very Good", "Good"] as const;
export type PolishGrade = (typeof POLISH_GRADES)[number];
export const SYMMETRY_GRADES = ["Excellent", "Very Good", "Good"] as const;
export type SymmetryGrade = (typeof SYMMETRY_GRADES)[number];
export const FLUORESCENCE_GRADES = ["None", "Faint", "Medium", "Strong"] as const;
export type FluorescenceGrade = (typeof FLUORESCENCE_GRADES)[number];

export const DIAMOND_TYPES = ["natural", "lab-grown"] as const;
export type DiamondType = (typeof DIAMOND_TYPES)[number];

export const CATEGORIES = ["loose-diamond"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRODUCT_KINDS = ["diamond"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export interface Money {
  amount: number;
  currency: string;
}

/** Grading data for a loose diamond. Labs/certificates are shown ONLY when present. */
export interface DiamondSpecs {
  carat: number;
  cut: CutGrade;
  color: ColorGrade;
  clarity: ClarityGrade;
  polish: (typeof POLISH_GRADES)[number];
  symmetry: (typeof SYMMETRY_GRADES)[number];
  fluorescence: (typeof FLUORESCENCE_GRADES)[number];
  /** Millimeters, e.g. "6.52 × 6.58 × 4.01". */
  measurements: string;
  /** Grading laboratory name. null = not supplied by data. */
  lab: string | null;
  /** Certificate/report number. NEVER fabricated — null when not supplied. */
  certificateNumber: string | null;
  /** Trusted external report URL. null when not supplied. */
  certificateUrl: string | null;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  kind: ProductKind;
  category: Category;
  description: string;
  price: Money;
  /**
   * Where the record came from: the bundled development seed, or an entry the
   * catalogue owner added through the admin panel. The client shows its
   * "Sample data" badge only for seed entries.
   */
  dataSource: "development-seed" | "admin";
  /** Photography is not yet supplied; empty means the UI renders shape art. */
  images: ProductImage[];
  /** Optional clip of the stone itself, served from the media store. */
  video?: string | null;
  createdAt: string;

  // ---- Diamond facets ----
  diamondType?: DiamondType;
  shape?: DiamondShape;
  specs?: DiamondSpecs;

  /** Featured on the homepage. Only used when explicitly true in data. */
  featured?: boolean;
}

/* ---------------- Query model ---------------- */

export const SORT_OPTIONS = [
  "relevance",
  "price-asc",
  "price-desc",
  "carat-asc",
  "carat-desc",
  "newest",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export interface CatalogQuery {
  /** Category route scope; when set, only that category is considered. */
  category?: Category;
  /** Diamond type scope, e.g. /diamonds/natural. */
  diamondType?: DiamondType;
  q?: string;
  shapes?: DiamondShape[];
  caratMin?: number;
  caratMax?: number;
  priceMin?: number;
  priceMax?: number;
  cuts?: CutGrade[];
  colors?: ColorGrade[];
  clarities?: ClarityGrade[];
  polishes?: PolishGrade[];
  symmetries?: SymmetryGrade[];
  fluorescences?: FluorescenceGrade[];
  page?: number;
  pageSize?: number;
  sort?: SortOption;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Facet counts for the UI filter panel, computed on the scoped set. */
  facets: CatalogFacets;
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface CatalogFacets {
  shapes: FacetBucket[];
  cuts: FacetBucket[];
  colors: FacetBucket[];
  clarities: FacetBucket[];
  polishes: FacetBucket[];
  symmetries: FacetBucket[];
  fluorescences: FacetBucket[];
  priceMin: number | null;
  priceMax: number | null;
  caratMin: number | null;
  caratMax: number | null;
}
