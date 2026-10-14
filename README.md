# Evarenne — Lab-Grown Diamonds & Fine Jewelry

A reference catalogue for lab-grown diamonds: browse loose stones by shape, carat, colour,
clarity and grade, read the specifications plainly, and enquire directly on WhatsApp.
No cart, no checkout, no prices — every enquiry starts a conversation with a specialist.

- **Client** — React 19 + Vite + Tailwind CSS 4 + TypeScript (`client/`)
- **API** — Express 5 + Zod + TypeScript (`server/`)
- **Production runtime** — Cloudflare Worker serving the built client and the shared API (`server/src/worker.ts`, `wrangler.jsonc`)

---

## Quick start

```bash
npm install

# Local dev only: the admin panel password (see "Admin panel")
cat > .env <<'EOF'
ADMIN_PASSWORD=choose-a-password
EOF

npm run dev
```

| Service  | URL                          |
| -------- | ---------------------------- |
| Storefront (Vite) | http://localhost:5173  |
| API (Express)     | http://localhost:4000  |

The Vite dev server proxies `/api/*` to the Express server, so the storefront
just calls `/api/...` and never thinks about the port. Built and tested on Node 26.

---

## Scripts

Run from the repo root; they fan out to both workspaces.

| Command | What it does |
| --- | --- |
| `npm run dev` | Express API + Vite dev server, in parallel |
| `npm run build` | Compiles the server and builds the client into `client/dist` |
| `npm start` | Runs the compiled server (serves `client/dist` if it exists) |
| `npm run lint` | ESLint across server and client |
| `npm run typecheck` | `tsc` for both workspaces |
| `npm test` | Vitest — server then client |

Current state: **lint clean, typecheck clean, 103 tests passing** (59 server, 44 client).

---

## Repository layout

```
.
├── client/                     # Storefront SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── catalog/        # ProductCard, FilterBar, ProductArt
│   │   │   ├── home/           # HeroStage — animated hero SVG
│   │   │   ├── layout/         # SiteHeader, SiteFooter, nav-items, SearchOverlay
│   │   │   └── ui/             # Button, Form, Display, Overlay, Reveal, toast
│   │   ├── pages/              # Route components (+ admin/)
│   │   ├── lib/                # api client, schema types, whatsapp.ts, money/labels
│   │   └── assets/             # hero, shape and product photography
│   └── vite.config.ts          # port 5173, /api → :4000 proxy
├── server/
│   └── src/
│       ├── domain/             # catalog query, zod schemas, shared types
│       ├── routes/             # catalog.routes, admin.routes (Express adapters)
│       ├── admin/              # auth, product store, media, shared admin API
│       ├── data/seed.ts        # bundled lab-grown sample catalogue
│       ├── app.ts              # createApp() — the Express app
│       ├── index.ts            # local dev entry, reads .env
│       └── worker.ts           # Cloudflare Worker entry (production)
├── wrangler.jsonc              # Workers config: assets, D1, optional R2
├── SVG/                        # Reference stone-shape illustrations (source art)
├── sample diamound/            # Reference photography supplied with the brief
├── DIAMOND_WEBSITE_AI_AGENT_TASK.md   # original brief
└── IMPLEMENTATION_CHECKLIST.md        # phased plan and status
```

The two asset folders above are the source material the brief shipped with. What
the site actually serves lives in `client/src/assets`.

### Routes

| Path | Page |
| --- | --- |
| `/` | Home — hero, shop by shape, why lab-grown, featured, the 4Cs |
| `/diamonds` | Catalogue with filters, sorting and pagination |
| `/search` | Same catalogue view, driven by `?q=` |
| `/products/:slugOrId` | Diamond detail — specs, grading report, **Inquire Now** |
| `/diamond-guide`, `/diamond-guide/:topic` | Education: the 4Cs, shapes |
| `/our-story`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms` | Static content |
| `/appointments` | Enquiry form (still routed, not linked from the UI) |
| `/admin/login`, `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit` | Admin panel |

`/diamonds/natural` and `/diamonds/lab-grown` are legacy URLs: they redirect to
`/diamonds` and keep the query string, so shared filtered links still resolve.
The catalogue is **lab-grown only**.

---

## API

### Catalogue

Catalogue, product, search and home responses all include `dataSource`,
`generatedAt` and a `notice` field alongside their payload, so the client can
label sample data honestly. `GET /api/health` is a plain liveness check.

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `{ status: "ok", service: "evarenne-api" }` |
| `GET` | `/api/catalog` | Paginated. Query: `page`, `pageSize`, `shapes`, `colors`, `clarities`, `cuts`, `polishes`, `symmetries`, `fluorescences`, `caratMin`, `caratMax`, `sort` |
| `GET` | `/api/products/:slugOrId` | `{ product, dataSource, ... }` |
| `GET` | `/api/search?q=` | Text search; `{ items, total, q, ... }` |
| `GET` | `/api/home` | `{ featured, counts, ... }` for the homepage |

An invalid catalogue query answers `400` with a `issues[]` array naming each
bad path and message.

`sort` accepts `relevance`, `price-asc`, `price-desc`, `carat-asc`, `carat-desc`, `newest`.

### Admin

Password login over an `HttpOnly`, `SameSite=Lax` session cookie. Login is
throttled; the API answers `503` until `ADMIN_PASSWORD` is configured.

| Method | Path |
| --- | --- |
| `POST` | `/api/admin/login` · `/api/admin/logout` |
| `GET` | `/api/admin/session` |
| `GET`/`POST` | `/api/admin/products` |
| `GET`/`PUT`/`DELETE` | `/api/admin/products/:id` |
| `POST` | `/api/admin/media` (photo/video upload) |
| `GET` | `/api/media/:key` (public media serving) |

The Express server and the Cloudflare Worker call the **same** admin handler —
one implementation, two runtimes.

---

## Admin panel

A password-protected panel at `/admin` for managing the diamonds visitors see:
create, edit and delete listings, and upload photographs and video.

- Password comes from `ADMIN_PASSWORD` — set it in `.env` for local dev.
- Stored listings live in `server/data/` locally (gitignored), and in the D1
  database `evarenne-admin` in production.
- Admin-created records are merged ahead of the bundled seed, so a diamond
  saved a moment ago appears on the storefront immediately.
- R2 for media is optional: until the bucket exists, uploads answer `503`
  with a clear message rather than failing silently.

For a deployed Worker:

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET   # optional; falls back to the password
```

---

## Deployment (Cloudflare Workers)

`wrangler.jsonc` wires the Worker up to:

- **Assets** — `client/dist`, served with a single-page-application fallback so
  client-side routes like `/products/:slug` render the app shell.
- **D1** — `evarenne-admin`, holding admin-added products.
- **R2** — added later as an `r2_buckets` entry once the bucket exists.

```bash
npm run build
npx wrangler deploy
```

`npm run build` is required first: the Worker serves the built client from
`client/dist`, which is gitignored.

---

## Design

Tokens live in `client/src/index.css` and are referenced as Tailwind utilities.

| Token | Value | Use |
| --- | --- | --- |
| `olive` | `#606B45` | Primary actions, header |
| `champagne` | `#C7AD7A` | Accents, rules, eyebrow labels |
| `ivory` / `ivory-deep` | `#F7F4EC` / `#F0EADF` | Page grounds |
| `charcoal` / `charcoal-soft` | `#262821` / `#54564B` | Body text |
| `sand` / `taupe` | `#E5DCCB` / `#6E6A55` | Surfaces, secondary actions |

Type: **Cormorant Garamond** (display) and **Jost** (UI), self-hosted via
`@fontsource-variable`.

The homepage hero (`client/src/components/home/HeroStage.tsx`) is one 640×700 SVG —
a round brilliant falls in and settles, then turns one full revolution. Motion lives
in `index.css` under `.hero-*`, distances are SVG user units so it scales at every
breakpoint, and `prefers-reduced-motion` collapses it to the final frame.

---

## Honesty rules this site follows

The brief asks for a polished storefront without inventing facts. Kept deliberately:

- **Lab-grown only.** Natural stones were removed from the product line; the
  `diamondType` enum offers no other value.
- **Reference catalogue.** No cart, no checkout, no prices — the footer says so,
  and product pages never offer a purchase action.
- **Sample data is labelled.** Every bundled seed diamond carries
  `dataSource: "development-seed"`, and its detail page shows a "Sample data"
  badge. Admin-supplied listings carry `dataSource: "admin"` and no badge.
- **No invented grades.** A grading report is shown only when a real lab, report
  number and URL exist in the data.
- **Placeholder copy is marked.** Policy and story pages state that final copy is
  pending owner approval rather than inventing shipping promises or brand history.
- **Sample imagery is captioned.** Cut illustrations are described as sample
  images of the cut, not photographs of a specific stone.

---

## Enquiries

Every **Inquire Now** control opens a WhatsApp chat with the showroom number and a
message already written — no form to fill in. The number and message format live in
one place:

```ts
// client/src/lib/whatsapp.ts
whatsappInquiryUrl()                                    // general enquiry
whatsappInquiryUrl("Lab-Grown Oval 1.20ct (SKU EVL-OV-120)") // names the stone
```

The diamond detail page passes the stone name and SKU, so the specialist knows which
piece prompted the message before the first reply.

---

## Tests

```bash
npm test
```

- **Server** — domain/query behaviour, catalog response shapes, admin auth, CRUD and media.
- **Client** — page smoke tests (including the enquiry form carrying a diamond
  over from a detail page), UI component tests, money formatting, and the
  WhatsApp link contract.

---

## Further reading

- [`DIAMOND_WEBSITE_AI_AGENT_TASK.md`](DIAMOND_WEBSITE_AI_AGENT_TASK.md) — original brief and constraints.
- [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) — phased plan with status.
