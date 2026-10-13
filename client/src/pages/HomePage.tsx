import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { whatsappInquiryUrl } from "../lib/whatsapp";
import { ProductCard } from "../components/catalog/ProductCard";
import { DiamondArt } from "../components/catalog/ProductArt";
import { HeroStage } from "../components/home/HeroStage";
import { shapeLabel } from "../lib/labels";
import { Skeleton } from "../components/ui/Display";
import { Reveal } from "../components/ui/Reveal";
import type { DiamondShape, Product } from "../lib/api-types";

const HOME_SHAPES: DiamondShape[] = ["round", "oval", "emerald", "princess", "cushion", "pear"];

function FeaturedProducts() {
  const { data, loading, error } = useApi<{ featured: Product[] }>((signal) => {
    void signal;
    return api.home();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4" aria-busy="true">
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
        <p className="text-sm text-charcoal-soft">
          Featured pieces appear here once the catalog marks items as featured.
        </p>
        <Link
          to="/diamonds"
          className="mt-4 inline-flex h-11 items-center border border-olive px-6 font-sans text-sm font-medium text-olive hover:bg-olive hover:text-ivory anim-shrink"
        >
          Browse diamonds
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {data.featured.slice(0, 4).map((product, index) => (
        <Reveal as="li" key={product.id} delay={100 + index * 100}>
          <ProductCard product={product} />
        </Reveal>
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
            <Reveal delay={100}>
              <p className="text-eyebrow text-champagne-deep">Lab-Grown Diamonds</p>
              <h1 className="mt-4 font-display text-display text-charcoal">
                A diamond chosen
                <br />
                <em className="text-olive">with clarity.</em>
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-6 max-w-lg text-body-lg text-charcoal-soft">
                Every stone we list carries its own specifications — cut, colour, clarity, carat — shown
                plainly, so the choice is yours to make with confidence.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/diamonds"
                  className="inline-flex h-[3.25rem] items-center bg-olive px-8 font-sans text-base font-medium text-ivory hover:bg-olive-hover anim-shrink"
                >
                  Browse Lab-Grown Diamonds
                </Link>
                <a
                  href={whatsappInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[3.25rem] items-center border border-olive px-8 font-sans text-base font-medium text-olive hover:bg-olive hover:text-ivory anim-shrink"
                >
                  Inquire Now
                </a>
              </div>
            </Reveal>
          </div>

          {/* The stage: the diamond drops in from above and seats itself in
              the stand on load. It carries its own entrance, so no scroll
              reveal. */}
          <HeroStage className="order-first mx-auto w-full max-w-sm sm:max-w-md lg:order-none lg:max-w-none" />
        </div>
        <div className="rule-champagne" />
      </section>

      {/* ---- Shop by shape ---- */}
      <section aria-labelledby="shop-shape" className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8">
        <Reveal delay={100} className="mb-8 text-center">
          <p className="text-eyebrow text-champagne-deep">Find your silhouette</p>
          <h2 id="shop-shape" className="mt-2 font-display text-h2 text-charcoal">
            Shop by Shape
          </h2>
        </Reveal>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {HOME_SHAPES.map((shape, index) => (
            <Reveal as="li" key={shape} delay={200 + index * 100}>
              <Link
                to={`/diamonds?shapes=${shape}`}
                className="group flex flex-col items-center gap-2 border border-transparent p-3 transition-colors hover:border-ivory-dim"
              >
                <DiamondArt
                  shape={shape}
                  framed={false}
                  className="h-20 w-full transition-transform duration-300 ease-luxury group-hover:scale-105"
                />
                <span className="font-sans text-xs tracking-wide text-charcoal group-hover:text-olive">
                  {shapeLabel(shape)}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---- Why lab-grown ---- */}
      <Reveal delay={100} variant="soft">
        <section aria-labelledby="lab-heading" className="bg-olive py-16 text-ivory">
          <div className="mx-auto max-w-(--container-lg) px-4 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-eyebrow text-champagne">Why lab-grown</p>
              <h2 id="lab-heading" className="mt-2 font-display text-h2">
                The Same Diamond, Grown
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <Reveal delay={200}>
                <div className="h-full border border-ivory/20 p-8">
                  <h3 className="font-display text-h3">Identical material</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                    A lab-grown diamond is crystallised carbon — the same hardness, brilliance and
                    optical properties as any other diamond, assessed on the same 4Cs scale.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={350}>
                <div className="h-full border border-ivory/20 p-8">
                  <h3 className="font-display text-h3">Origin you can trace</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/85">
                    Every stone is grown under controlled conditions, so where it came from is
                    documented from the first day rather than inferred afterwards.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---- Featured ---- */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-(--container-page) px-4 py-16 lg:px-8">
        <Reveal delay={100} className="mb-8 text-center">
          <p className="text-eyebrow text-champagne-deep">Selected for you</p>
          <h2 id="featured-heading" className="mt-2 font-display text-h2 text-charcoal">
            Featured Pieces
          </h2>
        </Reveal>
        <FeaturedProducts />
      </section>

      {/* ---- 4Cs teaser ---- */}
      <section aria-labelledby="4cs-heading" className="bg-ivory-deep py-16">
        <div className="mx-auto max-w-(--container-page) px-4 lg:px-8">
          <Reveal delay={100} className="mb-10 text-center">
            <p className="text-eyebrow text-champagne-deep">Quality, explained</p>
            <h2 id="4cs-heading" className="mt-2 font-display text-h2 text-charcoal">
              The 4Cs
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-charcoal-soft">
              Cut, colour, clarity, and carat — the four dimensions graders use to describe a diamond.
              Understanding them makes every other decision easier.
            </p>
          </Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { c: "Cut", d: "How well a diamond's facets interact with light — the single biggest factor in sparkle." },
              { c: "Colour", d: "Graded D (colourless) to J (noticeable warmth). Whiter stones are rarer." },
              { c: "Clarity", d: "The presence of inclusions under 10× magnification, from FL (flawless) down." },
              { c: "Carat", d: "The weight of the stone — not the same as its visual size." },
            ].map((item, index) => (
              <Reveal as="li" key={item.c} delay={200 + index * 100} className="lift-on-hover border border-ivory-dim bg-ivory p-6">
                <h3 className="font-display text-h3 text-olive">{item.c}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{item.d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Appointment CTA ---- */}
      <section aria-labelledby="appt-heading" className="mx-auto max-w-(--container-page) px-4 py-20 text-center lg:px-8">
        <Reveal delay={100}>
          <p className="text-eyebrow text-champagne-deep">Personal guidance</p>
          <h2 id="appt-heading" className="mt-2 font-display text-h2 text-charcoal">
            Speak with a diamond specialist
          </h2>
        </Reveal>
        <Reveal delay={300}>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-charcoal-soft">
            Book a consultation — in person or virtually — to compare stones, understand grading reports,
            or talk through a commission.
          </p>
        </Reveal>
        <Reveal delay={400}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[3.25rem] items-center bg-olive px-8 font-sans text-base font-medium text-ivory hover:bg-olive-hover anim-shrink"
            >
              Inquire Now
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
