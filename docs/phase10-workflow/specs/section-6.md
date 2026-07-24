# Phase 10 §6 — `/dashboard` first-layer hierarchy

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §6 → `docs/PHASE10_UX_ARCHITECTURE.md` §4 ("`/dashboard`") → this
document. This document exists to make those three concrete and checkable for
this one section; it does not override them. The `portfolio-ux` skill was
consulted while writing this spec: the three top-level questions must each
lead with one plain-language interpretation before any chart or table, no
question may be presented as an equally-weighted card among the others, and
`/dashboard` keeps its own established dark "deep tier" Tailwind visual
language (`--bg`/`--surface`/`--border`/`--text-primary`/`--text-secondary`/
`--accent`, `Card`, utility classes) — it does **not** adopt the Observatory
shell's `--obs-*` editorial token set, which `src/app/globals.css` documents
as a deliberately separate palette ("new token names only, never reused from
the deep tier above, so the two palettes coexist with zero collisions by
construction"). `/dashboard` is not one of the five Observatory chapters and
is not being folded into `ObservatoryShell` this section — it remains its own
owner-gated deep route, reachable from `/`'s attention links and `NavBar`,
exactly as today.

## 1. Scope — the smallest complete vertical slice

Replace `/dashboard`'s single unbroken 18-component stack with three
top-level, question-led modes (**How am I doing?** / **Why?** / **What
deserves attention?**) plus one secondary **All analytics** index that groups
every existing component under Performance, Holdings, Risk, and Events. Wire
the five `MetricExplanation` builder functions §5 built but did not mount
(Beta, Sharpe, Sortino, Volatility, Max drawdown) into a new deep-tier-styled
disclosure inside `RiskPanel`. Delete nothing; every current analytic keeps a
discoverable home.

### In scope

- One new pure module, `src/lib/dashboard-hierarchy.ts` (§2): the four
  query-addressable dashboard views (three modes + the analytics index),
  a validate-or-default resolver mirroring `resolveObservatoryChapter`, and
  an href builder mirroring `observatoryChapterHref`. Unit tested.
- One new client-safe presentational component,
  `src/components/dashboard/DashboardModeSwitcher.tsx` (§3): a real semantic
  `<nav>` of links (not an ARIA `role="tablist"` widget — see §3's design
  decision), mirroring `ChapterOrbit`'s established `<Link aria-current>`
  pattern exactly, styled with Tailwind utility classes matching `NavBar`'s
  existing `linkClass` convention (no new CSS module — `/dashboard`'s
  existing components never use one).
- One new deep-tier disclosure component,
  `src/components/dashboard/MetricDisclosure.tsx` +
  `metric-disclosure.module.css` (§4): a structural and behavioral twin of
  `src/components/observatory/MetricExplain.tsx`, re-implemented against
  `/dashboard`'s own color tokens instead of `--obs-*`. Consumes the exact
  same `MetricExplanation` type and the five already-tested, unmodified
  builder functions from `src/lib/observatory/metric-explanations.ts`
  (`betaExplanation`, `sharpeExplanation`, `sortinoExplanation`,
  `volatilityExplanation`, `maxDrawdownExplanation`) — no new content-model
  code, no change to that file.
- Editing `src/components/dashboard/RiskPanel.tsx` (§5): replace its
  Volatility, Max drawdown, Sharpe, Beta, and Sortino `Metric` tiles with
  `MetricDisclosure` instances; everything else in the file (Top-2
  concentration, `ConcentrationMeter`/HHI, Best day, Worst day, Win rate,
  Current streak) is unchanged.
- Rewriting `src/app/dashboard/page.tsx` (§6): add `searchParams`, add one
  real `<h1>` (currently absent — a pre-existing gap this section's
  restructuring must not perpetuate, per the cross-route accessibility
  contract's "one `h1` names the current route" rule), render
  `DashboardModeSwitcher`, and render exactly one view's content per request
  (server-side, mirroring `ObservatoryShell`'s `chapterContent[active.id]`
  pattern — never all four views mounted at once).
- Three new mode-content components (§6.1–§6.3):
  `src/components/dashboard/HowAmIDoingMode.tsx`,
  `src/components/dashboard/WhyMode.tsx`,
  `src/components/dashboard/AttentionMode.tsx` — each a thin server
  component assembling existing primitives plus a lead sentence built from
  already-tested, reused copy functions (§2). No new copy logic beyond the
  resolver in `dashboard-hierarchy.ts`.
- One new analytics-index component (§6.4),
  `src/components/dashboard/AllAnalyticsView.tsx`: four `<section>` groups
  (Performance, Holdings, Risk, Events), each rendering the existing
  components assigned in §6.4's table, completely unchanged except
  `RiskPanel`'s new props.
- Before/after screenshots at 1440×900 and 390×844 for all four views (§9).

### Explicitly out of scope for this section (do not touch)

- `ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `ChapterFocusManager.tsx`,
  `chapters.ts`, any `PulseChapter`/`ForcesChapter`/`StructureChapter`/
  `TimelineChapter`/`LabChapter`/`BriefingChapter`, or either Observatory
  page (`src/app/(depth-pull)/page.tsx`, `src/app/(depth-pull)/share/page.tsx`)
  — `/` and `/share` are unaffected by this section.
- `src/components/observatory/MetricExplain.tsx` and
  `metric-explain.module.css` — unmodified. This section does not refactor
  them to share code with the new `MetricDisclosure`; see §4's design
  decision for why the duplication is deliberate.
- `src/lib/observatory/metric-explanations.ts` — read-only. All eight
  builder functions, `MetricExplanationId`, `resolveExplainParam`, and
  `METRIC_SHORT_HISTORY_DAYS` are reused verbatim; none is modified or
  duplicated.
- `HHI`'s live explanation UI — already shipped in `StructureChapter` (§5).
  `RiskPanel`'s existing `ConcentrationMeter` (HHI visual meter) is
  unchanged; this section does not also add a `MetricDisclosure` for HHI
  inside `RiskPanel`. TWR and XIRR already have their `MetricExplain`
  homes in `LabChapter` (§5); this section does not add a second, duplicate
  disclosure for either metric inside `/dashboard`.
- Any individual analytic component's own internal heading level. Fourteen
  of the eighteen components this section relocates already render their own
  `<h2>` (confirmed by direct grep: `BetaTable`, `ClassificationBarList`,
  `CompositionDonut`, `ExcessReturns`, `ContributionChart`,
  `EarningsCalendar`, `CorrelationHeatmap`, `LatestNews`, `HoldingRiskTable`,
  `HoldingsPerformanceChart`, `ValueChart`, `RealizedUnrealized`, `RiskPanel`,
  and `WinnersLosers`/`LiveWinnersLosers`'s inner `<h2>`/`<h3>`s). Downgrading
  every one of these to `<h3>` for stricter nesting under this section's new
  `<h1>`/mode `<h2>`/group `<h3>` structure is out of scope: it touches
  fourteen files with no behavioral need, and several may have external
  references or future tests keyed to their current heading level. Record
  this as a conscious, bounded deferral, not a regression — heading structure
  *inside* these cards is exactly as accessible (or inaccessible) today as
  after this section; what changes is that the page now has exactly one
  `<h1>` and a real per-view `<h2>` above them, which it had neither of
  before.
- `src/lib/dashboard-data.ts` — read-only. Every field this section's new
  code needs (`totalCost`, `twrPct`, `xirrPct`, `historyDays`, `chartData`,
  `dailyChangeAsOf`, `dailyChangePct`, `pricesAsOf`, `hhi`, `movers`,
  `winners`, `losers`, `netFlowsToday`, `benchmarkComparisons`,
  `upcomingEarnings`, `volatilityPct`, `maxDrawdown`, `sharpe`, `betaVsVoo`,
  `sortinoRatio`, `positionRows`, `holdingsPerformance`, `holdingRisks`, and
  every other field already passed to today's `RiskPanel`/component tree)
  already exists on `DashboardData`. No new field, no new fetch.
- `src/lib/math/*` — unchanged, per `CLAUDE.md`'s "no rewrite of the proven
  financial math merely to support a new layout."
- `NavBar.tsx`, `LiveQuotesProvider.tsx`, `LoginForm.tsx`, the unauthenticated
  branch of `dashboard/page.tsx` — unchanged. Authentication, the public
  `/share` link, and the live-quotes context boundary are untouched.
- `/share/full` — unaffected; that route's own migration is §3's decision,
  already settled, not reopened here.
- Any new runtime dependency, popover/tabs/floating-UI library, or anchored
  desktop popover. `MetricDisclosure` reuses `MetricExplain`'s established
  single-inline-disclosure mechanism (§5's own design decision), not a new
  interaction pattern.

## 2. `src/lib/dashboard-hierarchy.ts` — new pure module

```ts
export type DashboardViewId = "how" | "why" | "attention" | "analytics";

export type DashboardView = {
  id: DashboardViewId;
  index: number;
  label: string;
  /** Rendered as the view's own <h2>. Empty string for "analytics", which
   *  uses a plain descriptive label instead of a question (§6.4). */
  question: string;
};

export const DASHBOARD_VIEWS: readonly DashboardView[] = [
  { id: "how", index: 0, label: "How am I doing?", question: "How is the portfolio performing against its own history and the market?" },
  { id: "why", index: 1, label: "Why?", question: "What holdings, flows, and moves are driving that result?" },
  { id: "attention", index: 2, label: "What deserves attention?", question: "What is stale, concentrated, or newly notable right now?" },
  { id: "analytics", index: 3, label: "All analytics", question: "" },
] as const;

export const DEFAULT_DASHBOARD_VIEW_ID: DashboardViewId = "how";

const VIEW_IDS = DASHBOARD_VIEWS.map((v) => v.id);

function isDashboardViewId(value: string): value is DashboardViewId {
  return (VIEW_IDS as string[]).includes(value);
}

/** Resolves a raw searchParams value to a known view, defaulting to "how" for anything unrecognized — same contract as resolveObservatoryChapter. */
export function resolveDashboardView(raw: string | string[] | undefined): DashboardView {
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (slug && isDashboardViewId(slug)) {
    return DASHBOARD_VIEWS.find((v) => v.id === slug)!;
  }
  return DASHBOARD_VIEWS[0];
}

/** Builds a /dashboard href, preserving caller-supplied query state (e.g. explain) and replacing only `mode` — same contract as observatoryChapterHref. */
export function dashboardViewHref(id: DashboardViewId, preservedQuery?: Record<string, string>): string {
  const params = new URLSearchParams(preservedQuery);
  params.set("mode", id);
  return `/dashboard?${params.toString()}`;
}
```

No new copy-building functions are added here. Mode leads reuse, verbatim and
unmodified:

- `pulseLeadCopy` and `pulseDriverCopy` (`@/lib/surface-copy`) for the "How am
  I doing?" and "Why?" leads respectively (§6.1, §6.2) — the exact same
  functions `PulseChapter` already calls, given the exact same input shapes
  `PulseChapter` already builds them from (`historyDays`, `portfolioTwrPct`,
  `benchmark`, `windowLabel`). These sentences will read identically to
  Pulse/Forces's public copy because they describe the same underlying
  numbers; that is intentional (one voice across the product), not
  duplication of logic — the functions are called, not reimplemented.
- `todayLine` (`@/lib/surface-copy`) for the "What deserves attention?" lead
  (§6.3) — the exact function `BriefingChapter` already calls.
- `buildAttentionItems` (`@/lib/observatory/briefing-copy`) for the
  "attention" mode's list (§6.3) — the exact function `BriefingChapter`
  already calls, with the exact same input shape.

## 3. `DashboardModeSwitcher` component

New `src/components/dashboard/DashboardModeSwitcher.tsx`, no CSS module.

**Design decision (record in the evidence doc, §10):** a real `<nav
aria-label="Dashboard view">` of `next/link` anchors with
`aria-current="page"` on the active one — the exact same pattern
`ChapterOrbit` already uses for Observatory chapter navigation — not an ARIA
`role="tablist"`/`role="tab"` widget. Rationale: these are four real,
independently linkable, server-rendered views (not a client-side single-page
tab panel), so `role="tab"` would additionally obligate roving-tabindex and
arrow-key handling that nothing else in this codebase implements and that
`ChapterOrbit`'s own precedent deliberately avoids for the identical reason.
Reusing the established pattern is simpler to verify correct than inventing a
second navigation idiom for the same underlying concept.

```ts
export type DashboardModeSwitcherProps = {
  activeViewId: DashboardViewId;
  /** Route-relevant query state (currently only `explain`) preserved on every link — same contract as ChapterOrbit's preservedQuery. */
  preservedQuery?: Record<string, string>;
};
```

Renders one `<nav>` containing four `<Link href={dashboardViewHref(v.id,
preservedQuery)} aria-current={v.id === activeViewId ? "page" : undefined}>`,
in `DASHBOARD_VIEWS` order. The three question views show `v.label`; the
"analytics" view (last, visually and semantically separated — e.g. a `|`
divider or distinct `data-secondary="true"` styling hook, not equal visual
weight with the three questions) shows "All analytics". Each link is at least
44×44 CSS pixels, matching `NavBar`'s existing `[&>button]:min-h-[44px]`
convention (applied here via the link's own Tailwind classes, e.g.
`inline-flex min-h-[44px] items-center`).

## 4. `MetricDisclosure` component

New `src/components/dashboard/MetricDisclosure.tsx` +
`metric-disclosure.module.css`.

**Design decision (record in the evidence doc, §10):** this is a deliberate,
near-1:1 structural and behavioral copy of `MetricExplain.tsx` (§5), not a
shared abstraction. `MetricExplain`'s CSS module hard-depends on `--obs-*`
custom properties, which are declared only inside `observatory.module.css`
and only reach elements inside `ObservatoryShell`'s subtree (mounted at `/`
and `/share`). `/dashboard` is a separate route tree that never mounts
`ObservatoryShell` and uses a different, deliberately non-overlapping token
set (`src/app/globals.css`'s deep-tier `--bg`/`--surface`/`--border`/
`--text-primary`/`--text-secondary`/`--accent`/`--loss`). Reusing
`MetricExplain` directly would render with undefined custom properties
(broken borders/colors); aliasing `--obs-*` to the deep-tier values would mix
two intentionally distinct palettes inconsistently (only this one component
would shift to the warm Field Journal palette while every sibling `Card` in
the same view stayed on the cool violet deep-tier palette). Extracting a
shared headless hook out of `MetricExplain.tsx` was considered and rejected
for this section: it would mean editing an already-reviewed-and-accepted §5
file to serve a not-yet-built consumer, widening this section's risk surface
for a cosmetic-only saving. The interaction contract (state, focus
management, keyboard handling, ARIA) is copied verbatim; only the JSX's
class names and the CSS module's token references differ.

```ts
export type MetricDisclosureProps = {
  explanation: MetricExplanation; // from @/lib/observatory/metric-explanations, unmodified
  /** Full href, e.g. dashboardViewHref("analytics", { explain: "beta" }) + "#risk" — built by the caller. */
  permalink: string;
  /** True only when this explanation's id matches a validated ?explain= param AND the current view is "analytics" — computed by the caller page, not this component. */
  initiallyOpen?: boolean;
};
```

Behavior — identical to `MetricExplain.tsx` §5, restated for this file:

- Renders a `<section className={styles.metric}>` wrapping a compact row
  (always visible: `shortLabel`, `currentValue.formatted`, and a real
  `<button type="button" aria-expanded={open} aria-controls={panelId}>` whose
  visible text is `` `Explain ${shortLabel}` ``, never an icon alone; minimum
  44×44 CSS pixels) and, when `open`, the same eleven-part expanded panel
  `MetricExplain` renders (§5 §4, items 1–11: focus-on-open heading,
  definition, current value + as-of, status prefix when not `"contextual"`,
  interpretation summary + evidence list, why-it-matters, limitations,
  calculation `<details>`, source freshness, permalink `Link`, Close button).
- `open` state: `useState(initiallyOpen ?? false)`, no re-sync effect — same
  as `MetricExplain`.
- Close (button or `Escape`): closes and returns focus to the trigger.
- `usePrefersReducedMotion()` (existing hook, reused as-is) gates the
  150ms open/close transition exactly as `MetricExplain` does.
- `metric-disclosure.module.css` uses `var(--border)` in place of
  `var(--obs-line)`, `var(--text-secondary)` in place of `var(--obs-evidence)`
  for labels, `var(--text-primary)` in place of `var(--obs-ink)`, and
  `var(--accent)` for the trigger's focus/border accent in place of
  `var(--obs-accent)` — same visual role, deep-tier token. No `--obs-*`
  reference appears anywhere in this file (checkable by direct grep).

## 5. `RiskPanel.tsx` changes

Add props: `historyDays: number`, `dailyChangeAsOf: string`,
`pricesAsOf: string | null`, `explainOpenId?: MetricExplanationId`.

Replace exactly these five `<Metric>` tiles with `<MetricDisclosure>`,
keeping their current grid position (i.e., keep the same
`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` layout — `MetricDisclosure`'s
compact row must fit one grid cell at every named breakpoint, same as the
`Metric` tile it replaces):

| Current tile | New instance |
|---|---|
| Volatility (ann.) | `<MetricDisclosure explanation={volatilityExplanation({ volatilityPct, historyDays, dailyChangeAsOf, pricesAsOf })} permalink={...} initiallyOpen={explainOpenId === "volatility"} />` |
| Max drawdown | `maxDrawdownExplanation({ maxDrawdown: maxDrawdownPct, historyDays, dailyChangeAsOf, pricesAsOf })` |
| Sharpe | `sharpeExplanation({ sharpe, historyDays, dailyChangeAsOf, pricesAsOf })` |
| Beta vs VOO | `betaExplanation({ betaVsVoo, historyDays, dailyChangeAsOf, pricesAsOf })` |
| Sortino | `sortinoExplanation({ sortinoRatio, historyDays, dailyChangeAsOf, pricesAsOf })` |

Each instance's `permalink` is
`` `${dashboardViewHref("analytics", { explain: <id> })}#risk` ``. Every
other tile (Top-2 concentration, `ConcentrationMeter`, Best day, Worst day,
Win rate, Current streak) is byte-identical to today.

## 6. `src/app/dashboard/page.tsx` rewrite

```ts
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[]; explain?: string | string[] }>;
}) {
```

(Auth branch above this is unchanged verbatim.) After `const data = await
getDashboardData();`:

```ts
const params = await searchParams;
const activeView = resolveDashboardView(params.mode);
const explainOpenId = resolveExplainParam(params.explain); // reused from @/lib/observatory/metric-explanations
const preservedQuery = explainOpenId ? { explain: explainOpenId } : undefined;
const today = todayInTimeZone("America/New_York"); // @/lib/date, same helper BriefingChapter's caller already uses
```

Render, inside the existing `<LiveQuotesProvider>` (unchanged wrapper) and
`<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">` (unchanged
container):

```tsx
<h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
<LiveHeadlineStats {...same props as today, unchanged} />
<DashboardModeSwitcher activeViewId={activeView.id} preservedQuery={preservedQuery} />
{activeView.id === "how" && <HowAmIDoingMode data={data} />}
{activeView.id === "why" && <WhyMode data={data} />}
{activeView.id === "attention" && <AttentionMode data={data} today={today} />}
{activeView.id === "analytics" && (
  <AllAnalyticsView
    data={data}
    explainOpenId={explainOpenId === undefined ? undefined : explainOpenId}
  />
)}
```

Only the active view's component tree is rendered per request — same
server-side "one active branch" discipline `ObservatoryShell`'s
`chapterContent[active.id]` lookup already establishes, so no two
`MetricDisclosure` instances for the same metric id ever mount
simultaneously (there is exactly one live `RiskPanel`, inside
`AllAnalyticsView`, and it only renders when `activeView.id === "analytics"`).
`LiveHeadlineStats` stays outside all four view branches (identical props,
identical position, unchanged behavior) — it is the one thing every view
shares, per "Preserve live quote/freshness behavior."

`explainOpenId` reaches `RiskPanel` (inside `AllAnalyticsView`, §6.4) only
when `activeView.id === "analytics"` — this is the section's "home view"
rule for direct links, the same documented cross-view no-op behavior §5
established for chapter-scoped `explain` params: `/dashboard?mode=how&explain=beta`
opens the "How am I doing?" view and does nothing extra (Beta's only home is
the analytics view's Risk group); `/dashboard?mode=analytics&explain=beta`
opens Beta expanded and focused.

### 6.1 `HowAmIDoingMode`

```ts
export type HowAmIDoingModeProps = { data: DashboardData };
```

- `<h2>How am I doing?</h2>` (visually can repeat/echo the switcher's active
  label — this is the view's own content heading, required by the
  cross-route accessibility contract's per-view heading rule, same as
  `ObservatoryShell`'s per-chapter `<h2>`).
- Lead: `pulseLeadCopy({ historyDays: data.historyDays, portfolioTwrPct:
  data.twrPct, benchmark: vooComparison, windowLabel: computed from
  data.chartData[0]?.date via windowLabel() })`, where `vooComparison` is
  `data.benchmarkComparisons.find(c => c.ticker === "VOO") ?? { available:
  false, twrPct: null, excessReturnPct: null }` — the exact same lookup
  `share/page.tsx` already performs.
- Up to three plain-text facts (no interactive disclosure — matches
  `PulseChapter`/`BriefingChapter`'s existing plain-fact precedent, not every
  metric gets its own trigger): TWR (`formatSignedPercent(data.twrPct, 2)`),
  benchmark gap (`vooComparison.excessReturnPct !== null ?
  formatSignedPercent(vooComparison.excessReturnPct, 2) + " vs. VOO" : "VOO
  comparison unavailable"`), Max drawdown
  (`formatSignedPercent(data.maxDrawdown, 1)`).
- Primary visual: `<ValueChart data={data.chartData} />` — unchanged
  component, unchanged props.
- Continuation: `<Link href={dashboardViewHref("analytics") + "#performance"}>Open Performance analytics →</Link>`.

### 6.2 `WhyMode`

```ts
export type WhyModeProps = { data: DashboardData };
```

- `<h2>Why?</h2>`.
- Lead: `pulseDriverCopy({ historyDays: data.historyDays, benchmarkAvailable:
  vooComparison.available, gapPct: vooComparison.excessReturnPct, positions:
  data.positionRows.map(p => ({ ticker: p.ticker, contribution:
  p.contribution })) })` (same `vooComparison` lookup as §6.1). If `null`
  (short history / no benchmark), render nothing for the lead line rather
  than an empty paragraph — same as `PulseChapter`'s existing `driver ?
  <p>...</p> : null` pattern.
- Up to three plain-text facts: top winner
  (`data.winners[0] ? \`${data.winners[0].ticker}
  ${formatSignedPercent(data.winners[0].gainPct, 1)}\` : "No winners yet"`),
  top loser (same shape from `data.losers[0]`), today's net flow
  (`data.netFlowsToday === 0 ? "No new capital added today." :
  \`${formatSignedCurrency(data.netFlowsToday)} net today.\`` — dollars are
  fine here; `/dashboard` is owner-only and already shows dollars
  everywhere).
- Primary visual: `<ContributionChart entries={data.positionRows.filter(p =>
  p.contribution !== null).map(p => ({ ticker: p.ticker, contribution:
  p.contribution! }))} />` — unchanged component, identical filter/map
  `page.tsx` already performs today.
- Continuation: `dashboardViewHref("analytics") + "#holdings"`, labeled "Open
  Holdings analytics →".

### 6.3 `AttentionMode`

```ts
export type AttentionModeProps = { data: DashboardData; today: string };
```

- `<h2>What deserves attention?</h2>`.
- Lead: `todayLine({ dayReturn: data.dailyChangePct })` — same function,
  same input shape `BriefingChapter` already uses.
- Attention list: `buildAttentionItems({ pricesStale: data.pricesAsOf ===
  null, hhi: data.hhi, topMover: data.movers[0] ? { ticker:
  data.movers[0].ticker, dayPct: data.movers[0].dayPct } : null,
  upcomingEarnings: data.upcomingEarnings.map(e => ({ ticker: e.ticker, date:
  e.date })), today })`. Render the first three items (already priority-order
  by construction: stale-prices → concentration → notable-move → earnings)
  as an `<ul>`, each `<li>` a `<Link href={item.href}>` containing the
  `"Critical: "`/`"Notice: "` severity prefix (matching `BriefingChapter`'s
  exact rendering, including the text prefix — never color-only) followed by
  `item.text`. If the full list has more than 3 items, add one line below
  the list: `` `+${items.length - 3} more in Risk & Events analytics` ``
  linking to `dashboardViewHref("analytics") + "#risk"`. If the list is
  empty, render `BriefingChapter`'s exact "Nothing needs your attention right
  now." sentence.
- No separate "primary visual" beyond this list — the list itself is both the
  primary content and the up-to-three facts, per §1's explicit design
  decision (a prioritized list already satisfies the "one dominant visual,
  bounded facts" hierarchy rule without inventing a second, redundant
  representation of the same three items).
- Continuation: `dashboardViewHref("analytics") + "#risk"`, labeled "Open
  Risk & Events analytics →" (mirrors the "+N more" link when present; when
  the list has ≤3 items, this is the view's only continuation link).

### 6.4 `AllAnalyticsView`

```ts
export type AllAnalyticsViewProps = { data: DashboardData; explainOpenId?: MetricExplanationId };
```

- `<h2>All analytics</h2>` followed by one sentence: "Every dashboard metric,
  grouped by what it explains. Nothing here is deleted or hidden — this is
  the complete toolset." (Directly satisfies PHASE10.md's non-goal "No
  removal of advanced data.")
- Four `<section id="..." aria-labelledby="...-heading">`, each with an
  `<h3 id="...-heading">` group label, in this fixed order and exact
  membership (every one of the 18 pre-existing analytics components —
  `LiveHeadlineStats` excepted, since it stays outside all four views per
  §6 — appears in exactly one group; none is duplicated, none is dropped):

| Section id | `<h3>` | Components (unchanged props from today's `page.tsx`) |
|---|---|---|
| `performance` | Performance | `CompareEntryPoint`, `BetaTable`, `ExcessReturns`, `RealizedUnrealized` |
| `holdings` | Holdings | `LivePositionsTable`, `CompositionDonut`, `ClassificationBarList` (Sector), `ClassificationBarList` (AI exposure), `HoldingsPerformanceChart` |
| `risk` | Risk | `RiskPanel` (with the §5 props added: `historyDays`, `dailyChangeAsOf`, `pricesAsOf`, `explainOpenId`), `CorrelationHeatmap`, `HoldingRiskTable` |
| `events` | Events | `EarningsCalendar`, `LatestNews` (conditional on `data.latestNews.length > 0`, unchanged), `LiveWinnersLosers` |

`ValueChart` and `ContributionChart` are **not** repeated here — they are
each already the primary visual of "How am I doing?" (§6.1) and "Why?"
(§6.2) respectively; showing the same live chart twice in one page would be
redundant, not additive. This is the one place this section chooses "reached
via its mode" over "also listed here" for two specific components; every
other component is listed here and only here.

## 7. Acceptance criteria

### Behavioral

1. `/dashboard?mode=how` (and the bare `/dashboard`, which defaults to
   `how`) shows the "How am I doing?" lead, exactly three facts, and
   `ValueChart` as the primary visual; the same numbers currently visible in
   today's headline/chart appear unchanged (data parity — no new
   computation).
2. `/dashboard?mode=why` shows the "Why?" lead (or nothing, per §6.2, when
   `pulseDriverCopy` returns `null`), the top winner/loser/net-flow facts,
   and `ContributionChart` as the primary visual.
3. `/dashboard?mode=attention` shows `todayLine`'s lead and the attention
   list (or the empty-state sentence) built from the exact same
   `buildAttentionItems` logic already proven correct by
   `briefing-copy.test.ts`.
4. `/dashboard?mode=analytics` shows all four groups (§6.4's table) with
   every named component rendering, none omitted, none duplicated across
   groups, and none appearing a second time in `how`/`why`/`attention`
   except `ValueChart`/`ContributionChart`'s documented single-home rule.
5. An unrecognized `mode` value behaves identically to no param at all
   (defaults to `how`, no crash).
6. Each mode's continuation link and the "+N more" link (when present) in
   `attention` navigate to `/dashboard?mode=analytics` with the correct hash
   anchor.
7. `RiskPanel`'s five `MetricDisclosure` instances (Volatility, Max
   drawdown, Sharpe, Beta, Sortino) render collapsed by default and expand
   on trigger, using the exact same explanation content §5's tests already
   verified correct for each builder function.
8. `/dashboard?mode=analytics&explain=beta` (and the equivalent for
   sharpe/sortino/volatility/max-drawdown) renders that metric's
   `MetricDisclosure` pre-expanded with its heading focused on load;
   `/dashboard?mode=how&explain=beta` (any non-`analytics` mode) opens
   nothing extra — Beta's only home is the analytics view's Risk group.
9. Every prop currently passed to every relocated component
   (`LiveHeadlineStats`, `ValueChart`, `CompareEntryPoint`,
   `HoldingsPerformanceChart`, `BetaTable`, `ExcessReturns`,
   `LivePositionsTable`, `RealizedUnrealized`, `CompositionDonut`,
   `ContributionChart`, both `ClassificationBarList`s, `CorrelationHeatmap`,
   `LiveWinnersLosers`, `EarningsCalendar`, `LatestNews`, `HoldingRiskTable`)
   is passed identically after this section — no value, filter, or map
   logic changes for any of them.
10. The unauthenticated branch (`LoginForm`, public-share link) is
    byte-identical to today; auth still gates on `isValidSession`.

### Visual

11. Exactly one dominant question/visual leads each of the three modes; no
    mode presents more than one primary chart or more than three plain-text
    facts before its continuation link — matches the "one question per
    layer" design principle, checkable directly against §6.1–§6.3's fixed
    content lists.
12. `AllAnalyticsView`'s four groups read as a labeled reference index (clear
    `<h3>` group headers, existing `Card`-based components unchanged), not a
    second copy of the old undifferentiated stack — the group headers are
    the one net-new visual structure distinguishing it from today's flat
    list.
13. `MetricDisclosure`'s compact state shows the metric's current value
    leading (not buried under label text) and its expanded state reads as a
    guided layer (same six-part order `MetricExplain` established), matching
    `RiskPanel`'s existing `Metric` tile's visual weight in its grid cell —
    no card-wall, badge, or notification-dot addition.
14. `/dashboard`'s existing dark deep-tier palette (`--bg`, `--surface`,
    `--border`, `--text-primary`, `--text-secondary`, `--accent`) is
    unchanged everywhere, including inside `MetricDisclosure` — zero
    `--obs-*` token references anywhere under `src/components/dashboard/`
    (checkable by direct grep).
15. 1440×900 before (today's single flat stack) and after screenshots exist
    under `docs/phase10-baseline/section-6/`, covering: default (`how`),
    `why`, `attention` (with at least one attention item present),
    `analytics` (scrolled to the Risk group), and one `MetricDisclosure`
    instance expanded.

### Mobile

16. 390×844 shows the mode switcher, the active view's lead/facts/primary
    visual, and the continuation link with no horizontal page overflow
    (`document.documentElement.scrollWidth === clientWidth`, verified live)
    at every one of the four views.
17. Every mode-switcher link and every `MetricDisclosure` trigger/Close
    button/permalink is at least 44×44 CSS pixels at 390px.
18. `AllAnalyticsView`'s four groups remain independently scrollable/reachable
    at 390px without requiring a wide table — existing components' own
    established mobile behavior (unchanged) continues to apply; this section
    adds no new horizontal-scroll requirement.
19. 390×844 before/after screenshots exist under
    `docs/phase10-baseline/section-6/`, covering the same five states as
    item 15.

### Accessibility

20. Exactly one `<h1>` exists on `/dashboard` ("Dashboard") — a real gap
    closed by this section (confirmed absent today by direct read of
    `dashboard/page.tsx`).
21. Each of the three question modes and the analytics index renders exactly
    one `<h2>` naming that view; `AllAnalyticsView`'s four group labels are
    `<h3>` — heading order from the page root is `h1 → h2 → h3`, never
    skipped, for every new heading this section adds (pre-existing internal
    `<h2>`s inside relocated components are the documented §1 deferral, not
    a new violation).
22. `DashboardModeSwitcher` uses real `<Link>`s with `aria-current="page"`
    on the active view, keyboard-operable via native anchor semantics (no
    custom key handling needed, matching `ChapterOrbit`'s precedent).
23. `MetricDisclosure`'s trigger is a real, visibly labeled `<button>` (never
    icon-only) with correct `aria-expanded`/`aria-controls`; opening moves
    focus to the panel heading; Escape or the Close button returns focus to
    the trigger — identical contract to `MetricExplain.test.tsx`'s existing
    assertions, re-verified for this component.
24. The attention list's severity prefixes (`"Critical: "`/`"Notice: "`)
    appear in rendered text, not color alone — same requirement
    `BriefingChapter` already satisfies, reused verbatim.
25. 200% zoom at desktop width does not clip the mode switcher, any fact
    line, or the `MetricDisclosure` panel (per `PRODUCT_DIRECTION.md`'s
    "Navigation" success measure and the UX architecture's responsive
    contract).

### Tests

26. `dashboard-hierarchy.test.ts`: `resolveDashboardView` for all four valid
    ids, an invalid id, and `undefined`; `dashboardViewHref` with and without
    `preservedQuery`.
27. `MetricDisclosure.test.tsx`: collapsed-by-default, click-to-open,
    Enter/Space-to-open, `aria-expanded` toggling, Escape-to-close with
    focus return, Close-button-to-close with focus return, `initiallyOpen`
    rendering expanded with the heading focused on mount, permalink `href`
    equals the passed prop verbatim, reduced-motion variant skipping the
    transition — the same assertion set `MetricExplain.test.tsx` already
    proved correct for the Observatory twin, reproduced for this component.
28. `RiskPanel.test.tsx` (new — no file exists today): all five
    `MetricDisclosure` instances render with props correctly derived from
    `RiskPanel`'s own props (spot-check against the exact builder-function
    fixtures `metric-explanations.test.ts` already established); the
    unchanged tiles (Top-2 concentration, HHI meter, Best/Worst day, Win
    rate, Current streak) still render their existing values; `explainOpenId`
    opens only the matching instance.
29. `dashboard/page.test.tsx` (new — no file exists today): mode routing for
    all four `mode` values plus an invalid value; data parity (each
    relocated component receives the exact prop values `dashboard-data`'s
    existing fixtures would have produced for today's flat render); the
    `explain` + `mode` interaction from item 8; the unauthenticated branch is
    unchanged; the new `<h1>` and per-view `<h2>` are present.
30. `HowAmIDoingMode.test.tsx`, `WhyMode.test.tsx`, `AttentionMode.test.tsx`,
    `AllAnalyticsView.test.tsx` (new): each component's lead/facts/primary
    visual/continuation render correctly from fixture `DashboardData`,
    including each mode's documented empty/edge case (§6.1's short-history
    benchmark-unavailable fallback text, §6.2's `null`-driver no-render,
    §6.3's empty-attention-list sentence and the "+N more" line's presence/
    absence at exactly 3 vs. 4+ items).
31. Full existing suite remains green — no existing test weakened, skipped,
    or deleted, including the (currently zero) dashboard-area tests this
    section adds net-new rather than modifies.

### Build

32. `npm run build` passes; no new build-time network dependency.
33. No new runtime dependency added to `package.json` — `MetricDisclosure`
    and `DashboardModeSwitcher` use only React state/refs/effects, existing
    hooks, and `next/link`.
34. No material client-bundle or server-latency regression: this section
    adds one small disclosure component (mounted five times, only when
    `mode=analytics`) and three thin mode components that each render a
    subset of already-shipped components — no route renders more component
    weight in total than today's single flat page did, and each mode by
    itself renders materially less.

### Privacy

35. `/dashboard` remains gated behind `isValidSession` exactly as before —
    this section makes no change to authentication, and no new route is
    created (all four views live under the existing `/dashboard` path via
    query params, not new route segments).
36. No dashboard data, mode content, or `MetricDisclosure` output appears in
    any public cache or payload — `/dashboard` continues to use `export const
    dynamic = "force-dynamic"`, unchanged, and nothing in this section
    touches `/share`, `/share/full`, or the public Observatory chapters.
37. API keys and server-only computation remain server-only; no new
    client-side fetch is introduced (`MetricDisclosure` and the mode
    components consume only props already computed server-side by
    `getDashboardData`).

## 8. New/changed files (minimum)

- `src/lib/dashboard-hierarchy.ts` (new)
- `src/lib/dashboard-hierarchy.test.ts` (new)
- `src/components/dashboard/DashboardModeSwitcher.tsx` (new)
- `src/components/dashboard/MetricDisclosure.tsx` (new)
- `src/components/dashboard/metric-disclosure.module.css` (new)
- `src/components/dashboard/MetricDisclosure.test.tsx` (new)
- `src/components/dashboard/HowAmIDoingMode.tsx` + `.test.tsx` (new)
- `src/components/dashboard/WhyMode.tsx` + `.test.tsx` (new)
- `src/components/dashboard/AttentionMode.tsx` + `.test.tsx` (new)
- `src/components/dashboard/AllAnalyticsView.tsx` + `.test.tsx` (new)
- `src/components/dashboard/RiskPanel.tsx` (edit, per §5)
- `src/components/dashboard/RiskPanel.test.tsx` (new)
- `src/app/dashboard/page.tsx` (rewrite, per §6)
- `src/app/dashboard/page.test.tsx` (new)

## 9. Evidence to capture and commit

- `docs/phase10-baseline/section-6/README.md`: before (today's single flat
  stack, one 1440×900 and one 390×844 capture is sufficient for "before"
  since there are no modes yet) and after screenshots per §7 items 15/19;
  console warning/error count; a live direct-link check
  (`/dashboard?mode=analytics&explain=sharpe` opening Sharpe expanded and
  focused).
- Record the two design decisions explicitly (§3's nav-not-tablist choice,
  §4's deliberate `MetricExplain`/`MetricDisclosure` duplication and why),
  so a later section doesn't need to rediscover the reasoning.
- Record the §1 heading-level deferral (fourteen relocated components keep
  their existing internal `<h2>`) as a conscious, bounded, non-regressive
  choice, not an oversight.
