# DEVELOPMENT_STATUS.md — Bumayed

**Last updated:** 2026-11-26
**Current phase:** Phase 7 — sandbox payments built, **awaiting client approval of the sandbox flow**

## Completed
- Phase 0–6 ✅ approved (seller + admin/dealer gates approved 2026-11-26)
- Phase 7 promotions, packages, payments:
  - Featured / Premium / Urgent prices and durations read from `promotion_prices`
  - Dealer packages from `packages`; featured slots consumed server-side; listing quota enforced when a package sets one (seeded packages stay unlimited)
  - Sandbox checkout. A browser return does not activate anything
  - Signed webhook grants, fails, cancels, or refunds. Duplicate `providerEventId` cannot grant twice
  - Live: https://bumayed.vercel.app

## In progress
- ⛔ **Approval gate:** client reviews the sandbox payment flow before a real provider (Telr, Network International, or Stripe) and production credentials

## Next step (after gate)
Phase 8 — notifications, content, moderation polish.

## How to try
1. Login `dealer.dev@bumayed.local` / `DevPassword123!`
2. Open an **active** listing → Promote, or `/en/dashboard/packages`
3. On sandbox checkout, choose Simulate success
4. Press success again — the second event must not add another promotion
