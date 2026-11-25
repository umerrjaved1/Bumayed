# DEVELOPMENT_STATUS.md — Bumayed

**Last updated:** 2026-11-25
**Current phase:** Phase 5 — complete, **awaiting owner approval gate**

## Completed
- Phase 0–4 ✅ approved
- Phase 5 seller listings:
  - 8-step create wizard (category → specs → details → price → photos → video → preview → submit)
  - Local image upload adapter (`public/uploads`, MIME sniffing, size limits) until R2/S3
  - YouTube/Instagram/TikTok video URL validation
  - Seller dashboard listing tabs + lifecycle actions (submit/pause/reactivate/renew/sold/remove)
  - Favorites API + button on listing detail + favorites page
  - Ownership enforced server-side on all seller routes
  - typecheck / lint / build ✓ · Vitest 15 tests

## In progress
- ⛔ **Approval gate:** owner review of seller journey

## Next step (after gate)
Phase 6 — dealer dashboard + admin moderation panel.

## How to try
1. Login: `dealer.dev@bumayed.local` / `DevPassword123!`
2. Open `/en/dashboard/listings/new` and complete the wizard
3. Submitted ads stay **PENDING** until Phase 6 moderation
