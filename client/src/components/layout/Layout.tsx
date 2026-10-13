import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Scrolls to top on route change and sets focus for screen-reader users. */
function RouteAnnouncer() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-olive">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <RouteAnnouncer />
      {/* The ivory sheet: every reading surface sits here so body copy can stay
          charcoal (13.6:1). Full-bleed, matching the reference storefront. */}
      <main id="main-content" tabIndex={-1} className="flex-1 bg-ivory">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
