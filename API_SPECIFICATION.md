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

## Planned (later phases)

| Area | Phase | Endpoints (sketch) |
|---|---|---|
| Auth | 4 | `POST /api/auth/register\|login\|logout\|verify-email\|forgot\|reset` |
| Seller listings | 5 | `POST/PATCH/DELETE /api/listings`, status actions, signed uploads |
| Favorites | 5 | `GET/POST/DELETE /api/favorites` |
| Reports | 8 | `POST /api/reports` |
| Dealer | 6 | `PATCH /api/dealer/profile`, documents |
| Admin | 6 | `/api/admin/*` with permission matrix |
| Payments | 7 | checkout + `POST /api/payments/webhook/[provider]` (signature-verified, idempotent) |

Business rules live in `src/modules/*/service.ts` — handlers stay thin.
