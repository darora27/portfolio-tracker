# Phase 10 §4 — Private `/` owner briefing

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §4 → `docs/PHASE10_UX_ARCHITECTURE.md` → this document. This
document exists to make those three concrete and checkable for this one
section; it does not override them. The `portfolio-ux` skill was consulted
while writing this spec: the briefing chapter's attention list must read as
editorial marginalia (sentence-style evidence notes with a real link), not a
notification/badge list; the owner utility strip must stay visually quiet and
subordinate, positioned after the story exactly as `ObservatoryShell`'s
existing `ownerSlot` already places it; nothing here introduces card-wall or
dashboard-KPI styling.

## 1. Scope — the smallest complete vertical slice

Replace `/`'s current Phase-9 "surface" experience (`SurfaceHeader` +
`SurfaceActs`, a total-value hero followed by a chart and three flip cards)
with the private Observatory: the same `ObservatoryShell` §1 built, in
`mode="private"`, answering the three owner questions — what changed, why,
what deserves attention — before any dollar figure or action link appears.

This mirrors §2's precedent exactly: §2 replaced `/share`'s old number-first
hero with one new chapter (`PulseChapter`) inside the shell. §4 replaces `/`'s
old number-first hero with one new chapter (`BriefingChapter`, this section's
only new chapter) inside the same shell, plus one new subordinate owner-utility
region the shell already has a slot for (`ownerSlot`).

### In scope

- One new server component, `src/components/observatory/BriefingChapter.tsx`,
  with a co-located CSS module `briefing-chapter.module.css` following
  `PulseChapter.tsx` / `pulse-chapter.module.css`'s established pattern (same
  dark editorial visual language — do not invent a second visual system).
- One new pure copy/logic module, `src/lib/observatory/briefing-copy.ts`
  (§3 below), independently unit tested with hand-computed fixtures.
- One new server component, `src/components/observatory/OwnerUtilityStrip.tsx`,
  with a co-located CSS module `owner-utility-strip.module.css` — the "owner
  utility including total value" `docs/PHASE10_UX_ARCHITECTURE.md` §4 places
  last in `/`'s hierarchy, wired into `ObservatoryShell`'s existing `ownerSlot`
  prop (already built in §1; no shell change needed).
- Rewiring `src/app/(depth-pull)/page.tsx`'s authenticated branch to render
  `ObservatoryShell` with `BriefingChapter` at the `pulse` chapter slot and
  the four chapters §3 already built (`ForcesChapter`, `StructureChapter`,
  `TimelineChapter`, `LabChapter`) reused unchanged at their existing slots.
- Before/after screenshots at 1440×900 and 390×844 (§8).

### Explicitly out of scope for this section (do not touch)

- `ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `ChapterFocusManager.tsx`,
  `chapters.ts`'s chapter list/ids/hrefs, or any shell navigation mechanics —
  all settled in §1 and already support `mode="private"` and `ownerSlot`
  exactly as this section needs them (confirmed by direct code read: `mode
  === "private" && ownerSlot` renders the slot after the stage, and `mode ===
  "public"` is the only thing gating the "Read-only" badge — no change
  required to either).
- `ForcesChapter.tsx`, `StructureChapter.tsx`, `TimelineChapter.tsx`,
  `LabChapter.tsx`, and their pure copy modules (`forces-copy.ts`,
  `structure-copy.ts`, `timeline-data.ts`) — reused at `/` **exactly as §3
  shipped them**, same dollar-safe props, zero new dollar content added to
  any of the four. `PRODUCT_DIRECTION.md`'s "Private chapters may add
  dollars..." is permissive, not mandatory, and `PHASE10.md` §4's Work list
  places the dollar addition specifically "after the briefing" (i.e. the
  owner-utility slot, not each reused chapter) — rebuilding four
  already-correct chapters with new private-only dollar variants is a much
  larger undertaking than this section's assigned slice and is deferred, not
  silently dropped: record it as a deferred item in the evidence doc (§8).
- `PulseChapter.tsx` and its two pure copy functions (`pulseLeadCopy`,
  `pulseDriverCopy`) — unchanged; `/share` keeps using them exactly as before.
  `BriefingChapter` is a new, separate component, not a private variant of
  `PulseChapter` (its question — "what changed / why / what deserves
  attention" — is genuinely different from Pulse's "market-relative result,"
  per `docs/PHASE10_UX_ARCHITECTURE.md` §4's route-specific hierarchies).
- `src/lib/dashboard-data.ts`'s computation logic — only *read* its existing
  fields (§2 below). No new `DashboardData` field is needed; every input
  this section's new copy module needs already exists on `DashboardData`.
- `SurfaceHeader.tsx`, `SurfaceActs.tsx`, `PortfolioOrrery.tsx`,
  `CountUpSettle.tsx`, `SurfaceGrowthChart.tsx`, `FlipCard.tsx`,
  `DepthPull.tsx` — `/` stops importing `SurfaceHeader`/`SurfaceActs` this
  section, which leaves the first five unused (`DepthPull` is still used
  elsewhere — verify with `grep -rl DepthPull src/app src/components` before
  assuming otherwise). **Do not delete any of these files or their tests
  this section** — removing genuinely dead code is a separate, later cleanup
  decision (analogous to how §2/§3 left the old dashboard components in
  place, unused by new chapters, without deleting them); deleting them here
  risks a broader diff than this section's bounded scope authorizes.
- The unauthenticated branch of `src/app/(depth-pull)/page.tsx` (the
  `LoginForm` sign-in view) — unchanged, byte-for-byte, from its current
  source. Security/privacy sits above product hierarchy in
  `PRODUCT_DIRECTION.md`'s decision order; there is no reason to touch
  working auth-gate code in a product-hierarchy section.
- `/dashboard`, `/share`, `/compare`, `/research`, `/history`, `/trades`,
  `/stock/[ticker]` — all out of scope; this section only adds *links* to the
  first four (already-existing, unmodified routes) and reuses `/stock/[ticker]`
  (already exists, dynamic per ticker) as an attention-item target. It does
  not add query-param filtering to any of them — none of the four support it
  today, and adding it is out of this section's scope (confirmed: no
  `searchParams` destructuring exists today in `src/app/research/page.tsx`,
  `src/app/trades/page.tsx`, `src/app/history/page.tsx`, or
  `src/app/dashboard/page.tsx`).

## 2. Data available (read-only; existing `DashboardData` fields)

`getDashboardData()` (already called by the current `/` page) already
provides every input this section needs — no new fetch, no new
`DashboardData` field:

- `dailyChangePct: number` — today's change, for "what changed."
- `movers: Mover[]` (`{ ticker, day, dayPct }`) — `.ticker` and `.dayPct`
  only for the briefing's copy/attention logic (never `.day`, a dollar
  amount, in the *briefing chapter's* own sentences — the owner-utility
  strip, §5, is the one place dollars are allowed this section).
- `pricesAsOf: string | null` — `null` means stale (same convention the
  shell's `freshness` prop and `/share` already use); pass
  `pricesStale = data.pricesAsOf === null`.
- `hhi: number` — for the concentration attention item, reusing
  `concentrationStatus`/`riskLine` exactly as §2/§3 already do (do not invent
  a second HHI-interpretation scheme).
- `upcomingEarnings: EarningsEvent[]` (`{ ticker, date, hour, epsEstimate,
  resolvedSymbol? }`) — `.ticker` and `.date` only for the earnings
  attention item.
- `totalValue: number`, `totalCost: number`, `simpleReturnPct: number` — for
  the owner utility strip only (§5). `simpleReturnPct` is already computed;
  do not recompute gain/return by hand (`CLAUDE.md`: "Simple return shown but
  clearly labeled" — reuse the existing labeled field, do not derive a new
  one from `totalValue - totalCost` and risk a labeling mismatch with
  wherever else `simpleReturnPct` is defined).
- `dailyChangeAsOf: string` — reused for the shell's existing `freshness`
  prop, exactly as `/share/page.tsx` already does (`freshness={{ label:
  "Prices as of", value: formatDate(data.dailyChangeAsOf), stale:
  data.pricesAsOf === null }}`). No change to this pattern.

One new server-side value, computed in `page.tsx` itself (not a new
`DashboardData` field, since it is a pure date computation with no query):

- `today: string` — `todayInTimeZone("America/New_York")` from
  `src/lib/date.ts`, the exact same call `dashboard-data.ts` already makes
  internally for its own "today" concept. Passed into `buildAttentionItems`
  (§3.2) so the earnings-window filter has a real, testable "now" without
  reaching for `Date.now()` inside a pure function.

## 3. Copy, selection, and visual rules (exact, deterministic, no LLM)

New module: `src/lib/observatory/briefing-copy.ts`.

### 3.1 "What changed" and "why"

**"What changed":** reuse `todayLine({ dayReturn: data.dailyChangePct })`
from `src/lib/surface-copy.ts` verbatim — do not write a new
today's-change sentence or a second "little changed" threshold. This is the
`BriefingChapter`'s lead sentence.

**"Why"** — a new pure function, since this is a different question than
anything `surface-copy.ts` already answers (Pulse's `pulseDriverCopy`
explains a multi-period benchmark-gap driver; this explains *today's*
driver):

```ts
export function briefingWhyCopy(
  movers: { ticker: string; dayPct: number }[],
): string | null
```

- `movers.length === 0` → `null` (omit the driver line entirely; do not
  render an empty sentence).
- Otherwise, `top = movers[0]` (already the largest-magnitude mover — same
  verified sort order §3.1 of the §3 spec already confirmed against
  `dashboard-data.ts`; do not re-sort). Return exactly:
  `` `${top.ticker} drove most of today's move, ${formatSignedPercent(top.dayPct, 1)}.` ``

### 3.2 "What deserves attention"

```ts
export type AttentionSeverity = "critical" | "notice";

export type AttentionItem = {
  id: string;
  text: string;
  href: string;
  severity: AttentionSeverity;
};

/** A single-day move at or above this magnitude is "notable" for the daily
 *  briefing. Deliberately higher than Pulse/Forces' 0.0015 materiality
 *  threshold (which flags any measurable period-return driver for
 *  commentary) — a daily briefing needs a higher bar so ordinary daily
 *  noise doesn't constantly read as "needs attention." */
export const BRIEFING_NOTABLE_MOVE_THRESHOLD = 0.03;

/** Earnings within this many days of "today" are attention-worthy for a
 *  daily/weekly briefing (docs/PHASE10_UX_ARCHITECTURE.md §4: "Daily/weekly
 *  market-relative briefing"). Events further out remain visible on
 *  /dashboard's existing earnings calendar, unaffected by this window. */
export const BRIEFING_EARNINGS_WINDOW_DAYS = 7;

const MAX_EARNINGS_ATTENTION_ITEMS = 3;

export function buildAttentionItems(input: {
  pricesStale: boolean;
  hhi: number;
  topMover: { ticker: string; dayPct: number } | null;
  upcomingEarnings: { ticker: string; date: string }[];
  today: string;
}): AttentionItem[]
```

Build the returned array in this **exact, fixed priority order** — never
reorder by severity or alphabetically, and never omit a satisfied condition
to make room for another:

1. **Stale prices.** If `input.pricesStale`, push exactly:
   `{ id: "stale-prices", text: "Prices are stale — showing the last known values.", href: "/dashboard", severity: "critical" }`
2. **High concentration.** If `concentrationStatus(input.hhi).tier ===
   "critical"`, push exactly:
   `{ id: "concentration", text: riskLine(input.hhi), href: "/dashboard", severity: "notice" }`
   (reuse `riskLine`'s existing critical-tier sentence — "Very concentrated
   — a few stocks drive most of the movement." — verbatim; do not write a
   new concentration sentence here, same reuse rule §3.2 of the §3 spec
   already established for `structureConcentrationCopy`.)
3. **Notable mover.** If `input.topMover !== null &&
   Math.abs(input.topMover.dayPct) >= BRIEFING_NOTABLE_MOVE_THRESHOLD`, push
   exactly:
   `{ id: "notable-move", text: \`${input.topMover.ticker} moved ${formatSignedPercent(input.topMover.dayPct, 1)} today.\`, href: \`/stock/${input.topMover.ticker}\`, severity: "notice" }`
4. **Upcoming earnings.** Filter `input.upcomingEarnings` to entries where
   `event.date >= input.today && event.date <= addDays(input.today,
   BRIEFING_EARNINGS_WINDOW_DAYS)` (import `addDays` from `@/lib/date`; ISO
   `YYYY-MM-DD` strings compare correctly with `>=`/`<=`). Sort the matches
   ascending by date (soonest first) and take at most
   `MAX_EARNINGS_ATTENTION_ITEMS`. For each surviving event, push:
   `{ id: \`earnings-${event.ticker}\`, text: \`${event.ticker} reports earnings ${formatDate(event.date)}.\`, href: \`/stock/${event.ticker}\`, severity: "notice" }`

If none of the four conditions are satisfied, return `[]` — `BriefingChapter`
must render an explicit positive fallback sentence in that case (§4 below),
never a silently empty section with a dangling heading.

### 3.3 `BriefingChapter` composition (portfolio-ux: editorial marginalia, not a notification list)

Five-course shape, matching Pulse/Forces/Structure/Timeline's established
pattern:

- **Eyebrow:** `"Owner briefing"` (distinct from Pulse's `"Market-relative
  observation"` — same chapter slot, different route identity).
- **Lead:** `todayLine(...)` output (§3.1).
- **Driver ("why"):** `briefingWhyCopy(...)` output, when non-null (§3.1).
- **Attention section:** a heading (`"What deserves attention"`) followed by
  `buildAttentionItems(...)`'s results (§3.2), each item rendered as one
  marginal annotation — the item's `text` as a real sentence, wrapped in a
  real `<a href={item.href}>` (the whole sentence is the link target, not a
  separate "→" affordance bolted onto plain text — this is evidence
  marginalia in the Field Journal sense, not a notification list with badges
  or dots). Precede `critical`-severity items' visible text with the literal
  word `"Critical: "` and `notice`-severity items with `"Notice: "` — text
  labels, never color alone, per
  `docs/PHASE10_UX_ARCHITECTURE.md` §9's accessibility contract. When
  `buildAttentionItems(...)` returns `[]`, render exactly
  `"Nothing needs your attention right now."` in place of the list (plain
  text, not a link).
- **Continuation:** a real link to Forces — `observatoryChapterHref("/",
  "forces")` (same pattern `PulseChapter` already uses for `/share`, just
  based at `/`).

No `<details>` expert-detail disclosure is required for this chapter — it is
a briefing, not a data table; `PHASE10.md` §4's acceptance criteria do not
require one, and inventing one would add scope this section doesn't need.

## 4. `OwnerUtilityStrip` (portfolio-ux: quiet, subordinate, after the story)

New component, rendered only via `ObservatoryShell`'s existing `ownerSlot`
prop (already positioned after the chapter stage and before
`ChapterFocusManager` — confirmed by direct code read of
`ObservatoryShell.tsx`; no shell change needed).

```ts
export type OwnerUtilityStripProps = {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
};
```

Content, in this order:

1. Three plain-text stats, small type, muted relative to the chapter plate's
   body text (per the skill's "quiet... subordinate" and "avoid... badges"
   guidance — no card, no border box, no large numerals competing with the
   plate above it): `"Total value"` (`formatCurrency(totalValue)`),
   `"Total cost"` (`formatCurrency(totalCost)`), and `"Simple return"`
   (`formatSignedPercent(simpleReturnPct, 1)`) — label every value with its
   name in visible text (never an unlabeled bare number), matching
   `CLAUDE.md`'s "Simple return shown but clearly labeled" rule exactly.
2. Four real links, each at least 44×44 CSS pixels, to the existing private
   routes: `"Open the full dashboard"` → `/dashboard`, `"Record a trade"` →
   `/trades`, `"Research"` → `/research`, `"History"` → `/history`.

No client-side animation (e.g. `CountUpSettle`) is required or expected —
keep this a server component with static formatted text, consistent with
every other Observatory chapter/region shipped so far (§1–§3 established
"server component unless a specific disclosure genuinely requires client
interactivity"; a static utility strip does not).

## 5. Required work — file-level guidance

- `src/app/(depth-pull)/page.tsx`: keep the existing unauthenticated
  `LoginForm` branch byte-for-byte unchanged. In the authenticated branch,
  replace the `<SurfaceHeader variant="private" /><SurfaceActs ... />` pair
  with:
  - Compute `today = todayInTimeZone("America/New_York")` (import from
    `@/lib/date`).
  - Render `ObservatoryShell` with `mode="private"`, `basePath="/"`,
    `activeChapterId` from `resolveObservatoryChapter(searchParams.chapter)`
    (same pattern `/share/page.tsx` already uses — add the `searchParams`
    prop to this page's signature the same way), `title="Portfolio
    Observatory"`, the same `freshness` shape `/share` uses (label `"Prices
    as of"`, `formatDate(data.dailyChangeAsOf)`, `stale: data.pricesAsOf ===
    null`), `ownerSlot={<OwnerUtilityStrip .../>}`, and `chapterContent`
    with `pulse` mapped to the new `BriefingChapter` and `forces` /
    `structure` / `timeline` / `lab` mapped to the exact same component
    calls `/share/page.tsx` already makes (same prop slices, same data
    source — `getDashboardData()` is already called once per request; do
    not fetch it twice).
  - `getPublicTimelineData()` (needed for Timeline, exactly as `/share`
    needs it) must also be called here — reuse it as-is; it has no
    dollar-bearing fields to begin with (confirmed by its §3 spec), so
    calling it from a private route introduces no new privacy surface.
- `src/components/observatory/BriefingChapter.tsx` +
  `briefing-chapter.module.css`: new, per §3.3.
- `src/lib/observatory/briefing-copy.ts`: new, per §3.1/§3.2, independently
  unit tested with hand-computed fixtures.
- `src/components/observatory/OwnerUtilityStrip.tsx` +
  `owner-utility-strip.module.css`: new, per §4.
- No changes to `src/app/share/full/page.tsx`, `src/lib/dashboard-data.ts`,
  `src/lib/observatory/chapters.ts`, `src/lib/observatory/timeline-data.ts`,
  `src/components/observatory/{ObservatoryShell,ChapterOrbit,ChapterFocusManager,ForcesChapter,StructureChapter,TimelineChapter,LabChapter,PulseChapter}.tsx`,
  or `src/lib/surface-copy.ts`.

## 6. Acceptance criteria

### Behavioral

1. An authenticated visit to `/` shows, in the first-loaded chapter (Pulse
   slot / `BriefingChapter`), in order: what changed today, why (when a
   driver exists), and what deserves attention (or the explicit "nothing
   needs attention" fallback) — before any dollar figure or action link
   (`OwnerUtilityStrip` renders only after the chapter stage, per the
   shell's existing `ownerSlot` placement).
2. `data.totalValue` is present on the page (in `OwnerUtilityStrip`) but is
   not the largest, first, or most visually dominant element — it does not
   lead the page.
3. Every attention item's link lands on a real, already-existing route
   (`/dashboard` or `/stock/<ticker>`) that shows content relevant to that
   item (concentration/staleness → the general deep dashboard; a notable
   mover or upcoming earnings → that ticker's own detail page).
4. Forces, Structure, Timeline, and Lab render at `/` with the exact same
   real, non-crashing content §3 already proved for `/share` (verified by
   checking each reused component receives the same prop shape from
   `data`/`timeline` this section's `page.tsx` computes — not a new
   behavioral test suite, since their behavior is already covered by §3's
   tests).
5. Unauthenticated `/` is byte-identical to its current source (the
   `LoginForm` sign-in view) — confirmed by diffing that branch's rendered
   output against the pre-section baseline.
6. `buildAttentionItems` degrades gracefully with no stale flag, low
   concentration, no live movers, and no near-term earnings: returns `[]`,
   and `BriefingChapter` shows the exact fallback sentence, not a crash, not
   an empty heading with nothing under it.

### Visual

7. `BriefingChapter` and `OwnerUtilityStrip` use the same dark editorial
   visual language as Pulse/Forces/Structure/Timeline/Lab — no new visual
   system, no card grid, no badge/pill/notification-dot styling for
   attention items (each renders as a linked sentence, per §3.3).
8. `OwnerUtilityStrip` is visually subordinate to the chapter plate above it
   — smaller type scale, muted tone, no competing large numerals — verified
   by direct visual inspection of the captured screenshot, not merely by
   DOM order.
9. 1440×900 before (today's `SurfaceHeader`/`SurfaceActs` hero) and after
   (this section's `BriefingChapter` + shell) screenshots exist under
   `docs/phase10-baseline/section-4/`.

### Mobile

10. 390×844 shows the briefing lead, driver, attention list, and
    continuation link with no horizontal page overflow
    (`document.documentElement.scrollWidth === clientWidth`, verified live).
11. `OwnerUtilityStrip`'s four action links and every attention-item link
    are each at least 44×44 CSS pixels and do not visually crowd the
    shell's existing chapter navigation.
12. 390×844 before/after screenshots exist under
    `docs/phase10-baseline/section-4/`.

### Accessibility

13. Exactly one `h1` per page load (unchanged shell contract — confirm
    `BriefingChapter`/`OwnerUtilityStrip` introduce no second one).
14. Every attention-item link and every `OwnerUtilityStrip` action link is
    reachable and operable by keyboard (Tab + Enter) with a visible focus
    outline, reusing the shell's existing focus-visible pattern.
15. Critical/notice severity is expressed in visible text (`"Critical: "` /
    `"Notice: "` prefixes) — verify this appears in the rendered markup, not
    only in CSS class names or color.
16. Reduced motion and the shell's existing no-3D static fallback continue
    to pass — confirm `observatory-fallback.test.ts` still passes
    unmodified (this section adds no new motion).

### Tests

17. New unit tests for `briefingWhyCopy` covering: a top mover present, and
    an empty `movers` array (returns `null`).
18. New unit tests for `buildAttentionItems` covering: all four conditions
    false (`[]`), each condition true individually, all four true together
    (verifying the exact fixed priority order from §3.2), more than
    `MAX_EARNINGS_ATTENTION_ITEMS` qualifying earnings events (verifying the
    cap and the ascending-date ordering), and an earnings event exactly at
    the `BRIEFING_EARNINGS_WINDOW_DAYS` boundary and one day past it
    (boundary-inclusive vs. excluded).
19. A new test for the rewired `/` page (new file, `src/app/(depth-pull)/page.test.tsx`,
    following `src/app/(depth-pull)/share/page.test.tsx`'s exact mocking
    convention) asserting: the unauthenticated branch is unchanged; the
    authenticated branch renders `BriefingChapter`'s content, all four
    reused chapters via `?chapter=`, and `OwnerUtilityStrip`'s total
    value/cost/return; the "nothing needs attention" fallback renders when
    no attention condition is met.
20. Full existing suite remains green — no existing test weakened, skipped,
    or deleted (this includes any existing `SurfaceActs`/`SurfaceHeader`
    tests, which stay as-is since those components are not deleted this
    section, per §1's out-of-scope list).

### Build

21. `npm run build` passes with no new build-time network dependency.
22. No new client-bundle dependency; `BriefingChapter` and
    `OwnerUtilityStrip` are server components (§3.3/§4 — no disclosure
    toggle in either needs client JS).
23. Performance stays within the §1 CSS-3D decision's recorded budgets (no
    new long-task/bundle regression attributable to `/`'s route-owned
    content).

### Privacy

24. `/` still gates behind `isValidSession` exactly as before — confirmed
    live, logged-out, zero-cookie request returns the sign-in form, not the
    Observatory shell or any owner data.
25. None of `BriefingChapter`'s or `buildAttentionItems`'s output contains a
    dollar amount — checkable directly from `briefing-copy.ts`'s function
    signatures (no dollar-bearing field is ever passed in) and from
    `BriefingChapter`'s prop type.
26. `OwnerUtilityStrip`'s dollar content (`totalValue`, `totalCost`) never
    reaches `/share` — confirmed by the fact that `/share/page.tsx` is
    untouched this section and never imports `OwnerUtilityStrip`.
27. `/share`'s existing zero-dollar-leak privacy tests (from §2/§3) still
    pass unmodified — this section makes no change to `/share/page.tsx` or
    any component it imports.

## 7. New test files (minimum)

- `src/lib/observatory/briefing-copy.test.ts`
- `src/app/(depth-pull)/page.test.tsx` (new — confirmed via §1's earlier
  `find` that no `page.test.tsx` exists anywhere under
  `src/app/(depth-pull)/` today except `share/page.test.tsx`)

## 8. Evidence to capture and commit

- `docs/phase10-baseline/section-4/README.md`: before (today's
  `SurfaceHeader`/`SurfaceActs` hero at `/`) and after (this section's
  `BriefingChapter` + reused chapters + `OwnerUtilityStrip`) 1440×900 and
  390×844 screenshots, console warning/error count, and the privacy/auth
  gating check for `/` (logged out and logged in).
- Record the deferred item explicitly: Forces/Structure/Timeline/Lab are
  reused at `/` without new private-only dollar content this section (§1's
  out-of-scope list) — note this as a conscious, bounded deferral, not an
  oversight, per `PHASE10.md`'s "Required final report" item 9 convention.
- Record real numbers, not placeholders — if a screenshot cannot be captured
  for a stated reason, say so explicitly rather than omitting the
  requirement silently (same convention §2/§3's evidence docs established).
