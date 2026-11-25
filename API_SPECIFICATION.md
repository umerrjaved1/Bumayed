# API_SPECIFICATION.md — Bumayed

**Status:** Phase 3 draft (core listing read APIs). Auth/seller/admin endpoints land in Phases 4–6.
Error shape: `{ "error": { "code": string, "message": string } }`.

---

## System

### `GET /api/health`
- Auth: none
- Response `200`: `{ status: "ok", service: "bumayed", timestamp: ISO }`

---

## Listings (public)

### `GET /api/listings`
Server-side search, filter, sort, pagination (playbook §7.3).

| Query | Type | Notes |
|---|---|---|
| `category` | `cars\|motorcycles\|boats` | Required (defaults `cars` if omitted → still validated) |
| `keyword` | string | Title/description/make/model contains (case-insensitive) |
| `make` | string | Exact make name (case-insensitive) |
| `priceMin` / `priceMax` | int AED | Inclusive |
| `yearMin` / `yearMax` | int | Inclusive |
| `mileageMax` | int | |
| `emirate` | `AUH\|DXB\|…` | Emirate code |
| `condition` | `new\|used` | Specs JSON |
| `sellerType` | `individual\|dealer` | Seller role |
| `transmission` | `automatic\|manual` | Cars |
| `fuelType` | `petrol\|diesel\|hybrid\|electric` | Cars |
| `regionalSpec` | `gcc\|american\|european\|japanese` | Cars |
| `motoType` | string | Motorcycles |
| `boatType` | string | Boats |
| `sort` | `newest\|priceAsc\|priceDesc\|mileageAsc\|yearDesc` | Default `newest` |
| `page` | int ≥ 1 | Default `1`; page size **9** |

- Auth: none (ACTIVE listings only)
- Response `200`:
```json
{
  "items": [ /* ListingPublicDto[] */ ],
  "total": 12,
  "page": 1,
  "totalPages": 2,
  "pageSize": 9
}
```
- Errors: `400 INVALID_CATEGORY` · `500 INTERNAL`

### `GET /api/listings/[slug]`
- Auth: none (ACTIVE only)
- Response `200`: `{ "listing": ListingPublicDto }`
- Errors: `404 NOT_FOUND` · `500 INTERNAL`

### ListingPublicDto (summary)
`id` (= slug for public URLs), `slug`, `category`, `title`, `priceAed`, `year`,
`mileageKm`, `make`, `model`, `trim?`, `emirate`, `city`, `condition`,
`description`, `photoCount`, `videoUrl?`, `featured?`, `urgent?`, `premium?`,
`createdAt`, category-specific specs, `seller { name, type, since, verified, phone, whatsapp, dealerName? }`.

---

## Auth (Phase 4)

Auth.js handlers also serve `GET/POST /api/auth/*` (CSRF, session, callback).
Custom JSON APIs below use the auth module services. Rate-limited by IP.

### `POST /api/auth/register`
Body: `{ displayName, accountType: individual|dealer, email?, phone?, password, businessName? }`  
Rules: email **or** phone required (neither mandatory alone). Dealer requires `businessName`.  
Response `200`: `{ ok: true, message }` (duplicate identifiers also return generic ok — no enumeration).  
Errors: `400 VALIDATION` · `429 RATE_LIMITED`

### `POST /api/auth/login`
Body: `{ identifier, password }` (identifier = email or E.164 phone)  
Response `200`: `{ ok: true }` (+ session cookie)  
Errors: `401 INVALID_CREDENTIALS|EMAIL_NOT_VERIFIED|ACCOUNT_DISABLED` · `429 RATE_LIMITED`

### `POST /api/auth/logout`
Response `200`: `{ ok: true }` (clears session)

### `POST /api/auth/forgot-password`
Body: `{ email }` → always generic success message (no enumeration). Sends reset email when account exists.

### `POST /api/auth/reset-password`
Body: `{ email, token, password }` → `200 { ok: true }` or `400 INVALID_TOKEN`

### `POST /api/auth/verify-email`
Body: `{ email, token }` → activates email accounts. Also available via `/[locale]/auth/verify-email?email&token`.

OTP: scaffolded (`FEATURE_OTP_ENABLED=false`). Do not expose OTP endpoints until enabled.

---

## Planned (later phases)

| Area | Phase | Endpoints (sketch) |
|---|---|---|
| Auth | 4 | ✅ implemented above |
| Seller listings | 5 | `POST/PATCH/DELETE /api/listings`, status actions, signed uploads |
| Favorites | 5 | `GET/POST/DELETE /api/favorites` |
| Reports | 8 | `POST /api/reports` |
| Dealer | 6 | `PATCH /api/dealer/profile`, documents |
| Admin | 6 | `/api/admin/*` with permission matrix |
| Payments | 7 | checkout + `POST /api/payments/webhook/[provider]` (signature-verified, idempotent) |

Business rules live in `src/modules/*/service.ts` — handlers stay thin.
