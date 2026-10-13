import { Link } from "react-router-dom";
import type { Product } from "../../lib/api-types";
import { ProductArt } from "./ProductArt";
import { shapeLabel } from "../../lib/labels";
import { Badge } from "../ui/Display";

/**
 * Catalog card — a view-only entry point into the detail page. This site is a
 * reference catalogue: it shows specifications, never prices or purchase
 * actions.
 */
export function ProductCard({ product }: { product: Product }) {
  const meta: string[] = [];
  if (product.specs) {
    meta.push(`${product.specs.carat.toFixed(2)} ct`);
    if (product.specs.color) meta.push(`Colour ${product.specs.color}`);
    if (product.specs.clarity) meta.push(`Clarity ${product.specs.clarity}`);
  }

  return (
    <article className="group relative flex flex-col border border-ivory-dim bg-white transition-shadow duration-200 hover:shadow-card-hover">
      <Link
        to={`/products/${product.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-olive"
      >
        <div className="relative aspect-square overflow-hidden">
          <ProductArt product={product} className="h-full w-full transition-transform duration-500 ease-luxury group-hover:scale-[1.04]" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.diamondType && (
            <Badge tone={product.diamondType === "natural" ? "olive" : "champagne"}>
              {product.diamondType === "natural" ? "Natural" : "Lab-Grown"}
            </Badge>
          )}
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="font-display text-lg leading-snug text-charcoal underline-offset-4 hover:text-olive hover:underline"
        >
          {product.name}
        </Link>

        {product.shape && <p className="text-xs text-charcoal-soft">{shapeLabel(product.shape)}</p>}

        {meta.length > 0 && <p className="text-xs text-charcoal-soft">{meta.join(" · ")}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-olive"
          >
            View details
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
