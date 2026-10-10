import { z } from "zod";
import { Router } from "express";
import { findProduct } from "../domain/catalog.js";
import { SEED_PRODUCTS } from "../data/seed.js";

/**
 * Pricing API — server-side authority for money.
 *
 * The browser NEVER decides a price. Add-to-cart and checkout always go
 * through POST /api/pricing/quote, which recomputes the total from the
 * server-side catalog. This is the integration boundary where a real
 * inventory/price service replaces the seed lookup before launch.
 */

const quoteLineSchema = z
  .object({
    productId: z.string().min(1).optional(),
    quantity: z.number().int().positive().max(10),
    /** For ring-builder configurations: the chosen setting + diamond pair. */
    settingId: z.string().min(1).optional(),
    diamondId: z.string().min(1).optional(),
  })
  .superRefine((line, ctx) => {
    const isConfiguredRing = Boolean(line.settingId && line.diamondId);
    if (!line.productId && !isConfiguredRing) {
      ctx.addIssue({
        code: "custom",
        message: "Provide productId, or both settingId and diamondId",
      });
    }
    if (line.productId && isConfiguredRing) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either productId or a settingId+diamondId pair, not both",
      });
    }
  });

const quoteSchema = z.object({
  items: z.array(quoteLineSchema).min(1).max(20),
});

export const pricingRouter = Router();

pricingRouter.post("/quote", (req, res) => {
  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid quote request",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  const lines = [];
  let total = 0;
  let currency: string | null = null;

  for (const line of parsed.data.items) {
    // A configured ring line item is priced as setting + diamond.
    if (line.settingId && line.diamondId) {
      const setting = findProduct(SEED_PRODUCTS, line.settingId);
      const diamond = findProduct(SEED_PRODUCTS, line.diamondId);
      if (!setting || setting.kind !== "setting") {
        res.status(409).json({ error: `Unknown or invalid setting: ${line.settingId}` });
        return;
      }
      if (!diamond || diamond.kind !== "diamond") {
        res.status(409).json({ error: `Unknown or invalid diamond: ${line.diamondId}` });
        return;
      }
      // Compatibility check — the same rule the builder enforces.
      const compatible =
        diamond.shape != null &&
        setting.compatibility?.shapes.includes(diamond.shape) &&
        diamond.specs != null &&
        diamond.specs.carat >= (setting.compatibility?.caratMin ?? 0) &&
        diamond.specs.carat <= (setting.compatibility?.caratMax ?? Infinity);
      if (!compatible) {
        res.status(409).json({ error: "The selected diamond is not compatible with this setting." });
        return;
      }
      const lineTotal = setting.price.amount + diamond.price.amount;
      total += lineTotal * line.quantity;
      currency = currency ?? setting.price.currency;
      lines.push({
        kind: "configured-ring" as const,
        setting: { id: setting.id, sku: setting.sku, name: setting.name, price: setting.price },
        diamond: { id: diamond.id, sku: diamond.sku, name: diamond.name, price: diamond.price },
        quantity: line.quantity,
        lineTotal: { amount: lineTotal, currency: setting.price.currency },
      });
      continue;
    }

    const productId = line.productId;
    if (!productId) {
      // Unreachable via schema validation, but keep the boundary defensive.
      res.status(400).json({ error: "Each line requires a productId or a setting+diamond pair" });
      return;
    }
    const product = findProduct(SEED_PRODUCTS, productId);
    if (!product) {
      res.status(409).json({ error: `Unknown product: ${productId}` });
      return;
    }
    const lineTotal = product.price.amount * line.quantity;
    total += lineTotal;
    currency = currency ?? product.price.currency;
    lines.push({
      kind: "product" as const,
      product: { id: product.id, sku: product.sku, name: product.name, price: product.price },
      quantity: line.quantity,
      lineTotal: { amount: lineTotal, currency: product.price.currency },
    });
  }

  res.json({
    lines,
    total: { amount: total, currency: currency ?? "USD" },
    // Honest status: quoting is not ordering, and no order has been placed.
    status: "quote-only",
    dataSource: "development-seed" as const,
  });
});
