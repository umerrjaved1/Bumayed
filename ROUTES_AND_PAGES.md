# ROUTES_AND_PAGES.md — Bumayed

**Status:** Draft v1 — Phase 0 proposal, pending approval.
All user-facing routes are locale-prefixed: `/[locale]/…` where locale ∈
`en | ar`. `ar` renders full RTL. `/` redirects to the preferred/default
locale. API routes are **not** locale-prefixed.

Access legend: 🌐 public · 🔑 authenticated (any role) · 👤 owner-only ·
🛡 admin (SUPER_ADMIN) · 🧭 moderator (per permission) · 🏢 dealer

---

## 1. Public pages

| Route | Page | Access | Notes |
|---|---|---|---|
| `/[locale]` | Homepage | 🌐 | Hero/search, category shortcuts, emirate selector, featured & latest ads, popular makes, dealer promo, banners, how-it-works |
| `/[locale]/cars` | Cars search/results | 🌐 | Filters in URL query params (bookmarkable) |
| `/[locale]/motorcycles` | Motorcycles search/results | 🌐 | Category-specific filters |
| `/[locale]/boats` | Boats search/results | 🌐 | Category-specific filters |
| `/[locale]/listings/[slug]` | Listing detail | 🌐 | Gallery, specs, seller panel, call/WhatsApp, share, report, video, similar listings. Only ACTIVE listings public |
| `/[locale]/dealers` | Dealer directory | 🌐 | Verified dealers only |
| `/[locale]/dealers/[slug]` | Dealer profile + inventory | 🌐 | |
| `/[locale]/about` `/faq` `/terms` `/privacy` `/contact` | Content pages | 🌐 | From ContentPage table; client-approved copy |
| `/[locale]/sitemap.xml` · `/robots.txt` | SEO | 🌐 | Indexable: categories, active listings only |

Filter query params (examples): `?keyword=&make=&model=&emirate=&city=&area=
&priceMin=&priceMax=&yearMin=&yearMax=&mileageMax=&sellerType=&sort=&page=`.
Sort: `newest | priceAsc | priceDesc | mileageAsc | yearDesc`.

---

## 2. Auth pages

| Route | Page | Access |
|---|---|---|
| `/[locale]/auth/register` | Register (email **or** mobile) | 🌐 (guests only) |
| `/[locale]/auth/login` | Login | 🌐 (guests only) |
| `/[locale]/auth/verify-email` | Email verification landing | 🔑 |
| `/[locale]/auth/forgot-password` | Request reset | 🌐 |
| `/[locale]/auth/reset-password` | Reset with token | 🌐 |
| `/[locale]/auth/verify-phone` | OTP entry | 🔑 — **feature-flagged OFF** (owner deferred SMS/OTP) |

---

## 3. Seller dashboard (individual & dealer shared shell)

| Route | Page | Access |
|---|---|---|
| `/[locale]/dashboard` | Overview | 🔑 |
| `/[locale]/dashboard/listings` | My listings (tabs: Active/Pending/Rejected/Expired) | 👤 |
| `/[locale]/dashboard/listings/new` | Create listing wizard (8 steps, §9.1) | 🔑 |
| `/[locale]/dashboard/listings/[id]/edit` | Edit listing | 👤 server-verified |
| `/[locale]/dashboard/favorites` | Favorites | 🔑 |
| `/[locale]/dashboard/notifications` | Notifications | 🔑 |
| `/[locale]/dashboard/settings` | Profile & account settings | 🔑 |
| `/[locale]/dashboard/payments` | Payment history | 🔑 |

Ownership rule: any `[id]` route re-checks `listing.sellerId === session.user.id`
on the server. ID tampering → 404/403, never data leak.

## 4. Dealer area

| Route | Page | Access |
|---|---|---|
| `/[locale]/dealer` | Dealer dashboard (verification status, package, featured slots, stats) | 🏢 verified |
| `/[locale]/dealer/profile` | Business profile & documents | 🏢 |
| `/[locale]/dealer/packages` | Package browse/purchase | 🏢 |
| `/[locale]/dealer/onboarding` | Business details + verification docs | role=DEALER, unverified |

## 5. Admin panel

| Route | Page | Access |
|---|---|---|
| `/[locale]/admin` | Dashboard counts (users, dealers, listings, pending, reports, revenue) | 🛡🧭 |
| `/[locale]/admin/users` | User search/view/verify/edit/suspend/block | 🛡 (suspend/block: 🛡 only) |
| `/[locale]/admin/dealers` | Dealer verification workflow | 🛡🧭(view) |
| `/[locale]/admin/listings` | Review/approve/reject w/ reason/edit/remove/feature | 🛡🧭 |
| `/[locale]/admin/reports` | Report queue & resolution | 🛡🧭 |
| `/[locale]/admin/catalog` | Categories, makes, models, trims, category fields | 🛡 |
| `/[locale]/admin/locations` | Emirates, cities, areas | 🛡 |
| `/[locale]/admin/commercial` | Promotion prices, packages, transactions | 🛡 only |
| `/[locale]/admin/content` | Banners, About/FAQ/Terms/Privacy | 🛡 (🧭 read-only optional) |
| `/[locale]/admin/admins` | Admin users & role management | 🛡 only |
| `/[locale]/admin/audit-log` | AdminActivityLog viewer | 🛡 only |

---

## 6. Permission matrix

| Capability | Visitor | Individual | Dealer | Moderator | Super Admin |
|---|---|---|---|---|---|
| Browse/search/view active listings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register / login / recover | ✅ | — | — | — | — |
| Create/edit own listings | ❌ | ✅ | ✅ | ❌ | ✅ |
| Pause/reactivate/renew/mark-sold own | ❌ | ✅ | ✅ | ❌ | ✅ |
| Favorites | ❌ | ✅ | ✅ | ✅ | ✅ |
| Report a listing | ✅ (w/ contact) | ✅ | ✅ | ✅ | ✅ |
| Buy promotions for own listings | ❌ | ✅ | ✅ | ❌ | ✅ |
| Dealer profile & documents | ❌ | ❌ | ✅ | view | ✅ |
| Buy/manage dealer package | ❌ | ❌ | ✅ | ❌ | ✅ |
| Approve/reject/remove listings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Resolve reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| Suspend/block users | ❌ | ❌ | ❌ | ❌* | ✅ |
| Verify dealers | ❌ | ❌ | ❌ | ❌* | ✅ |
| Manage catalog & locations | ❌ | ❌ | ❌ | ❌ | ✅ |
| Promotion prices, packages, transactions | ❌ | ❌ | ❌ | ❌ | ✅ |
| Content pages & banners | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage admin accounts / roles | ❌ | ❌ | ❌ | ❌ | ✅ |
| View audit log | ❌ | ❌ | ❌ | ❌ | ✅ |

\* Playbook §10.5: moderators must not manage super-admin accounts, payment
credentials or critical settings **unless explicitly granted** — default is ❌.

Enforcement: `middleware.ts` attaches session; every admin/dashboard page
and API handler calls the module `policies.ts` guard. Role values from the
client are never trusted.

---

## 7. API surface (summary — full detail in API_SPECIFICATION.md, Phase 3)

```
Public:     GET  /api/listings  /api/listings/[slug]  /api/catalog/*
            GET  /api/locations/*  /api/dealers  POST /api/reports
Auth:       POST /api/auth/register|login|logout|verify-email|forgot|reset
            POST /api/auth/otp/*            (flagged OFF)
Listings:   POST /api/listings  PATCH/DELETE /api/listings/[id]
            POST /api/listings/[id]/submit|pause|reactivate|renew|sold
            POST /api/uploads/sign  (signed image upload URLs)
Favorites:  GET/POST/DELETE /api/favorites
Commercial: POST /api/promotions/checkout  POST /api/packages/checkout
            POST /api/payments/webhook/[provider]  (signature-verified)
Dealer:     PATCH /api/dealer/profile  POST /api/dealer/documents
Admin:      /api/admin/users|dealers|listings|reports|catalog|locations|
            commercial|content|admins|audit-log  (per matrix above)
System:     GET /api/health
```
