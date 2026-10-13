/**
 * CLIENT-SIDE MIRROR OF THE SERVER DATA CONTRACT
 *
 * These shapes mirror `server/src/domain/types.ts`. The Express API is the
 * source of truth; if the server contract changes, update this file and the
 * server schema tests together. See /DATA_CONTRACT.md.
 */

export interface Money {
  amount: number;
  currency: string;
}

export type DiamondShape =
  | "round"
  | "oval"
  | "princess"
  | "emerald"
  | "cushion"
  | "pear"
  | "radiant"
  | "asscher"
  | "marquise"
  | "heart";

export type DiamondType = "natural" | "lab-grown";

export type Category = "loose-diamond";

export type ProductKind = "diamond";

export interface DiamondSpecs {
  carat: number;
  cut: string;
  color: string;
  clarity: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  measurements: string;
  lab: string | null;
  certificateNumber: string | null;
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
  dataSource: "development-seed";
  images: ProductImage[];
  createdAt: string;
  diamondType?: DiamondType;
  shape?: DiamondShape;
  specs?: DiamondSpecs;
  featured?: boolean;
}

export type SortOption =
  | "relevance"
  | "carat-asc"
  | "carat-desc"
  | "newest";

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

export interface CatalogResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: CatalogFacets;
  dataSource: "development-seed";
  generatedAt: string;
  notice: string;
}

export interface SearchResponse {
  items: Product[];
  total: number;
  q: string;
  dataSource: "development-seed";
}

export interface ProductResponse {
  product: Product;
  dataSource: "development-seed";
  generatedAt: string;
  notice: string;
}

/* ---------------- API error shape ---------------- */

export interface ApiErrorBody {
  error: string;
  issues?: Array<{ path: string; message: string }>;
}
