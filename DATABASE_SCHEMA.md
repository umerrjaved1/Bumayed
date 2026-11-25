# DATABASE_SCHEMA.md — Bumayed

**Status:** Draft v1 — Phase 0 proposal, pending approval.
PostgreSQL via Prisma. All tables have `createdAt`/`updatedAt` unless noted.
Naming: Prisma models PascalCase; mapped tables snake_case.

---

## 1. Enums

```prisma
enum Role            { INDIVIDUAL DEALER MODERATOR SUPER_ADMIN }
enum UserStatus      { ACTIVE SUSPENDED BLOCKED PENDING_VERIFICATION }
enum ListingStatus   { DRAFT PENDING ACTIVE REJECTED PAUSED SOLD EXPIRED REMOVED }
enum VehicleCategory { CARS MOTORCYCLES BOATS }        // seeded rows in Category table
enum RegionalSpec    { GCC AMERICAN EUROPEAN JAPANESE } // cars
enum Transmission    { MANUAL AUTOMATIC }
enum FuelType        { PETROL DIESEL HYBRID ELECTRIC }
enum Condition       { NEW USED }
enum DealerVerificationStatus { UNVERIFIED PENDING APPROVED REJECTED }
enum PromotionType   { FEATURED PREMIUM URGENT }
enum PromotionStatus { ACTIVE EXPIRED CANCELLED }
enum PaymentStatus   { INITIATED PENDING SUCCEEDED FAILED CANCELLED REFUNDED }
enum NotificationChannel { EMAIL IN_APP }
enum ReportStatus    { OPEN UNDER_REVIEW RESOLVED DISMISSED }
enum VideoProvider   { YOUTUBE INSTAGRAM TIKTOK }
```

---

## 2. Identity & accounts

### User
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | citext? unique | nullable — owner rule: email **or** mobile, neither mandatory |
| phone | varchar(20)? unique | E.164 UAE (+971…), nullable |
| passwordHash | text? | nullable only if OTP/passwordless is ever enabled |
| role | Role | default INDIVIDUAL |
| status | UserStatus | default PENDING_VERIFICATION |
| emailVerifiedAt | timestamptz? | |
| phoneVerifiedAt | timestamptz? | OTP deferred; column kept |
| lastLoginAt | timestamptz? | |

Indexes: `email`, `phone`, `(role, status)`.

### UserProfile — 1:1 User
`displayName`, `photoKey` (object-storage key), `emirateId FK`, `cityId FK?`,
`whatsappNumber?`, `showPhone bool = true`, `preferredLocale`.

### DealerProfile — 1:1 User (role = DEALER)
`businessName`, `slug unique`, `logoKey`, `businessPhone`, `businessEmail`,
`whatsappNumber`, `emirateId/cityId/address`, `description`, `workingHours`,
`verificationStatus DealerVerificationStatus = UNVERIFIED`,
`verifiedAt`, `verificationNote`.

### VerificationDocument — N:1 DealerProfile
`documentType` (trade license, Emirates ID, …), `fileKey`, `status`,
`reviewedById FK User?`, `reviewedAt`, `note`. *(Document list & approval
process is an open client question — structure kept generic.)*

### Session / Account / VerificationToken
Auth.js standard tables. `VerificationToken` reused for email verification
and password reset (hashed token, expiry, single-use).

### OtpCode (scaffolded, feature-flagged OFF)
`userId?/phone`, `codeHash` (never plaintext), `expiresAt`, `attempts`,
`resendCount`, `consumedAt`. Enforces expiry + attempt/resend limits.

---

## 3. Catalog

### Category
`id`, `code VehicleCategory unique` (CARS/MOTORCYCLES/BOATS), `nameEn`,
`nameAr`, `slug`, `icon`, `sortOrder`, `isActive`.

### CategoryField — configurable per-category attributes (§9.2)
`categoryId FK`, `key` (`mileage`, `engineCapacityCc`, `boatLengthFt`, …),
`labelEn`, `labelAr`, `fieldType` (SELECT/NUMBER/BOOLEAN/TEXT),
`optionsJson` (validated option list for SELECT), `isFilterable`,
`isRequired`, `sortOrder`. Unique `(categoryId, key)`.
Seed cars: regionalSpec, bodyType, transmission, fuelType, colour, condition,
warranty · motorcycles: engineCapacityCc, motorcycleType, condition ·
boats: boatType, length, engineHours, engineType, condition.

### VehicleMake
`id`, `categoryId FK`, `nameEn`, `nameAr?`, `slug`, `isActive`.
Unique `(categoryId, slug)`. Index `(categoryId, isActive)`.

### VehicleModel
`makeId FK`, `nameEn`, `nameAr?`, `slug`. Unique `(makeId, slug)`.

### VehicleTrim
`modelId FK`, `nameEn`, `nameAr?`. Unique `(modelId, nameEn)`.

> Source of UAE make/model/trim data is an open client question; schema is
> import-friendly (CSV/JSON seed scripts).

---

## 4. Locations

### Emirate — 7 seeded rows
`code unique` (AUH, DXB, SHJ, AJM, UAQ, RAK, FUJ), `nameEn`, `nameAr`.

### City — `emirateId FK`, `nameEn`, `nameAr`. Unique `(emirateId, nameEn)`.
### Area — `cityId FK`, `nameEn`, `nameAr`. Unique `(cityId, nameEn)`.

Default granularity: **emirate + city required, area optional** (open
question; data-driven so it can change without migration).

---

## 5. Listings

### Listing
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| sellerId | FK User | ownership enforced server-side |
| categoryId | FK Category | |
| status | ListingStatus | default DRAFT; transitions per §8 below |
| title | varchar(120) | |
| slug | unique | seo slug: `{title}-{shortid}` |
| description | text | sanitized |
| priceAed | int | AED, no decimals; > 0 |
| negotiable | bool | |
| makeId / modelId / trimId | FK? | per category rules |
| year | int? | |
| mileageKm | int? | cars/motorcycles |
| emirateId / cityId / areaId | FK / FK / FK? | |
| specs | jsonb | values keyed by CategoryField.key; Zod-validated per category; **not** a dump of all vehicle data |
| videoProvider / videoUrl | enum? / text? | one social video per listing (§9.4) |
| contactPhone / contactWhatsapp | varchar? | snapshot of seller-chosen contact |
| isFeatured / isUrgent / isPremium | derived, not stored | derived from active FeaturedPromotion rows |
| viewsCount | int | async increment |
| submittedAt / approvedAt / rejectedAt | timestamptz? | |
| rejectionReason | text? | shown to seller |
| expiresAt | timestamptz? | drives EXPIRED transition |
| soldAt / removedAt | timestamptz? | |

Indexes: `(status, categoryId, createdAt desc)` · `(categoryId, makeId,
modelId)` · `(emirateId, cityId)` · `(priceAed)` · `(year)` ·
`(sellerId, status)` · full-text GIN on `title + description` (en; ar later
if needed). Composite indexes tuned after seed-volume testing.

### ListingImage
`listingId FK`, `objectKey`, `thumbKey`, `width`, `height`, `sizeBytes`,
`mime`, `sortOrder`, `isPrimary`. Index `(listingId, sortOrder)`.
Owner rule: no fixed count limit; server auto-resizes/optimizes preserving
aspect ratio; count cap configurable via env (default generous, e.g. 30).

### ListingVideo — 1:1 Listing
`provider VideoProvider`, `originalUrl`, `embedUrl?` (null → render external
"Watch on" link), validated host allowlist.

### Favorite — `(userId, listingId)` unique pair. Index `(listingId)`.

---

## 6. Listing lifecycle (state machine)

```
DRAFT ──submit──▶ PENDING ──approve──▶ ACTIVE ──pause──▶ PAUSED ──reactivate──▶ ACTIVE
                     │                   │  │                │
                     └─reject─▶ REJECTED │  └─mark sold──▶ SOLD
   ACTIVE ──expiry job──▶ EXPIRED ──renew──▶ ACTIVE
   any state ──admin/user remove──▶ REMOVED (soft delete)
```

Rules: users may only move DRAFT→PENDING, ACTIVE↔PAUSED, ACTIVE→SOLD,
EXPIRED→ACTIVE (renew). PENDING→ACTIVE/REJECTED and any →REMOVED are
moderator/admin-only. Enforced in `listings/service.ts`, never by the client.

---

## 7. Commercial

### PromotionPrice (config, not hardcoded)
`type PromotionType`, `priceAed int`, `durationDays int`, `isActive`.
Seed with placeholder values flagged **DRAFT — client to confirm**.

### FeaturedPromotion
`listingId FK`, `type`, `status`, `startsAt`, `endsAt`, `paymentId FK?`.
Index `(status, endsAt)` for expiry job.

### Package (dealer packages)
`name`, `nameAr?`, `priceAed`, `validityDays`, `monthlyListingQuota int?`
(null = unlimited — current owner rule is no limits), `featuredSlots int`,
`isActive`, `sortOrder`.

### Subscription (dealer entitlement)
`dealerId FK User`, `packageId FK`, `startsAt`, `endsAt`, `status`,
`listingsUsedThisPeriod int`, `featuredSlotsUsed int`, `paymentId FK?`.
Quota enforcement server-side in `packages/service.ts`.

### Payment
`userId FK`, `purpose` (PROMOTION | PACKAGE), `promotionId?/subscriptionId?`,
`amountAed`, `currency = 'AED'`, `provider` (telr|ni|stripe),
`providerRef unique?`, `status`, `idempotencyKey unique`, `metadata jsonb`
(safe fields only). **Never stores card data.**

### Transaction
append-only provider events: `paymentId FK`, `providerEventId unique`
(idempotent webhook processing), `eventType`, `payload jsonb`, `processedAt`.

---

## 8. Notifications, reports, content

### Notification
`userId FK`, `channel`, `type` (LISTING_SUBMITTED / APPROVED / REJECTED /
EXPIRY_SOON / EXPIRED / PAYMENT_RESULT / PACKAGE_EXPIRY), `titleEn/Ar`,
`bodyEn/Ar`, `data jsonb?`, `readAt`, `dedupKey unique?` (prevents duplicate
sends on retried events). Index `(userId, readAt)`.

### NotificationPreference — 1:1 User
per-type channel toggles (jsonb or columns; default all on).

### Report
`listingId FK`, `reporterId FK User?` (nullable → guest reports w/ contact),
`reason`, `details`, `status`, `resolvedById FK?`, `resolution`, timestamps.

### Banner
`titleEn/Ar`, `imageKey`, `linkUrl`, `position` (home hero/sidebar…),
`sortOrder`, `isActive`, `startsAt/endsAt?`. Image dimensions validated.

### ContentPage
`slug unique` (about, faq, terms, privacy, contact), `titleEn/Ar`,
`bodyEn/Ar` (sanitized rich text), `status` (DRAFT until client-approved),
`publishedAt`.

---

## 9. Administration

### AdminActivityLog (audit)
`actorId FK User`, `action` (string enum), `targetType`, `targetId`,
`metadata jsonb` (safe before/after only), `ip`, `createdAt`.
Index `(actorId, createdAt)`, `(targetType, targetId)`.
Never logs passwords, OTPs, payment secrets, unnecessary PII.

---

## 10. ER overview

```
User 1─1 UserProfile          User 1─1 DealerProfile 1─N VerificationDocument
User 1─N Listing 1─N ListingImage
              │    1─1 ListingVideo
              │    N─ Favorite ─N User
              │    N─ Report
              │    N─ FeaturedPromotion ─1 Payment
Category 1─N CategoryField / VehicleMake 1─N VehicleModel 1─N VehicleTrim
Emirate 1─N City 1─N Area
Package 1─N Subscription N─1 User(dealer) ; Subscription 1─1 Payment
Payment 1─N Transaction
Notification N─1 User ; NotificationPreference 1─1 User
AdminActivityLog N─1 User(actor)
```

---

## 11. Notes & open items

- All money stored as integer AED fils-free values (AED has no decimal display
  requirement in scope; VAT handling is an open client question).
- `specs` jsonb is validated by the per-category Zod schema generated from
  CategoryField rows — flexible but never unstructured.
- Soft deletion: `REMOVED` listing status; images cleaned by orphan-cleanup
  job (defined in Phase 5).
- Open client decisions affecting schema defaults: VAT/invoice fields,
  dealer document types, location granularity, catalog data source.
