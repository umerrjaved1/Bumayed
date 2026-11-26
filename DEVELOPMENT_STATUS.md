# DEVELOPMENT_STATUS.md — Bumayed

**Last updated:** 2026-11-26
**Current phase:** Phase 9 built. Phase 10 QA not started.

## Completed
- Phase 0–6 approved
- Phase 7 sandbox payments built (test later)
- Phase 8 notifications, content, moderation
- Phase 9 SEO, accessibility, and a performance pass:
  - Public pages have unique titles, descriptions, canonical URLs, Open Graph, and English/Arabic alternates
  - `/sitemap.xml` lists public pages and active listings only
  - `/robots.txt` blocks API, dashboard, admin, sign-in, and checkout; those pages also send noindex
  - Active listing pages include structured data and photo alt text
  - Skip link and visible keyboard focus
  - Listing search already loads related rows in one query (no per-card query). Existing indexes cover status, category, location, price, and year. Card images lazy-load; the listing hero image loads first. Public pages stay dynamic so a changed listing is not served from a stale cache.
  - No Lighthouse score was recorded in this pass. Do not treat the site as measured-fast until a lab run is done.

## Still open
- Phase 7 sandbox payment test, then a real provider
- Client approval of notification copy and the prohibited-listing word list
- Phase 10 QA

## Live
https://bumayed.vercel.app
