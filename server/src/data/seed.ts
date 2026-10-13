import type { Product } from "../domain/types.js";

/**
 * DEVELOPMENT SEED DATASET — NOT REAL INVENTORY.
 *
 * Every item below carries `dataSource: "development-seed"`. Prices, SKUs,
 * and specifications are placeholders used to exercise the catalog, filters,
 * and cart. Certificate numbers and grading-laboratory claims
 * are intentionally NULL and must never be invented — supply real values
 * (or swap this file for an API/database import) before launch.
 *
 * See /DATA_CONTRACT.md for the documented shape of this data.
 */

const USD = (amount: number) => ({ amount, currency: "USD" });
const now = "2026-01-10T00:00:00.000Z";

const noReport = {
  lab: null,
  certificateNumber: null,
  certificateUrl: null,
} as const;

/* ---------------- Loose diamonds ---------------- */

interface DiamondSeed {
  sku: string;
  name: string;
  type: "lab-grown";
  shape: Product["shape"];
  carat: number;
  cut: "Excellent" | "Very Good" | "Good";
  color: "D" | "E" | "F" | "G" | "H" | "I" | "J";
  clarity: "FL" | "IF" | "VVS1" | "VVS2" | "VS1" | "VS2" | "SI1" | "SI2";
  polish: "Excellent" | "Very Good" | "Good";
  symmetry: "Excellent" | "Very Good" | "Good";
  fluorescence: "None" | "Faint" | "Medium" | "Strong";
  measurements: string;
  priceCents: number;
  created: string;
  /** Flagged for the homepage "Featured Pieces" row. */
  featured?: boolean;
}

const diamondSeeds: DiamondSeed[] = [
  // ---- Lab-grown ----
  { sku: "EVL-RD-100", name: "Lab-Grown Round Brilliant 1.00ct", type: "lab-grown", shape: "round", carat: 1.0, cut: "Excellent", color: "E", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.45 × 6.49 × 3.99", priceCents: 155000, created: "2026-01-09" },
  { sku: "EVL-RD-150", name: "Lab-Grown Round Brilliant 1.50ct", type: "lab-grown", shape: "round", carat: 1.5, cut: "Excellent", color: "D", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "7.31 × 7.35 × 4.51", priceCents: 295000, created: "2026-01-09", featured: true },
  { sku: "EVL-RD-200", name: "Lab-Grown Round Brilliant 2.00ct", type: "lab-grown", shape: "round", carat: 2.0, cut: "Excellent", color: "E", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.08 × 8.12 × 4.98", priceCents: 490000, created: "2026-01-08" },
  { sku: "EVL-OV-120", name: "Lab-Grown Oval 1.20ct", type: "lab-grown", shape: "oval", carat: 1.2, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.24 × 5.71 × 3.52", priceCents: 195000, created: "2026-01-07", featured: true },
  { sku: "EVL-OV-200", name: "Lab-Grown Oval 2.00ct", type: "lab-grown", shape: "oval", carat: 2.0, cut: "Excellent", color: "E", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "10.42 × 7.18 × 4.41", priceCents: 420000, created: "2026-01-06" },
  { sku: "EVL-EM-150", name: "Lab-Grown Emerald Cut 1.50ct", type: "lab-grown", shape: "emerald", carat: 1.5, cut: "Excellent", color: "E", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.01 × 5.52 × 3.91", priceCents: 265000, created: "2026-01-05", featured: true },
  { sku: "EVL-PR-120", name: "Lab-Grown Princess 1.20ct", type: "lab-grown", shape: "princess", carat: 1.2, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.01 × 5.98 × 4.22", priceCents: 185000, created: "2026-01-04" },
  { sku: "EVL-CU-175", name: "Lab-Grown Cushion 1.75ct", type: "lab-grown", shape: "cushion", carat: 1.75, cut: "Excellent", color: "G", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "7.42 × 7.28 × 4.85", priceCents: 275000, created: "2026-01-03" },
  { sku: "EVL-PE-150", name: "Lab-Grown Pear 1.50ct", type: "lab-grown", shape: "pear", carat: 1.5, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "10.12 × 6.08 × 3.82", priceCents: 240000, created: "2026-01-02", featured: true },
  { sku: "EVL-RA-150", name: "Lab-Grown Radiant 1.50ct", type: "lab-grown", shape: "radiant", carat: 1.5, cut: "Excellent", color: "H", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "7.52 × 6.22 × 4.29", priceCents: 245000, created: "2026-01-01" },
  { sku: "EVL-AS-150", name: "Lab-Grown Asscher 1.50ct", type: "lab-grown", shape: "asscher", carat: 1.5, cut: "Excellent", color: "E", clarity: "VS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.88 × 6.85 × 4.62", priceCents: 255000, created: "2025-12-31" },
  { sku: "EVL-MQ-120", name: "Lab-Grown Marquise 1.20ct", type: "lab-grown", shape: "marquise", carat: 1.2, cut: "Excellent", color: "G", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "12.18 × 6.02 × 3.62", priceCents: 205000, created: "2025-12-30" },
  { sku: "EVL-HT-100", name: "Lab-Grown Heart 1.00ct", type: "lab-grown", shape: "heart", carat: 1.0, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.71 × 6.92 × 4.18", priceCents: 175000, created: "2025-12-29" },
];


/* ---------------- Build final dataset ---------------- */

const diamonds: Product[] = diamondSeeds.map((seed) => ({
  id: `seed-${seed.sku.toLowerCase()}`,
  slug: seed.sku.toLowerCase(),
  sku: seed.sku,
  name: seed.name,
  kind: "diamond" as const,
  category: "loose-diamond" as const,
  description: `${seed.name} from the development preview catalog. Grading details shown are sample values, not a verified lab report.`,
  price: USD(seed.priceCents),
  dataSource: "development-seed" as const,
  images: [],
  createdAt: seed.created,
  featured: seed.featured,
  diamondType: seed.type,
  shape: seed.shape,
  specs: {
    carat: seed.carat,
    cut: seed.cut,
    color: seed.color,
    clarity: seed.clarity,
    polish: seed.polish,
    symmetry: seed.symmetry,
    fluorescence: seed.fluorescence,
    measurements: seed.measurements,
    ...noReport,
  },
}));


/* ---------------- Final dataset ---------------- */

export const SEED_PRODUCTS: Product[] = diamonds;

export const SEED_GENERATED_AT = now;
