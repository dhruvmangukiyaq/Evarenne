import { Link, useParams } from "react-router-dom";
import { Reveal } from "../components/ui/Reveal";

/**
 * Diamond education hub. Content is original and written to be accurate and
 * neutral: it explains the 4Cs without equating carat with size, avoids
 * unverifiable claims, and links to catalog pages at decision points.
 */

interface Topic {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  links?: Array<{ label: string; to: string }>;
}

const TOPICS: Topic[] = [
  {
    slug: "4cs",
    title: "The 4Cs",
    eyebrow: "Quality, explained",
    intro:
      "Cut, colour, clarity, and carat are the four dimensions grading laboratories use to describe a diamond. They're assessed independently — a large carat weight says nothing about how well a diamond sparkles.",
    sections: [
      {
        heading: "Cut",
        body: "Cut describes how well a diamond's proportions, symmetry, and polish let it handle light — not its outline shape. Cut is generally the biggest driver of a stone's brilliance and fire, and it's the one C that is entirely a result of human craftsmanship. Grading scales vary by laboratory, so compare within a single report rather than across labs.",
      },
      {
        heading: "Colour",
        body: "Colour is graded on a scale that runs from D (colourless) down the alphabet. Stones graded D–F are considered colourless; G–J show faint warmth that is often hard to see once set. Colour matters more in larger stones and in white metals, where any tint is easier to notice.",
      },
      {
        heading: "Clarity",
        body: "Clarity refers to internal characteristics (inclusions) and surface features (blemasses). Most inclusions are microscopic and don't affect durability or appearance to the naked eye. A clarity grade is assigned after examination under 10× magnification, so two stones that look identical side by side can carry different grades.",
      },
      {
        heading: "Carat",
        body: "Carat is a measure of weight, not size. Two diamonds of the same carat weight can look noticeably different in diameter depending on how their weight is distributed across the cut. We show carat alongside measurements so you can judge both.",
      },
    ],
    links: [
      { label: "Browse natural diamonds", to: "/diamonds/natural" },
      { label: "Browse lab-grown diamonds", to: "/diamonds/lab-grown" },
    ],
  },
  {
    slug: "shapes",
    title: "Diamond Shapes",
    eyebrow: "Finding your silhouette",
    intro:
      "Shape is the outline of a finished diamond. Every shape reflects light differently, which is why the outline you choose changes how the stone reads.",
    sections: [
      {
        heading: "Round brilliant",
        body: "The round brilliant is cut for maximum light return and is the most popular shape. Its 57 or 58 facets are engineered for sparkle, which is why it tends to hold its value and reads consistently well.",
      },
      {
        heading: "Oval, pear, marquise, and heart",
        body: "These elongated shapes can make a stone look larger than its carat weight suggests and can flatter the finger. Because they're longer, check the length-to-width ratio — it changes the character of the stone considerably.",
      },
      {
        heading: "Emerald, asscher, and other step cuts",
        body: "Step cuts have long, parallel facets that create a hall-of-mirrors effect rather than sparkle. They showcase clarity and colour, and they read as calm and architectural. They favour higher clarity grades because inclusions are easier to see.",
      },
      {
        heading: "Princess, cushion, radiant, and other modified brilliants",
        body: "These shapes blend a square or rectangular outline with brilliant-style faceting. They offer a squarer look with plenty of sparkle. As with all fancy shapes, proportions vary widely, so compare measurements.",
      },
    ],
    links: [{ label: "Shop by shape", to: "/diamonds/natural" }],
  },
  {
    slug: "natural-vs-lab-grown",
    title: "Natural vs Lab-Grown Diamonds",
    eyebrow: "An honest comparison",
    intro:
      "Natural and lab-grown diamonds are the same material — crystallised carbon with the same hardness and optical properties. They differ in origin, in how they're brought to market, and in the paperwork that records that origin. We show both and don't steer you toward either.",
    sections: [
      {
        heading: "Origin",
        body: "Natural diamonds formed over billions of years deep within the Earth and are mined. Lab-grown diamonds are produced using methods that replicate the growth process — typically HPHT (high pressure, high temperature) or CVD (chemical vapour deposition). The result is a diamond that is chemically, physically, and optically the same as one mined from the ground.",
      },
      {
        heading: "Grading",
        body: "Both types are graded on the same 4Cs scale by the same laboratories. A grading report describes the stone's characteristics; it does not, by itself, distinguish natural from lab-grown. Where a laboratory reports origin, we show that detail.",
      },
      {
        heading: "Origin and documentation",
        body: "Because the two are identical once grown, the difference is recorded rather than visible. Laboratories note origin on a report where they can determine it, so we show that detail alongside the grading rather than asking you to take our word for it.",
      },
      {
        heading: "What we won't claim",
        body: "We don't describe either type as an investment, and we don't make environmental or ethical claims that aren't independently substantiated. If a sustainability or sourcing statement matters to you, ask us for the specific documentation behind it.",
      },
    ],
    links: [
      { label: "Compare natural diamonds", to: "/diamonds/natural" },
      { label: "Compare lab-grown diamonds", to: "/diamonds/lab-grown" },
    ],
  },
];

function HubIndex() {
  return (
    <>
      <Reveal delay={100}>
        <p className="text-eyebrow text-champagne-deep">Learn</p>
        <h1 className="mt-2 font-display text-h1 text-charcoal">The Diamond Guide</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-charcoal-soft">
          Choosing a diamond is easier when the language makes sense. These guides explain how diamonds
          are graded and what actually matters — in plain terms, without the sales pitch.
        </p>
      </Reveal>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {TOPICS.map((topic, index) => (
          <Reveal as="li" key={topic.slug} delay={200 + index * 150}>
            <Link
              to={`/diamond-guide/${topic.slug}`}
              className="flex h-full flex-col border border-ivory-dim p-6 lift-on-hover"
            >
              <p className="text-eyebrow text-champagne-deep">{topic.eyebrow}</p>
              <h2 className="mt-2 font-display text-h3 text-charcoal">{topic.title}</h2>
              <p className="mt-2 flex-1 text-sm text-charcoal-soft">{topic.intro.split(".")[0]}.</p>
              <span className="mt-4 font-sans text-xs font-medium tracking-[0.14em] text-olive uppercase">
                Read →
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={400} variant="fade">
        <div className="mt-12 border border-champagne/40 bg-champagne/10 p-6">
          <h2 className="font-display text-h3 text-charcoal">A note on grading reports</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal-soft">
            Grading details depend on the specific stone and the laboratory that graded it. Scales and
            terminology differ between labs, so compare like with like. We only display a report number
            when a real, verifiable document exists for that stone — never a placeholder.
          </p>
        </div>
      </Reveal>
    </>
  );
}

export function EducationPage() {
  const { topic } = useParams<{ topic?: string }>();
  const current = TOPICS.find((t) => t.slug === topic);

  if (!topic || !current) {
    return (
      <div className="mx-auto max-w-(--container-page) px-4 py-12 lg:px-8">
        <HubIndex />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-(--container-lg) px-4 py-12 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 font-sans text-xs text-charcoal-soft">
          <li>
            <Link to="/diamond-guide" className="underline-offset-4 hover:text-olive hover:underline">
              Diamond Guide
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-charcoal">
            {current.title}
          </li>
        </ol>
      </nav>

      <Reveal delay={150}>
        <p className="text-eyebrow text-champagne-deep">{current.eyebrow}</p>
        <h1 className="mt-2 font-display text-h1 text-charcoal">{current.title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-charcoal-soft">{current.intro}</p>
      </Reveal>

      <div className="mt-12 flex max-w-2xl flex-col gap-10">
        {current.sections.map((section, index) => (
          <Reveal key={section.heading} delay={250 + index * 100}>
            <section>
              <h2 className="font-display text-h3 text-charcoal">{section.heading}</h2>
              <p className="mt-3 leading-relaxed text-charcoal-soft">{section.body}</p>
            </section>
          </Reveal>
        ))}
      </div>

      {current.links && (
        <Reveal delay={350}>
          <div className="mt-12 flex flex-wrap gap-3 border-t border-ivory-dim pt-8">
            {current.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex h-11 items-center border border-olive px-6 font-sans text-sm font-medium text-olive hover:bg-olive hover:text-ivory anim-shrink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </article>
  );
}
