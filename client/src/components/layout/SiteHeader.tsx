import { useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { useCart, useWishlist } from "../../store/cart";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "./CartDrawer";
import { useEscapeKey, useClickOutside } from "../../lib/a11y";
import { Button } from "../ui/Button";
import { DiamondArt } from "../catalog/ProductArt";

/** Brand wordmark — original type treatment, not any existing brand's mark. */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex flex-col items-center leading-none ${className}`} aria-label="Evarenne — home">
      <span className="font-display text-[1.65rem] font-medium tracking-[0.18em] text-wine">EVARENNE</span>
      <span className="mt-0.5 font-sans text-[0.58rem] tracking-[0.42em] text-gold-deep uppercase">
        Diamonds &amp; Fine Jewelry
      </span>
    </Link>
  );
}

function CartButton({ onClick }: { onClick: () => void }) {
  const { count } = useCart();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-wine"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine px-1 font-sans text-[0.62rem] font-medium text-ivory">
          {count}
        </span>
      )}
    </button>
  );
}

function WishlistLink() {
  const { entries } = useWishlist();
  return (
    <Link
      to="/wishlist"
      aria-label={`Wishlist, ${entries.length} saved item${entries.length === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-wine"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" />
      </svg>
      {entries.length > 0 && (
        <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine px-1 font-sans text-[0.62rem] font-medium text-ivory">
          {entries.length}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const openMenuItem = openMenu ? navItems.find((item) => item.label === openMenu) : undefined;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
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
      {/* Announcement bar: factual, no invented promises */}
      <div className="bg-wine px-4 py-2 text-center">
        <p className="font-sans text-xs tracking-[0.14em] text-ivory uppercase">
          Preview catalog — sample data, not yet available for purchase
        </p>
      </div>

      <header ref={headerRef} className="sticky top-0 z-(--z-header) border-b border-ivory-dim bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-(--container-page) items-center justify-between gap-4 px-4 py-3 lg:px-8">
          {/* Mobile: menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
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
              className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-wine"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          </div>

          {/* Mobile: search + wishlist + cart on the right */}
          <div className="flex items-center gap-0.5 lg:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center text-ink"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
            <WishlistLink />
            <CartButton onClick={() => setCartOpen(true)} />
          </div>

          {/* Desktop: wishlist + cart on the right */}
          <div className="hidden items-center gap-0.5 lg:flex">
            <WishlistLink />
            <CartButton onClick={() => setCartOpen(true)} />
          </div>
        </div>

        {/* Desktop nav row */}
        <nav
          aria-label="Primary"
          className="relative hidden border-t border-ivory-dim lg:block"
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
                    `block px-4 py-3 font-sans text-sm tracking-[0.06em] uppercase transition-colors ${
                      isActive ? "text-wine" : "text-ink hover:text-wine"
                    }`
                  }
                >
                  {item.label}
                  {item.menu && (
                    <span aria-hidden="true" className="ml-1.5 text-[0.6em] text-gold-deep">
                      ▾
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Panel is anchored to the nav (not the trigger) so it spans the full
              width and the shape grid never collapses into the trigger's width. */}
          {openMenuItem?.menu && (
            <div className="absolute top-full left-0 right-0 border border-t-0 border-ivory-dim bg-ivory shadow-card-hover">
              <div className="mx-auto max-w-(--container-page) px-8 py-7">
                {openMenuItem.menu.map((group) => (
                  <div key={group.label}>
                    <p className="mb-4 text-eyebrow text-gold-deep">{group.label}</p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
                      {group.links.map((link) => (
                        <li key={link.to}>
                          <Link
                            to={link.to}
                            className="group flex items-center gap-3 py-2 text-sm text-ink underline-offset-4 transition-colors hover:text-wine"
                          >
                            {link.shape && (
                              <DiamondArt
                                shape={link.shape}
                                framed={false}
                                className="h-8 w-8 shrink-0"
                                title=""
                              />
                            )}
                            <span className="group-hover:underline">{link.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
            className="absolute inset-0 cursor-default bg-ink/55 backdrop-blur-[3px]"
          />
          <nav
            aria-label="Mobile primary"
            className="absolute top-0 bottom-0 left-0 flex w-full max-w-sm flex-col bg-ivory shadow-drawer"
          >
            <div className="flex items-center justify-between border-b border-ivory-dim px-4 py-3">
              <Wordmark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center text-2xl text-ink-soft hover:text-wine"
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
                      className="flex-1 py-3.5 font-sans text-sm tracking-[0.06em] text-ink uppercase"
                    >
                      {item.label}
                    </Link>
                    {item.menu && (
                      <button
                        type="button"
                        aria-expanded={openMenu === item.label}
                        aria-label={`Toggle ${item.label} submenu`}
                        onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                        className="flex h-9 w-9 items-center justify-center text-gold-deep"
                      >
                        <span aria-hidden="true">{openMenu === item.label ? "−" : "+"}</span>
                      </button>
                    )}
                  </div>
                  {item.menu && openMenu === item.label && (
                    <div className="pb-4">
                      {item.menu.map((group) => (
                        <div key={group.label} className="mb-3">
                          <p className="mb-1.5 text-eyebrow text-gold-deep">{group.label}</p>
                          <ul className="flex flex-col gap-1.5 pl-1">
                            {group.links.map((link) => (
                              <li key={link.to}>
                                <Link to={link.to} className="text-sm text-ink-soft hover:text-wine">
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
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
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
