# Phase 10 §5 — Metric explainability primitive and core metrics

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §5 → `docs/PHASE10_UX_ARCHITECTURE.md` §5 ("Metric-explanation
content model") → this document. This document exists to make those three
concrete and checkable for this one section; it does not override them. The
`portfolio-ux` skill was consulted while writing this spec: the disclosure
must read as "a guided layer, not a tooltip wall" (current value and
interpretation lead, not a wall of labels), must use a real labeled button
(never an unlabeled info icon or hover-only content), and must not introduce
a card-wall, badge, or notification-dot visual system — it reuses the same
dark editorial visual language and the existing `<details>`-adjacent
disclosure precedent already shipped in Pulse/Structure/Timeline.

## 1. Scope — the smallest complete vertical slice

Build one reusable, accessible metric-explanation primitive and its complete
content model for all eight core metrics named in `PHASE10.md` §5's Work
list, then wire it live into the two Observatory chapters that already
display relevant values today: **Lab** (which already narrates TWR, and will
add XIRR alongside it — both are chapter-appropriate since Lab's question is
explicitly "How do methods, simulations, calculations, and limitations
change the interpretation?") and **Structure** (which already narrates HHI
via `structureConcentrationCopy`).

Alpha is excluded per `PHASE10.md` §5's own gate ("only if a tested alpha
definition exists") and `docs/PHASE10_UX_ARCHITECTURE.md`'s explicit
instruction ("do not show until benchmark, window, and regression method are
explicit and tested"). Confirmed by direct search: no alpha computation
exists anywhere in `src/` (the only source hit for the substring is inside
the word "Alphabet" in `src/lib/finnhub.ts:66`, not a metric). Do not add one
this section — that is a separate, future, explicitly-scoped section if ever
authorized.

### In scope

- One new pure content-model module, `src/lib/observatory/metric-explanations.ts`
  (§3), covering all eight metrics — TWR, XIRR, Beta, Sharpe, Sortino,
  Volatility, Max drawdown, HHI — independently unit tested with hand-computed
  and edge-case (null/short-history) fixtures.
- One new reusable client component, `src/components/observatory/MetricExplain.tsx`,
  with co-located `metric-explain.module.css` (§4) — the disclosure primitive
  itself: a labeled button, `aria-expanded`, click/Enter/Space/touch,
  focus-on-open/return-on-close, Escape-to-close, a visible Close button, and
  a real permalink anchor.
- Wiring `MetricExplain` into `LabChapter.tsx` for **TWR** and **XIRR**
  (replacing the chapter's existing static `<dl>` method block with two
  `MetricExplain` instances built from `twrExplanation()` /
  `xirrExplanation()`), and into `StructureChapter.tsx` for **HHI** (adding
  one `MetricExplain` instance built from `hhiExplanation()`, placed directly
  after the existing concentration lead sentence).
- Threading a validated `explain` query param (`?explain=<metricId>`,
  following `resolveObservatoryChapter`'s exact validate-or-default pattern)
  through `src/app/(depth-pull)/share/page.tsx` and
  `src/app/(depth-pull)/page.tsx` into the two chapters above, so a
  `MetricExplain` instance whose id matches the param opens pre-expanded and
  focused on load — this is the section's "direct-link and focus behavior"
  requirement (`PHASE10.md` §5 Work list).
- Passing `data.xirrPct` (already computed, already on `DashboardData`) into
  `LabChapter` as a new prop — no new data-layer computation.
- Before/after screenshots at 1440×900 and 390×844, each including one
  compact (collapsed) and one expanded `MetricExplain` state (§8).

### Explicitly out of scope for this section (do not touch)

- **Wiring `MetricExplain` into Beta, Sharpe, Sortino, Volatility, or Max
  drawdown's live display.** These five metrics exist today only in the
  legacy `RiskPanel` (`src/components/dashboard/RiskPanel.tsx`), used by
  `/dashboard` and `/share/full` — neither of which has an Observatory home
  yet. `PHASE10.md` §6's own Work list already assigns "Add explainability
  from §5" as part of `/dashboard`'s first-layer-hierarchy rebuild — wiring
  these five into a dashboard that doesn't exist yet in Observatory form
  would mean inventing throwaway UI this section, then redoing it in §6. Per
  this document's §3, their `MetricExplanation` builder functions and unit
  tests **are** in scope and must be fully correct — only their live UI
  mount point is deferred. Record this as a conscious, bounded deferral in
  the evidence doc (§8), not an oversight, following §4's identical
  deferral precedent for private-only chapter variants.
- `RiskPanel.tsx`, `ConcentrationMeter.tsx`, `/dashboard/page.tsx`,
  `/share/full/page.tsx` — unchanged. `/dashboard`'s rebuild is §6; this
  section does not touch the legacy dashboard.
- `ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `ChapterFocusManager.tsx`,
  `chapters.ts`'s chapter list/ids/hrefs, or shell navigation mechanics — all
  settled in §1 and unaffected. `observatoryChapterHref()` is *called* by
  this section's new permalink logic (§5 below) with its existing signature,
  unmodified.
- `PulseChapter.tsx`, `ForcesChapter.tsx`, `TimelineChapter.tsx`,
  `BriefingChapter.tsx`, `OwnerUtilityStrip.tsx` and their pure copy modules
  — none of the eight core metrics are currently displayed in these four
  chapters (confirmed by direct read of each), so none needs a `MetricExplain`
  instance this section.
- `src/lib/dashboard-data.ts` — read-only; every field this section's new
  code needs (`twrPct`, `xirrPct`, `historyDays`, `firstFundedDate` via
  chart data, `dailyChangeAsOf`, `pricesAsOf`, `betaVsVoo`, `sharpe`,
  `sortinoRatio`, `volatilityPct`, `maxDrawdown`, `hhi`, `top2ConcentrationPct`,
  `positionRows`) already exists on `DashboardData`. No new field, no new
  fetch, no changed computation.
- `src/lib/math/*` — the eight underlying pure math functions
  (`twr`, `xirr`, `beta`, `sharpeRatio`, `sortino`, `annualizedVolatility`,
  `drawdown`, `concentration`) are correct and already tested; this section
  only formats and explains their existing outputs. Do not modify any of
  them.
- Any anchored desktop popover or mobile bottom-sheet mechanism. See §4's
  design note: this section deliberately builds a single inline-disclosure
  mechanism (used identically at every viewport), per
  `docs/PHASE10_UX_ARCHITECTURE.md` §5's own permissive guidance that "a side
  panel or inline disclosure is safer for long content" than a popover that
  must be proven not to trap focus or reading order. Building a
  focus-non-trapping anchored popover from scratch is materially larger
  engineering scope than this section's primitive requires, and no such
  utility exists anywhere in the codebase today (confirmed by search) to
  build on top of.

## 2. `MetricExplanation` content-model type (verbatim from the UX architecture doc)

New file `src/lib/observatory/metric-explanations.ts` exports exactly this
type, copied verbatim from `docs/PHASE10_UX_ARCHITECTURE.md` §5 (do not
diverge from this shape):

```ts
export type MetricExplanationId =
  | "twr"
  | "xirr"
  | "beta"
  | "sharpe"
  | "sortino"
  | "volatility"
  | "max-drawdown"
  | "hhi";

export type MetricExplanation = {
  id: MetricExplanationId;
  name: string;
  shortLabel: string;
  category: "performance" | "risk" | "market-relative" | "cash-flow";
  definition: string;
  currentValue: {
    raw: number | null;
    formatted: string;
    asOf: string;
    window: string;
  };
  interpretation: {
    summary: string;
    evidence: string[];
    status: "contextual" | "limited" | "unavailable";
  };
  whyItMattersHere: string;
  limitations: string[];
  calculation: {
    formulaLabel: string;
    inputLabels: string[];
    methodReference: string;
  };
  sourceFreshness: string;
};

export const METRIC_EXPLANATION_IDS: readonly MetricExplanationId[] = [
  "twr", "xirr", "beta", "sharpe", "sortino", "volatility", "max-drawdown", "hhi",
] as const;

export function isMetricExplanationId(value: string): value is MetricExplanationId {
  return (METRIC_EXPLANATION_IDS as readonly string[]).includes(value);
}

/** Same validate-or-undefined contract as chapters.ts's resolveObservatoryChapter,
 *  but returns undefined (not a default) — an invalid/absent param means "nothing
 *  pre-opens," not "open the first metric." */
export function resolveExplainParam(raw: string | string[] | undefined): MetricExplanationId | undefined {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  return slug !== undefined && isMetricExplanationId(slug) ? slug : undefined;
}
```

A shared short-history threshold constant, applied to Beta/Sharpe/Sortino/
Volatility/XIRR (not TWR, which keeps its own already-shipped 14-day
threshold from `LabChapter`'s existing copy, and not Max drawdown/HHI, which
have no short-history caution in the architecture doc):

```ts
/** Below this many funded-history days, Beta/Sharpe/Sortino/Volatility/XIRR
 *  estimates are flagged as noisy per docs/PHASE10_UX_ARCHITECTURE.md §5's
 *  per-metric cautions. Matches the exact threshold HeadlineStats.tsx
 *  already uses for XIRR de-emphasis (`deemphasizeXirr = historyDays < 90`) —
 *  reused here, not reinvented, so the two surfaces never disagree. */
export const METRIC_SHORT_HISTORY_DAYS = 90;
```

## 3. Per-metric builder functions (exact content, deterministic, no LLM)

Each function takes only fields that already exist on `DashboardData` (or are
trivially derived from them, e.g. `windowLabel` from `firstFundedDate`) and
returns a fully populated `MetricExplanation`. All money-free — no dollar
amount is ever a parameter or appears in any returned string, satisfying this
section's Privacy criteria for both `/share` and `/`.

Shared helper, reused by every builder below (avoids duplicating the
staleness sentence eight times):

```ts
function freshnessLine(dailyChangeAsOf: string, pricesAsOf: string | null): string {
  const base = `Prices as of ${formatDate(dailyChangeAsOf)}.`;
  return pricesAsOf === null ? `${base} The latest source is currently stale.` : base;
}
```

### 3.1 `twrExplanation`

```ts
export function twrExplanation(input: {
  twrPct: number;
  historyDays: number;
  firstFundedDate: string | null;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
  benchmark: { available: boolean; twrPct: number | null; excessReturnPct: number | null };
}): MetricExplanation
```

- `id: "twr"`, `name: "Time-weighted return"`, `shortLabel: "TWR"`,
  `category: "performance"`.
- `definition`: `"Time-weighted return chains each funded day's return into one portfolio result, removing the effect of deposits and withdrawals."`
- `currentValue`: `raw: input.twrPct`, `formatted: formatSignedPercent(input.twrPct, 2)`,
  `window: input.firstFundedDate ? windowLabel(input.firstFundedDate) : "since the first funded snapshot"`,
  `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"limited"` if `input.historyDays < 14`, else `"contextual"`
  (reuses `LabChapter`'s existing 14-day threshold verbatim — do not invent a
  new one).
- `interpretation.summary`: when `input.benchmark.available && input.benchmark.twrPct !== null`:
  `` `Portfolio TWR is compared with VOO TWR over the identical funded-history window; VOO is currently at ${formatSignedPercent(input.benchmark.twrPct, 2)}.` ``;
  otherwise: `"Portfolio TWR is compared with VOO TWR only over an identical funded-history window; VOO is currently unavailable for a complete same-period comparison."`
  (both sentences reused verbatim from `LabChapter`'s existing "Benchmark
  method" text).
- `interpretation.evidence`: `[]` when benchmark unavailable; otherwise one
  entry: `` `Excess return vs. VOO: ${formatSignedPercent(input.benchmark.excessReturnPct ?? 0, 2)}.` `` —
  only push this entry when `input.benchmark.excessReturnPct !== null`.
- `whyItMattersHere`: `"A same-day deposit would otherwise look like investment performance, even though it is new capital rather than a gain — TWR keeps the two separate."` (reused verbatim from `LabChapter`'s existing "Why deposits are removed" text, merged into one sentence).
- `limitations`: `` [`TWR-versus-benchmark comparisons under 14 days of history are unreliable. This view currently has ${input.historyDays} days of history.`] `` (reused verbatim).
- `calculation`: `formulaLabel: "Chained daily returns"`,
  `inputLabels: ["Daily net-of-flow returns"]`,
  `methodReference: "r_t = (V_t − F_t) / V_{t−1} − 1, chained as (1+r_1)×(1+r_2)×...−1 (CLAUDE.md financial math rules)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.2 `xirrExplanation`

```ts
export function xirrExplanation(input: {
  xirrPct: number;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "xirr"`, `name: "XIRR (annualized return)"`, `shortLabel: "XIRR"`,
  `category: "performance"`.
- `definition`: `"XIRR is the annualized, money-weighted return implied by every cash flow's exact date and size, plus today's value as a final flow."`
- `currentValue`: `raw: input.xirrPct`, `formatted: formatSignedPercent(input.xirrPct, 2)`,
  `window: "annualized, money-weighted"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"limited"` if `input.historyDays < METRIC_SHORT_HISTORY_DAYS`, else `"contextual"`.
- `interpretation.summary`: `"Unlike TWR, XIRR is sensitive to when money was added or withdrawn — a large recent deposit can swing it sharply even if the underlying investments haven't moved much."`
- `interpretation.evidence`: `[]` (no secondary evidence fixture defined for XIRR this section).
- `whyItMattersHere`: `"XIRR states the portfolio's return the way an annualized personal rate of return is usually understood, accounting for exactly when capital moved."`
- `limitations`: when `input.historyDays < METRIC_SHORT_HISTORY_DAYS`:
  `` [`Only ${input.historyDays}d of history — annualizing a short window can be noisy.`] `` (reused verbatim from `HeadlineStats`'s existing sublabel text); otherwise `[]`.
- `calculation`: `formulaLabel: "Signed cash flows solved for a constant annual rate"`,
  `inputLabels: ["Trade dates and signed amounts", "Current total value as a final flow"]`,
  `methodReference: "Newton-Raphson with bisection fallback on the cash-flow NPV equation (src/lib/math/xirr.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.3 `betaExplanation`

```ts
export function betaExplanation(input: {
  betaVsVoo: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "beta"`, `name: "Beta vs. VOO"`, `shortLabel: "Beta"`,
  `category: "market-relative"`.
- `definition`: `"Beta measures how much the portfolio has historically moved for each 1% move in VOO, over the same funded-history window."`
- `currentValue`: `raw: input.betaVsVoo`,
  `formatted: input.betaVsVoo !== null ? formatNumber(input.betaVsVoo) : "—"`,
  `window: "vs. VOO, full funded history"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"unavailable"` if `input.betaVsVoo === null`; else `"limited"`
  if `input.historyDays < METRIC_SHORT_HISTORY_DAYS`; else `"contextual"`.
- `interpretation.summary`: when unavailable: `"Beta needs a full-history VOO benchmark match to compute — it isn't available yet."`;
  otherwise: `` input.betaVsVoo > 1 ? "The portfolio has historically moved more than VOO." : input.betaVsVoo < 1 && input.betaVsVoo > 0 ? "The portfolio has historically moved less than VOO." : input.betaVsVoo <= 0 ? "The portfolio has historically moved opposite to or independently of VOO." : "" ``
  (three-way branch on sign/magnitude; write as an `if`/`else if` chain, not
  a ternary, for readability).
- `interpretation.evidence`: `[]`.
- `whyItMattersHere`: `"Beta names how much of the portfolio's own movement is explained by the broader market it's benchmarked against."`
- `limitations`: `input.betaVsVoo === null ? ["Needs a full-history VOO benchmark match."] : input.historyDays < METRIC_SHORT_HISTORY_DAYS ? [\`Only ${input.historyDays}d of history — the estimate may be unstable.\`] : []`
  (reuses `RiskPanel`'s exact "Needs a full-history VOO benchmark match"
  sub-text for the null case).
- `calculation`: `formulaLabel: "Covariance with VOO, divided by VOO's variance"`,
  `inputLabels: ["Portfolio daily returns", "VOO daily returns"]`,
  `methodReference: "beta = Cov(portfolio, VOO) / Var(VOO) (src/lib/math/beta.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.4 `sharpeExplanation`

```ts
export function sharpeExplanation(input: {
  sharpe: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "sharpe"`, `name: "Sharpe ratio"`, `shortLabel: "Sharpe"`, `category: "risk"`.
- `definition`: `"Sharpe ratio measures annualized return earned per unit of volatility, using a 0% risk-free rate."`
- `currentValue`: `raw: input.sharpe`, `formatted: input.sharpe !== null ? formatNumber(input.sharpe) : "—"`,
  `window: "annualized"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"unavailable"` if `input.sharpe === null`; else `"limited"`
  if `input.historyDays < METRIC_SHORT_HISTORY_DAYS`; else `"contextual"`.
- `interpretation.summary`: `input.sharpe === null ? "Sharpe needs at least two daily returns with non-zero volatility to compute." : "A higher Sharpe ratio means more return was earned for the volatility taken on."`
- `interpretation.evidence`: `[]`.
- `whyItMattersHere`: `"Sharpe puts the portfolio's return in the context of how much it moved to get there, rather than looking at return alone."`
- `limitations`: `input.sharpe === null ? ["Needs at least 2 daily returns."] : input.historyDays < METRIC_SHORT_HISTORY_DAYS ? ["Short samples can make this ratio noisy."] : []`
  (reuses `RiskPanel`'s exact "Needs at least 2 daily returns" sub-text; the
  short-sample sentence is from `docs/PHASE10_UX_ARCHITECTURE.md` §5's Sharpe
  caution).
- `calculation`: `formulaLabel: "Annualized excess return over annualized volatility"`,
  `inputLabels: ["Daily net-of-flow returns", "Risk-free rate (0%)"]`,
  `methodReference: "(mean(daily returns) × 252 − riskFreeRate) / annualizedVolatility (src/lib/math/sharpe.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.5 `sortinoExplanation`

```ts
export function sortinoExplanation(input: {
  sortinoRatio: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "sortino"`, `name: "Sortino ratio"`, `shortLabel: "Sortino"`, `category: "risk"`.
- `definition`: `"Sortino ratio measures annualized return earned per unit of downside volatility only — days below a 4% annual minimum acceptable return."`
- `currentValue`: `raw: input.sortinoRatio`,
  `formatted: input.sortinoRatio !== null ? formatNumber(input.sortinoRatio) : "—"`,
  `window: "annualized"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"unavailable"` if `input.sortinoRatio === null`; else `"limited"`
  if `input.historyDays < METRIC_SHORT_HISTORY_DAYS`; else `"contextual"`.
- `interpretation.summary`: `input.sortinoRatio === null ? "Sortino needs at least one losing day recorded to measure downside risk." : "Unlike Sharpe, Sortino only penalizes downside moves, not upside volatility."`
- `interpretation.evidence`: `[]`.
- `whyItMattersHere`: `"Sortino answers the same question as Sharpe but doesn't treat a strong up day as risk, which can matter for a concentrated or growth-leaning portfolio."`
- `limitations`: `input.sortinoRatio === null ? ["No losing days recorded yet to measure downside risk."] : input.historyDays < METRIC_SHORT_HISTORY_DAYS ? ["Short samples can make this ratio noisy."] : []`.
- `calculation`: `formulaLabel: "Annualized excess return over annualized downside deviation"`,
  `inputLabels: ["Daily net-of-flow returns", "Minimum acceptable return (4%/yr)"]`,
  `methodReference: "(mean(daily returns) × 252 − 4%) / (downsideDeviation × √252) (src/lib/math/daily-stats.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.6 `volatilityExplanation`

```ts
export function volatilityExplanation(input: {
  volatilityPct: number | null;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "volatility"`, `name: "Volatility (annualized)"`, `shortLabel: "Volatility"`, `category: "risk"`.
- `definition`: `"Annualized volatility measures how much daily returns have varied — the spread of outcomes, not a prediction of loss."`
- `currentValue`: `raw: input.volatilityPct`,
  `formatted: input.volatilityPct !== null ? formatPercent(input.volatilityPct, 1) : "—"`,
  `window: "annualized"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"unavailable"` if `input.volatilityPct === null`; else `"limited"`
  if `input.historyDays < METRIC_SHORT_HISTORY_DAYS`; else `"contextual"`.
- `interpretation.summary`: `input.volatilityPct === null ? "Volatility needs at least two daily returns to compute a standard deviation." : "This is variability, not permanent loss — a high number means the path moved more, not that value was necessarily lost."`
- `interpretation.evidence`: `[]`.
- `whyItMattersHere`: `"Volatility gives Sharpe and Sortino their denominator, and on its own describes how bumpy the ride has been."`
- `limitations`: `input.volatilityPct === null ? ["Needs at least 2 daily returns."] : input.historyDays < METRIC_SHORT_HISTORY_DAYS ? [\`Only ${input.historyDays}d of history — the estimate may understate typical variability.\`] : []`
  (reuses `RiskPanel`'s exact "Needs at least 2 daily returns" sub-text).
- `calculation`: `formulaLabel: "Sample standard deviation of daily returns, annualized"`,
  `inputLabels: ["Daily net-of-flow returns"]`,
  `methodReference: "sampleStdDev(daily returns) × √252 (src/lib/math/volatility.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.7 `maxDrawdownExplanation`

```ts
export function maxDrawdownExplanation(input: {
  maxDrawdown: number;
  historyDays: number;
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "max-drawdown"`, `name: "Max drawdown"`, `shortLabel: "Max drawdown"`, `category: "risk"`.
- `definition`: `"Max drawdown is the largest peak-to-trough decline in the portfolio's funded-history value curve."`
- `currentValue`: `raw: input.maxDrawdown`, `formatted: formatSignedPercent(input.maxDrawdown, 1)`,
  `window: "peak-to-trough, full funded history"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"contextual"` always (never null; 0 is a valid,
  meaningful "no decline yet" value, not a missing-data sentinel).
- `interpretation.summary`: `input.maxDrawdown === 0 ? "The portfolio has not recorded a decline from a prior peak yet." : "This measures the worst point-to-point decline recorded, not the current distance from a peak."`
- `interpretation.evidence`: `[]`.
- `whyItMattersHere`: `"Max drawdown names the deepest decline actually experienced, which return and volatility alone don't show."`
- `limitations`: `["A short history may not yet include the portfolio's largest possible decline."]`.
- `calculation`: `formulaLabel: "Running peak-to-current decline of a chained growth index"`,
  `inputLabels: ["Daily net-of-flow returns"]`,
  `methodReference: "index_t = index_{t-1} × (1+r_t), maxDrawdown = min(index_t / peak_t − 1) (src/lib/math/drawdown.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

### 3.8 `hhiExplanation`

```ts
export function hhiExplanation(input: {
  hhi: number;
  top2ConcentrationPct: number;
  positions: { ticker: string; weight: number }[];
  dailyChangeAsOf: string;
  pricesAsOf: string | null;
}): MetricExplanation
```

- `id: "hhi"`, `name: "Herfindahl-Hirschman Index (concentration)"`,
  `shortLabel: "HHI"`, `category: "risk"`.
- `definition`: `"HHI sums the squared weight of every holding (0-10000 scale) to measure how concentrated the portfolio is in its largest positions."`
- `currentValue`: `raw: input.hhi`, `formatted: formatNumber(input.hhi, 0)`,
  `window: "current holdings"`, `asOf: formatDate(input.dailyChangeAsOf)`.
- `interpretation.status`: `"contextual"` always.
- `interpretation.summary`: `riskLine(input.hhi)` (reused verbatim from
  `src/lib/surface-copy.ts` — do not write a second HHI-interpretation
  sentence; §3 of the §3 spec already established this reuse rule for
  `structureConcentrationCopy`, and this section follows it identically).
- `interpretation.evidence`: build from `input.positions`, sorted descending
  by `weight` (already sorted this way when it reaches `StructureChapter` —
  do not re-sort, do not assume unsorted input): if `input.positions.length
  >= 1`, one entry `` `${input.positions[0].ticker} is the largest position at ${formatPercent(input.positions[0].weight, 1)}.` ``;
  if `input.positions.length >= 2`, a second entry
  `` `Top two positions: ${formatPercent(input.top2ConcentrationPct, 1)} combined.` ``.
  Empty array if `input.positions.length === 0`.
- `whyItMattersHere`: `"A concentrated portfolio's total return depends heavily on a small number of holdings — HHI names how concentrated, in one comparable number."`
- `limitations`: `["HHI describes current weights only — it says nothing about correlation between the holdings themselves."]`.
- `calculation`: `formulaLabel: "Sum of each holding's squared portfolio weight, ×10000"`,
  `inputLabels: ["Current holding weights"]`,
  `methodReference: "HHI = Σ(weight_i²) × 10000 (src/lib/portfolio/holdings.ts)."`
- `sourceFreshness`: `freshnessLine(input.dailyChangeAsOf, input.pricesAsOf)`.

## 4. `MetricExplain` component

New client component `src/components/observatory/MetricExplain.tsx` +
`metric-explain.module.css`.

**Design decision (record in the evidence doc, §8):** a single inline
disclosure, expanding directly beneath its trigger in normal document flow,
used identically at every viewport and for every metric — not an anchored
desktop popover, not a mobile bottom-sheet. Rationale: `docs/PHASE10_UX_ARCHITECTURE.md`
§5 explicitly allows this ("a side panel or inline disclosure is safer for
long content"); no focus-trap/bottom-sheet utility exists anywhere in the
codebase to build on (confirmed by search); and reusing one mechanism at
every breakpoint is simpler to verify correct than maintaining two.

```ts
export type MetricExplainProps = {
  explanation: MetricExplanation;
  /** Full href (e.g. from observatoryChapterHref(basePath, "lab", { explain: "twr" })) —
   *  built by the caller, not this component, keeping MetricExplain free of
   *  chapter/route knowledge. */
  permalink: string;
  /** True only when this explanation's id matches a validated ?explain= param
   *  AND its home chapter is the one currently active — computed by the
   *  caller page, not this component. */
  initiallyOpen?: boolean;
};
```

Behavior:

- Renders a `<section className={styles.metric}>` (not `<div>` — this is
  real content, not a layout wrapper) wrapping:
  - A compact row, always visible: `explanation.shortLabel`, `explanation.currentValue.formatted`,
    and a real `<button type="button" aria-expanded={open} aria-controls={panelId}>`
    whose visible text is `` `Explain ${explanation.shortLabel}` `` (never an
    icon alone — an adjacent `aria-hidden="true"` chevron glyph is allowed in
    addition to, never instead of, the text label). Minimum 44×44 CSS pixels.
  - When `open`, a `<div id={panelId} role="region" aria-labelledby={headingId}>` containing, in order:
    1. `<h3 id={headingId} tabIndex={-1}>{explanation.name}</h3>` — the
       focus-on-open target (ref + `useEffect` on `open` becoming `true`,
       mirroring `ChapterFocusManager`'s established
       `document.getElementById(id)?.focus()` pattern exactly, not a new
       focus-utility abstraction).
    2. `<p>{explanation.definition}</p>`
    3. A labeled current-value line: `` `${explanation.currentValue.formatted} ${explanation.currentValue.window}` ``,
       plus `` `As of ${explanation.currentValue.asOf}.` `` as a second sentence.
    4. If `explanation.interpretation.status !== "contextual"`, a visible
       text status line before the interpretation summary — literal
       `"Limited: "` prefix for `"limited"`, `"Unavailable: "` prefix for
       `"unavailable"` (never color-only, matching the shell's existing
       `"Critical: "`/`"Notice: "` text-label convention from §4).
    5. `<p>{explanation.interpretation.summary}</p>`, followed by
       `<ul>{explanation.interpretation.evidence.map(...)}</ul>` only when
       `evidence.length > 0`.
    6. `<p>{explanation.whyItMattersHere}</p>`
    7. When `explanation.limitations.length > 0`: a labeled `"Limitations"`
       heading (`<h4>`, not another `<h3>`) followed by
       `<ul>{limitations.map(...)}</ul>`.
    8. A nested `<details className={styles.calcDetails}>` (reusing the
       established `.details`/`summary { min-height: 44px }` pattern from
       `structure-chapter.module.css`, copied into this component's own CSS
       module rather than cross-importing another chapter's module) with
       `<summary>View calculation</summary>` and, inside: `formulaLabel`,
       a labeled list of `inputLabels`, and `methodReference` as a `<dl>`.
    9. `<p>{explanation.sourceFreshness}</p>`
    10. `<Link href={permalink}>Link to this explanation</Link>` (Next.js
        `Link`, matching `ChapterOrbit`'s existing navigation convention —
        not a plain `<a>`).
    11. A visible `<button type="button">Close</button>`, minimum 44×44,
        calling the same close handler as Escape.
- `open` state: `useState(initiallyOpen ?? false)` — `initiallyOpen` seeds
  the *initial* render only (no `useEffect` re-syncing on prop change; this
  component does not need to react to a later `explain=` param change
  without a full navigation/remount, which is what actually happens when a
  permalink is clicked — keeps the component simple and matches this
  section's bounded scope).
- Close (button click or `Escape` keydown while `open`): sets `open` to
  `false` and returns focus to the trigger `<button>` (ref).
- `usePrefersReducedMotion()` (existing hook, reused as-is): when `true`,
  the panel's open/close uses an immediate show/hide with no transition; when
  `false`, a `var(--dur-micro)` (150ms) height/opacity transition — same
  150ms budget the architecture doc already assigns to chapter crossfades.
- No animation, hover-only reveal, or content that exists only when
  `:hover` — everything above is reachable and fully visible via
  click/Enter/Space/touch and keyboard alone.

## 5. Required work — file-level guidance

- `src/lib/observatory/metric-explanations.ts`: new, per §2/§3. Barrel-export
  from `src/lib/observatory/` is not required (no existing barrel file for
  this directory — confirmed by directory listing).
- `src/lib/observatory/metric-explanations.test.ts`: new, per §7.
- `src/components/observatory/MetricExplain.tsx` + `metric-explain.module.css`:
  new, per §4.
- `src/components/observatory/MetricExplain.test.tsx`: new, per §7.
- `src/components/observatory/LabChapter.tsx`: add `xirrPct: number` and
  `explainOpenId?: MetricExplanationId` to `LabChapterProps`. Replace the
  existing static `<dl className={styles.method}>` block with two
  `MetricExplain` instances (TWR, then XIRR, in that order — TWR first since
  it's the chapter's existing lead subject), each built via
  `twrExplanation(...)` / `xirrExplanation(...)` from this component's
  existing props plus the new `xirrPct`. Keep the chapter's existing
  `eyebrow`, `lead`, `annotation`, and `continuation` elements unchanged —
  only the `<dl>` method block is replaced. Permalinks:
  `` observatoryChapterHref(basePath, "lab", { ...preservedQuery, explain: "twr" }) ``
  and the same with `explain: "xirr"` — `LabChapter` needs new `basePath: string`
  and `preservedQuery?: Record<string, string>` props to build these itself
  (mirroring how `PulseChapter`/`StructureChapter` already build their own
  `continuation` links via `observatoryChapterHref`).
- `src/components/observatory/StructureChapter.tsx`: add
  `explainOpenId?: MetricExplanationId` to `StructureChapterProps`. Add one
  `MetricExplain` instance (built via `hhiExplanation(...)`) directly after
  the existing `<p className={styles.lead}>{structureConcentrationCopy(...)}</p>`
  line, before the `<figure className={styles.weights}>` block. Permalink:
  `` observatoryChapterHref(basePath, "structure", { ...preservedQuery, explain: "hhi" }) ``
  — `StructureChapter` needs the same new `basePath`/`preservedQuery` props
  as `LabChapter`, for the same reason.
- `src/app/(depth-pull)/share/page.tsx` and `src/app/(depth-pull)/page.tsx`:
  compute `const explainOpenId = resolveExplainParam(searchParams.explain)`
  (same destructure-from-`searchParams` pattern already used for `chapter`).
  Pass `explainOpenId` through to `LabChapter` and `StructureChapter` only
  when `active.id` (the currently resolved chapter) matches that metric's
  home chapter — i.e. `LabChapter` receives `explainOpenId` only when
  `active.id === "lab"`, `StructureChapter` only when `active.id === "structure"` —
  otherwise pass `undefined`. This is the documented behavior for the
  cross-chapter edge case (§1): a link to `?chapter=structure&explain=twr`
  does not auto-open TWR (which lives in Lab); it silently does nothing
  extra. Pass `data.xirrPct` to `LabChapter`. Pass `basePath` (`"/share"` or
  `"/"`) and the same `preservedQuery` shape each page already threads
  through to `ObservatoryShell`.
- No changes to `ObservatoryShell.tsx`, `chapters.ts`, or any other chapter
  component.

## 6. Acceptance criteria

### Behavioral

1. Every one of the eight `MetricExplanation` builder functions (§3) returns
   a value with all six content-model layers populated (definition, current
   value, interpretation, why-it-matters, limitations array — possibly
   empty where documented, calculation) for both a normal-history fixture
   and each function's documented null/short-history edge case, and the
   `currentValue.formatted`/`interpretation.status` pairing matches this
   spec's exact rules in §3 for every case.
2. `MetricExplain` renders collapsed by default (`aria-expanded="false"`,
   panel not in the accessibility tree) unless `initiallyOpen` is true.
3. Clicking the trigger, or pressing Enter/Space while it has focus, toggles
   `aria-expanded` and reveals/hides the panel; a tap does the same (native
   `<button>` semantics — no separate touch-event handling needed, matching
   `FlipCard`'s existing precedent).
4. `Escape` while the panel is open closes it and returns focus to the
   trigger button; the visible Close button does the same via click.
5. On `/share?chapter=lab&explain=twr` and `/?chapter=lab&explain=twr`
   (and the equivalent `explain=xirr`, and `/share?chapter=structure&explain=hhi` /
   `/?chapter=structure&explain=hhi`), the matching `MetricExplain` instance
   renders already expanded and its heading receives focus on load; an
   `explain` value naming a metric whose home chapter isn't the active one
   opens nothing extra (§5's documented behavior).
6. An unrecognized `explain` value (anything not in `METRIC_EXPLANATION_IDS`)
   behaves identically to no param at all — no crash, nothing pre-opens.

### Visual

7. `MetricExplain`'s compact state shows the metric's current value leading,
   not buried under label text, and its expanded state reads as a guided
   layer (definition → value → interpretation → why-it-matters →
   limitations → optional calculation → freshness → permalink/close) — not
   a flat list of labeled fields resembling a tooltip.
8. `LabChapter` and `StructureChapter` retain their existing dark editorial
   visual language (same `--obs-*` tokens, same `--font-mono`/`--font-sans`
   convention) — `MetricExplain`'s CSS module introduces no new color token,
   no card/badge/notification-dot styling.
9. 1440×900 before (today's static `LabChapter` `<dl>` / `StructureChapter`
   with no explain control) and after screenshots exist under
   `docs/phase10-baseline/section-5/`, including one screenshot with a
   `MetricExplain` instance compact and one with it expanded.

### Mobile

10. 390×844 shows the compact row and, when expanded, the complete panel
    (including the calculation `<details>` and the Close button) with no
    horizontal page overflow (`document.documentElement.scrollWidth ===
    clientWidth`, verified live) and no clipped text.
11. The trigger button, calculation `<summary>`, permalink, and Close button
    are each at least 44×44 CSS pixels at 390px.
12. 390×844 before/after screenshots (including one expanded state) exist
    under `docs/phase10-baseline/section-5/`.

### Accessibility

13. The trigger is a real, visibly labeled `<button>` (never an icon alone,
    never relying on `title`/hover) with correct `aria-expanded` and
    `aria-controls` pointing at the panel's real `id`.
14. Opening the panel moves focus to its heading (`tabIndex={-1}`, focused
    via ref); closing (Escape or Close button) returns focus to the trigger.
15. `"Limited: "` / `"Unavailable: "` status prefixes appear in the rendered
    text, not only via CSS class/color, when `interpretation.status !== "contextual"`.
16. No content inside the expanded panel is reachable only via hover; the
    calculation `<details>` remains keyboard-operable exactly like the
    existing `.details` pattern in `StructureChapter`/`PulseChapter`.
17. Reduced motion: `observatory-fallback.test.ts` continues to pass
    unmodified (this section adds a new, separately reduced-motion-aware
    transition inside `MetricExplain` only, not a change to the shell's
    existing fallback mechanism).

### Tests

18. `metric-explanations.test.ts`: for each of the eight builder functions,
    a normal-history fixture and its documented null/short-history edge
    case, asserting the exact formatted strings, `status`, `limitations`,
    and `evidence` content specified in §3 (not just "is defined" — assert
    literal expected strings/values from hand-computed fixtures).
19. A shared content-schema assertion (a single reusable helper function in
    the test file, not a new runtime dependency) run against every fixture's
    returned `MetricExplanation`, checking every required string field is
    non-empty and `interpretation.status` is one of the three allowed
    literal values.
20. A banned-advisory-language test: every string field of every fixture's
    returned `MetricExplanation` (across all eight metrics, both fixtures
    each) is checked against a banned-word regex covering at minimum `buy`,
    `sell`, `should`, `recommend`, `advice`, `advise` (case-insensitive,
    word-boundary matched) — zero matches.
21. `MetricExplain.test.tsx`: covers collapsed-by-default, click-to-open,
    Enter/Space-to-open, `aria-expanded` toggling, Escape-to-close with
    focus return, Close-button-to-close with focus return, `initiallyOpen`
    rendering expanded with the heading focused on mount, permalink `href`
    equals the passed `permalink` prop verbatim, and the reduced-motion
    variant (mocked `prefers-reduced-motion`, following `FlipCard.test.tsx`'s
    existing mock pattern) skipping the transition.
22. New/updated tests for `LabChapter` and `StructureChapter` (new files —
    neither has a dedicated test file today; confirmed by directory
    listing) asserting: both `MetricExplain` instances render with correct
    props derived from chapter props, `explainOpenId` correctly opens only
    the matching instance and leaves the other collapsed, and an absent/
    mismatched `explainOpenId` leaves both collapsed.
23. `src/app/(depth-pull)/share/page.test.tsx` and
    `src/app/(depth-pull)/page.test.tsx`: extend existing tests to cover
    `resolveExplainParam` wiring — `?explain=` reaching the correct chapter
    only when that chapter is active, an invalid `explain` value being
    ignored, and `xirrPct` reaching `LabChapter`.
24. Full existing suite remains green — no existing test weakened, skipped,
    or deleted.

### Build

25. `npm run build` passes; no new build-time network dependency.
26. No new runtime dependency added to `package.json` (`MetricExplain` uses
    only React state/refs/effects and the existing `usePrefersReducedMotion`
    hook — no popover/floating-UI/focus-trap library).
27. Performance stays within the §1 CSS-3D decision's recorded budgets — no
    new long-task/bundle regression attributable to `MetricExplain` (it adds
    one small client component; confirm via the same route-owned-cost method
    §1's decision record already established, not a fresh from-scratch
    measurement methodology).

### Privacy

28. No `MetricExplanation` builder function accepts or ever formats a dollar
    amount — checkable directly from each function's input type (§3) and
    from `MetricExplain`'s prop type; confirmed by the banned-content check
    in item 20 plus a direct grep for `$`/`formatCurrency`/`formatSignedCurrency`
    across `metric-explanations.ts` returning zero matches.
29. `/share`'s existing zero-dollar-leak privacy tests (from §2/§3) still
    pass unmodified — `MetricExplain`'s wiring into `LabChapter`/`StructureChapter`
    adds no dollar-bearing prop to either component's public (`/share`)
    render path.
30. `/` still gates behind `isValidSession` exactly as before — this
    section makes no change to authentication.

## 7. New test files (minimum)

- `src/lib/observatory/metric-explanations.test.ts`
- `src/components/observatory/MetricExplain.test.tsx`
- `src/components/observatory/LabChapter.test.tsx` (new)
- `src/components/observatory/StructureChapter.test.tsx` (new)

## 8. Evidence to capture and commit

- `docs/phase10-baseline/section-5/README.md`: before/after 1440×900 and
  390×844 screenshots (Lab chapter compact, Lab chapter with TWR expanded,
  Structure chapter with HHI expanded), console warning/error count, and a
  direct-link check (`?chapter=lab&explain=xirr` opening XIRR expanded and
  focused, live).
- Record the deferred item explicitly: Beta/Sharpe/Sortino/Volatility/Max
  drawdown have complete, tested `MetricExplanation` builder functions this
  section but no live `MetricExplain` UI mount point yet — that is §6's
  explicit "Add explainability from §5" Work item, not an oversight here.
- Record the inline-disclosure-over-popover design decision (§4) with its
  rationale, so a later section doesn't need to rediscover why no
  popover/bottom-sheet exists.
