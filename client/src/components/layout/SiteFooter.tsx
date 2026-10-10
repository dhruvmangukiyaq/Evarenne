import { Link } from "react-router-dom";

const columns: Array<{ heading: string; links: Array<{ label: string; to: string }> }> = [
  {
    heading: "Shop",
    links: [
      { label: "Engagement Rings", to: "/engagement-rings" },
      { label: "Wedding Rings", to: "/wedding-rings" },
      { label: "Natural Diamonds", to: "/diamonds/natural" },
      { label: "Lab-Grown Diamonds", to: "/diamonds/lab-grown" },
      { label: "Fine Jewelry", to: "/jewelry" },
      { label: "Create Your Ring", to: "/create-your-ring" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { label: "The Diamond Guide", to: "/diamond-guide" },
      { label: "The 4Cs", to: "/diamond-guide/4cs" },
      { label: "Diamond Shapes", to: "/diamond-guide/shapes" },
      { label: "Natural vs Lab-Grown", to: "/diamond-guide/natural-vs-lab-grown" },
      { label: "Ring Size Guide", to: "/ring-size-guide" },
    ],
  },
  {
    heading: "Client Care",
    links: [
      { label: "Book an Appointment", to: "/appointments" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Shipping & Returns", to: "/shipping-returns" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Our Story", to: "/our-story" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ivory-dim bg-ivory-deep">
      <div className="mx-auto max-w-(--container-page) px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="font-display text-2xl tracking-[0.18em] text-wine">EVARENNE</p>
            <p className="mt-2 font-sans text-[0.6rem] tracking-[0.34em] text-gold-deep uppercase">
              Diamonds &amp; Fine Jewelry
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
              Natural and lab-grown diamonds, engagement rings, and fine jewelry — presented with clarity,
              so you can choose with confidence.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="mb-4 text-eyebrow text-ink">{column.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-wine hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule-gold my-10" />

        <div className="flex flex-col gap-4 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Evarenne. All rights reserved.</p>
          <p className="max-w-xl">
            This site is a development preview. Product data shown is sample data and is not an offer for
            sale. Pricing, availability, grading reports, and policies are confirmed before launch.
          </p>
        </div>
      </div>
    </footer>
  );
}
