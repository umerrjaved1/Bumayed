# REQUIREMENTS_ANALYSIS.md — Bumayed · Phase 0 analysis

**Status:** Draft v1, pending owner approval.
Contains: traceability matrix · owner decisions locked · open questions with
proposed defaults · risk register.

---

## 1. Requirements traceability matrix

| ID | Requirement (playbook ref) | Module | Phase | Doc section |
|---|---|---|---|---|
| R-01 | Bilingual EN/AR, full RTL, next-intl (§2, §3) | i18n | 1 | ARCH §4 AD-10 |
| R-02 | Categories: Cars, Motorcycles, Boats (§2) | catalog | 3 | DB §3 |
| R-03 | AED currency, UAE locations (§1) | locations | 3 | DB §4 |
| R-04 | Roles: Visitor/Individual/Dealer/Moderator/Super Admin (§2) | auth, admin | 4, 6 | ROUTES §6 |
| R-05 | Homepage modules (§6.1) | public UI | 2 | ROUTES §1 |
| R-06 | Category pages: search, filters, sort, pagination, URL params (§6.2) | listings | 2, 3 | ROUTES §1 |
| R-07 | Listing detail: gallery, specs, contact, share, report, video, similar (§6.3) | listings | 2, 3 | ROUTES §1 |
| R-08 | Registration email **or** mobile, neither mandatory (§4 owner) | auth | 4 | DB §2 |
| R-09 | Email verification, password recovery (§8) | auth | 4 | — |
| R-10 | Mobile OTP | auth | — | **DEFERRED (owner)** — scaffolded, flag OFF |
| R-11 | Individual & dealer profiles (§8) | users | 4, 6 | DB §2 |
| R-12 | Dealer verification workflow + documents (§8, §10.3) | admin | 6 | DB §2 — doc list TBC |
| R-13 | Create/edit listing wizard, drafts, moderation submit (§9.1) | listings | 5 | ROUTES §3 |
| R-14 | Category-specific vehicle fields, admin-configurable (§9.2) | catalog | 3, 6 | DB §3 CategoryField |
| R-15 | Images: no fixed limit, auto-resize/optimize, keep aspect (§4 owner, §9.3) | listings, storage | 5 | DB §5 |
| R-16 | One social video URL: IG/YT/TikTok embed or fallback link (§4 owner, §9.4) | listings | 5 | DB §5 |
| R-17 | No listing limits for individuals or dealers (§4 owner) | listings, packages | 5, 7 | Package quota nullable |
| R-18 | Favorites (§2) | favorites | 5 | DB §5 |
| R-19 | Seller dashboard incl. statuses & actions (§9.5) | dashboard | 5 | ROUTES §3 |
| R-20 | Featured/Premium/Urgent promotions (§11) | promotions | 7 | DB §7 |
| R-21 | Dealer packages, quotas server-side (§10.1, §11) | packages | 7 | DB §7 |
| R-22 | One payment gateway via adapter, webhook-verified (§3, §11) | payments | 7 | ARCH §4 AD-7/8 |
| R-23 | Admin panel: users/listings/catalog/locations/commercial/content/admins (§10.3) | admin | 6 | ROUTES §5 |
| R-24 | Audit log (§10.4) | admin | 6 | DB §9 |
| R-25 | Notifications: email + in-app, dedup (§12) | notifications | 8 | DB §8 |
| R-26 | Reports & moderation workflow (§12) | reports | 8 | DB §8 |
| R-27 | Content pages + banners, sanitized (§6.4, §12) | content | 2, 8 | DB §8 |
| R-28 | SEO: metadata, sitemap, hreflang, slugs (§13) | public UI | 9 | ROUTES §1 |
| R-29 | Accessibility (§13) | design system | 9 | DESIGN_SYSTEM (Phase 1) |
| R-30 | Performance: server-side search, indexes, image optimization (§7.3, §13) | listings | 3, 9 | DB §5 indexes |
| R-31 | QA matrix incl. RTL & security tests (§14) | QA | 10 | QA_TEST_PLAN (Phase 1 stub) |
| R-32 | Deployment & handover (§15) | ops | 11 | README (Phase 11) |

---

## 2. Owner decisions already locked (from playbook §4)

| Decision | Value |
|---|---|
| Brand name | **Bumayed** |
| Logo | Supplied by owner |
| Domain / hosting / DB accounts | Later — develop locally |
| SMS & OTP | **Deferred** ("leave it for now") |
| Registration | Email **or** mobile; neither mandatory |
| Listing limits | **None** for individuals or dealers |
| Image limits | No fixed count; auto-resize & optimize, preserve quality/aspect |
| Social video | Flexible embed IG/YouTube/TikTok; external-link fallback |

---

## 3. Open questions — proposed defaults (owner may override)

| # | Question | Proposed default |
|---|---|---|
| Q-1 | Payment gateway (Telr / NI / Stripe) + merchant status | **Stripe** if merchant eligibility allows (best sandbox/docs); adapter keeps swap cheap. **Blocker for Phase 7 until chosen.** |
| Q-2 | Featured/Premium/Urgent prices & durations | Config rows seeded as DRAFT placeholders (e.g. AED 49/99/29 · 7/15/3 days) — owner confirms |
| Q-3 | Dealer package prices, quotas, validity | 3 draft packages (Basic/Growth/Pro), unlimited listings (owner rule), differing featured slots — owner confirms |
| Q-4 | VAT / invoices | Show VAT-inclusive AED prices; generate simple PDF receipt only if required — owner confirms FTA invoicing needs |
| Q-5 | Arabic translations & approval | Professional translation of `messages/ar.json`, owner reviews before launch |
| Q-6 | Privacy/Terms/moderation policies | Clearly-marked DRAFT legal copy; owner supplies/approves final text before launch (release blocker) |
| Q-7 | Location granularity | Emirate + city required, area optional (schema supports all three) |
| Q-8 | Make/model/trim data source | Curated open dataset for top ~40 UAE makes seeded in Phase 3; admin-editable; owner supplies full catalog if available |
| Q-9 | Email provider | Resend or SES — pick at Phase 1 based on cost; needed for verification emails |
| Q-10 | Image count soft cap | Env-configurable cap (default 30/listing) to prevent abuse while honoring "no fixed limit" |

---

## 4. Risk register

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RK-1 | Payment merchant approval/credentials delayed (Telr/NI especially) | High | Medium | Adapter + mocked provider for dev; Phase 7 gates on real sandbox |
| RK-2 | OTP later retrofitted after launch flows built | Medium | Medium | OTP schema + service scaffolded behind flag; flows designed OTP-ready |
| RK-3 | Arabic RTL defects found late | High | Medium | RTL tested from Phase 1 acceptance; bilingual QA matrix in Phase 10 |
| RK-4 | Legal copy (terms/privacy/policies) not supplied | High (launch blocker) | Medium | Draft placeholders; listed as release blocker |
| RK-5 | Vehicle catalog data incomplete/inconsistent | Medium | Medium | Import-friendly schema; admin catalog UI; top-makes seed |
| RK-6 | Payment webhook forgery/replay | Critical | Low (if done right) | Signature verification + idempotency + Transaction dedup (§11) |
| RK-7 | Image upload abuse (oversized/non-image) | Medium | Medium | Server-side content validation, signed URLs, soft cap |
| RK-8 | Scope creep (chat, checkout, more categories requested) | Medium | Medium | Out-of-scope list in playbook §2; changes recorded in TASKS.md w/ approval |
| RK-9 | Translation quality/approval bottleneck | Medium | Medium | Early dictionary extraction (Phase 1), owner review loop |
| RK-10 | Hosting/domain/DB decisions deferred too long | Medium | Medium | Flag at Phase 9; local + preview deploys until then |
| RK-11 | Single gateway requirement later changes to multiple | Low | Low | Payment adapter already isolates provider |

---

## 5. Phase 0 conclusion

Repository is empty (greenfield, `.gitignore` + this playbook only; remote
`github.com/umerrjaved1/Bumayed.git`). Architecture, schema, routes,
permissions, defaults and risks are proposed in the companion documents.
**Approval gate: owner sign-off required on ARCHITECTURE.md,
DATABASE_SCHEMA.md and ROUTES_AND_PAGES.md before Phase 1 begins.**
✅ **Approved by owner on 2026-11-25.**
