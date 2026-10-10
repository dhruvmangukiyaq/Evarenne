import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { ProductCard } from "../components/catalog/ProductCard";
import { DiamondArt } from "../components/catalog/ProductArt";
import { shapeLabel } from "../lib/labels";
import { Skeleton } from "../components/ui/Display";
import type { DiamondShape, Product } from "../lib/api-types";

const HOME_SHAPES: DiamondShape[] = ["round", "oval", "emerald", "princess", "cushion", "pear"];

const STYLES = [
  { slug: "solitaire", name: "Solitaire", blurb: "One stone, nothing to compete with it." },
  { slug: "halo", name: "Halo", blurb: "A ring of light around the centre." },
  { slug: "pav%C3%A9", name: "Pavé", blurb: "A band dusted with stones." },
  { slug: "three-stone", name: "Three-Stone", blurb: "Past, present, and future." },
  { slug: "hidden-halo", name: "Hidden Halo", blurb: "Sparkle from above, secret from the side." },
  { slug: "vintage", name: "Vintage", blurb: "Milgrain and engraved detail." },
];

const METALS = [
  { slug: "platinum", name: "Platinum", tone: "#d8d8d6" },
  { slug: "18k-white-gold", name: "White Gold", tone: "#e8e4dc" },
  { slug: "18k-yellow-gold", name: "Yellow Gold", tone: "#C4A36B" },
  { slug: "18k-rose-gold", name: "Rose Gold", tone: "#d8a48f" },
];

function FeaturedProducts() {
  const { data, loading, error } = useApi<{ featured: Product[] }>((signal) => {
    void signal;
    return api.home();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border border-ivory-dim p-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="mt-4 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || data.featured.length === 0) {
    return (
      <div className="border border-dashed border-ivory-dim px-6 py-10 text-center">
        <p className="text-sm text-ink-soft">
          Featured pieces appear here once the catalog marks items as featured.
        </p>
        <Link
          to="/engagement-rings"
          className="mt-4 inline-flex h-11 items-center border border-wine px-6 font-sans text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {data.featured.slice(0, 4).map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function HomePage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden bg-ivory-deep">
        <div className="mx-auto grid max-w-(--container-page) items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div className="relative z-10">
            <p className="text-eyebrow text-gold-deep">Natural &amp; Lab-Grown Diamonds</p>
            <h1 className="mt-4 font-display text-display text-ink">
              A diamond chosen
              <br />
              <em className="text-wine">with clarity.</em>
            </h1>
            <p className="mt-6 max-w-lg text-body-lg text-ink-soft">
              Every stone we list carries its own specifications — cut, colour, clarity, carat — shown
              plainly, so the choice is yours to make with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/create-your-ring"
                className="inline-flex h-[3.25rem] items-center bg-wine px-8 font-sans text-base font-medium text-ivory transition-colors hover:bg-wine-hover"
              >
                Create Your Ring
              </Link>
              <Link
                to="/diamonds/natural"
                className="inline-flex h-[3.25rem] items-center border border-wine px-8 font-sans text-base font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
              >
                Browse Diamonds
              </Link>
            </div>
          </div>

          {/* Decorative diamond composition */}
          <div aria-hidden="true" className="relative hidden aspect-square lg:block">
            <div className="absolute top-0 right-0 w-3/5 rotate-6 border border-gold/30 bg-ivory p-3 shadow-card">
              <DiamondArt shape="round" className="w-full" title="" />
            </div>
            <div className="absolute bottom-4 left-0 w-1/2 -rotate-6 border border-gold/30 bg-ivory p-3 shadow-card">
              <DiamondArt shape="oval" className="w-full" title="" />
            </div>
            <div className="absolute right-8 bottom-0 w-2/5 rotate-12 border border-gold/30 bg-ivory p-3 shadow-card">
              <DiamondArt shape="emerald" className="w-full" title="" />
            </div>
          </div>
        </div>
        <div className="rule-gold" />
      </section>

      {/* ---- Shop by shape ---- */}
      <section aria-labelledby="shop-shape" className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-eyebrow text-gold-deep">Find your silhouette</p>
          <h2 id="shop-shape" className="mt-2 font-display text-h2 text-ink">
            Shop by Shape
          </h2>
        </div>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {HOME_SHAPES.map((shape) => (
            <li key={shape}>
              <Link
                to={`/diamonds/natural?shapes=${shape}`}
                className="group flex flex-col items-center gap-2 border border-transparent p-3 transition-colors hover:border-ivory-dim"
              >
                <DiamondArt shape={shape} className="w-full transition-transform duration-300 ease-luxury group-hover:scale-105" />
                <span className="font-sans text-xs tracking-wide text-ink group-hover:text-wine">
                  {shapeLabel(shape)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Shop by style ---- */}
      <section aria-labelledby="shop-style" className="bg-ivory-deep py-16">
        <div className="mx-auto max-w-(--container-page) px-4 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-eyebrow text-gold-deep">Designed around you</p>
            <h2 id="shop-style" className="mt-2 font-display text-h2 text-ink">
              Shop by Style
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STYLES.map((style) => (
              <li key={style.slug}>
                <Link
                  to={`/engagement-rings?styles=${style.slug}`}
                  className="block border border-ivory-dim bg-ivory p-6 transition-shadow hover:shadow-card-hover"
                >
                  <h3 className="font-display text-h3 text-ink">{style.name}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{style.blurb}</p>
                  <span className="mt-4 inline-block font-sans text-xs font-medium tracking-[0.14em] text-wine uppercase">
                    Explore →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Shop by metal ---- */}
      <section aria-labelledby="shop-metal" className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-eyebrow text-gold-deep">The setting matters</p>
          <h2 id="shop-metal" className="mt-2 font-display text-h2 text-ink">
            Shop by Metal
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METALS.map((metal) => (
            <li key={metal.slug}>
              <Link
                to={`/engagement-rings?metals=${encodeURIComponent(metal.slug)}`}
                className="group flex items-center gap-4 border border-ivory-dim p-5 transition-shadow hover:shadow-card"
              >
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-full border border-ivory-dim"
                  style={{ backgroundColor: metal.tone }}
                />
                <span className="font-sans text-sm font-medium text-ink group-hover:text-wine">
                  {metal.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Natural vs lab-grown ---- */}
      <section aria-labelledby="vs-heading" className="bg-wine py-16 text-ivory">
        <div className="mx-auto max-w-(--container-lg) px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-eyebrow text-gold">Understand the difference</p>
            <h2 id="vs-heading" className="mt-2 font-display text-h2">
              Natural vs Lab-Grown
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border border-ivory/20 p-8">
              <h3 className="font-display text-h3">Natural diamonds</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                Formed over billions of years deep within the Earth, natural diamonds are mined, cut,
                and graded. Their rarity is part of what shapes their price.
              </p>
            </div>
            <div className="border border-ivory/20 p-8">
              <h3 className="font-display text-h3">Lab-grown diamonds</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                Created in a laboratory using methods that replicate natural growth, lab-grown diamonds
                share the same chemical structure and are graded on the same scale. They typically cost
                less per carat.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/diamond-guide/natural-vs-lab-grown"
              className="inline-flex h-11 items-center border border-ivory px-6 font-sans text-sm font-medium text-ivory transition-colors hover:bg-ivory hover:text-wine"
            >
              Read the full guide
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Featured ---- */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-eyebrow text-gold-deep">Selected for you</p>
          <h2 id="featured-heading" className="mt-2 font-display text-h2 text-ink">
            Featured Pieces
          </h2>
        </div>
        <FeaturedProducts />
      </section>

      {/* ---- 4Cs teaser ---- */}
      <section aria-labelledby="4cs-heading" className="bg-ivory-deep py-16">
        <div className="mx-auto max-w-(--container-page) px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-eyebrow text-gold-deep">Quality, explained</p>
            <h2 id="4cs-heading" className="mt-2 font-display text-h2 text-ink">
              The 4Cs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">
              Cut, colour, clarity, and carat — the four dimensions graders use to describe a diamond.
              Understanding them makes every other decision easier.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { c: "Cut", d: "How well a diamond's facets interact with light — the single biggest factor in sparkle." },
              { c: "Colour", d: "Graded D (colourless) to J (noticeable warmth). Whiter stones are rarer." },
              { c: "Clarity", d: "The presence of inclusions under 10× magnification, from FL (flawless) down." },
              { c: "Carat", d: "The weight of the stone — not the same as its visual size." },
            ].map((item) => (
              <li key={item.c} className="border border-ivory-dim bg-ivory p-6">
                <h3 className="font-display text-h3 text-wine">{item.c}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link
              to="/diamond-guide/4cs"
              className="inline-flex h-11 items-center border border-wine px-6 font-sans text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
            >
              Learn the 4Cs in depth
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Appointment CTA ---- */}
      <section aria-labelledby="appt-heading" className="mx-auto max-w-(--container-page) px-4 py-20 text-center lg:px-8">
        <p className="text-eyebrow text-gold-deep">Personal guidance</p>
        <h2 id="appt-heading" className="mt-2 font-display text-h2 text-ink">
          Speak with a diamond specialist
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body-lg text-ink-soft">
          Book a consultation — in person or virtually — to compare stones, understand grading reports,
          or design a bespoke piece.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/appointments"
            className="inline-flex h-[3.25rem] items-center bg-wine px-8 font-sans text-base font-medium text-ivory transition-colors hover:bg-wine-hover"
          >
            Book an Appointment
          </Link>
          <Link
            to="/diamond-guide"
            className="inline-flex h-[3.25rem] items-center border border-wine px-8 font-sans text-base font-medium text-wine transition-colors hover:bg-wine hover:text-ivory"
          >
            Visit the Diamond Guide
          </Link>
        </div>
      </section>
    </>
  );
}
