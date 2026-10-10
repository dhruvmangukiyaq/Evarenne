# IMPLEMENTATION CHECKLIST — Evarenne Diamond E-Commerce

Source of truth: `DIAMOND_WEBSITE_AI_AGENT_TASK.md`
Status key: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked (needs owner)

---

## PHASE 0 — PROJECT AUDIT AND BASELINE `[x]`

### Audit findings (run 2026-01-10, actual commands executed)

- Working directory: `/Users/dhruvmangukiya/Desktop/Evarenne`
- Contents: `DIAMOND_WEBSITE_AI_AGENT_TASK.md`, `.DS_Store` **only** — there is no application code.
- `git status` → `fatal: not a git repository` (no Git history, no user changes to discard).
- No `package.json`, no framework, no routes, no components, no styles, no API, no database,
  no auth, no cart, no payment integration, no tests, no deployment config anywhere in the directory.
- Toolchain present: Node `v26.10.0`, npm `11.19.1`, git `2.x`. pnpm/yarn/bun not installed.
- npm registry reachable (`npm ping` → PONG).
- Conclusion: **greenfield project**. "Preserve existing features" rule is satisfied trivially —
  nothing exists yet to break. Frontend + backend must both be created.

### Audit outcomes
- [x] Full project structure inspected (empty) — no assumptions used.
- [x] Git status checked first; no user work discarded.
- [x] Missing services/data explicitly identified (see "Known gaps" below).
- [x] Implementation plan + this checklist produced before large changes.
- [ ] Baseline build/test run — **not possible: no project exists yet.** First build becomes the baseline.

### Known gaps (must be reported, never faked)
| Gap | Impact | Handling |
| --- | --- | --- |
| No real product/inventory database | Catalog needs data | Clearly marked **development seed dataset** + documented data contract; never presented as verified inventory |
| No payment provider credentials | Cannot take real payment | Build checkout integration boundary + safe non-production test flow; label as not connected |
| No auth backend/session store | Account area | Implement only what the chosen stack supports safely; guest cart works |
| No newsletter provider | Newsletter CTA | Documented placeholder that does NOT fake a success |
| No certificate files / lab URLs | Certificate viewer | Certificate fields are data-driven, rendered only when real data exists |
| No business policy content (shipping/returns/privacy/terms) | Footer links | Route stubs with explicit "content pending owner approval" — no invented claims |
| No real product photography | Hero/product imagery | Neutral, non-deceptive placeholder imagery clearly marked as such; no fake stock photos of "our" diamonds |
| No calendar/email integration | Appointments | "Request" workflow, confirmation only on real server acceptance; never "booking confirmed" |

---

## PHASE 1 — BRAND FOUNDATION AND DESIGN SYSTEM `[ ]`
Goal: tokens + primitives, no page content yet.
Likely files: `src/app/globals.css`, `src/theme/*`, `src/components/ui/*`.

- [ ] Palette tokens: Wine `#541F32`, Muted Gold `#C4A36B`, Ivory `#F8F4EF`, Ink `#241C20` (CSS vars, single source)
- [ ] Contrast audit of every text/button pair (gold-on-ivory banned for small body text)
- [ ] Typography: inspect live Tiffany site computed fonts (browser tools) — verify, don't assume
- [ ] Choose legally usable fonts (editorial serif for campaign headings + neutral sans for UI), fallbacks, `font-display`
- [ ] Type scale, line heights, letter spacing, responsive headings, weights
- [ ] Spacing / radius / shadow / container / breakpoint tokens
- [ ] Buttons: primary, secondary, outline, text, disabled, loading
- [ ] Inputs, selects, checkbox, radio, badges, price display, breadcrumb, modal/drawer, skeleton, empty state, error state, toast
- [ ] Focus-visible styles, reduced-motion support
- [ ] Image aspect-ratio + cropping strategy
- Acceptance: components share tokens; premium/calm/editorial look; keyboard focus visible.

## PHASE 2 — GLOBAL NAVIGATION AND DISCOVERY `[ ]`
- [ ] Header: Engagement Rings, Wedding Rings, Natural Diamonds, Lab-Grown Diamonds, Fine Jewelry, Diamond Guide, Our Story, Book an Appointment
- [ ] Original brand wordmark placeholder (no Tiffany branding)
- [ ] Search overlay → real results from seed catalog
- [ ] Account link (only if auth exists), wishlist w/ working saved state, cart icon + count + accessible drawer
- [ ] Desktop mega-menu grouped by shape / style / metal / diamond type
- [ ] Mobile drawer: Escape closes, closes after route selection, focus trap
- [ ] Sticky header without covering content
- [ ] Breadcrumbs on category/product pages
- Acceptance: every nav item resolves; keyboard/touch/mouse all work.

## PHASE 3 — HOMEPAGE / LUXURY BRAND STORY `[ ]`
- [ ] Hero + original brand message + working CTAs
- [ ] Shop by category / shape / style / metal (data-driven, only supported values)
- [ ] Natural vs lab-grown neutral comparison
- [ ] Featured products only if catalog supports it
- [ ] 4Cs teaser
- [ ] Craftsmanship/provenance/certification copy only where substantiated
- [ ] Appointment CTA → working route
- [ ] Newsletter: real endpoint or documented safe placeholder (no fake success)
- [ ] Footer: contact, FAQ, shipping, returns, privacy, terms, social — only where routes exist
- Acceptance: hierarchy, correct CTAs, no fabricated trust claims, responsive 320→1600px+.

## PHASE 4 — DIAMOND CATALOG AND PRODUCT DISCOVERY `[ ]`
- [ ] Routes: `/diamonds/natural`, `/diamonds/lab-grown`, `/engagement-rings`, `/wedding-rings`, `/jewelry`
- [ ] Filters combine correctly, clearable, category-relevant only
- [ ] Sort: price asc/desc, carat, newest, relevance
- [ ] Pagination / load more + accurate result counts
- [ ] Search by name, SKU, certificate number, attributes
- [ ] Filter/sort state in URL query params (shareable, back/forward works)
- [ ] Loading / no-results / API-error states
- [ ] Mobile filter drawer + desktop sidebar
- [ ] Accessible cards + alt text
- Acceptance: every filter changes results; URL↔UI in sync; count matches.

## PHASE 5 — PRODUCT DETAIL PAGES `[ ]`
- [ ] `/products/:slug`: title, SKU, price, availability, tax/shipping note
- [ ] Gallery with thumbnails, zoom, mobile gestures
- [ ] Diamond specs + certificate block (data-driven, only when real)
- [ ] Natural/lab classification, metal/size/style variants
- [ ] Size guide + ring-size selection
- [ ] Quantity control, add-to-cart, buy-now → existing checkout flow
- [ ] Wishlist/save-for-later
- [ ] Related products, shareable URL, SEO metadata
- [ ] Invalid product ID → graceful not-found
- Acceptance: variant price consistent page/cart/checkout; unavailable variants blocked.

## PHASE 6 — "CREATE YOUR OWN RING" BUILDER `[ ]`
- [ ] 3 entry paths: setting first / natural diamond / lab-grown diamond
- [ ] Stepper with validation, preserved selections, back/edit/restart
- [ ] Compatible-only options, clear selected states
- [ ] Itemized price + total from real variant prices
- [ ] Image composition (honestly labelled — no fake 3D claim)
- [ ] Config saved into cart line item; survives refresh
- Acceptance: both paths completable; invalid combos blocked; cart line holds full config.

## PHASE 7 — CART, CHECKOUT, ORDER FLOW `[ ]`
- [ ] Cart: add/remove/qty/save-for-later, image, variant, unit price, subtotal, total
- [ ] Server-side price/stock validation (backend authoritative)
- [ ] Checkout: contact, address, shipping, review, payment boundary
- [ ] No raw card data stored; hosted/secure fields only
- [ ] Order confirmation only after verified creation; duplicate-submit guard
- [ ] Empty/error states that preserve selections
- Acceptance: no fake payment success; no exposed secrets.

## PHASE 8 — AUTHENTICATION, ACCOUNT, WISHLIST `[ ]`
- [ ] Register / login / logout / password reset (only if architecture supports)
- [ ] Profile, addresses, order history
- [ ] Wishlist persistence, guest cart merge
- [ ] Server-side authorization, hashed passwords, non-enumerating reset messages, rate limiting
- Acceptance: protected data isolated per user; guest shopping works.

## PHASE 9 — DIAMOND EDUCATION AND TRUST `[ ]`
- [ ] `/diamond-guide`, `/4cs`, `/shapes`, `/natural-vs-lab-grown`, `/ring-size-guide`
- [ ] Grading-report reading, settings/metals, care/cleaning, FAQs
- [ ] Plain-language explanations; carat ≠ visual size; lab-dependent grading caveats
- [ ] No "conflict-free"/"investment guaranteed"/"100% ethical" claims without owner sign-off
- [ ] Education links from catalog/product decision points

## PHASE 10 — APPOINTMENTS AND CUSTOMER SUPPORT `[ ]`
- [ ] `/appointments` request form: name, contact, date/time, timezone, topic, notes
- [ ] Server validation, spam protection, consent messaging, confirmation only after real submission
- [ ] `/contact`, FAQ, order tracking only if a real service exists

## PHASE 11 — SEARCH, SEO, PERFORMANCE, ACCESSIBILITY `[ ]`
- [ ] Unique titles/descriptions, canonical, sitemap, robots, Open Graph
- [ ] Valid structured data (no fake reviews/ratings); noindex cart/checkout/account
- [ ] Responsive lazy images, minimal CLS, route code splitting, loading states
- [ ] Landmarks, heading order, keyboard everything, accessible names, focus, contrast, reduced motion, alt text
- [ ] No console errors, no broken routes, Lighthouse run + recorded

## PHASE 12 — SECURITY AND DATA QUALITY `[ ]`
- [ ] Env/secret handling (no secrets in repo or client bundle)
- [ ] Server-side validation, authz, rate limiting, CORS, error logging
- [ ] Input sanitization; inventory/price/order consistency
- [ ] No destructive DB operations

## PHASE 13 — RESPONSIVE VISUAL QA `[ ]`
- [ ] 320–375 / 390–430 / tablet / laptop / large desktop
- [ ] Nav, filters, search, grid, gallery, builder, cart, forms, footer
- [ ] Long names, missing images, large prices, empty results
- [ ] Keyboard + focus, reduced motion, back/forward/refresh on nested routes
- [ ] Loading / error / offline states — fix real issues found

## PHASE 14 — FINAL VERIFICATION AND HANDOFF `[ ]`
- [ ] Lint · type-check · unit/integration tests · production build · smoke tests — actually run
- [ ] Final report: features, files, routes, DB changes, env vars (names only), commands, results, limitations, owner TODOs

---

## Foundation decisions (Phase 0 outputs)
- **Framework:** chosen for SEO + server-side validation needs of Phases 7/11/12.
- **Brand name:** placeholder `EVARENNE` (from folder name) — owner can rename via one token.
- **Data:** documented dev seed dataset with an explicit data contract; labelled non-authoritative.
- **Git:** `git init` local only — no pushes, no deploys without explicit approval.
