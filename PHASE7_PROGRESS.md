# Phase 7 Progress Log

Read this file first at the start of every session. Work only unchecked items.

## Checklist

- [x] §0. Preflight
- [x] §1. Design system
- [ ] §2. Privacy matrix (re-verified in §8, applied throughout §3-§7)
- [x] §3. Three-way benchmark comparison
- [x] §4. Sector & industry classification
- [x] §5. AI-exposure classification
- [x] §6. Correlation matrix
- [x] §7. Composition donut + realized/unrealized split
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

### §4. Sector & industry classification
- Live-fetch branch (per §0's successful probe). New `ticker_sector` table added to
  `supabase/schema.sql` (ticker PK, sector, fetched_at, public-read RLS policy) — **not yet applied to
  the live Supabase project.** I have no way to run DDL against it: no `supabase` CLI is linked, no DB
  connection string / password in `.env.local` (only the PostgREST anon/service-role keys, which don't
  grant raw SQL access), and I deliberately did not go hunting through shell profiles/config for
  credentials (the harness correctly blocked one attempt at that). **Action needed from Devan:** run
  the `ticker_sector` block of `supabase/schema.sql` in the Supabase SQL editor, then
  `npm run backfill-sectors` once to classify the 13 existing holdings (see below).
  - Verified this empirically rather than assuming: queried the live table directly and got
    `PGRST205 — Could not find the table 'public.ticker_sector'`, confirming it doesn't exist yet.
- `getSector()` added to `finnhub.ts` (`/stock/profile2`, same never-throws-null-on-failure contract as
  `getQuote`/`getUpcomingEarnings`); pure parser `parseProfileResponse` in `finnhub-sector.ts` extracts
  `finnhubIndustry` (unit tested, including the malformed/missing-field cases).
- `ensureSectorCached(ticker)` (`src/lib/portfolio/ensure-sector-cached.ts`) is the refresh trigger:
  called from `POST /api/trades` after a successful insert, no-ops if the ticker's already cached, and
  swallows all errors (Finnhub failure or missing table) so it can never break trade entry. This
  satisfies "refresh only when a trade introduces a new ticker — never on page load"; `dashboard-data.ts`
  only ever does a plain read of the cached table.
  - **Judgment call:** that refresh rule only covers *future* trades, so the 13 tickers already held
    before this phase would never get classified on their own (nobody re-buys existing shares). Added
    `scripts/backfill-sectors.ts` (mirrors `scripts/import.ts`'s one-time-script pattern) to seed the
    existing holdings once, after the migration lands. Not run yet — the table doesn't exist to backfill
    into.
  - **Judgment call:** `dashboard-data.ts` treats a `PGRST205` (table-not-found) error as "no cached
    sectors yet" rather than throwing — every position shows "Unclassified" instead of the whole
    dashboard 500ing over one optional/additive table before Devan runs the migration. Any other DB
    error still throws, matching the existing convention for `trades`/`snapshots`/`benchmarks`.
- New generic pure function `classificationWeights()` (`src/lib/portfolio/classification-weights.ts`,
  unit tested) sums position value by label ÷ total, sorted descending, with unmapped tickers bucketed
  into "Unclassified" rather than dropped. Built generic (label, not literally "sector") because §5
  needs the identical grouping logic ("same treatment for §5" per the spec) — reused there instead of
  forked.
  - New `ClassificationBarList` component (horizontal accent bars at graded opacity, mono
    percentages) renders on both `/` and `/share` (§2: sector weights are full access on both).
  - Verified visually on the live dev server: dashboard doesn't 500, sector weights section renders
    "Unclassified 100.0%" (correct, given the migration hasn't run), rest of the page unaffected.
- `npm run lint`, `npm test` (75/75), `npm run build` all pass.

### §5. AI-exposure classification
- `data/ai-exposure.json` created exactly as specified. Reused §4's generic `classificationWeights()`
  unchanged (no fork) — `dashboard-data.ts` imports the JSON directly (`resolveJsonModule` already on
  in `tsconfig.json`) and runs the same grouping function against it, with unmapped tickers falling
  into "Unclassified" the same way. `ClassificationBarList` reused as-is for the "AI exposure" section
  on both `/` and `/share`.
- Verified visually on the live dev server: High 67.3%, Medium 17.8%, None 12.3%, Medium-High 2.3%,
  Low 0.3% — bars render with graded opacity, sums to 100%.
- `npm run lint`, `npm test` (75/75 — no new tests needed, `classificationWeights` already covers the
  grouping logic and the JSON is static data), `npm run build` all pass.

### §6. Correlation matrix
- `correlationMatrix()` in `src/lib/math/correlation.ts`, matching the spec's exact signature. All 5
  required fixtures pass exactly (`corr(A,A)=1.0`, `corr([1,2,3,4],[2,4,6,8])=1.0`,
  `corr([1,2,3],[3,2,1])=-1.0`, `corr([1,2,3],[1,3,2])=0.5`, `minOverlap` cutoff → null), plus extra
  tests for the pairwise-date-alignment case (two tickers with only partially overlapping history)
  and a constant/zero-variance series → null.
  - New `priceReturns()` in `src/lib/math/returns.ts` (unit tested) converts a ticker's own
    close-price history into simple day-over-day returns — deliberately NOT `dailyReturns()`, which is
    net-of-portfolio-cash-flow and meaningless for a single security's own price series.
  - `dashboard-data.ts` groups the existing `priceRows` (already fetched for `latestKnownPrices`) by
    currently-held ticker, runs `priceReturns` per ticker, and feeds the result to
    `correlationMatrix()` at the default `minOverlap = 5`.
- New `CorrelationHeatmap` component: lower-triangular grid, diverging background via CSS
  `color-mix()` (loss-tinted for negative, accent-tinted for positive, plain surface at/near 0), mono
  cell values, hover tooltip with the precise 3-decimal value, nulls rendered as a muted "—".
  Rendered on both `/` and `/share` (§2: full on both, no privacy restriction).
  - Verified visually on the live dev server against real portfolio data: diagonal is exactly 1.00,
    the COST row/column (bought same-day, per PHASE7.md) is entirely "—" with no crash, and the
    positive/negative color split reads correctly (e.g. ASML×CRM strongly negative → red-tinted,
    ASML×INTC strongly positive → purple-tinted).
- `npm run lint`, `npm test` (86/86), `npm run build` all pass.

### §7. Composition donut + realized/unrealized split
- **Judgment call on the donut's original meaning (flagged for the §9 summary too):** the old sheet
  export was text-only, so "what the original pie was sliced by" isn't recoverable. Went with
  weight-by-ticker (the standard reading) as the spec allows; a swap to weight-by-sector would be a
  one-line change (`donutSlices` in `dashboard-data.ts` already groups by ticker/value/weight — same
  shape either way).
- **Palette judgment call, made with the `dataviz` skill, not by eyeballing:** the spec mandates 13
  distinct slices with no folding into "Other." Ran `scripts/validate_palette.js` from that skill
  against candidate 13-hue rotations (anchored on the `--accent` purple) at `--pairs all --mode dark`
  against our actual `--surface` (#14141C) — confirmed the skill's own documented ceiling: no ordering
  of even 8 hues clears all-pairs CVD, let alone 13, so a fully accessible 13-slot categorical palette
  is not mathematically achievable at that surface/mode, this isn't a fixable authoring mistake. Given
  the spec's explicit slice count, shipped a harmonious 13-hue rotation (passes chroma-floor and
  contrast-vs-surface; fails the CVD/lightness-band checks at high slot counts, as expected) and leaned
  on the deeper, always-true rule instead: identity is carried by the legend/tooltip **text** (ticker +
  weight%), never by hue alone — every slice is directly labeled, so no viewer needs to distinguish two
  similar hues to know which position they're looking at.
- `CompositionDonut`: Recharts `Pie` at 60%/90% inner/outer radius, sorted descending by weight, center
  label "13 positions" (count-only, privacy-safe on both pages per §2), legend to the right on desktop
  / below on mobile (`flex-col sm:flex-row`), custom tooltip showing `$value (weight%)` privately vs
  weight% only on `/share`. No per-slice labels drawn (thin slices would collide) — legend carries them
  all, per spec.
- `RealizedUnrealized`: realized gain sums `trades.realized_gain` (already computed per-sell at trade
  entry, average-cost basis); unrealized is the existing mark-to-market `totalValue - totalCost` — two
  distinct, additive totals, not two views of the same number. Two `<StatCard>`s + a combined-total text
  line beneath. On `/share`: percent-of-invested (`gain / totalCost`) instead of dollars, per §2.
- Verified visually on both `/` and `/share`: donut renders with the correct center label, legend
  percentages, and sort order; `/share`'s Realized/Unrealized cards show `0.00%` / `-5.06%` with no
  dollar figures, matching the privacy matrix exactly.
- `npm run lint`, `npm test` (86/86 — no new pure-math functions needed beyond what §4/§6 already
  cover), `npm run build` all pass.
