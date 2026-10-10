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

export type Metal =
  | "platinum"
  | "18k-white-gold"
  | "14k-white-gold"
  | "18k-yellow-gold"
  | "14k-yellow-gold"
  | "18k-rose-gold"
  | "14k-rose-gold";

export type RingStyle =
  | "solitaire"
  | "halo"
  | "pavé"
  | "hidden-halo"
  | "three-stone"
  | "vintage"
  | "bezel";

export type Category =
  | "loose-diamond"
  | "engagement-ring"
  | "wedding-band"
  | "earrings"
  | "pendant"
  | "bracelet";

export type ProductKind = "diamond" | "setting" | "ring" | "jewelry";

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
  metal?: Metal;
  style?: RingStyle;
  centerDiamond?: DiamondSpecs & { shape: DiamondShape; type: DiamondType };
  compatibility?: {
    shapes: DiamondShape[];
    caratMin: number;
    caratMax: number;
  };
  featured?: boolean;
}

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "carat-asc"
  | "carat-desc"
  | "newest";

export interface FacetBucket {
  value: string;
  count: number;
}

export interface CatalogFacets {
  shapes: FacetBucket[];
  metals: FacetBucket[];
  styles: FacetBucket[];
  cuts: FacetBucket[];
  colors: FacetBucket[];
  clarities: FacetBucket[];
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

/* ---------------- Pricing quote (server-authoritative) ---------------- */

export type QuoteLine =
  | {
      kind: "product";
      product: { id: string; sku: string; name: string; price: Money };
      quantity: number;
      lineTotal: Money;
    }
  | {
      kind: "configured-ring";
      setting: { id: string; sku: string; name: string; price: Money };
      diamond: { id: string; sku: string; name: string; price: Money };
      quantity: number;
      lineTotal: Money;
    };

export interface QuoteResponse {
  lines: QuoteLine[];
  total: Money;
  status: "quote-only";
  dataSource: "development-seed";
}

/* ---------------- API error shape ---------------- */

export interface ApiErrorBody {
  error: string;
  issues?: Array<{ path: string; message: string }>;
}
