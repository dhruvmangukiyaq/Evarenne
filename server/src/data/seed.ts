import type { Product } from "../domain/types.js";

/**
 * DEVELOPMENT SEED DATASET — NOT REAL INVENTORY.
 *
 * Every item below carries `dataSource: "development-seed"`. Prices, SKUs,
 * and specifications are placeholders used to exercise the catalog, filters,
 * ring builder, and cart. Certificate numbers and grading-laboratory claims
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
  type: "natural" | "lab-grown";
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
}

const diamondSeeds: DiamondSeed[] = [
  // ---- Natural ----
  { sku: "EVN-RD-050", name: "Natural Round Brilliant 0.50ct", type: "natural", shape: "round", carat: 0.5, cut: "Excellent", color: "G", clarity: "VS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "5.10 × 5.14 × 3.17", priceCents: 145000, created: "2026-01-08" },
  { sku: "EVN-RD-075", name: "Natural Round Brilliant 0.75ct", type: "natural", shape: "round", carat: 0.75, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "Faint", measurements: "5.78 × 5.82 × 3.58", priceCents: 285000, created: "2026-01-09" },
  { sku: "EVN-RD-100", name: "Natural Round Brilliant 1.00ct", type: "natural", shape: "round", carat: 1.0, cut: "Excellent", color: "E", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.42 × 6.47 × 4.01", priceCents: 620000, created: "2026-01-05" },
  { sku: "EVN-RD-120", name: "Natural Round Brilliant 1.20ct", type: "natural", shape: "round", carat: 1.2, cut: "Excellent", color: "F", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.78 × 6.83 × 4.22", priceCents: 865000, created: "2026-01-03" },
  { sku: "EVN-OV-080", name: "Natural Oval 0.80ct", type: "natural", shape: "oval", carat: 0.8, cut: "Excellent", color: "G", clarity: "VS1", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "7.02 × 4.98 × 3.09", priceCents: 320000, created: "2026-01-07" },
  { sku: "EVN-OV-150", name: "Natural Oval 1.50ct", type: "natural", shape: "oval", carat: 1.5, cut: "Excellent", color: "F", clarity: "VS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "Faint", measurements: "9.12 × 6.34 × 3.91", priceCents: 1050000, created: "2026-01-02" },
  { sku: "EVN-EM-105", name: "Natural Emerald Cut 1.05ct", type: "natural", shape: "emerald", carat: 1.05, cut: "Very Good", color: "F", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "7.11 × 4.95 × 3.44", priceCents: 590000, created: "2026-01-06" },
  { sku: "EVN-PR-100", name: "Natural Princess 1.00ct", type: "natural", shape: "princess", carat: 1.0, cut: "Excellent", color: "G", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "5.42 × 5.39 × 3.81", priceCents: 480000, created: "2026-01-04" },
  { sku: "EVN-CU-130", name: "Natural Cushion 1.30ct", type: "natural", shape: "cushion", carat: 1.3, cut: "Excellent", color: "H", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "Faint", measurements: "6.61 × 6.44 × 4.32", priceCents: 610000, created: "2025-12-28" },
  { sku: "EVN-PE-090", name: "Natural Pear 0.90ct", type: "natural", shape: "pear", carat: 0.9, cut: "Excellent", color: "G", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.41 × 5.02 × 3.18", priceCents: 405000, created: "2025-12-30" },
  { sku: "EVN-RA-110", name: "Natural Radiant 1.10ct", type: "natural", shape: "radiant", carat: 1.1, cut: "Excellent", color: "H", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.55 × 5.41 × 3.72", priceCents: 495000, created: "2025-12-29" },
  { sku: "EVN-AS-100", name: "Natural Asscher 1.00ct", type: "natural", shape: "asscher", carat: 1.0, cut: "Very Good", color: "I", clarity: "VS2", polish: "Very Good", symmetry: "Excellent", fluorescence: "None", measurements: "5.61 × 5.58 × 3.92", priceCents: 415000, created: "2025-12-27" },
  { sku: "EVN-MQ-075", name: "Natural Marquise 0.75ct", type: "natural", shape: "marquise", carat: 0.75, cut: "Excellent", color: "F", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "10.22 × 5.11 × 2.98", priceCents: 295000, created: "2025-12-26" },
  { sku: "EVN-HT-100", name: "Natural Heart 1.00ct", type: "natural", shape: "heart", carat: 1.0, cut: "Excellent", color: "G", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "Faint", measurements: "6.72 × 6.89 × 4.21", priceCents: 530000, created: "2025-12-25" },

  // ---- Lab-grown ----
  { sku: "EVL-RD-100", name: "Lab-Grown Round Brilliant 1.00ct", type: "lab-grown", shape: "round", carat: 1.0, cut: "Excellent", color: "E", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.45 × 6.49 × 3.99", priceCents: 155000, created: "2026-01-09" },
  { sku: "EVL-RD-150", name: "Lab-Grown Round Brilliant 1.50ct", type: "lab-grown", shape: "round", carat: 1.5, cut: "Excellent", color: "D", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "7.31 × 7.35 × 4.51", priceCents: 295000, created: "2026-01-09" },
  { sku: "EVL-RD-200", name: "Lab-Grown Round Brilliant 2.00ct", type: "lab-grown", shape: "round", carat: 2.0, cut: "Excellent", color: "E", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.08 × 8.12 × 4.98", priceCents: 490000, created: "2026-01-08" },
  { sku: "EVL-OV-120", name: "Lab-Grown Oval 1.20ct", type: "lab-grown", shape: "oval", carat: 1.2, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.24 × 5.71 × 3.52", priceCents: 195000, created: "2026-01-07" },
  { sku: "EVL-OV-200", name: "Lab-Grown Oval 2.00ct", type: "lab-grown", shape: "oval", carat: 2.0, cut: "Excellent", color: "E", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "10.42 × 7.18 × 4.41", priceCents: 420000, created: "2026-01-06" },
  { sku: "EVL-EM-150", name: "Lab-Grown Emerald Cut 1.50ct", type: "lab-grown", shape: "emerald", carat: 1.5, cut: "Excellent", color: "E", clarity: "VVS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "8.01 × 5.52 × 3.91", priceCents: 265000, created: "2026-01-05" },
  { sku: "EVL-PR-120", name: "Lab-Grown Princess 1.20ct", type: "lab-grown", shape: "princess", carat: 1.2, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.01 × 5.98 × 4.22", priceCents: 185000, created: "2026-01-04" },
  { sku: "EVL-CU-175", name: "Lab-Grown Cushion 1.75ct", type: "lab-grown", shape: "cushion", carat: 1.75, cut: "Excellent", color: "G", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "7.42 × 7.28 × 4.85", priceCents: 275000, created: "2026-01-03" },
  { sku: "EVL-PE-150", name: "Lab-Grown Pear 1.50ct", type: "lab-grown", shape: "pear", carat: 1.5, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "10.12 × 6.08 × 3.82", priceCents: 240000, created: "2026-01-02" },
  { sku: "EVL-RA-150", name: "Lab-Grown Radiant 1.50ct", type: "lab-grown", shape: "radiant", carat: 1.5, cut: "Excellent", color: "H", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "7.52 × 6.22 × 4.29", priceCents: 245000, created: "2026-01-01" },
  { sku: "EVL-AS-150", name: "Lab-Grown Asscher 1.50ct", type: "lab-grown", shape: "asscher", carat: 1.5, cut: "Excellent", color: "E", clarity: "VS2", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.88 × 6.85 × 4.62", priceCents: 255000, created: "2025-12-31" },
  { sku: "EVL-MQ-120", name: "Lab-Grown Marquise 1.20ct", type: "lab-grown", shape: "marquise", carat: 1.2, cut: "Excellent", color: "G", clarity: "VS2", polish: "Excellent", symmetry: "Very Good", fluorescence: "None", measurements: "12.18 × 6.02 × 3.62", priceCents: 205000, created: "2025-12-30" },
  { sku: "EVL-HT-100", name: "Lab-Grown Heart 1.00ct", type: "lab-grown", shape: "heart", carat: 1.0, cut: "Excellent", color: "F", clarity: "VS1", polish: "Excellent", symmetry: "Excellent", fluorescence: "None", measurements: "6.71 × 6.92 × 4.18", priceCents: 175000, created: "2025-12-29" },
];

/* ---------------- Settings (ring settings for the builder) ---------------- */

interface SettingSeed {
  sku: string;
  name: string;
  style: Product["style"];
  metal: Product["metal"];
  priceCents: number;
  caratMin: number;
  caratMax: number;
  shapes: NonNullable<Product["shape"]>[];
  description: string;
  created: string;
}

const settingSeeds: SettingSeed[] = [
  { sku: "EVS-SOL-Pla", name: "Étoile Solitaire Setting", style: "solitaire", metal: "platinum", priceCents: 125000, caratMin: 0.5, caratMax: 3.0, shapes: ["round", "oval", "princess", "emerald", "cushion", "pear", "radiant", "asscher", "marquise", "heart"], description: "A slender platinum solitaire with a knife-edge profile that lifts the centre stone toward the light.", created: "2026-01-08" },
  { sku: "EVS-SOL-YG", name: "Étoile Solitaire Setting", style: "solitaire", metal: "18k-yellow-gold", priceCents: 98000, caratMin: 0.5, caratMax: 3.0, shapes: ["round", "oval", "princess", "emerald", "cushion", "pear", "radiant", "asscher", "marquise", "heart"], description: "The Étoile solitaire in warm 18k yellow gold, finished by hand to a soft mirror polish.", created: "2026-01-08" },
  { sku: "EVS-HAL-Pla", name: "Lumière Halo Setting", style: "halo", metal: "platinum", priceCents: 189000, caratMin: 0.5, caratMax: 2.0, shapes: ["round", "oval", "pear", "cushion"], description: "A halo of micro-set stones encircling the centre diamond, framed in platinum.", created: "2026-01-07" },
  { sku: "EVS-HAL-RG", name: "Lumière Halo Setting", style: "halo", metal: "18k-rose-gold", priceCents: 165000, caratMin: 0.5, caratMax: 2.0, shapes: ["round", "oval", "pear", "cushion"], description: "Rose gold halo setting with a scalloped micro-pavé border.", created: "2026-01-07" },
  { sku: "EVS-PAV-WG", name: "Rivière Pavé Setting", style: "pavé", metal: "18k-white-gold", priceCents: 172000, caratMin: 0.5, caratMax: 2.5, shapes: ["round", "oval", "emerald", "radiant"], description: "A continuous line of pavé stones runs along a refined 18k white gold band.", created: "2026-01-06" },
  { sku: "EVS-HID-Pla", name: "Aurora Hidden Halo Setting", style: "hidden-halo", metal: "platinum", priceCents: 198000, caratMin: 0.75, caratMax: 3.0, shapes: ["round", "oval", "cushion", "emerald"], description: "A hidden halo beneath the centre stone — sparkle from every angle above the hand.", created: "2026-01-05" },
  { sku: "EVS-TS-WG", name: "Trilogy Three-Stone Setting", style: "three-stone", metal: "18k-white-gold", priceCents: 215000, caratMin: 1.0, caratMax: 3.0, shapes: ["round", "emerald", "oval", "princess"], description: "Two tapered side stones frame the centre in a balanced three-stone composition.", created: "2026-01-04" },
  { sku: "EVS-VIN-YG", name: "Héritage Vintage Setting", style: "vintage", metal: "18k-yellow-gold", priceCents: 184000, caratMin: 0.5, caratMax: 2.0, shapes: ["round", "cushion", "oval"], description: "Milgrain detailing and hand-engraved shoulders inspired by archive pieces.", created: "2026-01-03" },
  { sku: "EVS-BEZ-Pla", name: "Halo Bezel Setting", style: "bezel", metal: "platinum", priceCents: 142000, caratMin: 0.3, caratMax: 1.5, shapes: ["round", "oval", "pear"], description: "A full platinum bezel that follows the stone's outline for a low, secure profile.", created: "2026-01-02" },
];

/* ---------------- Pre-configured rings ---------------- */

interface RingSeed {
  sku: string;
  name: string;
  style: NonNullable<Product["style"]>;
  metal: NonNullable<Product["metal"]>;
  priceCents: number;
  shape: NonNullable<Product["shape"]>;
  type: "natural" | "lab-grown";
  carat: number;
  cut: "Excellent" | "Very Good";
  color: "D" | "E" | "F" | "G" | "H";
  clarity: "VVS2" | "VS1" | "VS2";
  measurements: string;
  created: string;
  featured?: boolean;
}

const ringSeeds: RingSeed[] = [
  { sku: "EVR-SOL-RD-N1", name: "Étoile Solitaire Ring — 1.00ct Natural", style: "solitaire", metal: "platinum", priceCents: 745000, shape: "round", type: "natural", carat: 1.0, cut: "Excellent", color: "E", clarity: "VS1", measurements: "6.42 × 6.47 × 4.01", created: "2026-01-09", featured: true },
  { sku: "EVR-HAL-OV-N15", name: "Lumière Halo Ring — 1.50ct Natural Oval", style: "halo", metal: "18k-white-gold", priceCents: 1265000, shape: "oval", type: "natural", carat: 1.5, cut: "Excellent", color: "F", clarity: "VS2", measurements: "9.12 × 6.34 × 3.91", created: "2026-01-08", featured: true },
  { sku: "EVR-PAV-RD-L1", name: "Rivière Pavé Ring — 1.00ct Lab-Grown", style: "pavé", metal: "18k-white-gold", priceCents: 355000, shape: "round", type: "lab-grown", carat: 1.0, cut: "Excellent", color: "E", clarity: "VS1", measurements: "6.45 × 6.49 × 3.99", created: "2026-01-07", featured: true },
  { sku: "EVR-TS-EM-N105", name: "Trilogy Emerald Ring — 1.05ct Natural", style: "three-stone", metal: "platinum", priceCents: 890000, shape: "emerald", type: "natural", carat: 1.05, cut: "Very Good", color: "F", clarity: "VVS2", measurements: "7.11 × 4.95 × 3.44", created: "2026-01-06" },
  { sku: "EVR-HID-OV-L2", name: "Aurora Hidden Halo Ring — 2.00ct Lab-Grown Oval", style: "hidden-halo", metal: "platinum", priceCents: 665000, shape: "oval", type: "lab-grown", carat: 2.0, cut: "Excellent", color: "E", clarity: "VVS2", measurements: "10.42 × 7.18 × 4.41", created: "2026-01-05", featured: true },
  { sku: "EVR-VIN-CU-N13", name: "Héritage Vintage Cushion Ring — 1.30ct Natural", style: "vintage", metal: "18k-yellow-gold", priceCents: 829000, shape: "cushion", type: "natural", carat: 1.3, cut: "Excellent", color: "H", clarity: "VS2", measurements: "6.61 × 6.44 × 4.32", created: "2026-01-04" },
];

/* ---------------- Wedding bands & fine jewelry ---------------- */

interface SimpleSeed {
  sku: string;
  name: string;
  category: Product["category"];
  metal: Product["metal"];
  priceCents: number;
  description: string;
  style?: Product["style"];
  created: string;
  featured?: boolean;
}

const simpleSeeds: SimpleSeed[] = [
  { sku: "EVW-PLAIN-Pla", name: "Classic Plain Wedding Band — Platinum", category: "wedding-band", metal: "platinum", priceCents: 89000, style: "solitaire", description: "A comfort-fit platinum band, 2.5mm, finished to a soft polish.", created: "2026-01-08" },
  { sku: "EVW-PAV-WG", name: "Rivière Pavé Wedding Band — 18k White Gold", category: "wedding-band", metal: "18k-white-gold", priceCents: 132000, style: "pavé", description: "A half-eternity band of micro-set stones in 18k white gold.", created: "2026-01-07", featured: true },
  { sku: "EVW-PLAIN-YG", name: "Classic Plain Wedding Band — 18k Yellow Gold", category: "wedding-band", metal: "18k-yellow-gold", priceCents: 62000, style: "solitaire", description: "Comfort-fit 18k yellow gold band, 2.5mm.", created: "2026-01-06" },
  { sku: "EVW-ETR-Pla", name: "Eternity Band — Platinum", category: "wedding-band", metal: "platinum", priceCents: 265000, style: "pavé", description: "A full circle of stones in a platinum channel-set eternity band.", created: "2026-01-05" },
  { sku: "EVJ-STU-YG", name: "Bezel Diamond Studs — 18k Yellow Gold", category: "earrings", metal: "18k-yellow-gold", priceCents: 198000, style: "bezel", description: "A pair of bezel-set studs in 18k yellow gold. Total carat weight and grading details are supplied with the specific pair.", created: "2026-01-04", featured: true },
  { sku: "EVJ-HOO-Pla", name: "Petit Hoop Earrings — Platinum", category: "earrings", metal: "platinum", priceCents: 115000, description: "Slim platinum hoops with a hidden latch closure.", created: "2026-01-03" },
  { sku: "EVJ-PEN-RD-WG", name: "Solitaire Diamond Pendant — 18k White Gold", category: "pendant", metal: "18k-white-gold", priceCents: 158000, style: "solitaire", description: "A single solitaire pendant on a fine 18k white gold chain.", created: "2026-01-02" },
  { sku: "EVJ-TEN-YG", name: "Tennis Bracelet — 18k Yellow Gold", category: "bracelet", metal: "18k-yellow-gold", priceCents: 485000, description: "A classic line bracelet with a box clasp and double safety catch.", created: "2026-01-01", featured: true },
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

const settings: Product[] = settingSeeds.map((seed) => ({
  id: `seed-${seed.sku.toLowerCase()}`,
  slug: seed.sku.toLowerCase(),
  sku: seed.sku,
  name: seed.name,
  kind: "setting" as const,
  category: "engagement-ring" as const,
  description: seed.description,
  price: USD(seed.priceCents),
  dataSource: "development-seed" as const,
  images: [],
  createdAt: seed.created,
  metal: seed.metal,
  style: seed.style,
  compatibility: { shapes: seed.shapes, caratMin: seed.caratMin, caratMax: seed.caratMax },
}));

const rings: Product[] = ringSeeds.map((seed) => ({
  id: `seed-${seed.sku.toLowerCase()}`,
  slug: seed.sku.toLowerCase(),
  sku: seed.sku,
  name: seed.name,
  kind: "ring" as const,
  category: "engagement-ring" as const,
  description: `A pre-configured ${seed.style.replace("-", " ")} ring pairing a ${seed.metal.replace("-", " ")} setting with a ${seed.carat}ct ${seed.shape} centre diamond. Sample specification from the development preview catalog.`,
  price: USD(seed.priceCents),
  dataSource: "development-seed" as const,
  images: [],
  createdAt: seed.created,
  metal: seed.metal,
  style: seed.style,
  featured: seed.featured,
  centerDiamond: {
    shape: seed.shape,
    type: seed.type,
    carat: seed.carat,
    cut: seed.cut,
    color: seed.color,
    clarity: seed.clarity,
    polish: "Excellent",
    symmetry: "Excellent",
    fluorescence: "None",
    measurements: seed.measurements,
    ...noReport,
  },
}));

const jewelry: Product[] = simpleSeeds.map((seed) => ({
  id: `seed-${seed.sku.toLowerCase()}`,
  slug: seed.sku.toLowerCase(),
  sku: seed.sku,
  name: seed.name,
  kind: "jewelry" as const,
  category: seed.category,
  description: seed.description,
  price: USD(seed.priceCents),
  dataSource: "development-seed" as const,
  images: [],
  createdAt: seed.created,
  metal: seed.metal,
  style: seed.style,
  featured: seed.featured,
}));

export const SEED_PRODUCTS: Product[] = [...diamonds, ...settings, ...rings, ...jewelry];

/** Timestamp for the seed snapshot; surfaced in /api/config for transparency. */
export const SEED_GENERATED_AT = now;
