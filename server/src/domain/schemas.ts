import { z } from "zod";
import {
  CLARITY_GRADES,
  COLOR_GRADES,
  CUT_GRADES,
  DIAMOND_SHAPES,
  DIAMOND_TYPES,
  FLUORESCENCE_GRADES,
  POLISH_GRADES,
  PRODUCT_KINDS,
  SORT_OPTIONS,
  SYMMETRY_GRADES,
  CATEGORIES,
} from "./types.js";

const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/, "Expected ISO 4217 code, e.g. USD"),
});

const specsSchema = z.object({
  carat: z.number().positive().max(20),
  cut: z.enum(CUT_GRADES),
  color: z.enum(COLOR_GRADES),
  clarity: z.enum(CLARITY_GRADES),
  polish: z.enum(POLISH_GRADES),
  symmetry: z.enum(SYMMETRY_GRADES),
  fluorescence: z.enum(FLUORESCENCE_GRADES),
  measurements: z.string().min(1),
  lab: z.string().min(1).nullable(),
  // Certificate numbers must never be fabricated: format-checked only when present.
  certificateNumber: z
    .string()
    .regex(/^[A-Z0-9-]{6,32}$/, "Certificate numbers must be 6–32 chars of A–Z, 0–9, hyphen")
    .nullable(),
  certificateUrl: z
    .string()
    .url()
    .nullable(),
});

export const productSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    sku: z.string().min(3),
    name: z.string().min(1),
    kind: z.enum(PRODUCT_KINDS),
    category: z.enum(CATEGORIES),
    description: z.string().min(1),
    price: moneySchema,
    dataSource: z.literal("development-seed"),
    images: z.array(z.object({ src: z.string().min(1), alt: z.string().min(1) })),
    createdAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z)?$/, "Expected ISO date or datetime"),
    diamondType: z.enum(DIAMOND_TYPES).optional(),
    shape: z.enum(DIAMOND_SHAPES).optional(),
    specs: specsSchema.optional(),
    featured: z.boolean().optional(),
  })
  .superRefine((product, ctx) => {
    if (!product.diamondType || !product.shape || !product.specs) {
      ctx.addIssue({
        code: "custom",
        message: "Diamond products require diamondType, shape and specs",
        path: ["kind"],
      });
    }
  });

export const productArraySchema = z.array(productSchema);

/* ---------------- Query-string schemas (API input validation) ---------------- */

const csvEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .transform((raw) => raw.split(",").map((v) => v.trim()).filter(Boolean))
    .pipe(z.array(z.enum(values)).min(1));

const optionalNumber = z.coerce.number().nonnegative().optional();

export const catalogQuerySchema = z
  .object({
    category: z.enum(CATEGORIES).optional(),
    diamondType: z.enum(DIAMOND_TYPES).optional(),
    q: z.string().max(200).optional(),
    shapes: csvEnum(DIAMOND_SHAPES).optional(),
    cuts: csvEnum(CUT_GRADES).optional(),
    colors: csvEnum(COLOR_GRADES).optional(),
    clarities: csvEnum(CLARITY_GRADES).optional(),
    polishes: csvEnum(POLISH_GRADES).optional(),
    symmetries: csvEnum(SYMMETRY_GRADES).optional(),
    fluorescences: csvEnum(FLUORESCENCE_GRADES).optional(),
    caratMin: optionalNumber,
    caratMax: optionalNumber,
    priceMin: optionalNumber,
    priceMax: optionalNumber,
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(48).optional(),
    sort: z.enum(SORT_OPTIONS).optional(),
  })
  .superRefine((query, ctx) => {
    if (query.caratMin !== undefined && query.caratMax !== undefined && query.caratMin > query.caratMax) {
      ctx.addIssue({ code: "custom", message: "caratMin cannot exceed caratMax", path: ["caratMin"] });
    }
    if (query.priceMin !== undefined && query.priceMax !== undefined && query.priceMin > query.priceMax) {
      ctx.addIssue({ code: "custom", message: "priceMin cannot exceed priceMax", path: ["priceMin"] });
    }
  });

export type CatalogQueryInput = z.infer<typeof catalogQuerySchema>;
