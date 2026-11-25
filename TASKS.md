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
- [ ] **Approval gate: design system + responsive layouts demo** (EN + AR screenshots shown 2026-11-25)

## Phase 2 — Public marketplace UI
- [ ] Homepage (all §6.1 modules)
- [ ] `/cars` `/motorcycles` `/boats` results pages (filters sidebar/drawer, sort, pagination, URL params, no-results/loading/error)
- [ ] Listing detail page (§6.3)
- [ ] Content page layouts (About/FAQ/Terms/Privacy/Contact) — draft copy
- [ ] Isolated, documented mock fixtures only (no fake "real" data)
- [ ] **Approval gate: public UI sign-off**

## Phase 3 — Database & backend
- [ ] Prisma schema per `DATABASE_SCHEMA.md`; migrations from clean DB
- [ ] Service/repository/policies layer per module
- [ ] Listing lifecycle state machine + tests
- [ ] Server-side search/filter/sort/pagination + indexes
- [ ] `API_SPECIFICATION.md` complete
- [ ] Seeds: 7 emirates, cities, categories, fields, makes/models, dev users/listings
- [ ] Vitest coverage for core services
- [ ] **Approval gate: schema + API + listing workflow review**

## Phase 4 — Auth & accounts
- [ ] Register (email or mobile), login, logout, sessions
- [ ] Email verification; password forgot/reset
- [ ] Rate limiting on auth endpoints; no account-existence leakage
- [ ] Individual profile; dealer profile + verification document upload
- [ ] OTP module scaffolded, feature-flag OFF
- [ ] Security tests per playbook §8
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
