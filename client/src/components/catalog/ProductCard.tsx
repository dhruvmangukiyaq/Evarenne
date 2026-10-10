import { Link } from "react-router-dom";
import type { Product } from "../../lib/api-types";
import { ProductArt } from "./ProductArt";
import { metalLabel, shapeLabel } from "../../lib/labels";
import { Badge, PriceDisplay } from "../ui/Display";
import { useCart, useWishlist } from "../../store/cart";
import { useToast } from "../ui/toast-context";

function WishlistToggle({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  return (
    <button
      type="button"
      onClick={() =>
        toggle({
          id: product.id,
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          price: product.price,
          category: product.category,
          shape: product.shape,
        })
      }
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-wine shadow-hairline transition-transform hover:scale-105"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" />
      </svg>
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addProduct } = useCart();
  const { toast } = useToast();

  const meta: string[] = [];
  if (product.specs) {
    meta.push(`${product.specs.carat.toFixed(2)} ct`);
    meta.push(product.specs.color);
    meta.push(product.specs.clarity);
  } else if (product.centerDiamond) {
    meta.push(`${product.centerDiamond.carat.toFixed(2)} ct`);
    meta.push(`${product.centerDiamond.color} / ${product.centerDiamond.clarity}`);
  }
  if (product.metal) meta.push(metalLabel(product.metal));

  const quickAddable = product.kind === "diamond" || product.kind === "jewelry";

  return (
    <article className="group relative flex flex-col border border-ivory-dim bg-white transition-shadow duration-200 hover:shadow-card-hover">
      <WishlistToggle product={product} />

      <Link to={`/products/${product.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-wine">
        <div className="relative aspect-square overflow-hidden">
          <ProductArt product={product} className="h-full w-full transition-transform duration-500 ease-luxury group-hover:scale-[1.04]" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.diamondType && <Badge tone={product.diamondType === "natural" ? "wine" : "gold"}>{product.diamondType === "natural" ? "Natural" : "Lab-Grown"}</Badge>}
          {product.kind === "setting" && <Badge tone="neutral">Setting only</Badge>}
        </div>

        <Link
          to={`/products/${product.slug}`}
          className="font-display text-lg leading-snug text-ink underline-offset-4 hover:text-wine hover:underline"
        >
          {product.name}
        </Link>

        {product.shape && <p className="text-xs text-ink-soft">{shapeLabel(product.shape)}</p>}

        {meta.length > 0 && <p className="text-xs text-ink-soft">{meta.join(" · ")}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <PriceDisplay price={product.price} size="md" compact />
          {quickAddable && (
            <button
              type="button"
              onClick={() => {
                addProduct({ id: product.id, name: product.name, subtitle: product.sku, sku: product.sku });
                toast(`${product.name} added to your bag`, "success");
              }}
              className="border border-wine px-3.5 py-1.5 font-sans text-xs font-medium tracking-wide text-wine uppercase transition-colors hover:bg-wine hover:text-ivory"
            >
              Add to bag
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
