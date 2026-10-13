import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/admin-api";

/**
 * Chrome shared by the signed-in admin pages: a plain header (site wordmark,
 * an "Admin" marker, links out) and the routed content beneath it.
 *
 * Deliberately its own shell rather than the public `Layout` — no storefront
 * navigation, filters or footer, because nothing here is browsable by visitors.
 */
export function AdminChrome() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await adminApi.logout();
    } catch {
      // The cookie may already be gone; either way we're leaving.
    }
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <a href="#admin-content" className="skip-link">
        Skip to content
      </a>

      <header className="border-b border-ivory-dim bg-white">
        <div className="mx-auto flex max-w-(--container-page) flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 lg:px-8">
          <div className="flex items-baseline gap-3">
            <Link to="/admin/products" className="font-display text-xl text-charcoal">
              Evarenne
            </Link>
            <span className="border border-olive/25 bg-olive/10 px-2 py-0.5 font-sans text-[10px] font-medium tracking-[0.18em] text-olive uppercase">
              Admin
            </span>
          </div>

          <nav aria-label="Admin" className="flex flex-wrap items-center gap-5 font-sans text-sm">
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                isActive
                  ? "text-charcoal underline decoration-olive decoration-2 underline-offset-8"
                  : "text-charcoal-soft underline-offset-8 transition-colors hover:text-olive hover:underline"
              }
            >
              Diamonds
            </NavLink>
            <Link
              to="/admin/products/new"
              className="text-charcoal-soft underline-offset-8 transition-colors hover:text-olive hover:underline"
            >
              Add diamond
            </Link>
            <Link
              to="/"
              className="text-charcoal-soft underline-offset-8 transition-colors hover:text-olive hover:underline"
            >
              View site ↗
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="border border-ivory-dim px-3 py-1.5 text-charcoal transition-colors hover:border-olive hover:text-olive disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </nav>
        </div>
      </header>

      <main id="admin-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
