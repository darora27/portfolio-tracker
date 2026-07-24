# Phase 10 §2 — `/share` Pulse vertical slice

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `PRODUCT_DIRECTION.md`
→ `PHASE10.md` §2 → `docs/PHASE10_UX_ARCHITECTURE.md` → this document. This
document exists to make those three concrete and checkable for this one
section; it does not override them.

## 1. Scope — the smallest complete vertical slice

Replace the current Phase 9 `/share` landing (`SurfaceHeader` + `SurfaceActs`,
led by an isolated TWR-percent hero number) with the production Observatory
shell (`src/components/observatory/ObservatoryShell.tsx`, built in §1) mounted
at `/share`, with **real, live data wired into the Pulse chapter only**. Pulse
becomes the default chapter (`?chapter=pulse` or no `chapter` param).

The other four chapters (Forces, Structure, Timeline, Lab) are **not** built in
this section. `PHASE10.md` assigns them to §3. Leave `chapterContent` for
`forces` / `structure` / `timeline` / `lab` unset in the `/share` page's props
so `ObservatoryShell`'s own existing default (`"This chapter's content ships
in a later Phase 10 section."`) renders for them — this is the shell's
documented behavior (`ObservatoryShell.tsx` lines 58–59) and already the
precedent the §1 preview route (`/dev/observatory-shell`) established. Do not
write new placeholder copy for those four chapters; do not build any Forces/
Structure/Timeline/Lab content, even partial.

### In scope

- `src/app/(depth-pull)/share/page.tsx`: rewritten to mount `ObservatoryShell`
  with real portfolio data for Pulse.
- A new Pulse chapter content component (public/read-only) under
  `src/components/observatory/`.
- New pure copy/selection functions (see §3) for the market-relative lead
  sentence and the main-driver sentence, unit-tested.
- A trajectory visual (portfolio vs. VOO, same funded-history window as
  today's `chartData`) with a genuine text/data alternative — this does not
  exist anywhere in the codebase today (see §3.4).
- A working, real link/control from Pulse to the Forces chapter
  (`observatoryChapterHref("/share", "forces")`), landing on the shell's own
  placeholder — that placeholder view is correct and expected for this
  section, not a defect.
- New privacy regression test(s) for the rebuilt `/share` (see §6).
- Before/after screenshots at 1440×900 and 390×844 (see §7).

### Explicitly out of scope for this section (do not touch)

- `src/app/share/full/page.tsx` — untouched, byte-identical. `PHASE10.md` §3
  owns the `/share/full` disposition decision.
- `src/app/(depth-pull)/page.tsx` (private `/`), `SurfaceActs.tsx`,
  `SurfaceHeader.tsx` — still actively used by private `/` (confirmed by
  direct read: `/` imports both and is not part of this section).
  `PHASE10.md` §4 owns rebuilding `/`. Do not delete, rename, or refactor
  these files even though `/share` stops importing them — they remain live
  production code for `/`.
- Composition/concentration/today's-mover ("What I own" / "How risky is it" /
  "Today" flip cards), the Orrery, and the existing vs.-market growth-chart
  toggle on the old Act 2/3 — this content is not deleted; it remains
  reachable, unchanged, at `/share/full`. It is deferred to §3's
  Forces/Structure chapters, not this section. Do not invent new Pulse-chapter
  UI to re-house it early.
- Any Forces/Structure/Timeline/Lab content, even a stub beyond the shell's
  own existing default.
- `src/lib/dashboard-data.ts`'s computation logic — only *read* its existing
  fields (see §3). Do not add new fields to `DashboardData` unless a required
  Pulse computation is genuinely impossible from what it already returns (it
  is not — see §3).
- Any change to `src/app/(depth-pull)/layout.tsx` or `DepthPullProvider`
  scoping (settled in §1).

## 2. Data available (read-only; no new `DashboardData` fields needed)

All of the following already exist on `getDashboardData()`'s return value
(`src/lib/dashboard-data.ts`) and are sufficient for this section:

- `twrPct` — portfolio TWR over the full funded-snapshot history.
- `benchmarkComparisons: BenchmarkComparison[]` — find the entry with
  `ticker === "VOO"`. `.available` is `false` when VOO's close history
  doesn't cover every funded-history date (do not treat this as a crash or a
  zero; see §3.2). When `.available`, `.excessReturnPct` is portfolio TWR
  minus VOO TWR over the *same* funded-history window (`portfolioTwrPct -
  benchmarkTwrPct`) — this already satisfies `PRODUCT_DIRECTION.md`'s
  same-period comparison rule; do not compute your own alternate gap.
- `historyDays` — calendar days from the first funded snapshot to today.
- `pricesAsOf` — the latest known price date (`string | null`); `null` only
  when no price data exists at all.
- `dailyChangeAsOf` — `pricesAsOf ?? today`, already the existing "prices as
  of" badge convention used elsewhere in this codebase.
- `chartData: ChartPoint[]` — `{ date, portfolioIndex, vooIndex?, ... }`,
  indexed to 100 at the first funded date, one entry per funded-history date.
  This is the exact same series the current `SurfaceGrowthChart` renders.
- `positionRows: PositionRow[]` — each has `.ticker` (string) and
  `.contribution: number | null` (= `gain / totalCost`, i.e. this holding's
  share of total portfolio return — already the "contribution to return"
  field `CLAUDE.md` §1 requires). **Never read `.value`, `.gain`,
  `.costBasis`, `.price`, `.day`, `.prevClose` (dollar/price fields) from this
  section's public Pulse code path** — only `.ticker` and `.contribution`.

## 3. Copy and selection rules (exact, deterministic, no LLM)

Add these as new pure, synchronous, unit-tested functions. Extending
`src/lib/surface-copy.ts` is the natural home (it already has
`weeklySubline`/`todayLine`/`riskLine` with the same shape and the banned-word
list they must also respect); a new co-located module
(`src/lib/observatory/pulse-copy.ts`) is also acceptable — either way, the
function signatures and behavior below are the acceptance criteria, not the
file location.

### 3.1 Window label

`windowLabel(firstFundedDate: string): string` → `` `since ${formatDate(firstFundedDate)}` `` using the
existing `formatDate` from `src/lib/format.ts`. `firstFundedDate` is
`chartData[0]?.date` (equivalently `mathSnapshots[0].date` internally to
`dashboard-data.ts` — reachable from the page via `chartData[0].date`).

### 3.2 Lead sentence

```ts
type PulseLeadInput = {
  historyDays: number;
  portfolioTwrPct: number;
  benchmark: { available: boolean; twrPct: number | null; excessReturnPct: number | null };
  windowLabel: string;
};
function pulseLeadCopy(input: PulseLeadInput): string
```

Insufficient-history / benchmark-unavailable state (`historyDays < 14` OR
`!benchmark.available`): return exactly
`"Building the market-relative picture — a full comparison needs more trading history."`
(consistent with this codebase's existing fallback pattern, e.g. `SharePage`'s
current `"Building this week's picture."`). `14` is this section's own
explicit threshold (there is no existing precedent for a TWR-vs-benchmark
minimum window) — implement exactly `14`, not an approximation.

Otherwise, reuse the exact direction/magnitude/tie conventions already
established in `src/lib/surface-copy.ts` (`directionWord`, `magnitude`,
the `0.0015` tie epsilon — call it `GAP_TIE_THRESHOLD` if extracted, do not
invent a different epsilon):

- `gapPct = benchmark.excessReturnPct!`
- `gapWord`: `|gapPct| < 0.0015` → `"even with"`; `gapPct > 0` → `"a
  <magnitude(gapPct)>-point lead over"`; `gapPct < 0` → `"a
  <magnitude(gapPct)>-point gap behind"`.
- Sentence: `` `Since ${windowLabel}, the portfolio is ${directionWord(portfolioTwrPct)} ${magnitude(portfolioTwrPct)} while VOO is ${directionWord(benchmark.twrPct!)} ${magnitude(benchmark.twrPct!)} — ${gapWord} the market.` ``
  matching `PRODUCT_DIRECTION.md`'s worked example structure ("Since June 24,
  the portfolio is down 2.8% while VOO is up 1.7% — a 4.6-point gap.").
  When `|gapPct| < 0.0015`, render:
  `` `Since ${windowLabel}, the portfolio is ${directionWord(portfolioTwrPct)} ${magnitude(portfolioTwrPct)}, about even with VOO.` ``
  (no "lead"/"gap behind" clause when there is effectively no gap).

### 3.3 Driver sentence

```ts
type PulseDriverInput = {
  historyDays: number;
  benchmarkAvailable: boolean;
  gapPct: number | null; // benchmark.excessReturnPct
  positions: { ticker: string; contribution: number | null }[];
};
function pulseDriverCopy(input: PulseDriverInput): string | null
```

Returns `null` (render nothing, not an empty string, not a fallback sentence
— the lead sentence's own fallback already covers the insufficient-history
case) when `historyDays < 14` or `!benchmarkAvailable` or `gapPct === null`.

Otherwise:

- `MATERIALITY_THRESHOLD = 0.0015` (same constant/value as the lead
  sentence's tie epsilon — reuse it, do not define a second unrelated number).
- `drags` = positions with `contribution !== null && contribution <=
  -MATERIALITY_THRESHOLD`, sorted ascending by `contribution` (most negative
  first).
- `boosts` = positions with `contribution !== null && contribution >=
  MATERIALITY_THRESHOLD`, sorted descending by `contribution` (most positive
  first).
- If `drags.length === 0 && boosts.length === 0`: return
  `"No single holding drove most of the result."`
- If `gapPct <= 0` (portfolio trails or ties): name up to the top 2
  `drags` tickers joined with `" and "` as the primary cause:
  `` `Most of the shortfall came from ${namedTickers}.` `` (use `"the largest drag came from ${ticker}"` phrasing instead of "Most of the shortfall" when only one drag ticker exists — i.e. singular: `` `The largest drag came from ${drags[0].ticker}.` ``, plural: `` `Most of the shortfall came from ${drags[0].ticker} and ${drags[1].ticker}.` ``).
  If `boosts.length > 0`, append a second sentence naming only the single
  largest boost: `` ` ${boosts[0].ticker} offset part of it.` ``
  If `drags.length === 0` (gap is negative/flat but no individual holding
  crossed the materiality threshold on the downside), skip straight to the
  "no single holding" sentence above instead of naming a boost as if it were
  a cause of a shortfall.
- If `gapPct > 0` (portfolio leads): symmetric wording, positive framing:
  singular `` `The largest gain came from ${boosts[0].ticker}.` ``, plural
  `` `Most of the lead came from ${boosts[0].ticker} and ${boosts[1].ticker}.` ``,
  with an optional appended drag clause: `` ` ${drags[0].ticker} offset part of it.` ``

This function must never read or expose a dollar amount, share count, or
price — only `ticker` and `contribution` (a fraction), matching §2's data
rule above.

### 3.4 Trajectory visual text/data alternative

Direct read of `src/components/surface/SurfaceGrowthChart.tsx` confirms it
today has **zero** text takeaway and **zero** accessible data/table path — it
is an unlabeled Recharts SVG with a mouse-only tooltip. `PHASE10.md` §2's
Accessibility criterion ("semantic chart takeaway") and
`docs/PHASE10_UX_ARCHITECTURE.md` §9's cross-route contract ("Charts include
a concise text takeaway and an accessible data/table path") are not met by
reusing it as-is. Whichever chart component Pulse uses (the existing one
extended, or a new Pulse-specific one) must add, at minimum:

- One visible sentence-level takeaway near the chart (the lead sentence from
  §3.2 already serves as this — an additional separate takeaway is not
  required if the lead sentence is positioned adjacently to the chart).
- A real accessible data path: either (a) a visually-available `<table>`
  (may be inside a native `<details>`/disclosure so it doesn't dominate the
  layout, but must not be `display: none` / `aria-hidden` when expanded, and
  the toggle must be a real labeled button) listing date + portfolio index +
  VOO index for a bounded, deterministic sample (first date, last date, and
  every Nth date such that at most ~20 rows render — exact N is
  implementation's choice, but it must be deterministic, not random), or (b)
  an `aria-label`/adjacent visually-hidden text summary stating the start
  value, end value, and direction. Either satisfies the criterion; pick one
  and implement it completely — do not leave a partial version of both.

## 4. Required work — file-level guidance

- `src/app/(depth-pull)/share/page.tsx`: call `getDashboardData()` as today;
  resolve the active chapter from `searchParams.chapter` via
  `resolveObservatoryChapter`; render `ObservatoryShell` with `mode="public"`,
  `basePath="/share"`, `title="Portfolio Observatory"` (matching the §1
  preview route's established title), `freshness={{ label: "Prices as of",
  value: formatDate(data.dailyChangeAsOf), stale: data.pricesAsOf === null
  }}`, and `chapterContent={{ pulse: <PulseChapter ... /> }}` only (no other
  keys).
- New component (suggested: `src/components/observatory/PulseChapter.tsx`):
  server component (no client state required for §2's content), takes the
  narrow slice of `DashboardData` it needs as props (not the whole object —
  keep the dollar-bearing fields out of this component's prop type entirely
  so it is structurally impossible for it to render them), renders the lead
  sentence, the driver sentence (when non-null), the trajectory chart +
  alternative, and a real link to Forces using
  `observatoryChapterHref("/share", "forces")` (a plain `<a>`/`Link`, not a
  span — it must be a real, keyboard-operable, focus-visible control per
  `PHASE10.md`'s Accessibility criterion).
- `src/lib/surface-copy.ts` (or `src/lib/observatory/pulse-copy.ts`): add
  `pulseLeadCopy` and `pulseDriverCopy` per §3, each independently unit
  tested with hand-computed fixtures (not snapshot tests).
- Keep `SurfaceHeader`/`SurfaceActs` imports out of the rewritten
  `/share/page.tsx` entirely (Pulse's job fully replaces Act 1–3 for `/share`
  specifically; they remain imported by `/`, untouched).

## 5. Acceptance criteria

### Behavioral

1. Loading `/share` with no `chapter` query param renders the Pulse chapter
   by default (same default behavior `resolveObservatoryChapter` already
   guarantees).
2. The lead sentence names the result, the benchmark comparison, and the gap
   direction/magnitude per §3.2, using real `getDashboardData()` output — no
   hardcoded or placeholder numbers.
3. The driver sentence per §3.3 appears directly under/near the lead sentence
   whenever it is non-`null`, and is omitted (not rendered as an empty
   element) when `null`.
4. The window and freshness (§4's `freshness` prop) are both visible in the
   same first viewport as the lead sentence.
5. A real, working link/control from Pulse reaches the Forces chapter
   (`?chapter=forces`), landing on the shell's existing default placeholder —
   this is expected, not a defect, for this section.
6. Insufficient-history state (`historyDays < 14` or VOO benchmark
   unavailable): the lead sentence's fallback text renders, the driver
   sentence is omitted, and the page does not crash, show `NaN`, or show a
   zero standing in for missing data.
7. Read-only/public state is visible (the shell's existing `Read-only` badge
   in `mode="public"`, already implemented in §1 — no new work required here
   beyond passing `mode="public"`).

### Visual

8. No account dollar value or an isolated giant KPI leads the page — the
   lead sentence (text) is the dominant first-viewport element, per
   `PRODUCT_DIRECTION.md` principle 1 and the non-goal "No account-value hero
   on `/share`."
9. Exactly one trajectory visual renders in the Pulse chapter (not the old
   Act 2 chart *and* a new one).
10. 1440×900 before (current production `/share`) and after (this section's
    `/share`) screenshots are captured and committed under
    `docs/phase10-baseline/section-2/`.

### Mobile

11. 390×844 shows the same lead sentence, driver sentence, freshness, and
    Forces continuation within the first viewport, with no horizontal page
    overflow (`document.documentElement.scrollWidth === clientWidth`,
    verified live, not assumed).
12. The Forces continuation control is at least 44×44 CSS pixels.
13. 390×844 and 1440×900 screenshots both exist under
    `docs/phase10-baseline/section-2/`.

### Accessibility

14. Exactly one `h1` on `/share` (already guaranteed by `ObservatoryShell`;
    confirm the new Pulse content does not introduce a second one).
15. The trajectory visual has a working text/data alternative per §3.4 — not
    merely planned, actually present and reachable by keyboard if it is a
    disclosure.
16. The Forces continuation link is reachable and operable by keyboard
    (Tab + Enter) and has a visible focus outline against the dark surface
    (reuse the shell's existing focus-visible pattern; do not introduce a new
    one).
17. Reduced motion and the shell's existing no-3D static fallback continue to
    pass (this section adds no new motion; confirm the existing
    `observatory-fallback.test.ts` suite still passes unmodified — do not
    weaken it to make Pulse's content fit).

### Tests

18. New unit tests for `pulseLeadCopy` covering: a clear lead, a clear
    trailing gap, a within-epsilon tie, and the insufficient-history/
    unavailable-benchmark fallback — each against a hand-computed fixture
    value, not a recorded snapshot.
19. New unit tests for `pulseDriverCopy` covering: single drag only, multiple
    drags with an offsetting boost, single boost only (leading case),
    below-materiality-threshold positions that must not be named, and the
    "no single holding" fallback.
20. A new privacy regression test for `/share`'s rendered output (see §6)
    passes.
21. Full existing suite remains green (no existing test is weakened,
    skipped, or deleted to make this section's tests pass).

### Build

22. `npm run build` passes with no new build-time network dependency
    introduced (no new font, no new external script).
23. No new client-bundle dependency is added; the Pulse chapter content is a
    server component unless a specific interaction (e.g. the data-table
    disclosure toggle) genuinely requires client interactivity, in which case
    only that specific disclosure control may be a client component.

### Privacy

24. A new automated regression test asserts the rendered `/share` HTML for
    an unauthenticated request contains zero matches of the pattern
    `/\$\d[\d,]*\.\d{2}\b/` (the same strict-currency convention already used
    in the §0/§1 evidence docs, chosen specifically to avoid false-positiving
    on React Server Component's own generic `$`-prefixed reference tokens).
25. The same test (or a sibling test) asserts the rendered output contains no
    owner-only marker text (e.g. does not render any element with the shell's
    `ownerSlot` content, and `/share`'s page never passes an `ownerSlot`
    prop at all) and does not include any trade `reason` text, research data,
    or simulation results (none of these are used by Pulse's data path per
    §2, so this is a structural guarantee to lock in with a test, not new
    plumbing to build).
26. `PulseChapter`'s prop type is confirmed (by direct code read during
    review) to exclude every dollar/price-bearing field (`value`, `gain`,
    `costBasis`, `price`, `day`, `prevClose`, `totalValue`, `totalCost`,
    `dailyChange`, `realizedGain`, `unrealizedGain`, `xirrPct` is fine to
    keep excluded too since Pulse doesn't need it) from its own prop
    signature — this is checkable directly from the component's TypeScript
    type, not just from what happens to render today.

## 6. New test files (minimum)

- `src/lib/surface-copy.test.ts` (extend the existing file if
  `pulseLeadCopy`/`pulseDriverCopy` land there) or a new co-located
  `*.test.ts` next to wherever they're defined, covering §5.18–19.
- A new test exercising the rendered `/share` page output for the privacy
  assertions in §5.24–26 (e.g. `src/app/(depth-pull)/share/page.test.tsx`, or
  a route-level test consistent with however this codebase already tests
  page output elsewhere — check for an existing pattern before inventing a
  new one).

## 7. Evidence to capture and commit

- `docs/phase10-baseline/section-2/README.md`: before (current production
  `/share`) and after (this section's `/share`) 1440×900 and 390×844
  screenshots, console warning/error count, and the privacy test result.
- Record real numbers, not placeholders — if a screenshot cannot be captured
  for a stated reason, say so explicitly (matching this project's existing
  evidence-doc convention) rather than omitting the requirement silently.
