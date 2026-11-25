# Bumayed — UAE Motors Marketplace

Bilingual (English/Arabic, full RTL) classifieds marketplace for **cars,
motorcycles and boats** in the UAE. Buyers contact sellers directly by phone
or WhatsApp. See `UAE_Motors_Marketplace_Agent_Playbook.md` (execution
contract) and the Phase 0 docs: `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`,
`ROUTES_AND_PAGES.md`, `REQUIREMENTS_ANALYSIS.md`, `TASKS.md`,
`DEVELOPMENT_STATUS.md`.

## Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.4.6 |
| UI library | React | 19.3.0 |
| Language | TypeScript (strict) | ^5 |
| Styling | Tailwind CSS + shadcn/ui | 4.3.3 |
| i18n | next-intl (`en`, `ar` + RTL) | ^4 |
| Validation | Zod | ^4 |
| Icons | Lucide | latest |

Pinned versions: see `package-lock.json`.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values (see file comments)
npm run dev                  # http://localhost:3000 → redirects to /en
```

Routes: `/en/...` (LTR) and `/ar/...` (RTL). Health check: `GET /api/health`.

## Quality gates

```bash
npm run typecheck    # TypeScript strict, no errors allowed
npm run lint         # ESLint (next/core-web-vitals)
npm run format       # Prettier (+ tailwind class sorting)
npm run build        # production build must pass
```

(Vitest unit tests and Playwright E2E arrive in Phases 3 and 5.)

## Conventions

- **Never commit secrets.** `.env.example` documents every variable;
  `src/lib/env.ts` validates them at boot (Zod).
- Internal navigation uses `@/i18n/navigation` (`Link`, `useRouter`, …) so
  the locale prefix is preserved — not `next/link`.
- Business rules will live in `src/modules/*/service.ts` (Phase 3+); UI and
  API handlers must not duplicate them.
- Mock fixtures for visual prototyping live in `src/lib/mock/` only, are
  clearly marked, and must be removed when real APIs land (playbook rule 9).
- English and Arabic copy must stay equivalent in `messages/en.json` and
  `messages/ar.json`. RTL is tested, not assumed.

## Project status

Phase 1 (foundation & design system) — see `DEVELOPMENT_STATUS.md` and
`TASKS.md`.
