# Phase 10 §3 — `/share` Forces, Structure, Timeline, and Method chapters

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §3 → `docs/PHASE10_UX_ARCHITECTURE.md` → this document. This
document exists to make those three concrete and checkable for this one
section; it does not override them. The `portfolio-ux` skill was consulted
while writing this spec (marginalia/ribbon motifs, per-chapter composition,
and the `/share/full` decision below reflect its guidance).

## 0. Naming clarification (read first)

`PHASE10.md` §3's title calls the fifth chapter "Method." `PRODUCT_DIRECTION.md`'s
binding information model and `src/lib/observatory/chapters.ts` (already shipped
in §1) both name it **Lab** (`id: "lab"`, `label: "Lab"`,
question: *"How do methods, simulations, calculations, and limitations change
the interpretation?"*). These are the same chapter. **Do not** rename the
chapter, add a sixth chapter, or introduce a new id — build this section's
"Method" content as `chapterContent.lab` on the existing shell. Everywhere
below, "Lab chapter" and "Method chapter" refer to the identical thing.

## 1. Scope — the smallest complete vertical slice

Wire real, read-only content into `/share`'s four remaining chapters — Forces,
Structure, Timeline, Lab — completing the public Observatory that §2 started
with Pulse. Each chapter must independently answer one question and stand
alone; none of them may become a long scroll of equally-weighted cards.

Also: decide and implement `/share/full`'s Phase 10 disposition (§4 below), the
Work item `PHASE10.md` §3 explicitly assigns to this section.

### In scope

- Four new server components under `src/components/observatory/`:
  `ForcesChapter.tsx`, `StructureChapter.tsx`, `TimelineChapter.tsx`,
  `LabChapter.tsx`, each with a co-located CSS module following
  `PulseChapter.tsx` / `pulse-chapter.module.css`'s established pattern (same
  dark editorial visual language — do not invent a second visual system).
- New pure, unit-tested data/copy functions for each chapter (§3.1–3.4).
- One new data-fetching module, `src/lib/observatory/timeline-data.ts`, for
  Timeline's flow/trade markers (§3.3 — genuinely new data, not available from
  `getDashboardData()`).
- Wiring all four into `/share/page.tsx`'s `chapterContent` map.
- The `/share/full` disposition decision, implemented with a new privacy
  regression test (§4).
- Before/after screenshots at 1440×900 and 390×844 for all four chapters (§7).

### Explicitly out of scope for this section (do not touch)

- The Pulse chapter, `ObservatoryShell.tsx`, `ChapterOrbit.tsx`,
  `ChapterFocusManager.tsx`, `chapters.ts`'s chapter list/ids, or any shell
  navigation mechanics — all settled in §1/§2. Do not add a "divergence
  ribbon" or "marginalia" retrofit to Pulse; those motifs are introduced fresh
  in this section's new chapters only (§0's naming clarification and §3.1/§3.3
  below explain why).
- Beta, Sharpe, Sortino, volatility (annualized), and the interactive
  per-metric "Explain" disclosure system from
  `docs/PHASE10_UX_ARCHITECTURE.md` §5 (`MetricExplanation`). `PHASE10.md`
  §3's Work list assigns Forces/contribution, Structure/concentration+
  correlation, Timeline/performance+composition+events, and Method/TWR only —
  not the full risk-metric suite. These remain reachable, unchanged, at
  `/share/full`. Building the general Explain-button system is a larger,
  cross-cutting undertaking than one section; do not start it here.
- The old dashboard visual components — `ClassificationBarList`,
  `CorrelationHeatmap`, `CompositionDonut`, `ContributionChart`,
  `WinnersLosers`, `RiskPanel`, `BetaTable`, `ExcessReturns`,
  `HoldingsPerformanceChart`, `HoldingRiskTable`, `EarningsCalendar`,
  `RealizedUnrealized` — must not be imported into any new Observatory
  chapter. §2 already established the precedent (a new `PulseChapter` +
  `SurfaceGrowthChart`'s replacement, not reuse) precisely because the old
  components have no text takeaway/accessible-data path and a different
  visual system. Reuse their underlying **data and math** (already exposed on
  `DashboardData` — see §2 per chapter below), never their UI.
- `/dashboard`, `/`, `/compare`, `/research`, `/history`, `/trades`,
  `/stock/[ticker]` — all out of scope; PHASE10.md assigns these to later
  sections.
- `getHistoryData()`'s own behavior, `HistoryRow`, `dailyReturnBars`, or
  `drawdownSeries` — Timeline's new data module (§3.3) may call
  `getHistoryData()` and read **only** its `.compositionHistory` field; it
  must not read, forward, or expose `.rows` (dollar-bearing) and does not need
  `.dailyReturnBars`/`.drawdownSeries` (Timeline gets its own growth/drawdown
  story from `DashboardData`, already fetched by the page — see §3.3). Do not
  modify `history-data.ts` itself.
- `src/lib/dashboard-data.ts`'s computation logic — only *read* its existing
  fields (§2 below). No new `DashboardData` field is needed for
  Forces/Structure/Lab; Timeline needs one genuinely new fetch, isolated in
  its own new module (§3.3), not added to `DashboardData`.
- Any change to `PulseChapter`'s props, its two pure copy functions
  (`pulseLeadCopy`/`pulseDriverCopy`), or its existing tests.

## 2. Data available per chapter (read-only; existing `DashboardData` fields)

### Forces

- `positionRows: PositionRow[]` — `.ticker` and `.contribution` only (same
  rule as §2's Pulse spec: never read `.value`, `.gain`, `.costBasis`,
  `.price`, `.day`, `.prevClose`, `.weight` from this chapter's data path;
  `.weight` is Structure's field, not Forces').
- `movers: Mover[]` (`{ ticker, day, dayPct }`) — `.ticker` and `.dayPct`
  only; never `.day` (a dollar amount).

### Structure

- `top2ConcentrationPct: number`, `hhi: number` — both already fractions/HHI
  units, dollar-safe.
- `sectorWeights: ClassificationWeight[]`, `aiExposureWeights:
  ClassificationWeight[]` — `{ label, weight }`, `weight` is a 0–1 fraction,
  already sorted descending, dollar-safe (already shipped publicly on
  `/share/full` today).
- `correlationTickers: string[]`, `correlationCells: (number | null)[][]` —
  pairwise correlation, dollar-safe.
- `positionRows` — `.ticker` and `.weight` only for this chapter (never
  `.contribution`, which is Forces', or any dollar field).
- Reuse `concentrationStatus`/`riskLine` from
  `src/lib/portfolio/concentration-status.ts` / `src/lib/surface-copy.ts` —
  already shipped, already tested, already the codebase's one HHI-band
  convention (`< 1500` good/"Diversified", `1500–2500` warning/"Moderately
  concentrated", `> 2500` critical/"Highly concentrated"). Do not invent a
  second HHI band scheme.

### Timeline

- `chartData: ChartPoint[]` — reuse `.date` and `.portfolioIndex` only (not
  `.vooIndex`; the VOO comparison is Pulse's job, and Timeline must be
  visually distinct from Pulse's chart — see §3.3).
- `maxDrawdown: number`, `allTimeHigh: AllTimeHighInfo | null` (`{ pct,
  peakDate }`), `bestDay: DatedReturn | null`, `worstDay: DatedReturn | null`
  (`{ date, r }`) — all percent/date-based, dollar-safe.
- `historyDays: number`.
- New data (not on `DashboardData` today — see §3.3 for the new module):
  flow-direction markers (capital added/withdrawn, no dollar amount) and
  trade-event markers (date + ticker + action, no shares/price/reason).
- `getHistoryData()`'s `.compositionHistory` field only (weight %,
  dollar-safe) for the expert-detail composition-over-time disclosure.

### Lab

- `historyDays`, `pricesAsOf`, `dailyChangeAsOf`, `twrPct`, the VOO
  `benchmarkComparisons` entry (`.available`, `.twrPct`, `.excessReturnPct`)
  — all already read by `/share/page.tsx` today for Pulse; pass the same
  values through.
- No new data. This chapter is real values interpolated into fixed
  methodology copy (§3.4), not a new computation.

## 3. Copy, selection, and visual rules (exact, deterministic, no LLM)

Each chapter follows the five-course shape (`portfolio-ux` skill): one lead
sentence, one dominant visual, at most three supporting facts, one "why"
annotation, one continuation link, expert detail behind a `<details>`
disclosure. None of the four may render as a card grid.

### 3.1 Forces

**New pure functions** (suggested home: `src/lib/observatory/forces-copy.ts`):

```ts
export type ContributionRow = { ticker: string; contribution: number };

/** Filters null contributions, sorts descending (most positive first). */
export function rankContributions(
  positions: { ticker: string; contribution: number | null }[],
): ContributionRow[]

/** Caps the bar visual's row count without losing the extremes. */
export function foldContributionsForDisplay(
  ranked: ContributionRow[],
  maxNamed = 8,
): { named: ContributionRow[]; otherSum: number | null }
```

`foldContributionsForDisplay`: if `ranked.length <= maxNamed`, return `{
named: ranked, otherSum: null }` unchanged. Otherwise keep the top 4 (most
positive) and bottom 4 (most negative) individually, sum the remaining
middle rows' `contribution` into `otherSum` (may be positive, negative, or
zero), and set `named` to those 8 in their original rank order (top 4, then
bottom 4). This is the dominant visual's data: a ranked horizontal bar per
named row (positive bars one color/direction, negative the other, **plus** a
`+`/`−` sign and the formatted percent as visible text — never color alone,
per `docs/PHASE10_UX_ARCHITECTURE.md` §9), an "Other" bar when `otherSum !==
null`.

```ts
export const FORCES_MATERIALITY_THRESHOLD = 0.0015; // same value as Pulse's epsilon; import, do not redefine

/** The "evidence marginalia" annotation — computed off the full unfolded `rankContributions` output, not the capped display rows. */
export function forcesMarginaliaCopy(ranked: ContributionRow[]): string | null
```

- `ranked.length === 0` → `null` (omit; no positions with known contribution).
- Let `top = ranked[0]`, `bottom = ranked[ranked.length - 1]`.
- If `top.contribution < FORCES_MATERIALITY_THRESHOLD` AND
  `bottom.contribution > -FORCES_MATERIALITY_THRESHOLD` (nothing crossed the
  threshold either direction): return exactly
  `"Contribution was spread across the portfolio; no single holding stood out."`
- Else if both cross (top ≥ threshold and bottom ≤ −threshold):
  `` `${top.ticker} contributed the most to total return, at ${formatSignedPercent(top.contribution, 1)}; ${bottom.ticker} weighed on it the most, at ${formatSignedPercent(bottom.contribution, 1)}.` ``
- Else if only `top` crosses:
  `` `${top.ticker} contributed the most to total return, at ${formatSignedPercent(top.contribution, 1)}.` ``
- Else if only `bottom` crosses:
  `` `${bottom.ticker} weighed on the result the most, at ${formatSignedPercent(bottom.contribution, 1)}.` ``

**Lead sentence:** a plain-language framing sentence, not a copy of Pulse's
benchmark-gap sentence (Pulse already covers "why the gap vs. VOO exists" —
Forces shows the *full* picture, every holding, not just the top movers):
exactly `"Every holding's share of the portfolio's total return, ranked."`
(static — this chapter's "lead" is the framing question, not a computed
number; the computed evidence is the marginalia sentence and the bar visual).

**Supporting facts (exactly 2, not 3 — a natural third does not exist without
inventing a stat; do not invent one):**

1. `` `${positiveCount} of ${total} holdings added to the result.` `` where
   `positiveCount = ranked.filter(r => r.contribution > 0).length` and
   `total = ranked.length`. Omit this fact entirely (not render an empty
   line) when `total === 0`.
2. Today's biggest percentage mover, from `movers[0]` (already sorted by
   `dayPct` magnitude upstream — verify this against `dashboard-data.ts`'s
   existing `.slice(0, 3)` mover selection before assuming order; if
   `movers` is empty, omit this fact): `` `${movers[0].ticker} moved the most today, ${formatSignedPercent(movers[0].dayPct, 1)}.` ``

**Continuation:** real link to Structure —
`observatoryChapterHref("/share", "structure")`.

### 3.2 Structure

**New pure function** (suggested home: `src/lib/observatory/structure-copy.ts`):

```ts
export function structureConcentrationCopy(hhi: number, top2ConcentrationPct: number): string {
  return `${riskLine(hhi)} The top two holdings make up ${formatPercent(top2ConcentrationPct, 1)} of the portfolio.`;
}

export type CorrelatedPair = { a: string; b: string; correlation: number };

/** Highest non-null off-diagonal cell; null if fewer than 2 tickers or every off-diagonal cell is null. */
export function mostCorrelatedPair(tickers: string[], cells: (number | null)[][]): CorrelatedPair | null
```

`mostCorrelatedPair` must only compare `i < j` pairs (never a ticker against
itself, never double-count `[i][j]`/`[j][i]`).

**Lead sentence:** `structureConcentrationCopy(hhi, top2ConcentrationPct)`
output, reusing the exact existing `riskLine`/`concentrationStatus` bands —
do not write a new HHI-interpretation scheme.

**Dominant visual:** a ranked horizontal weight-bar list of every position
(`positionRows`, already sorted by weight descending —
`computeHoldings`/`holdingsPerformance`'s existing sort order; verify this
directly rather than re-sorting), each bar labeled with its ticker and
`formatPercent(weight, 1)` as visible text.

**Supporting facts (up to 3):**

1. Largest sector weight: `` `${sectorWeights[0].label} is the largest sector at ${formatPercent(sectorWeights[0].weight, 1)}.` `` (omit if `sectorWeights` is empty).
2. Largest AI-exposure band: same pattern using `aiExposureWeights[0]`.
3. `mostCorrelatedPair` result, when non-null: `` `${a} and ${b} are the most correlated holdings (${formatNumber(correlation, 2)}).` `` (omit this fact — not the whole chapter — when null).

**Expert detail (behind one `<details>` disclosure, matching Pulse's exact
precedent):** the correlation matrix as a real `<table>` (rows/columns =
`correlationTickers`, cells = `correlationCells`; render `null` cells as
"Not enough overlap" text, not blank) — this is the "detailed... correlation
matrix remain[ing] available below the interpretation" the UX architecture
calls for.

**Continuation:** real link to Timeline —
`observatoryChapterHref("/share", "timeline")`.

### 3.3 Timeline

**New module `src/lib/observatory/timeline-data.ts`** — this is the one
genuinely new data-fetching path this section adds:

```ts
export type FlowMarker = { date: string; direction: "in" | "out" };
export type TradeMarker = { date: string; ticker: string; action: "buy" | "sell" };

/** Emits a marker only where total_cost changed vs. the immediately prior snapshot; the first snapshot never emits (no prior day to compare — same "day 0 has no return" convention as dailyReturns). */
export function flowMarkers(snapshots: { date: string; totalCost: number }[]): FlowMarker[]

/** Structural privacy guarantee: this function's own input type has no shares/price/total/reason fields to leak — it cannot expose them even by mistake. */
export function toPublicTradeMarkers(
  trades: { date: string; ticker: string; action: "buy" | "sell" }[],
): TradeMarker[]

export async function getPublicTimelineData(): Promise<{
  flowMarkers: FlowMarker[];
  tradeMarkers: TradeMarker[];
  compositionHistory: CompositionHistorySeries;
}>
```

`getPublicTimelineData()`:

- `supabase.from("snapshots").select("date, total_cost").order("date", { ascending: true })`
  — select **exactly** these two columns, never `select("*")`; this is the
  checkable structural guarantee against a future `snapshots` column leaking
  here by accident.
- `supabase.from("trades").select("date, ticker, action").order("date", { ascending: true })`
  — same rule: exactly these three columns, never `*`, never `price`,
  `shares`, `total`, or `reason`.
- Calls `getHistoryData()` (existing, from `src/lib/history-data.ts`) and
  reads **only** `.compositionHistory` from its return value — do not
  destructure or forward `.rows`, `.dailyReturnBars`, or `.drawdownSeries`.

**Lead sentence:** static framing, values supplied by the supporting facts
below (this mirrors Forces' static-lead-plus-computed-facts shape):
exactly `"How the portfolio's shape and result changed over time."`

**Dominant visual — the "annotated divergence ribbon":** a single-line
portfolio growth-index chart (`chartData.map(d => ({ date: d.date, index:
d.portfolioIndex }))` — **portfolio only, no VOO line**; this must look
visually distinct from Pulse's dual-line chart, not a re-skin of it) with its
running peak drawn as a lighter reference line so drawdown reads as the gap
between the two, plus a horizontal marker ribbon beneath the chart: one tick
per `flowMarkers`/`tradeMarkers` entry, positioned by date along the same
x-axis as the chart. Ticks must be distinguishable by shape/label text, not
color alone (capital-added vs. capital-withdrawn vs. buy vs. sell). Cap the
combined marker count actually rendered on the ribbon at 24, sampled
deterministically (same rule as Pulse's `sampledChartData`: always include
the first and last, evenly spaced in between) — if capping occurs, this
capping logic belongs in `TimelineChapter.tsx` itself (a display concern),
not in `timeline-data.ts` (data correctness); log/document how many were
dropped is not required here, but the sampling must be deterministic, not
random.

**Text/data alternative:** a `<details>` disclosure (same convention as
Pulse/Structure) containing a real `<table>` listing every flow/trade marker
(uncapped — the disclosure's table is the complete record; only the ribbon's
visual ticks are capped) with columns Date, Event (`"Capital added"` /
`"Capital withdrawn"` / `"Bought <ticker>"` / `"Sold <ticker>"`).

**Supporting facts (exactly 3):**

1. All-time-high status: when `allTimeHigh === null`, omit; when
   `allTimeHigh.pct === 0`, `"At its all-time high."`; otherwise
   `` `${formatPercent(Math.abs(allTimeHigh.pct), 1)} below its peak, reached ${formatDate(allTimeHigh.peakDate)}.` ``
2. Best day: `bestDay === null` → omit; else
   `` `Best day: ${formatSignedPercent(bestDay.r, 1)} on ${formatDate(bestDay.date)}.` ``
3. Worst day: same pattern with `worstDay`.

**Expert detail (behind one `<details>` disclosure):** the
composition-over-time stacked view, rendered from `compositionHistory`
(weight % per ticker per date — a simple stacked bar or per-ticker sparkline
list is sufficient; this does not need to be a polished stacked-area chart,
since it is expert detail, not the dominant visual).

**Continuation:** real link to Lab —
`observatoryChapterHref("/share", "lab")`.

### 3.4 Lab (Method)

No new pure functions required — this chapter interpolates already-available
real values into fixed methodology copy. Suggested home for the copy
constants: inline in `LabChapter.tsx`, or `src/lib/observatory/lab-copy.ts`
if extraction aids testing.

**Lead sentence:** exactly
`"This portfolio's return is measured with time-weighted return (TWR), which removes the effect of deposits and withdrawals."`

**Dominant content (definition-list structure, not a chart):**

- **What it measures:** plain-language TWR definition (one sentence).
- **Current value:** `` `${formatSignedPercent(twrPct, 2)} ${windowLabel}.` ``
- **Why deposits are removed:** one sentence explaining that a same-day
  deposit would otherwise distort the daily return (matches
  `CLAUDE.md`'s TWR rule and `docs/PHASE10_UX_ARCHITECTURE.md` §5's TWR
  caution).
- **Benchmark method:** one sentence stating the same-period comparison rule
  (portfolio TWR vs. VOO TWR over the identical funded-history window — never
  a mismatched date range), naming whether VOO is currently `.available`.
- **Limitations:** always-shown text (not conditional) stating that TWR-vs-
  benchmark comparisons under 14 days of history are unreliable — the same
  `14`-day threshold Pulse already uses (`PulseLeadInput`'s
  `historyDays < 14` gate); do not invent a second threshold.
- **Freshness:** `` `Prices as of ${formatDate(dailyChangeAsOf)}.` `` (reuse
  the exact phrase already used in the shell's freshness slot for
  consistency, not a new wording).

**Continuation / compatibility link:** a real, keyboard-operable link to
`/share/full`, labeled `"View the complete public dataset"` — this is the
`/share/full` compatibility link decision from §4 below, and it must live
here (Lab is the chapter whose job, per
`docs/PHASE10_UX_ARCHITECTURE.md` §2, is "public methodology... and a
curated non-private example" — the natural place to point to the exhaustive
detail view).

## 4. The `/share/full` decision

**Decision: `/share/full` remains a compatibility route, unchanged in
content.** Rationale (binding per `PRODUCT_DIRECTION.md`'s decision
hierarchy and non-goals):

- `/share/full` today renders far more than this section's four chapters
  cover — `PositionsTable`, `BetaTable`, `HoldingRiskTable`,
  `HoldingsPerformanceChart`, `EarningsCalendar`, `RealizedUnrealized`,
  `ExcessReturns` have no equivalent anywhere in Forces/Structure/Timeline/Lab
  (by design — §1's "out of scope" list above explicitly excludes rebuilding
  the full risk-metric suite this section).
- Retiring or redirecting `/share/full` would remove correct, still-unique
  public analytics with no verified new home — directly against
  `PHASE10.md`'s ground rule 15 ("Preserve advanced data... do not delete
  correct analytics merely to create visual space") and
  `PRODUCT_DIRECTION.md`'s non-goal ("No removal of advanced data; it moves
  to an appropriate layer").
- `PRODUCT_DIRECTION.md`'s own route table already calls `/share/full`
  "Transitional legacy public detail" that "should be reorganized or retired
  only through an explicit migration decision" — a future decision, not
  automatically triggered by shipping four editorial chapters that summarize
  a subset of its data.

**Required implementation (bounded, two small additions only):**

1. `LabChapter.tsx` links to `/share/full` (§3.4, already specified above).
2. `/share/full`'s page gets one small addition: a real link back to
   `/share` (e.g., `"← Back to Observatory"` near its existing top), styled
   minimally, touching no other part of the page's existing rendering,
   `hideDollars` logic, or data fetching.

Nothing else on `/share/full` changes. This is the full extent of this
section's `/share/full` work — do not restyle it, do not add Observatory
visual language to it, do not touch its `hideDollars` setting logic.

## 5. Required work — file-level guidance

- `src/app/(depth-pull)/share/page.tsx`: extend `chapterContent` to include
  `forces`, `structure`, `timeline`, `lab` keys (alongside the existing
  `pulse` key from §2 — do not remove or restructure it). Fetch
  `getPublicTimelineData()` alongside the existing `getDashboardData()` call
  (both awaited; a `Promise.all` is fine but not required).
- New components (server components, no client state needed for this
  section's content — same rule §2 established for Pulse):
  `src/components/observatory/ForcesChapter.tsx`,
  `StructureChapter.tsx`, `TimelineChapter.tsx`, `LabChapter.tsx`, each
  taking only the narrow prop slice it needs (never the whole
  `DashboardData` object — keep dollar-bearing fields structurally excluded
  from every new component's prop type, exactly as `PulseChapter`'s prop
  type already does).
- `src/lib/observatory/forces-copy.ts`, `structure-copy.ts`: new pure
  functions per §3.1/§3.2, each independently unit tested with
  hand-computed fixtures.
- `src/lib/observatory/timeline-data.ts`: new data module per §3.3, with
  `flowMarkers`/`toPublicTradeMarkers` unit tested with hand-computed
  fixtures (pure functions) and `getPublicTimelineData` covered by an
  integration-style test that mocks `supabase`/`getHistoryData` the same way
  `src/app/(depth-pull)/share/page.test.tsx` already mocks
  `getDashboardData`.
- `src/app/share/full/page.tsx`: add the one back-link only (§4).

## 6. Acceptance criteria

### Behavioral

1. Each of Forces, Structure, Timeline, and Lab answers its one named
   question (per `chapters.ts`'s existing `question` field) and can stand
   alone — a visitor landing directly on any one chapter's URL (e.g.
   `/share?chapter=structure`) gets a complete, non-crashing answer without
   visiting the others first.
2. Direct links and browser back/forward to each chapter work (already
   guaranteed by the §1 shell's URL-state mechanism — confirm this section's
   content doesn't break it, not new work).
3. Forces' marginalia sentence (§3.1) and Timeline's supporting facts (§3.3)
   use real `getDashboardData()`/`getPublicTimelineData()` output — no
   hardcoded or placeholder numbers.
4. Every chapter degrades gracefully on very short history (`historyDays`
   small, `positionRows`/`chartData` short, `correlationCells` mostly null,
   `flowMarkers`/`tradeMarkers` empty): no crash, no `NaN`, no zero rendered
   as if it were real data — omit facts/sentences per the `null`/empty rules
   in §3, don't fabricate fallback numbers.
5. `/share/full`'s existing behavior (data, `hideDollars` default, all
   existing components) is unchanged except for the one added back-link.

### Visual

6. Forces, Structure, Timeline, and Lab each have a visually distinct
   dominant composition (ranked bar list; ranked bar list + disclosure;
   single-line ribboned chart; definition list) — none is a card grid, and no
   chapter merely re-skins another's chart (Timeline's single portfolio-only
   line with a marker ribbon must look distinct from Pulse's dual-line
   chart).
7. No chapter mandates a long scroll before reaching its continuation link —
   expert detail (correlation matrix, composition-over-time) is behind
   `<details>` disclosures, not inline in the main flow.
8. 1440×900 before/after screenshots exist for all four chapters under
   `docs/phase10-baseline/section-3/` ("before" = today's shell placeholder
   text for that chapter, already captured in §1/§2 evidence and reusable by
   reference; "after" = this section's built chapter).

### Mobile

9. 390×844 shows each chapter's lead, dominant visual, supporting facts, and
   continuation within a reasonable scroll (not necessarily one viewport,
   unlike Pulse's stricter §2 requirement — `PHASE10.md` §3 only requires "no
   horizontal page overflow," not first-viewport completeness) — verify
   `document.documentElement.scrollWidth === clientWidth` live for all four
   chapters.
10. Every continuation link and disclosure toggle is at least 44×44 CSS
    pixels.
11. 390×844 screenshots exist for all four chapters under
    `docs/phase10-baseline/section-3/`.

### Accessibility

12. Exactly one `h1` per page load (unchanged from the shell; confirm no new
    chapter introduces a second one).
13. Every `<details>` disclosure's `<summary>` is a real, keyboard-operable
    control; every accessible data table has real `<caption>`/`<th
    scope="...">` markup (same convention as Pulse's existing table).
14. Timeline's marker ribbon does not rely on color alone — verify
    shape/text distinguishes capital-added/withdrawn/buy/sell in the
    rendered markup, not only in CSS.
15. Every new continuation link (Forces→Structure, Structure→Timeline,
    Timeline→Lab, Lab→`/share/full`, `/share/full`→`/share`) is reachable and
    operable by keyboard (Tab + Enter) with a visible focus outline, reusing
    the shell's existing focus-visible pattern.
16. Reduced motion and the shell's existing no-3D static fallback continue
    to pass — confirm `observatory-fallback.test.ts` still passes unmodified.

### Tests

17. New unit tests for `rankContributions`, `foldContributionsForDisplay`,
    and `forcesMarginaliaCopy` covering: a clear top+bottom pair, top-only,
    bottom-only, below-materiality-threshold (the "spread across" fallback),
    and the >8-position folding case.
18. New unit tests for `structureConcentrationCopy` and `mostCorrelatedPair`
    covering: each HHI band, a null-cell-only matrix (returns `null`), and a
    genuine highest-correlation pair.
19. New unit tests for `flowMarkers` and `toPublicTradeMarkers` covering: an
    increase, a decrease, no change (no marker), and the first-snapshot-never-
    emits rule.
20. A test for `getPublicTimelineData` confirming it selects only the named
    columns (assert against the mocked Supabase query builder's `.select()`
    argument, not just the returned shape) and forwards only
    `.compositionHistory` from `getHistoryData`.
21. A new privacy regression test for the fully-wired `/share` page (extend
    `src/app/(depth-pull)/share/page.test.tsx`) asserting all four new
    chapters' rendered HTML contains zero `/\$\d[\d,]*\.\d{2}\b/` matches,
    trade reasons, or owner-only markers — same convention as §2's existing
    tests in that file.
22. A new privacy regression test for `/share/full` (none exists today —
    confirm via `find src/app/share -name "*.test.*"` before writing, to
    avoid duplicating one) asserting: the back-link to `/share` exists, and
    the page's existing dollar-hiding behavior with `hideDollars=true` (the
    documented default) is unchanged.
23. Full existing suite remains green — no existing test weakened, skipped,
    or deleted.

### Build

24. `npm run build` passes with no new build-time network dependency.
25. No new client-bundle dependency; every new chapter component is a server
    component unless a specific disclosure toggle genuinely requires client
    interactivity (same rule §2 established — native `<details>` needs no
    client JS at all, so this should not arise).
26. Performance stays within the §1 CSS-3D decision's recorded budgets (no
    new long-task/bundle regression attributable to `/share`'s route-owned
    content).

### Privacy

27. Zero matches of `/\$\d[\d,]*\.\d{2}\b/` in `/share`'s unauthenticated
    rendered HTML across all five chapters (Pulse + this section's four).
28. Every new chapter component's TypeScript prop type is confirmed (by
    direct code read during review) to exclude every dollar/price-bearing
    field, matching §2's `PulseChapter` precedent — checkable directly from
    each component's prop signature.
29. `timeline-data.ts`'s two Supabase queries select only the named columns
    (`date, total_cost` / `date, ticker, action`) — checkable directly from
    source, not just from current rendered output.
30. Trade `reason` text never appears anywhere in `/share`'s rendered output
    or in any new module's types (structurally impossible, not merely
    untested — `toPublicTradeMarkers`'s input type has no `reason` field).
31. `/share/full`'s existing privacy posture (whatever it is today — this
    section adds a test for it per §6.22 since none exists) is unchanged by
    the one added back-link.

## 7. New test files (minimum)

- `src/lib/observatory/forces-copy.test.ts`
- `src/lib/observatory/structure-copy.test.ts`
- `src/lib/observatory/timeline-data.test.ts`
- Extend `src/app/(depth-pull)/share/page.test.tsx` for §6.21.
- A new `src/app/share/full/page.test.tsx` for §6.22 (confirmed via search
  not to already exist).

## 8. Evidence to capture and commit

- `docs/phase10-baseline/section-3/README.md`: before (shell placeholder,
  referencing existing §1/§2 evidence rather than recapturing it) and after
  (this section's built chapter) 1440×900 and 390×844 screenshots for all
  four chapters, console warning/error count, and the privacy test results
  for both `/share` and `/share/full`.
- Record real numbers, not placeholders — if a screenshot cannot be captured
  for a stated reason, say so explicitly rather than omitting the
  requirement silently (same convention §2's evidence doc established).
