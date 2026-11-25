# TASKS.md — Bumayed implementation checklist

Legend: `[ ]` pending · `[~]` in progress · `[x]` done (tested) · `⛔` blocked
Scope changes must be recorded here and approved before implementation.

---

## Phase 0 — Analysis ✅ approved 2026-11-25
- [x] Repository inspection (empty greenfield, remote: github.com/umerrjaved1/Bumayed.git)
- [x] Requirements traceability matrix → `REQUIREMENTS_ANALYSIS.md` §1
- [x] Architecture proposal → `ARCHITECTURE.md`
- [x] Database design proposal → `DATABASE_SCHEMA.md`
- [x] Routes & permission matrix → `ROUTES_AND_PAGES.md`
- [x] Open questions + risk register → `REQUIREMENTS_ANALYSIS.md` §3–4
- [x] **Owner approval of Phase 0 deliverables** (2026-11-25)

## Phase 1 — Foundation & design system ⛔ awaiting owner approval
- [x] Next.js 16.4.6 init (App Router, TS strict, Tailwind 4, shadcn/ui on Base UI, Lucide); versions pinned in README
- [x] ESLint + Prettier + typecheck scripts; env validation (Zod, `src/lib/env.ts`); `.env.example`
- [x] `GET /api/health` — verified 200 locally
- [x] next-intl en/ar; `[locale]` routing; RTL `<html dir>`; locale-aware AED/number formatting
- [x] Localized error + not-found pages; app shell (sticky header, footer, mobile drawer nav)
- [x] `DESIGN_SYSTEM.md`: colors, EN/AR typography (Inter + Noto Sans Arabic), spacing, radii, elevation, breakpoints, RTL rules
- [x] Shared components: header/footer, nav, language switcher, search bar, category cards, listing card, price display; shadcn primitives (buttons, inputs, select, dialog, sheet, skeleton, table, tabs, badges, pagination, toasts, tooltip, alert) for the rest
- [x] **Approval gate: design system + responsive layouts demo** (approved 2026-11-25)

## Phase 2 — Public marketplace UI ✅ approved 2026-11-25
- [x] Homepage (all §6.1 modules: hero/search, categories, emirate selector, featured, latest, popular makes, dealer promo, how-it-works, footer)
- [x] `/cars` `/motorcycles` `/boats` results pages (sidebar filters desktop / drawer mobile, sort, pagination, URL params, no-results + loading skeletons; verified: gcc+price+sort query → correct 2 results)
- [x] Listing detail page (§6.3: gallery placeholders, specs, description, seller panel w/ verification, tel:/wa.me links, share, report dialog (honest Phase-8 placeholder), YouTube/IG/TikTok video logic, similar listings)
- [x] Content pages (About/FAQ/Terms/Privacy/Contact) — clearly marked draft copy
- [x] Isolated, documented mock fixtures only (`src/lib/mock/`, marked for Phase 3 replacement)
- [x] Fixed en route: Base UI select labels, nativeButton warnings, year grouping, SSR empty-value i18n crash
- [x] **Approval gate: public UI sign-off** (approved 2026-11-25)

## Phase 3 — Database & backend ✅ approved 2026-11-25
- [x] Prisma 7 schema per `DATABASE_SCHEMA.md`; migration `20261125124501_init` from clean DB
- [x] Listings module: service / repository / policies / mappers
- [x] Listing lifecycle state machine + Vitest
- [x] Server-side search/filter/sort/pagination + indexes (Prisma where + orderBy)
- [x] `API_SPECIFICATION.md` (public listing read APIs; later phases sketched)
- [x] Seeds: 7 emirates, cities, categories, fields, makes/models, DEV users/listings
- [x] Vitest: lifecycle + query parse (8 tests)
- [x] Public UI wired to PostgreSQL (mock fixtures deprecated)
- [x] **Approval gate: schema + API + listing workflow review** (approved 2026-11-25)

## Phase 4 — Auth & accounts ⛔ awaiting owner approval
- [x] Register (email or mobile), login, logout, JWT sessions (Auth.js)
- [x] Email verification; password forgot/reset (hashed tokens)
- [x] Rate limiting on auth endpoints; no account-existence leakage
- [x] Individual profile on register; dealer profile created (UNVERIFIED) — document upload Phase 6
- [x] OTP module scaffolded, feature-flag OFF
- [x] Password + schema Vitest; smoke login/register
- [ ] **Approval gate: auth workflows**

## Phase 5 — Listings & seller dashboard
- [ ] 8-step create wizard (validation, drafts, back/next)
- [ ] Signed-URL image upload → R2/S3; content validation; resize/optimize; reorder/remove; orphan cleanup
- [ ] Social video URL validation + embed/fallback
- [ ] Seller dashboard: lists by status, edit/delete/pause/reactivate/renew/sold
- [ ] Favorites UI + API
- [ ] E2E: create→upload→submit→moderate→edit→pause→renew→sold
- [ ] **Approval gate: seller journey**

## Phase 6 — Dealer & admin
- [ ] Dealer dashboard (verification, package, slots, stats)
- [ ] Admin dashboard counts
- [ ] Users / dealers / listings / reports admin modules
- [ ] Catalog, locations, commercial, content admin modules
- [ ] Admin roles (Super Admin / Moderator) + audit log
- [ ] Permission tests: authorized + unauthorized for every capability
- [ ] **Approval gate: admin & dealer workflows**

## Phase 7 — Promotions, packages, payments
- [ ] Promotion config (DB-driven prices/durations)
- [ ] Dealer packages + server-side quota enforcement
- [ ] Payment adapter + selected provider integration
- [ ] Signature-verified webhook, idempotency, transaction history
- [ ] Tests: success/fail/cancel/duplicate/delayed webhook
- [ ] **Approval gate: sandbox payment flow (client)**

## Phase 8 — Notifications, content, moderation
- [ ] Notification events + email & in-app delivery + preferences + dedup
- [ ] Report workflow + resolution + user notification
- [ ] Banners & content pages admin with sanitization

## Phase 9 — SEO / a11y / performance
- [ ] Metadata, canonical, OG, sitemap, robots, hreflang, slugs
- [ ] Accessibility pass (keyboard, focus, labels, contrast, alt text)
- [ ] Performance pass (image opt, lazy load, indexes, N+1 audit, measured)

## Phase 10 — Comprehensive QA
- [ ] Functional matrix (playbook §14)
- [ ] Localization: EN LTR / AR RTL, numerals, dates, AED formatting
- [ ] Security matrix (§14)
- [ ] Responsive matrix (5 widths)
- [ ] Release-blocker checklist cleared

## Phase 11 — Deployment & handover
- [ ] Prod env vars, managed PostgreSQL, R2/S3, domain/DNS, email provider
- [ ] Migrations + approved reference seeds; secure initial super-admin
- [ ] Monitoring, backups, smoke tests
- [ ] Handover package (no live credentials)

---

### Scope-change log
| Date | Request | Decision | Approved by |
|---|---|---|---|
| — | — | — | — |
