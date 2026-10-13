import { Link, useLocation } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";

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
        body: "Clarity in what we present, honesty about what we can and cannot verify, and jewellery made to be worn for decades. Every product page shows the exact specifications we hold for that piece — and nothing we don't.",
      },
      {
        heading: "Lab-grown, presented plainly",
        body: "Evarenne offers lab-grown diamonds only. Every stone we list carries its exact specifications and the grading we hold for it — nothing invented, nothing rounded up. Our guide explains the details.",
      },
    ],
  },
  contact: {
    eyebrow: "Client care",
    title: "Contact Us",
    intro: "Questions about a piece, a diamond, or a collection? We're here to help.",
    pendingNotice:
      "Direct contact channels (email, phone, and showroom address) will be listed here once confirmed. For now, please use the appointment request form, which reaches the team directly.",
    sections: [],
  },
  faq: {
    eyebrow: "Client care",
    title: "Frequently Asked Questions",
    intro: "Straight answers to the questions we hear most often.",
    pendingNotice:
      "The full FAQ is being drafted with the business owner so every answer reflects actual policy. It will cover collections, grading reports, care, and viewing appointments.",
    sections: [
      {
        heading: "Are lab-grown diamonds real diamonds?",
        body: "Yes. A lab-grown diamond is crystallised carbon — the same material, hardness and optical properties — and it is graded on the same 4Cs scale by the same laboratories. The difference is origin: grown under controlled conditions rather than taken from the ground.",
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
      "The privacy policy is being prepared with legal review and will cover data collection, cookies, and your rights under applicable law.",
    sections: [
      {
        heading: "What we can say now",
        body: "This site is a reference catalogue — it shows diamond specifications and stores no personal data. There is no account, no shopping bag, and no checkout. If you enquire about a piece, any details you send are used only to reply to you.",
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
};

export function StaticPage() {
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, "");
  const page = PAGES[key];

  if (!page) {
    return (
      <div className="mx-auto max-w-(--container-lg) px-4 py-16">
        <h1 className="font-display text-h1">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-olive underline underline-offset-4">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-(--container-lg) px-4 py-12 lg:px-8">
      <Reveal delay={100}>
        <p className="text-eyebrow text-champagne-deep">{page.eyebrow}</p>
        <h1 className="mt-2 font-display text-h1 text-charcoal">{page.title}</h1>
      </Reveal>

      <Reveal delay={250}>
        <p className="mt-4 max-w-2xl text-body-lg text-charcoal-soft">{page.intro}</p>
      </Reveal>

      {page.pendingNotice && (
        <Reveal delay={400} variant="fade">
          <p className="mt-6 max-w-2xl border-l-2 border-champagne bg-champagne/10 px-4 py-3 text-sm text-charcoal">
            <strong className="font-medium">In preparation: </strong>
            {page.pendingNotice}
          </p>
        </Reveal>
      )}

      {page.sections && page.sections.length > 0 && (
        <div className="mt-10 flex max-w-2xl flex-col gap-8">
          {page.sections.map((section, index) => (
            <Reveal key={section.heading} delay={500 + index * 100}>
              <section>
                <h2 className="font-display text-h3 text-charcoal">{section.heading}</h2>
                <p className="mt-2 leading-relaxed text-charcoal-soft">{section.body}</p>
              </section>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={400}>
        <div className="mt-12 border-t border-ivory-dim pt-8">
          <Link
            to="/appointments"
            className="inline-flex h-11 items-center bg-olive px-6 font-sans text-sm font-medium text-ivory hover:bg-olive-hover anim-shrink"
          >
            Inquire Now
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
