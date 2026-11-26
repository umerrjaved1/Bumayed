# DEVELOPMENT_STATUS.md — Bumayed

**Last updated:** 2026-11-26
**Current phase:** Phase 8 — built, policy wording still needs client approval

## Completed
- Phase 0–6 approved
- Phase 7 sandbox payments built (test later)
- Phase 8 notifications, content, moderation:
  - Inbox at `/dashboard/notifications`, email when a provider key exists, deduped retries
  - Listing submit/approve/reject/expiry, payment result, package expiry, report resolved
  - Admin content editor sanitizes HTML; banners need an https link and a size in range
  - New listings are blocked when they match prohibited terms (editable page, defaults until filled)

## Still open
- Phase 7 sandbox payment test, then a real provider
- Client approval of notification copy and the prohibited-listing word list

## Live
https://bumayed.vercel.app
