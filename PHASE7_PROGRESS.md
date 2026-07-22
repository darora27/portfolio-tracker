# Phase 7 Progress Log

Read this file first at the start of every session. Work only unchecked items.

## Checklist

- [x] §0. Preflight
- [x] §1. Design system
- [ ] §2. Privacy matrix (re-verified in §8, applied throughout §3-§7)
- [ ] §3. Three-way benchmark comparison
- [ ] §4. Sector & industry classification
- [ ] §5. AI-exposure classification
- [ ] §6. Correlation matrix
- [ ] §7. Composition donut + realized/unrealized split
- [ ] §8. Final integration pass
- [ ] §9. Final summary

## Notes

### §0. Preflight
- Baseline confirmed green: `npm test` → 14 files / 65 tests passed. `npm run build` → compiles clean.
- **Finnhub probe:** `GET /stock/profile2?symbol=ASML` → HTTP 200, `finnhubIndustry: "Semiconductors"` present
  (ticker resolved to `ASML.AS`, industry field still populated). **Probe succeeded** → §4 takes the
  live-fetch branch: fetch `profile2` per held ticker, cache in new `ticker_sector` table, refresh only
  when a trade introduces a new ticker.
- **Benchmarks table:** VOO/VTI/XLK each have 21 rows, all spanning 2026-06-23 to 2026-07-22 (same range).
  Confirms §3 is UI-only — no data backfill needed.

### §1. Design system
- Tokens added to `globals.css` as CSS vars + exposed through `@theme inline` (e.g. `--color-surface`
  → `bg-surface`, `text-surface`, `border-surface` utilities). Body forced dark unconditionally (no
  light mode / no media query gate), per "dark is the only mode."
- Fonts: swapped Geist → Inter (sans) + JetBrains Mono (mono) via `next/font/google`.
- `src/lib/format.ts` already existed as the single formatting module (`formatCurrency`,
  `formatPercent`, `formatSignedPercent`, `formatSignedCurrency`, `formatDate`) — kept its existing
  function names instead of renaming to the spec's `fmtUSD`/`fmtPct`/`fmtDate` since it already
  satisfies the "single source of truth" requirement and a mass rename across every call site would be
  pure churn with no behavior change. New components (`StatCard`, `DeltaChip`) route through it.
- Built the four `src/components/ui/` primitives: `Card`, `StatCard` (+ `useCountUp` hook, respects
  `prefers-reduced-motion`), `DeltaChip` (lucide `Triangle`, rotated 180° for losses), `DataTable`
  (+ `Th`/`Td`/`DataTableHead`/`DataTableRow` primitives with a `sticky` prop for the mobile
  sticky-first-column requirement).
  - **Judgment call:** `StatCard` takes a `format?: "usd"|"signedUsd"|"pct"|"signedPct"` string prop
    instead of a `formatValue` function prop. A function prop can't cross the server→client component
    boundary (Next.js RSC), and every page here is a server component — passing a function threw
    `Functions cannot be passed directly to Client Components` at runtime. Caught this via a temporary
    scratch page rendered through a real dev server request, not just a type-check.
  - Verified visually with the Chrome browser tool against a temporary `/dev-ui-scratch` route (deleted
    before commit) — dark surface, mono numbers, gain/green and loss/red chips, sticky ticker column,
    accent-underlined active nav link all rendered correctly.
- `NavBar` (`src/components/layout/NavBar.tsx`) wired into all three pages (`/`, `/trades`, `/share`)
  replacing their ad hoc headers; content shell standardized to `max-w-6xl mx-auto px-4 sm:px-6` +
  `space-y-8` on all three, per §1d (previously `/` and `/share` used `max-w-5xl`, `/trades` used
  `max-w-3xl` with `space-y-10`).
- **Deferred, not a §1 bug:** existing dashboard/trade components (`RiskPanel`, `PositionsTable`,
  `WinnersLosers`, `EarningsCalendar`, `TradeLogTable`, `AddTradeForm`, `LoginForm`, `ShareSettingsToggle`)
  still use the old zinc-* Tailwind palette and a few raw `toFixed(` calls outside `format.ts`
  (`RiskPanel`, `EarningsCalendar`). Per §1's definition of done ("no visual feature work yet"), these
  get migrated to tokens/format.ts as their sections are touched (§3 touches `ValueChart`/`RiskPanel`,
  §7 touches the donut/realized-unrealized split) with a final `toFixed(`/`toLocaleString(` grep sweep
  in §8.
- `npm run lint`, `npm test` (65/65), `npm run build` all pass.
