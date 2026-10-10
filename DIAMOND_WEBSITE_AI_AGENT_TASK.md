# DIAMOND LUXURY E-COMMERCE WEBSITE — AI AGENT MASTER TASK

## Your role

Act as a senior full-stack engineer, luxury e-commerce UX designer, accessibility specialist, QA engineer, and technical lead.

Your job is to inspect the existing project, understand its stack and current behavior, and implement a polished diamond-selling website in small, verified phases. Work in the existing repository. Do not blindly replace the project or rewrite working features.

Reference websites:
- https://www.diarossa.com/
- https://www.tiffany.com/

Use these sites as functional and visual research references only. Do not copy their logos, exact wording, proprietary assets, source code, or trademarked brand identity. Build an original brand experience using the palette below.

## Brand palette — required

Use these exact design tokens throughout the interface:

- Wine: `#541F32`
- Muted Gold: `#C4A36B`
- Ivory: `#F8F4EF`
- Ink: `#241C20`

Suggested use:
- Main page background: Ivory.
- Primary text: Ink.
- Primary actions / key brand areas: Wine.
- Premium accents, dividers, selected states, small highlights: Muted Gold.
- Use white only where it supports legibility or product photography.
- Check accessible contrast for every text/button combination. Do not use gold as small body text on ivory unless contrast is adequate.
- Define CSS variables or theme tokens once and reuse them. Avoid scattered hard-coded color values.

## Typography requirement

The user wants typography inspired by the premium feel of Tiffany & Co.

1. Inspect the live Tiffany site in a browser and inspect the actual computed/rendered fonts for headings, body copy, navigation, and buttons, if browser tools are available.
2. Do not assume the Tiffany wordmark font is the website's UI font. Do not claim a font identity unless verified.
3. Do not download, scrape, or redistribute proprietary fonts without authorization. Do not copy the Tiffany logo or wordmark.
4. If the original UI font is not licensed and available for this project, select legally usable, close alternatives:
   - Refined editorial serif for large campaign headings and selected luxury moments.
   - Highly readable neutral sans-serif for product details, filters, navigation, forms, and body text.
5. Prefer a licensed local font already present in the repository if suitable. Otherwise use a reputable, legally usable font source, with reliable fallback fonts and sensible loading behavior.
6. Establish a consistent type scale, line heights, letter spacing, responsive heading sizes, and font weights. Avoid using a decorative serif for every UI element.
7. Keep all text legible on mobile and support the required character set.

## Core mission

Create an original, trustworthy, premium diamond e-commerce experience combining:
- Diarossa-inspired diamond discovery, natural/lab-grown selection, shape/style/metal navigation, and a “create your own ring” journey.
- Tiffany-inspired editorial product presentation, high-end product pages, ring customization, diamond education, appointments, and customer care.
- The user's own wine / muted gold / ivory / ink brand identity.

The website must be functional, not just a static mockup. Every visible control must either work or be clearly labelled as a future integration. Do not fabricate successful payments, stock availability, certification, shipping promises, appointment bookings, or customer reviews.

## NON-NEGOTIABLE WORKING RULES

1. Start by inspecting the repository: package scripts, framework, routing, current pages, components, styles, API calls, database models, environment variables (never print secret values), tests, and Git status.
2. Write a concise implementation plan and create/update a checklist in this file or a separate `IMPLEMENTATION_CHECKLIST.md`.
3. Work one phase at a time, in order. Before each phase, state its goal, files likely to change, and acceptance criteria in your task notes.
4. Preserve existing working routes, authentication, cart behavior, backend integrations, and data. Do not break unrelated features.
5. Do not replace the existing stack or introduce a new framework without a compelling, explained reason.
6. Prefer reusable components, typed/validated data where the existing stack supports it, clean separation of UI/business logic, and maintainable code.
7. Never expose database credentials, payment secrets, API keys, or private customer data in client code or logs.
8. Do not use fake buttons. All links, filters, forms, sorting, cart actions, quantity controls, dialogs, and navigation must work.
9. Use real product data from the existing API/database when available. If no backend/catalog exists, create a clearly marked development seed dataset and a documented data contract. Never present demo inventory or demo certificates as verified real-world inventory.
10. Do not invent GIA/IGI certificate numbers, diamond origin claims, ethical sourcing claims, prices, stock, ratings, or reviews. Make these fields data-driven and display them only when supported by real data.
11. Keep the design responsive, keyboard-accessible, and mindful of reduced-motion preferences.
12. Do not push, deploy, delete production data, run destructive database migrations, or change production secrets without explicit user approval.
13. If a requirement cannot be completed because credentials, external services, real data, or a third-party API are missing, implement a safe interface/adapter where appropriate and clearly report what is blocked. Never claim it is complete.
14. Avoid adding large dependencies unless they provide real value. Explain major new dependencies in the final report.
15. After each phase, run relevant lint, type-check, tests, and build commands that exist in this repository. Fix regressions before continuing.

# PHASE 0 — PROJECT AUDIT AND BASELINE

- Inspect the full project structure and existing application.
- Identify framework, package manager, routes, styling system, component conventions, backend, database, authentication, cart, payment integration, deployment configuration, and available tests.
- Check Git status first. Do not discard user changes.
- Run the existing app and baseline checks when possible.
- Record current issues separately from new work.
- Identify whether the project is frontend-only or full-stack.
- Produce a concise plan and checklist before making large changes.

Acceptance criteria:
- The implementation plan reflects the real codebase rather than assumptions.
- Existing behavior and user changes are preserved.
- Missing services/data are explicitly identified.

# PHASE 1 — BRAND FOUNDATION AND DESIGN SYSTEM

Create or refine reusable design tokens and foundational UI elements.

Required:
- Palette tokens for Wine, Muted Gold, Ivory, and Ink.
- Typography tokens and responsive type scale.
- Consistent spacing, border radii, shadows, container widths, and breakpoints.
- Button variants: primary, secondary, outline, text/link, disabled, loading.
- Inputs, selects, checkboxes, radio buttons, badges, price display, breadcrumb, modal/drawer, skeleton/loading states, empty states, error states, and toast/feedback patterns.
- Focus-visible styles and accessible color contrast.
- Reduced-motion support.
- Image aspect ratios and a consistent image-cropping strategy.

Acceptance criteria:
- Components share tokens rather than duplicating styling.
- Layout looks premium, calm, editorial, and product-focused.
- Keyboard focus is visible and interactive states are distinguishable.

# PHASE 2 — GLOBAL NAVIGATION AND DISCOVERY

Create a responsive luxury jewelry navigation.

Recommended navigation:
- Engagement Rings
- Wedding Rings
- Natural Diamonds
- Lab-Grown Diamonds
- Fine Jewelry
- Education / The Diamond Guide
- Our Story / Craftsmanship
- Book an Appointment

Also implement:
- Brand logo/name placeholder for the user's own brand (do not use Tiffany branding).
- Search control with usable search overlay/page.
- Account/sign-in link if authentication exists.
- Wishlist icon with working saved-item state if feasible.
- Cart icon with item count and accessible cart drawer/page.
- Desktop mega-menu grouped by shape, style, metal, and diamond type.
- Mobile navigation drawer with accessible open/close behavior.
- Sticky header only if it supports the visual experience; avoid covering page content.
- Breadcrumbs on category/product/detail pages.

Acceptance criteria:
- Every navigation item leads to the correct route or meaningful section.
- Menus work with keyboard, touch, and mouse.
- Mobile menu closes on Escape and after route selection.
- Search returns relevant results from the real catalog or clearly marked demo dataset.

# PHASE 3 — HOMEPAGE / LUXURY BRAND STORY

Build an original home page with these sections, using real project data and optimized images where available:

1. Premium hero with a short original brand message and clear calls to action.
2. Shop by category: engagement rings, loose diamonds, wedding bands, earrings, pendants, bracelets, as supported by inventory.
3. Shop by diamond shape: Round, Oval, Princess, Emerald, Cushion, Pear, Radiant, Asscher, Marquise, Heart, and other shapes only when supported.
4. Shop by style: Solitaire, Halo, Pavé, Three-stone, Vintage, Hidden Halo, and other styles when supported.
5. Shop by metal: Platinum, white gold, yellow gold, rose gold, and available karat variants.
6. Natural vs lab-grown educational comparison, written accurately and neutrally.
7. Featured / new / best-selling products only when supported by actual catalog data.
8. Diamond quality / 4Cs education teaser.
9. Craftsmanship, provenance, care, and certification information only when the business can substantiate the claims.
10. Appointment / expert consultation CTA.
11. Newsletter signup only if a real endpoint/provider exists; otherwise implement a clearly documented safe placeholder, not a fake success.
12. Complete footer with contact, FAQ, shipping, returns, privacy, terms, social links, and policies where actual routes/content exist.

Acceptance criteria:
- Page has a clear hierarchy and premium product photography.
- CTA destinations are correct.
- No fabricated trust claims or broken image placeholders.
- Responsive layout works at mobile, tablet, laptop, and large desktop sizes.

# PHASE 4 — DIAMOND CATALOG AND PRODUCT DISCOVERY

Build separate catalog routes for loose natural diamonds, loose lab-grown diamonds, engagement rings, wedding bands, and other supported jewelry categories.

Required catalog behavior:
- Grid/list layout if useful.
- Filters that combine correctly and can be cleared.
- Sorting: price low-to-high, price high-to-low, carat, newest, and relevance where data supports it.
- Pagination or “load more” with correct result counts.
- Search by product name, SKU, certificate number where appropriate, and relevant attributes.
- Filter/sort state reflected in URL query parameters where practical, so links can be shared and browser back/forward works.
- Loading, no-results, and API-error states.
- Mobile filter drawer and desktop sidebar/top filter bar.
- Accessible product-card controls and image alt text.

Diamond filters should be data-driven and may include:
- Diamond type: natural / lab-grown.
- Shape.
- Price range.
- Carat range.
- Cut grade.
- Color grade.
- Clarity grade.
- Polish, symmetry, and fluorescence if supplied.
- Certification laboratory and certificate availability if supplied.
- Metal, ring size, ring style, setting, and gemstone details for jewelry products.

Rules:
- Do not show attributes that are not relevant to the current category.
- Do not invent filter options or available inventory counts.
- Use a single consistent data model for filtering and sorting.
- Ensure filter combinations do not produce contradictory results.
- Make “clear all” restore the default catalog state.

Acceptance criteria:
- Every filter and sort option changes the displayed results.
- URL state and UI state stay in sync where implemented.
- Product count matches the filtered result set.
- Empty/error/loading states are useful and accessible.

# PHASE 5 — PRODUCT DETAIL PAGES

Every product detail page should include relevant information supported by the data:

- Product title, SKU/ID, price, availability status, and tax/shipping note where applicable.
- High-quality product gallery with thumbnails, zoom or enlarged view, and mobile-friendly gestures.
- Diamond shape, carat, cut, color, clarity, polish, symmetry, fluorescence, measurements, and certificate details when applicable and available.
- Natural/lab-grown classification.
- Metal, setting style, ring size, and other variants where applicable.
- Size guide and ring-size selection for rings.
- Quantity control where appropriate.
- Add to cart and buy-now behavior integrated with existing checkout/authentication.
- Wishlist/save-for-later behavior if account/local persistence is supported.
- Delivery/returns/care information from the actual business policy.
- Related products from the catalog.
- Certificate viewer/download link only if a real certificate file or trusted external certificate URL exists.
- Shareable product URL and sensible SEO metadata.

Acceptance criteria:
- Selected variants and price are consistent across page/cart/checkout.
- Unavailable variants cannot be purchased.
- Cart updates correctly and survives refresh according to the existing architecture.
- Product pages work with direct URL visits and invalid product IDs.

# PHASE 6 — “CREATE YOUR OWN RING” BUILDER

Implement a guided ring builder inspired by the idea of Diarossa's ring-creation flow and Tiffany's customization experience, while keeping the UI original.

Suggested journey:
1. Choose a starting path:
   - Start with a setting.
   - Start with a natural diamond.
   - Start with a lab-grown diamond.
2. If starting with a setting: select setting style, metal, ring size, and other supported options.
3. If starting with a diamond: choose diamond type, then browse/filter loose diamonds.
4. Select a compatible center diamond.
5. Review the combined ring.
6. Show a clear itemized price and total.
7. Review selections and add the configured product to cart.

Requirements:
- Use a stepper/progress indicator.
- Keep selections when navigating between steps.
- Validate required selections before moving forward.
- Show only compatible options.
- Show a clear selected-state for each option.
- Update price from real variant prices; never fabricate totals.
- Allow back/edit/restart.
- If actual 3D rendering is unavailable, use a polished product-image composition and clearly communicate its limitations rather than pretending it is a true 3D model.
- Save the selected setting and diamond IDs/configuration in cart data so the exact configuration reaches checkout.
- On refresh, preserve progress if practical and safe.

Acceptance criteria:
- Users can complete both supported starting paths.
- Invalid combinations are blocked with helpful explanations.
- The final cart line item contains the full ring configuration and correct total.

# PHASE 7 — CART, CHECKOUT, AND ORDER FLOW

Inspect and preserve the existing cart/auth/payment system before changing it.

Cart:
- Add/remove item, update quantity where relevant, remove item, save for later if supported.
- Display product image, variant/configuration, unit price, quantity, subtotal, discounts only when valid, shipping/tax information where known, and total.
- Recalculate totals on the trusted backend for real checkout.
- Validate stock and price before order placement.
- Useful empty-cart and error states.

Checkout:
- Contact details, delivery address, shipping method, order review, and payment provider integration if available.
- Validate inputs and show actionable errors.
- Do not store raw card numbers or CVV in the application database. Use a trusted payment provider's hosted/secure components.
- Do not report an order as paid or placed until the backend/payment provider confirms it.
- If payment credentials are unavailable, build the integration boundary and a safe non-production test flow; clearly mark what is not connected.
- Show order confirmation only after verified order creation.
- Prevent accidental duplicate order submission.

Acceptance criteria:
- Prices are calculated and validated on the server for production checkout.
- Errors do not lose the user's selections unnecessarily.
- No fake payment success, insecure card handling, or exposed secrets.

# PHASE 8 — AUTHENTICATION, ACCOUNT, AND WISHLIST

Only implement features appropriate to the existing project architecture.

Potential features:
- Register, login, logout, password reset.
- Account profile and addresses.
- Order history and order details.
- Wishlist.
- Guest cart merge after login.
- Secure session handling and appropriate access control.

Security:
- Validate data on both client and server.
- Hash passwords with a suitable established library if password authentication is used.
- Apply authorization on backend endpoints, not only in frontend routes.
- Do not leak whether a private account exists through password-reset messages.
- Rate-limit sensitive authentication endpoints where the backend supports it.
- Never commit credentials or secrets.

Acceptance criteria:
- Protected data is accessible only to the correct user.
- Guest shopping works as appropriate.
- Authentication errors are clear without exposing sensitive internals.

# PHASE 9 — DIAMOND EDUCATION AND TRUST

Create an education hub with original, accurate content:
- The 4Cs: cut, color, clarity, carat.
- Diamond shape guide.
- Natural vs lab-grown diamonds.
- How to read a grading report.
- Ring settings and metals.
- Ring-size guide.
- Diamond care and cleaning.
- FAQs.
- Sourcing, traceability, warranty, returns, and certification policy only to the extent the business has verified information.

Requirements:
- Explain technical terms in plain language.
- Do not equate carat with visual size or quality.
- Explain that grading/certification details depend on the specific stone and laboratory.
- Avoid misleading claims such as “investment guaranteed,” “conflict-free,” or “100% ethical” unless substantiated and legally reviewed.
- Link education pages from catalog/product pages at useful decision points.

Acceptance criteria:
- Education pages are readable, navigable, and accessible.
- Claims are evidence-based and approved by the business owner before publication.

# PHASE 10 — APPOINTMENTS AND CUSTOMER SUPPORT

Where business operations support them, implement:
- Appointment request form for in-store or virtual consultation.
- Customer name/contact, preferred date/time, timezone, topic, and optional notes.
- Server-side validation, spam protection, consent/privacy messaging, and confirmation only after successful submission.
- Contact form, FAQ links, order tracking link if an actual order-tracking service exists.
- If calendar/email integration is unavailable, provide a clearly labelled request workflow or integration adapter; do not claim a booking is confirmed.

Acceptance criteria:
- Form submissions are validated and securely handled.
- Confirmation messages match the actual server result.
- Private form content is not exposed publicly.

# PHASE 11 — SEARCH, SEO, PERFORMANCE, AND ACCESSIBILITY

SEO:
- Unique page titles and meta descriptions.
- Canonical URLs where appropriate.
- Sitemap and robots configuration appropriate to the app.
- Open Graph metadata.
- Product structured data only when accurate and valid.
- Avoid indexing internal account, cart, checkout, or private pages.
- Do not mark fake reviews or fake ratings in structured data.

Performance:
- Responsive optimized images and lazy loading below the fold.
- Avoid loading huge images/videos unnecessarily.
- Minimize layout shift.
- Use route-level code splitting where supported.
- Avoid unnecessary re-renders and excessive animation.
- Add loading states for asynchronous actions.

Accessibility:
- Semantic landmarks and heading order.
- Keyboard-accessible menus, dialogs, filters, forms, and builder steps.
- Accessible names and useful error messages.
- Visible focus indicators.
- Sufficient contrast.
- Reduced-motion support.
- Avoid color-only communication.
- Meaningful alt text.

Acceptance criteria:
- No obvious console errors.
- No broken internal routes.
- Lighthouse or equivalent checks are run if available; record results and remaining issues.
- Structured data and metadata reflect real content.

# PHASE 12 — SECURITY AND DATA QUALITY

Audit:
- Environment variable use and secret handling.
- Server-side validation.
- Authentication/authorization.
- MongoDB queries and schema validation if MongoDB is used.
- Rate limiting and abuse protection where appropriate.
- CORS configuration.
- Error handling and logging.
- File uploads, if any.
- Payment provider integration.
- Input sanitization and output encoding where relevant.
- Inventory, price, and order consistency.
- Data migration safety and backups before production changes.

Acceptance criteria:
- No secrets in source control or frontend bundles.
- Backend verifies important business rules.
- Production data is not modified destructively without explicit approval.

# PHASE 13 — RESPONSIVE VISUAL QA

Check at least:
- Small mobile (~320–375px).
- Standard mobile (~390–430px).
- Tablet.
- Laptop.
- Large desktop.

Verify:
- Navigation, filters, search, product grid, product gallery, ring builder, cart, forms, and footer.
- Long product names, missing images, large prices, and empty results.
- Keyboard navigation and focus.
- Reduced-motion behavior.
- Browser back/forward and refresh on nested routes.
- Loading, error, and offline/network failure states where applicable.

Fix real issues instead of merely documenting them.

# PHASE 14 — FINAL VERIFICATION AND HANDOFF

Run all applicable:
- Lint.
- Type-check.
- Unit/integration tests.
- Production build.
- Existing end-to-end tests.
- Route smoke tests.
- Responsive and accessibility checks.

Do not claim a test passed unless it was actually run and passed.

Provide a final report containing:
1. Features completed.
2. Important files/components changed.
3. Routes added/updated.
4. Backend/database changes and migrations.
5. Environment variables/integrations required (names only; never values).
6. Commands to run locally.
7. Tests/build results.
8. Known limitations and blocked integrations.
9. Manual steps the user must complete.
10. Any work requiring approval before deployment.

## Suggested route map

Adapt this map to the existing routing conventions rather than forcing a new router:

- `/` — Home
- `/diamonds/natural` — Natural loose diamonds
- `/diamonds/lab-grown` — Lab-grown loose diamonds
- `/engagement-rings` — Engagement rings
- `/wedding-rings` — Wedding bands
- `/jewelry` — Other jewelry categories, if sold
- `/products/:slug` — Product detail
- `/create-your-ring` — Ring builder
- `/diamond-guide` — Education hub
- `/diamond-guide/4cs`
- `/diamond-guide/shapes`
- `/diamond-guide/natural-vs-lab-grown`
- `/ring-size-guide`
- `/appointments` — Consultation request
- `/wishlist` — If supported
- `/cart`
- `/checkout`
- `/login` and `/account` — If authentication exists
- `/faq`, `/contact`, `/shipping-returns`, `/privacy`, `/terms` — As appropriate

## Recommended component architecture

Adapt to the current project and avoid unnecessary duplication. Possible components:
- `SiteHeader`, `MegaMenu`, `MobileNavigation`, `SiteFooter`
- `SearchOverlay`, `ProductCard`, `ProductGrid`, `ProductGallery`
- `FilterSidebar`, `MobileFilterDrawer`, `SortSelect`, `ActiveFilterChips`
- `DiamondSpecs`, `CertificateDetails`, `PriceDisplay`
- `RingBuilderStepper`, `SettingSelector`, `DiamondSelector`, `RingSummary`
- `CartDrawer`, `CartItem`, `OrderSummary`
- `AppointmentForm`, `EducationCard`, `Breadcrumbs`
- Shared `Button`, `Input`, `Select`, `Dialog`, `Toast`, `Skeleton`, `EmptyState`

## Definition of done

The task is complete only when:
- The original project has been audited and preserved.
- The four required brand colors are applied consistently.
- Typography is verified or replaced with a legal, visually appropriate alternative.
- All implemented controls actually work.
- Catalog filters, product pages, and ring-building flow use consistent data.
- Cart and checkout are truthful, secure, and integrated as far as available services permit.
- Responsive behavior and accessibility are tested.
- Lint/tests/build have been run and results are reported accurately.
- Unavailable integrations and required owner actions are clearly listed.

## Start here

Begin with Phase 0 only. Inspect the repository and report the actual stack, routes, data model, existing features, and baseline test/build status. Then create the checklist and implement phases in order. Do not attempt a risky all-at-once rewrite. Continue through the phases autonomously when the next phase is safe and the required dependencies are available; pause and ask the user only when a real decision, credential, payment/legal/business policy, destructive action, or deployment approval is required.
