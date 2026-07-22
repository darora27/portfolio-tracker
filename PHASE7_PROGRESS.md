# Phase 7 Progress Log

Read this file first at the start of every session. Work only unchecked items.

## Checklist

- [x] §0. Preflight
- [x] §1. Design system
- [ ] §2. Privacy matrix (re-verified in §8, applied throughout §3-§7)
- [x] §3. Three-way benchmark comparison
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

### §3. Three-way benchmark comparison
- New pure function `computeBenchmarkComparison` in `src/lib/portfolio/benchmark-comparison.ts`
  (unit-tested: complete-history case with hand-computed TWR/excess-return, missing-date →
  unavailable, no-history → unavailable). Reuses the existing `beta()` and `twr()` functions
  unchanged, per the spec's "do not fork the math."
- `dashboard-data.ts` now fetches all three benchmark tickers in one query (`.in("ticker", [...])`)
  instead of VOO alone, and loops `computeBenchmarkComparison` over VOO/VTI/XLK. `betaVsVoo` (used by
  the existing `RiskPanel`) is now derived from the same computed array instead of a separate
  calculation, so there's exactly one code path for benchmark beta.
- `ValueChart` rewritten: 4 series (portfolio + 3 benchmarks) with the exact colors/dashes from §1a,
  a toggleable pill-chip legend (click to hide/show a benchmark; portfolio always visible), a custom
  dark tooltip component (replacing Recharts' default white tooltip), CartesianGrid/axis styling per
  §1f. New `BetaTable` (3-row DataTable) and `ExcessReturns` (3 DeltaChips) components, both rendered
  on `/` and `/share` per the §2 privacy matrix ("full" on both).
  - Added `formatNumber(value, digits)` to `format.ts` and switched `RiskPanel`'s raw `toFixed(` calls
    (sharpe, beta, HHI) to route through it — one instance of the §1c cleanup pulled forward instead
    of deferred to §8, since I was already touching that file.
  - Added `usePrefersReducedMotion` (`src/components/ui/`), built on `useSyncExternalStore` rather
    than `useState`+`useEffect` (the latter trips the `react-hooks/set-state-in-effect` lint rule and
    is the wrong tool for subscribing to external browser state) — wired into `ValueChart`'s line
    animations and refactored `useCountUp` to share it instead of its own inline `matchMedia` check.
  - **Bug caught via live dev-server + browser check, not just build/tests:** passing a `formatValue`
    function prop from a server-component page into the `"use client"` `StatCard` threw
    `Functions cannot be passed directly to Client Components` — Next's RSC boundary can't serialize
    functions. Fixed in §1's `StatCard` (see that section's notes); resurfaced here as a reminder to
    keep checking new client-component props against that boundary as pages pass data down.
  - Also chased what looked like a broken chart (only a tiny stub rendered, full width empty) through
    the DOM/computed-styles/SVG clip-path — turned out to be Recharts' default line-draw-in animation
    caught mid-frame by the screenshot, confirmed by re-screenshotting a beat later. Not a bug, but
    worth having wired reduced-motion support regardless.
  - Verified visually on `/` (authenticated) and `/share`: 4-series chart renders and the legend
    toggle correctly hides/shows a benchmark line; beta table and excess-return chips appear on both
    pages with full values (no privacy restriction, per §2).
- `npm run lint`, `npm test` (68/68), `npm run build` all pass.
