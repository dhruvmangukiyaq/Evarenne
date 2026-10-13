import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { SearchOverlay } from "./SearchOverlay";
import { useEscapeKey, useClickOutside } from "../../lib/a11y";
import { shapePhoto } from "../../lib/shape-assets";
import { Button } from "../ui/Button";
import { DiamondArt } from "../catalog/ProductArt";

/**
 * Brand wordmark: serif capitals with the closing full stop set apart. Two
 * colour variants — one per ground:
 *  - on-light: charcoal capitals with an olive full stop — for ivory surfaces
 *    such as the mobile drawer and the footer.
 *  - on-dark:  ivory capitals with a champagne full stop — for the olive
 *    header. Charcoal on olive is only 2.6:1, so the dark ground needs the
 *    light lockup to stay legible.
 * Plain type only (no plate behind it, no raster asset), so it stays sharp at
 * any size.
 */
function Wordmark({
  className = "",
  size = "lg",
  variant = "on-dark",
}: {
  className?: string;
  size?: "lg" | "sm";
  variant?: "on-light" | "on-dark";
}) {
  const type = size === "lg" ? "text-[1.9rem]" : "text-[1.35rem]";
  const onLight = variant === "on-light";
  return (
    <Link
      to="/"
      className={`group inline-flex items-baseline leading-none ${className}`}
      aria-label="Evarenne & Co. — home"
    >
      <span className="inline-block px-2.5">
        {/* Clean type lockup — no plate behind the capitals, so it reads as
            plain text on whichever ground it sits (ivory drawer/footer or the
            olive header). */}
        <span
          className={`font-display ${type} font-semibold uppercase tracking-[0.015em] ${
            onLight ? "text-charcoal" : "text-ivory"
          }`}
        >
          Evarenne &amp; Co
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const openMenuItem = openMenu ? navItems.find((item) => item.label === openMenu) : undefined;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  // Close menus on route change (spec: mobile menu closes after route
  // selection). Adjusted during render rather than in an effect.
  const locationKey = `${location.pathname}${location.search}`;
  const [prevLocationKey, setPrevLocationKey] = useState(locationKey);
  if (locationKey !== prevLocationKey) {
    setPrevLocationKey(locationKey);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEscapeKey(openMenu !== null || mobileOpen, () => {
    setOpenMenu(null);
    setMobileOpen(false);
  });
  useClickOutside(openMenu !== null, headerRef, () => setOpenMenu(null));

  return (
    <>
      {/* Announcement bar: the champagne ribbon — charcoal on champagne is 6.9:1 */}
      <div className="bg-champagne px-4 py-2 text-center">
        <p className="font-sans text-xs tracking-[0.14em] text-charcoal uppercase">
          Reference catalog — sample data, for viewing only
        </p>
      </div>

      <header
        ref={headerRef}
        className="sticky top-0 z-(--z-header) border-b border-ivory/25 bg-olive/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-(--container-page) items-center justify-between gap-4 px-4 py-3 lg:px-8">
          {/* Mobile: menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center text-ivory lg:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Wordmark className="lg:absolute lg:left-1/2 lg:-translate-x-1/2" />

          {/* Desktop: search + account on the left */}
          <div className="hidden items-center gap-1 lg:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ivory transition-colors hover:bg-ivory/12"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          </div>

          {/* Mobile: search on the right */}
          <div className="flex items-center gap-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ivory transition-colors hover:bg-ivory/12"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop nav row */}
        <nav
          aria-label="Primary"
          className="relative hidden border-t border-ivory/25 lg:block"
          onMouseLeave={() => setOpenMenu(null)}
        >
          <ul className="mx-auto flex max-w-(--container-page) items-center justify-center gap-1 px-8">
            {navItems.map((item) => (
              <li
                key={item.label}
                onMouseEnter={() => setOpenMenu(item.menu ? item.label : null)}
              >
                <NavLink
                  to={item.to}
                  onFocus={() => setOpenMenu(item.menu ? item.label : null)}
                  className={({ isActive }) =>
                    // Text stays ivory (5.2:1 on olive). Champagne carries the
                    // active/hover underline only — a non-text indicator, so its
                    // 2.6:1 against olive is fine and never blocks legibility.
                    `block px-4 py-3 font-sans text-sm tracking-[0.06em] text-ivory uppercase underline-offset-[0.6em] transition-colors hover:underline hover:decoration-champagne ${
                      isActive ? "underline decoration-champagne decoration-2" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Panel is anchored to the nav (not the trigger) so it spans the full
              width and the shape grid never collapses into the trigger's width. */}
          {openMenuItem?.menu && (
            <div className="absolute top-full left-0 right-0 border border-t-0 border-ivory-dim bg-sand shadow-card-hover">
              <div className="mx-auto grid max-w-(--container-page) items-stretch gap-x-14 gap-y-10 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]">
                {openMenuItem.menu.groups.map((group) => (
                  <div key={group.label} className="flex flex-col">
                    <p className="mb-5 font-display text-h4 text-charcoal">{group.label}</p>
                    {/* Two columns that read across (Round | Pear, Oval | Emerald …) */}
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                      {group.links.map((link) => (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className="group flex items-center gap-3 py-1.5 text-sm text-charcoal underline-offset-4 transition-colors hover:text-olive"
                          >
                            {link.shape && (
                              <DiamondArt
                                shape={link.shape}
                                framed={false}
                                className="h-7 w-7 shrink-0"
                                title=""
                              />
                            )}
                            <span className="group-hover:underline">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={group.allTo}
                      className="mt-6 inline-flex h-11 items-center justify-center self-start bg-taupe px-8 font-display text-lg tracking-wide text-ivory transition-colors hover:bg-taupe-hover"
                    >
                      {group.allLabel}
                    </Link>
                  </div>
                ))}

                {/* Sample photography anchors the panel — labelled as a shape
                    reference, never as a specific stone for sale. */}
                <figure className="hidden lg:block">
                  <div className="h-full w-full overflow-hidden">
                    <img
                      src={shapePhoto(openMenuItem.menu.image.shape) ?? undefined}
                      alt={openMenuItem.menu.image.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                </figure>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-(--z-drawer) lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-default bg-charcoal/55 backdrop-blur-[3px]"
          />
          <nav
            aria-label="Mobile primary"
            className="absolute top-0 bottom-0 left-0 flex w-full max-w-sm flex-col bg-ivory shadow-drawer"
          >
            <div className="flex items-center justify-between border-b border-ivory-dim px-4 py-3">
              <Wordmark size="sm" variant="on-light" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center text-2xl text-charcoal-soft hover:text-olive"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto scroll-slim px-4 py-2">
              {navItems.map((item) => (
                <li key={item.label} className="border-b border-ivory-dim/70 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.to}
                      className="flex-1 py-3.5 font-sans text-sm tracking-[0.06em] text-charcoal uppercase"
                    >
                      {item.label}
                    </Link>
                    {item.menu && (
                      <button
                        type="button"
                        aria-expanded={openMenu === item.label}
                        aria-label={`Toggle ${item.label} submenu`}
                        onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                        className="flex h-9 w-9 items-center justify-center text-champagne-deep"
                      >
                        <span aria-hidden="true">{openMenu === item.label ? "−" : "+"}</span>
                      </button>
                    )}
                  </div>
                  {item.menu && openMenu === item.label && (
                    <div className="pb-4">
                      {item.menu.groups.map((group) => (
                        <div key={group.label} className="mb-3">
                          <p className="mb-1.5 font-display text-base text-charcoal">{group.label}</p>
                          <ul className="flex flex-col gap-1.5 pl-1">
                            {group.links.map((link) => (
                              <li key={link.to}>
                                <Link to={link.to} className="text-sm text-charcoal-soft hover:text-olive">
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link
                            to={group.allTo}
                            className="mt-3 inline-flex h-10 items-center justify-center bg-taupe px-6 font-display text-base tracking-wide text-ivory"
                          >
                            {group.allLabel}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t border-ivory-dim px-4 py-4">
              <Button
                fullWidth
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/appointments");
                }}
              >
                Book an Appointment
              </Button>
            </div>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
