# ARCHITECTURE.md — Bumayed (UAE Motors Marketplace)

**Status:** Draft v1 — Phase 0 proposal, pending project-owner approval.
**Owner:** Umer Javed · **Prepared by:** MZA-Logics
**Reference inspiration:** dubizzle.com (flows only; no branding/assets copied)

---

## 1. System overview

Bumayed is a bilingual (English/Arabic, full RTL), responsive, lead-generation
classifieds marketplace for **Cars, Motorcycles and Boats** in the UAE.
Buyers browse listings and contact sellers directly by phone or WhatsApp.
There is no internal buyer–seller chat and no vehicle checkout.

### Architectural style: Modular Monolith

One Next.js application, one PostgreSQL database, clearly separated internal
modules. No microservices, no Elasticsearch, no separate backend service for
the MVP (per playbook §3). Module boundaries are enforced by folder structure
and by keeping business rules in a service layer.

```
┌────────────────────────────────────────────────────────────┐
│                     Next.js (App Router)                    │
│                                                            │
│  Public UI ── Buyer flows (RSC + minimal client JS)        │
│  Seller/Dealer dashboards ── authenticated UI              │
│  Admin panel ── role-gated UI                              │
│                                                            │
│  app/api/* Route Handlers ── HTTP API surface              │
│  Server Actions ── mutations from internal forms only      │
│                                                            │
│  src/modules/<domain>                                      │
│    ├── service.ts      business rules (single source)      │
│    ├── repository.ts   Prisma data access                  │
│    ├── schemas.ts      Zod input/output validation         │
│    └── policies.ts     authorization checks                │
└───────────────┬───────────────────────┬────────────────────┘
                │                       │
        PostgreSQL (Prisma)      Object storage (R2/S3)
        Managed instance         Listing images, dealer logos,
                                 profile photos (keys in DB)
```

External services: email provider (verification + notifications),
SMS/OTP provider (**deferred by owner decision**), payment gateway
(Telr / Network International / Stripe — **owner to select**, via adapter),
error monitoring (Sentry or equivalent).

---

## 2. Technology stack (approved by playbook §3)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), latest stable | RSC-first; route handlers for API |
| Language | TypeScript, strict mode | `strict: true`, no implicit any |
| UI | Tailwind CSS + shadcn/ui + Lucide | Design system in `DESIGN_SYSTEM.md` |
| i18n | `next-intl` | `en` + `ar`, full RTL, locale-aware formatting |
| Database | PostgreSQL (managed) + Prisma | Migrations from clean DB must work |
| Validation | Zod | Every API input, server action, env var |
| Auth | Auth.js (v5) | Credentials + email verification; OTP provider slot kept but disabled |
| Storage | Cloudflare R2 or S3-compatible | Signed upload URLs; keys in DB, never binaries |
| Payments | Adapter interface → one provider | Telr / NI / Stripe, owner selects |
| Testing | Vitest (unit/service), Playwright (E2E) | Typecheck + ESLint gates |
| Monitoring | Sentry or equivalent | Added before production deploy |

Exact versions are pinned in the lockfile at initialization (Phase 1) and
recorded in `README.md`.

---

## 3. Repository layout (target)

```
bumayed/
├── docs content lives at repo root (per playbook §1):
│   README.md ARCHITECTURE.md DATABASE_SCHEMA.md ROUTES_AND_PAGES.md
│   API_SPECIFICATION.md DESIGN_SYSTEM.md TASKS.md DEVELOPMENT_STATUS.md
│   QA_TEST_PLAN.md .env.example
├── prisma/                  schema.prisma, migrations/, seed/
├── messages/                en.json, ar.json (next-intl dictionaries)
├── public/                  static assets, brand placeholders
├── src/
│   ├── app/
│   │   ├── [locale]/        all user-facing routes (en/ar)
│   │   │   ├── (public)/    homepage, category, listing, content pages
│   │   │   ├── (auth)/      login, register, verify, recover
│   │   │   ├── dashboard/   seller dashboard
│   │   │   ├── dealer/      dealer dashboard
│   │   │   └── admin/       admin panel
│   │   └── api/             route handlers (see API_SPECIFICATION.md)
│   ├── components/          design-system + shared components
│   ├── modules/
│   │   ├── auth/  listings/  catalog/  locations/  favorites/
│   │   ├── notifications/  reports/  promotions/  packages/
│   │   ├── payments/  banners/  content/  admin/  users/
│   ├── lib/                 prisma client, i18n config, storage, email, env
│   └── middleware.ts        locale routing + session attach
├── tests/                   vitest unit + playwright e2e
└── playwright.config.ts / vitest.config.ts
```

---

## 4. Key architectural decisions

| # | Decision | Rationale |
|---|---|---|
| AD-1 | Modular monolith, single Next.js app | Playbook mandate; fastest path to dependable MVP |
| AD-2 | Business rules only in `modules/*/service.ts` | No duplicated logic between UI and API handlers; testable without HTTP |
| AD-3 | Authorization in `modules/*/policies.ts`, enforced server-side on every handler | Never trust role values from the browser (playbook §8) |
| AD-4 | All user input validated with Zod at the boundary | Fail fast, typed errors, consistent API errors |
| AD-5 | Server-side filtering/pagination with DB indexes | Playbook §7.3: never fetch-all-then-filter in browser |
| AD-6 | Listing state machine enforced in the service layer | Users cannot change moderation-controlled states (§7.2) |
| AD-7 | Payment provider behind `PaymentProvider` interface | Swap Telr/NI/Stripe without touching business logic (§3 Payments) |
| AD-8 | Paid entitlements activated only from verified provider webhooks (idempotent) | Never trust browser redirects (§11 critical rule) |
| AD-9 | Images uploaded via short-lived signed URLs directly to object storage; server validates real file content | No arbitrary uploads; no binaries in PostgreSQL (§9.3) |
| AD-10 | Locale segment `[locale]` for every page; `dir` set on `<html>` | Genuine RTL, correct language alternates for SEO |
| AD-11 | OTP module scaffolded but feature-flagged OFF | Owner decision: "SMS and OTP integration: leave it for now" |
| AD-12 | Commercial values (promotion prices, package quotas, VAT) in DB/config, never hardcoded | Owner has not finalized prices (§4 open questions) |
| AD-13 | Redis omitted at MVP | Only added later if rate limiting/caching/jobs justify it (§3) |

---

## 5. Module map

| Module | Responsibility | Key rules |
|---|---|---|
| `auth` | Registration (email **or** mobile — neither mandatory per owner), login, email verification, password reset, sessions | Modern password hashing; no account-existence leakage; rate limits; OTP flag off |
| `users` | Individual profiles, account settings | Owner-editable only |
| `catalog` | Categories, makes, models, trims, category fields & options | Admin-configurable fields where practical (§9.2) |
| `locations` | Emirates (7 seeded), cities, areas | Granularity default: emirate + city (+area where data supplied) |
| `listings` | Listing CRUD, wizard, lifecycle, search/filter/sort, gallery, video URL validation | State machine; ownership enforcement; server-side search |
| `favorites` | Save/unsave listings | Authenticated only |
| `promotions` | Featured / Premium / Urgent | Prices & durations from DB config |
| `packages` | Dealer packages, quotas, entitlements | Quotas enforced server-side |
| `payments` | Initiation, webhook verification, idempotency, transaction history | AD-7, AD-8 |
| `notifications` | Email + in-app events, preferences, dedup | SMS optional/deferred |
| `reports` | Listing reports, moderation resolution | Audit-logged |
| `banners`, `content` | Homepage banners; About/FAQ/Terms/Privacy/Contact | Client-approved copy; sanitized rich text |
| `admin` | Dashboards, moderation, catalog/location/commercial/content management, audit log | Permission matrix in `ROUTES_AND_PAGES.md` |

---

## 6. Cross-cutting concerns

- **Error handling:** typed `AppError` with codes; API returns `{ error: { code, message } }`; UI shows localized messages.
- **Audit logging:** sensitive admin/seller actions recorded (actor, action, target, timestamp, safe before/after metadata). Never log passwords, OTPs, payment secrets.
- **Rate limiting:** login, registration, OTP (when enabled), password reset, report creation. Start with in-DB/in-memory limiter; Redis only if needed.
- **Environment:** `.env.example` documents every variable; Zod-validated at boot.
- **Seed data:** 7 emirates, categories, makes/models, field options, dev-only sample users/listings (clearly marked, never production passwords).

---

## 7. Effort estimate by module (single senior engineer, aggressive MVP)

| Module / phase | Estimate (working days) |
|---|---|
| Phase 1 — Foundation, i18n/RTL, design system, shared components | 2.0 |
| Phase 2 — Public UI (home, category/search, listing detail, content pages) | 2.5 |
| Phase 3 — DB schema, migrations, seeds, search backend, core APIs | 2.5 |
| Phase 4 — Auth + account types (email verification; OTP scaffolded, off) | 1.5 |
| Phase 5 — Listing wizard, uploads, seller dashboard | 2.5 |
| Phase 6 — Dealer dashboard + admin panel + audit | 2.5 |
| Phase 7 — Promotions, packages, payment adapter + webhook tests | 2.0 |
| Phase 8 — Notifications, reports/moderation, content mgmt | 1.5 |
| Phase 9 — SEO, accessibility, performance pass | 1.0 |
| Phase 10 — Comprehensive QA (functional, RTL, security, responsive) | 2.0 |
| Phase 11 — Deployment + handover | 1.0 |
| **Total realistic engineering effort** | **~21 working days** |

External dependencies (payment merchant approval, SMS provider, hosting,
translations, catalog data) are outside engineering control and tracked in
the `REQUIREMENTS_ANALYSIS.md` risk register.

---

## 8. Deferred / explicitly out of scope (per playbook §2)

Native mobile apps · buyer–seller chat · vehicle checkout/escrow · financing,
insurance, inspection services · hosting uploaded video files · multiple
simultaneous payment gateways · non-motors categories.
