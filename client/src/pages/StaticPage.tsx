import { Link, useLocation } from "react-router-dom";

/**
 * Static content pages — single component, keyed by route.
 *
 * Policy and story content is business-owned; where a policy has not been
 * supplied yet we say so plainly instead of inventing shipping promises,
 * return windows, or brand history.
 */

interface StaticPageDefinition {
  eyebrow: string;
  title: string;
  intro: string;
  /** Rendered when the business has not supplied final copy. */
  pendingNotice?: string;
  sections?: Array<{ heading: string; body: string }>;
}

const PAGES: Record<string, StaticPageDefinition> = {
  "our-story": {
    eyebrow: "About",
    title: "Our Story",
    intro:
      "Evarenne was founded on a simple idea: choosing a diamond should feel considered, clear, and personal — never pressured.",
    pendingNotice:
      "Full brand story, workshop details, and craftsmanship photography are being prepared and will be published once verified by the founder.",
    sections: [
      {
        heading: "What we stand for",
        body: "Clarity in what you're buying, honesty about what we can and cannot verify, and jewellery made to be worn for decades. Every product page shows the exact specifications we hold for that piece — and nothing we don't.",
      },
      {
        heading: "Natural and lab-grown, side by side",
        body: "We present both natural and lab-grown diamonds without steering you toward one. They differ in origin and typically in price; they do not differ in the way they're graded. Our guide explains the details.",
      },
    ],
  },
  contact: {
    eyebrow: "Client care",
    title: "Contact Us",
    intro: "Questions about a piece, a diamond, or an order? We're here to help.",
    pendingNotice:
      "Direct contact channels (email, phone, and showroom address) will be listed here once confirmed. For now, please use the appointment request form, which reaches the team directly.",
    sections: [],
  },
  faq: {
    eyebrow: "Client care",
    title: "Frequently Asked Questions",
    intro: "Straight answers to the questions we hear most often.",
    pendingNotice:
      "The full FAQ is being drafted with the business owner so every answer reflects actual policy. It will cover orders, grading reports, care, and returns.",
    sections: [
      {
        heading: "Do you sell both natural and lab-grown diamonds?",
        body: "Yes. Both are available as loose stones and in finished jewellery. Natural and lab-grown diamonds are chemically and optically the same material; they differ in origin, and typically in price.",
      },
      {
        heading: "Are the diamonds certified?",
        body: "Grading details depend on the specific stone and the laboratory that graded it. Where a grading report exists, its laboratory and report number are shown on the product page. We never display report numbers that aren't backed by a real document.",
      },
    ],
  },
  "shipping-returns": {
    eyebrow: "Client care",
    title: "Shipping & Returns",
    intro: "What to expect once you've chosen your piece.",
    pendingNotice:
      "Final shipping timeframes, insurance details, return windows, and exchange policies are being confirmed with operations and legal review. No shipping or return promise is published until it's verified — this avoids making guarantees we can't yet keep.",
    sections: [
      {
        heading: "Why no timeframes yet?",
        body: "Because we won't publish a delivery promise, insured-shipping terms, or a return window that hasn't been agreed with the team and reviewed for accuracy. These details will appear here before launch.",
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro: "How your information is handled when you shop with Evarenne.",
    pendingNotice:
      "The privacy policy is being prepared with legal review and will cover data collection, cookies, payment handling (via our payment provider), and your rights under applicable law.",
    sections: [
      {
        heading: "What we can say now",
        body: "This site stores your shopping bag and wishlist locally in your browser. We do not store card numbers or payment credentials anywhere in this application — payments are handled by a dedicated payment provider once checkout is connected.",
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro: "The terms that govern use of this site.",
    pendingNotice:
      "Full terms of service are in legal review and will be published before launch. This preview site is not an offer for sale; product data shown is sample data.",
    sections: [],
  },
  "ring-size-guide": {
    eyebrow: "Guidance",
    title: "Ring Size Guide",
    intro: "How to find the right ring size — and why it matters more than you'd think.",
    pendingNotice:
      "A printable size chart and in-store measurement instructions are being prepared. In the meantime, our appointment consultation includes complimentary sizing.",
    sections: [
      {
        heading: "Measuring at home",
        body: "Wrap a strip of paper around the base of the intended finger, mark where it overlaps, and measure the length in millimetres. That measurement is the ring's inner circumference. Measure at the end of the day when fingers are at their largest, and avoid measuring when hands are cold.",
      },
      {
        heading: "Wide bands run snug",
        body: "Wider bands cover more of the finger and typically feel tighter at the same size. If you're choosing a band wider than about 6mm, consider going up half a size.",
      },
    ],
  },
};

export function StaticPage() {
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, "");
  const page = PAGES[key];

  if (!page) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <h1 className="font-display text-h1">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-wine underline underline-offset-4">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-(--container-lg) px-4 py-12 lg:px-8">
      <p className="text-eyebrow text-gold-deep">{page.eyebrow}</p>
      <h1 className="mt-2 font-display text-h1 text-ink">{page.title}</h1>
      <p className="mt-4 max-w-2xl text-body-lg text-ink-soft">{page.intro}</p>

      {page.pendingNotice && (
        <p className="mt-6 max-w-2xl border-l-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ink">
          <strong className="font-medium">In preparation: </strong>
          {page.pendingNotice}
        </p>
      )}

      {page.sections && page.sections.length > 0 && (
        <div className="mt-10 flex max-w-2xl flex-col gap-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-h3 text-ink">{section.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{section.body}</p>
            </section>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-ivory-dim pt-8">
        <Link
          to="/appointments"
          className="inline-flex h-11 items-center bg-wine px-6 font-sans text-sm font-medium text-ivory transition-colors hover:bg-wine-hover"
        >
          Book an appointment
        </Link>
      </div>
    </article>
  );
}
