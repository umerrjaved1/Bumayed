# DESIGN_SYSTEM.md — Bumayed

**Status:** v1 (Phase 1) — pending owner visual review at the Phase 1 gate.
Direction: **premium automotive** — clean, confident, high readability,
photography-forward. No Dubizzle branding or assets.

Tokens are implemented in `src/app/globals.css` (`:root` / `.dark`, oklch)
and surfaced to Tailwind 4 via `@theme inline`.

---

## 1. Color

| Token | Light | Role |
|---|---|---|
| `primary` | midnight navy `oklch(0.30 0.07 255)` | Brand surfaces (hero, footer), primary buttons, headings emphasis |
| `accent` | amber gold `oklch(0.77 0.15 72)` | CTAs, featured badges, focus rings, highlights |
| `background` / `foreground` | near-white / deep navy-ink | Page surfaces & text |
| `secondary` / `muted` | cool grays | Subtle panels, secondary text |
| `destructive` | red `oklch(0.58 0.25 27)` | Errors, urgent badges, destructive actions |
| `success` | green `oklch(0.65 0.14 155)` | Approved/verified states |
| `warning` | amber (shares accent hue) | Pending/expiry states |
| `border` / `input` / `ring` | cool gray / gray / accent-gold | Lines, fields, focus |

Dark theme is defined (`.dark`) but **light is the launch default**; dark
mode ships post-MVP after a dedicated contrast pass.

## 2. Typography

| Use | Latin (EN) | Arabic (AR) |
|---|---|---|
| UI & body | **Inter** (`--font-inter`) | **Noto Sans Arabic** (`--font-noto-arabic`) |

Font stacks swap automatically: `html[dir="rtl"]` re-orders `--font-sans` so
Arabic renders in Noto Sans Arabic first. Loaded via `next/font` (self-hosted,
no layout shift).

Scale (Tailwind defaults, rem): `text-xs .75` · `sm .875` · `base 1` ·
`lg 1.125` · `xl 1.25` · `2xl 1.5` · `3xl 1.875` · `4xl 2.25` · `5xl 3`.
Headings `font-semibold/bold tracking-tight`. Prices use `tabular-nums`.

## 3. Spacing, radius, elevation, breakpoints

- Spacing: Tailwind 4px scale (`p-4` = 1rem). Page gutter `px-4 sm:px-6 lg:px-8`,
  max content width `max-w-7xl`.
- Radius: base `--radius: 0.625rem` (10px); cards `rounded-lg`, media
  containers inherit via `overflow-hidden`.
- Elevation: flat by default; `shadow-md` on card hover, `shadow-lg` for the
  hero search bar and overlays only.
- Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
  Mobile-first; filters become a Sheet/drawer below `lg` (Phase 2).

## 4. RTL rules

- `dir` is set on `<html>` per locale; **logical properties only** for
  directional spacing (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`,
  `text-start`) — never `ml/mr/pl/pr/left/right` in new code.
- Icons with directionality (arrows, chevrons) must flip (Lucide
  `rtl:` variant or `rotate-180` in RTL). Non-directional icons (Car, Search)
  stay as-is.
- Numerals: locale-aware via `Intl.NumberFormat` — `en-AE` (Western digits)
  and `ar-AE` (Arabic-Indic digits). See `PriceDisplay`.

## 5. Components (Phase 1 inventory)

shadcn/ui primitives in `src/components/ui/`: button, card, badge, input,
textarea, select, dialog, sheet, skeleton, table, dropdown-menu, tabs,
avatar, separator, sonner (toasts), pagination, label, tooltip, alert.

Composed components:

| Component | File | Purpose |
|---|---|---|
| `SiteHeader` | `components/layout/site-header.tsx` | Sticky header: brand, nav, language switcher, login, Post an Ad |
| `MobileNav` | `components/layout/mobile-nav.tsx` | Sheet drawer nav `< md` |
| `SiteFooter` | `components/layout/site-footer.tsx` | Link columns, legal, copyright |
| `LanguageSwitcher` | `components/layout/language-switcher.tsx` | EN/AR toggle preserving current path |
| `SearchBar` | `components/shared/search-bar.tsx` | Keyword + emirate, submits to URL query params |
| `CategoryCard` | `components/shared/category-card.tsx` | Cars / Motorcycles / Boats shortcuts |
| `ListingCard` | `components/shared/listing-card.tsx` | Photo area, badges, price, specs, location |
| `PriceDisplay` | `components/shared/price-display.tsx` | Locale-aware AED formatting |

States to implement per component as features land: loading (Skeleton),
empty (icon + message + action), error (Alert + retry) — playbook §5.2.

## 6. Accessibility baseline

Semantic landmarks (`header/nav/main/footer`), labeled form controls
(`aria-label` on icon-only buttons), visible focus (`outline-ring/50`),
contrast ≥ WCAG AA for text tokens, keyboard-operable menus (Radix under
shadcn). Full a11y pass in Phase 9.
