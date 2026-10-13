import { Link } from "react-router-dom";

const columns: Array<{ heading: string; links: Array<{ label: string; to: string }> }> = [
  {
    heading: "Shop",
    links: [
      { label: "Lab-Grown Diamonds", to: "/diamonds" },
      { label: "Diamond Guide", to: "/diamond-guide" },
    ],
  },
  {
    heading: "Client Care",
    links: [
      { label: "Inquire Now", to: "/appointments" },
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
    <footer className="mt-20 border-t border-ivory/15 bg-charcoal">
      <div className="mx-auto max-w-(--container-page) px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            {/* Ivory lockup — the light logo variant, for the charcoal ground */}
            <p className="inline-flex items-baseline whitespace-nowrap leading-none">
              <span className="px-2 py-1 font-display text-xl font-semibold uppercase tracking-[0.015em] text-ivory">
                Evarenne &amp; Co
              </span>
              <span aria-hidden="true" className="font-display text-lg text-champagne">
                .
              </span>
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/80">
              Lab-grown diamonds — presented with clarity, so you can choose with
              confidence.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="mb-4 text-eyebrow text-champagne">{column.heading}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-ivory/85 underline-offset-4 transition-colors hover:text-ivory hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="rule-champagne my-10" />

        <div className="flex flex-col gap-4 text-xs text-ivory/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Evarenne. All rights reserved.</p>
          <p className="max-w-xl">
            This site is a reference catalogue. Product data shown is sample data, presented for viewing
            only — it is not an offer for sale, and nothing here can be purchased. Specifications and
            policies are confirmed before launch.
          </p>
        </div>
      </div>
    </footer>
  );
}
