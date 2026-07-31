# Phase 10 §14 specification: The Chart Room, stage one — the page

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

Design proof: `docs/phase10-workflow/design-proofs/section-14.md`
Acceptance ledger: `docs/phase10-workflow/acceptance/section-14.json`

Authority: `PHASE10.md` §14 (this section's own roadmap scope) →
`UNIVERSE_STOCK_LAB.html` (repo root, the fully-specified mock) →
`OWNER_FEEDBACK_LEDGER.md` FB-13 (four owner reports, the promotion ruling).
**§15 is a separate section** (Mission Control content rework, plus the
Chart Room's stage two — the doors) and nothing in this document authorizes
touching it, `MISSION_CONTROL_ARCHITECTURE.md`, or any Mission Control
component.

---

## 0. The ledger board

Per `OWNER_FEEDBACK_LEDGER.md` rule 2: every open/designed row is marked
scheduled-here, scheduled-§n, or deferred with owner initials.

| ID | Status at spec time | Disposition |
|---|---|---|
| `FB-13` | designed (Chart Room, four reports, his words *"I just want that to be implemented at some point"*) | **scheduled here — stage one only.** Stage two (a HOLDINGS row click, an ORBITS ring/blip click, `FULL ANALYSIS ▸`) is bound to §15 by `PHASE10.md`'s own text and is what actually closes this row; this section cannot close it alone |
| `FB-01` | open · "nearly there," proportions confirmed, one more nudge | **not this section** — the nudge shipped in §13 (`orrery.ts` gap coefficient, `scene-model.ts` belt span); row stays open only because it closes on his sentence, not on capture. No universe-scene code is touched here |
| `FB-02` | designed, background | **not this section** — the five moves shipped in §13; awaiting his sentence + before/after pair, already captured |
| `FB-05` | open · "still needs to be a bit bigger," 6th report, language softened | **not this section** — the `--type-label` bump to 12px shipped in §13; this section's own new type-role map (`VIS-08`) starts from that already-shipped 12px floor, does not reopen the ramp |
| `FB-17` | open · picked 600px, live/capture gap unresolved | **not this section** — the default shipped in §13; the live/capture investigation is recorded as unresolved (non-reproducible under Playwright's viewport option) and is not this section's work |
| `FB-23` | open, sun chip anchoring | **not this section** — shipped in §13 (`sunTelemetryRef`), universe-scene only, no Chart Room surface |
| `FB-24` | open, moon click behavior | **not this section** — shipped in §13 (`isUsableNewsUrl` filter fix), universe-scene only |
| `FB-25` | open, planet panel content | **not this section** — shipped in §13 (`PlanetDetail.tsx` CONTRIB/VS VOO stats), universe-scene only. Distinct from this section's THE COMPANY/CONTRIBUTION benches, which are a new full-page surface, not the planet panel |
| `FB-26` | open · high, trail/direction daily encoding | **not this section** — shipped in §13, universe-scene only |
| `FB-12` | parked by owner, explicitly deprioritized | **not this section** — unchanged |
| `FB-16` | designed, XLK hollow-core system | **not this section** — scheduled `§13′`, a distinct future item |
| `FB-18`, `D1`, `D3` | needs-owner / held | **not this section** — parked, unchanged |
| `FB-21` | designed, ledger-bookkeeping gap only | **not this section** — already shipped in §12a, no Chart Room surface touches it |
| `FB-27`, `FB-28`, `FB-29`, `FB-30`, `FB-32`, `FB-33`, `FB-35` | designed (`MISSION_CONTROL_ARCHITECTURE.md` §4–§6) | **not this section — scheduled §15** by `PHASE10.md`'s own text (each row's own "next section" disposition, written when §14/§15 were a single combined section, now resolved to §15 by the split ruling) |
| `FB-10`, `FB-19`, `FB-20`, `FB-22`, `FB-31`, `FB-03`, `FB-04`, `FB-06`–`FB-09`, `FB-14`, `FB-34` | already closed/retired/resolved | no disposition needed — not open/designed |
| `D2` | open · general, "the website is still relatively confusing" | **not this section** — tracked via `FB-05` (its row's own disposition, "subsumed rows close"); `FB-05` itself is "not this section" above (shipped in §13, awaiting his sentence). This section's own new surface doesn't add confusion (it's a reuse of already-established observatory grammar, per the design proof), but it doesn't resolve D2 either — no action here |

**Rule-2 override, recorded explicitly.** Counting every currently open or
designed row on the board (excluding parked/needs-owner side states):
`FB-01, FB-02, FB-05, FB-13, FB-16, FB-17, FB-21, FB-23, FB-24, FB-25,
FB-26, FB-27, FB-28, FB-29, FB-30, FB-32, FB-33, FB-35` — 18 rows, far past
the five-row landing-section threshold. Unlike §13 (which resolved its own
excess by making itself a landing section closing ten rows), **this section
does not close debt** — it is a single new-build item, authorized in
writing by the owner specifically *instead of* landing the Mission Control
debt pile: `PHASE10.md` §14's own text states the reason in full — *"Its own
section, ahead of the Mission Control rework. Raised four times. The reason
it moves first: everything in §15 is wiring up components that already
exist and work. The Chart Room is the only genuinely missing thing left in
the queue, and putting the missing thing behind the misplaced things is how
it slipped four times."* This is the ruling recorded at commit `f392a049`
(`PHASE10_STATE.json` section note) and satisfies rule 2's "unless the
owner overrides in writing" clause directly — it is not a self-authorized
exception. The 15 rows scheduled §15 (`FB-27`–`FB-35` set) are exactly what
makes §15 itself a landing section by construction; nothing here reduces
that requirement or should be read as deferring it further.

---

## 1. Operating conditions

- `single_provider_mode` status: unchanged from §13 (`PHASE10_STATE.json`);
  `docs/phase10-workflow/SINGLE_PROVIDER_MODE.md`'s compensating controls
  remain mandatory if still active at implementation time — re-check the
  live flag before starting, do not assume it from this document.
- `main` is green at section start, re-verified by this turn:
  `git diff --name-only 33789eebeb170c1c60a833b5d963bbadbb64f2f7 HEAD --
  src/ public/ package.json package-lock.json scripts/` is empty, and the
  §13 accept turn independently ran `npm test` (112/112 files, 583/584
  tests, 1 intentional skip) and `npm run build` (exit 0, 18/18 routes) at
  that commit. Any red at review is new and is a blocker.
- No criterion is carried into this section from §13.
- This section is **stage one only**: the page itself, reachable at the
  existing owner-gated route `/stock/[ticker]`. No new route, no Mission
  Control wiring, no universe-scene change. `FULL ANALYSIS ▸` and the two
  click-through doors are explicitly out of scope (§15).

---

## 2. Route and privacy — reuse, do not duplicate

`src/app/stock/[ticker]/page.tsx` already exists: owner-gated via
`isValidSession`/`SESSION_COOKIE_NAME`, `robots:{index:false,follow:false}`,
`dynamic = "force-dynamic"`, never linked from `/share`, 404s via
`getStockDetailData` returning `null` for an unheld ticker. This section
**rebuilds that page's body** to the Chart Room design; it does not create
a new route and does not change the privacy posture, the session gate, the
login fallback, or the 404 behavior. `PRV-01` is a regression criterion,
not new privacy design work — no new privacy decision is required because
no new exposure is created (G-DESIGN/G-PUBLIC are satisfied by inheritance,
not by a fresh review).

The mock's `OWNER` tags (`VALUE`, `COST BASIS`, `DAY $`, `SINCE BUY $`, the
`COST` graph overlay) render unconditionally once authenticated — the whole
route is owner-only, so there is no viewer-identity branch to add inside
the page itself. **Freeze boundary note (see design proof):** if this page
is ever linked from `/share` in a future section, those five fields need a
viewer-identity conditional then; that is explicitly not this section's
work and must not be pre-built speculatively (no dead code for a state that
cannot occur yet).

---

## 3. Data plumbing — extend `getStockDetailData`, reuse existing math

`src/lib/stock-data.ts`'s `StockDetailData` already provides: `ticker`,
`shares`, `price`, `priceAsOf`, `value`, `weight`, `costBasis`,
`costPerShare`, `gain`, `gainPct`, `day`, `dayPct`, `contribution`,
`sector`, `aiExposure`, `priceHistory`, `metric` (P/E, market cap, div
yield, 52-week range — the same `CompanyMetric` `FundamentalsRow` already
renders), `recommendation` (analyst consensus), `news` (already filtered
through `isUsableNewsUrl`), `correlationRow` (already the MOVES WITH bench's
exact data, computed from `dashboard.correlationTickers`/`correlationCells`).

**New fields this section adds to `StockDetailData` (extend, do not
replace):**

| Field | Source | Reused, not reimplemented |
|---|---|---|
| `dailyReturns: {date:string; r:number}[]` | `priceReturns(priceHistory)` | `src/lib/math/returns.ts` — the exact function `dashboard-data.ts:303` already calls per-ticker |
| `firstTradeDate: string \| null` | `getDashboardData()`'s existing `firstTradeByTicker` map (already computed at `dashboard-data.ts:262`, not currently returned to the caller — expose it) | existing computation, newly exposed |
| `trades: {date; action; shares; price}[]` | `trades` table filtered to this ticker (same query `dashboard-data.ts` already runs once for all tickers; do not add a second Supabase round-trip) | existing `trades` fetch |
| `nextEarnings: EarningsEvent \| null` | `getUpcomingEarnings([ticker])`, same function `dashboard-data.ts:209` already calls for all held tickers — call it for this one ticker (or read from the dashboard's own `upcomingEarnings` array, filtered, if calling `getDashboardData()` already fetched it — avoid a second Finnhub round-trip for the same data) | `src/lib/finnhub.ts` |
| `vooCloseHistory: {date; price}[]` | the same `closeByDateByTicker.get("VOO")` map `dashboard-data.ts:384` already builds — expose it aligned to `priceHistory`'s own date range, not the portfolio's full funded history | existing benchmark close fetch |
| `bookGrowthIndex: {date; index}[]` | the same `growthIndexSeries` `dashboard-data.ts:342` already builds — expose it aligned to `priceHistory`'s own date range | existing growth-index computation |
| `betaVsVoo: number \| null` | `dashboard.holdingRisks` (already computed at `dashboard-data.ts:389`, currently unreturned — expose it and look up this ticker) | `perHoldingRisk` |
| `volatilityPct: number \| null` | same `holdingRisks` entry | `perHoldingRisk` / `annualizedVolatility` |
| `correlationWithVoo: number \| null` | `correlationMatrix({[ticker]: dailyReturns, VOO: priceReturns(vooCloseHistory)})` — a **2-key call to the existing, already-tested function**, not a new Pearson-r primitive. Its own `minOverlap` guard (default 5) already produces `null` for thin history | `src/lib/math/correlation.ts`, reused exactly as `perHoldingRisk` already does for beta alignment |
| `contributionRanking: {ticker; contribution}[]` | `dashboard.positionRows.map(p => ({ticker:p.ticker, contribution:p.contribution}))`, the exact shape `ContributionChart`'s `entries` prop already takes | existing per-position `contribution` field |

**New pure functions this section adds** (TDD — write the failing test
first, per `CLAUDE.md`'s engineering rules and the project's
`test-driven-development` practice):

- `sliceToRange(priceHistory, range: "7d"|"30d"|"sinceBuy"|"max", firstTradeDate)`
  in a new file `src/lib/portfolio/chart-room-window.ts`. Calendar-day
  trailing lookback for `7d`/`30d` using `addDays` (`src/lib/date.ts`,
  the same pattern `trailing-return.ts` already uses — "closest point ON OR
  BEFORE the target date," never an exact-match assumption). `sinceBuy`
  slices from `firstTradeDate` forward; `max` returns the full series.
  Returns an empty slice (not a crash) when the ticker's history is shorter
  than the requested window — the graph then renders whatever it has, per
  the empty/insufficient-history state.
- `alignToDates(series, dates: string[])` — same file. Returns `available:
  false` (mirroring `computeBenchmarkComparison`'s own guard) when the
  target series is missing any date in `dates`, rather than silently
  comparing over a shorter, misaligned window. Used for both the VOO and
  BOOK overlays, each aligned to the *currently selected graph range's*
  dates, not the portfolio's full history — this is what "SAME PERIOD"
  means in the mock's own overlay labels.
- `perTickerDrawdown(dailyReturns)` is **not a new function** — it is
  `drawdown()` from `src/lib/math/drawdown.ts`, called directly on this
  ticker's own `dailyReturns` (optionally sliced to since-buy first via
  `sliceToRange`). Do not write a second drawdown implementation.

---

## 4. The strip (header stat line)

Per the mock: kicker `CHART ROOM`, ticker + company name, TODAY hero figure,
chips (`WEIGHT`, `WEEK`, `30D`, `SINCE BUY`, `EARNINGS T−nD`, `N SESSIONS`).

- `WEIGHT` — existing `weight` field, unchanged.
- `WEEK`/`30D` — `trailingReturn(priceHistory-as-IndexedPoint, 7)` /
  `trailingReturn(..., 30)`, reusing `src/lib/portfolio/trailing-return.ts`
  exactly as `surface-copy.ts` already does for the portfolio-level weekly
  subline. `priceHistory` maps to `IndexedPoint` via `{date, index: price}`
  — price itself is already an index for a single ticker (no re-basing
  needed, unlike the portfolio's TWR growth index).
- `SINCE BUY` — the existing `gainPct` field (already "since purchase,"
  weighted-average-cost basis) — labeled `(SIMPLE)` per the mock, matching
  `CLAUDE.md`'s rule to clearly label simple return and never compare it
  against a benchmark's fixed-start-date figure elsewhere on this page.
- `EARNINGS T−nD` — `daysBetween(today, nextEarnings.date)` (`src/lib/
  date.ts`) when `nextEarnings` is non-null; the chip is **absent**, not
  zero, when no earnings are scheduled (mirrors `EarningsCalendar`'s own
  "No earnings scheduled" empty state).
- `N SESSIONS` — `priceHistory.length`.
- Every chip individually omits itself (never renders a zero or a dash
  standing in for a real absent value) when its underlying field is `null`
  — the no-fabrication rule applies chip-by-chip, not page-wide.

---

## 5. The full-scale graph

One SVG-based chart (`ChartRoomGraph`, new component,
`src/components/observatory/chart-room/`), client component for the
range/mode/overlay toggle state (mirrors the mock's own `G` state object),
server-fed with `priceHistory`, `vooCloseHistory`, `bookGrowthIndex`,
`trades`, `costPerShare`, `firstTradeDate` as props — no client-side data
fetching, no new API route.

- **Range detents** `7D` / `30D` (default, matches mock's
  `aria-pressed="true"` default) / `SINCE BUY` / `MAX`, via `sliceToRange`.
- **Modes** `RETURN` (indexed to 100 at the window start, default) /
  `PRICE` (raw `$` price) — a pure display transform of the same sliced
  series, no separate data fetch per mode.
- **Overlays**, each independently toggleable (mock defaults: `VOO` on,
  rest off):
  - `VOO · SAME PERIOD` — `alignToDates(vooCloseHistory, slicedDates)`,
    indexed to 100 at the same window start as the stock's own series. Renders nothing (not a flat line) when `available: false`.
  - `BOOK · SAME PERIOD` — same alignment against `bookGrowthIndex`.
  - `DEPTH` — running-peak line + shaded stratum over the *currently
    displayed* (sliced, mode-adjusted) series — a rendering transform of
    the visible curve itself, not the DEPTH bench's own drawdown-from-daily-returns computation (`VIS-04`). These are two different views (one
    of price/return level, one of return-series drawdown) and must not be
    conflated into one implementation.
  - `TRADES` — buy/sell markers from `trades`, filtered to the window
    currently displayed, positioned at each trade's date on the graph's own
    x-axis.
  - `COST` — dashed horizontal line at `costPerShare`, `PRICE` mode only
    (matches the mock — cost basis is a price-space concept, not
    meaningful indexed-to-100). Disabled/no-op when `mode !== "price"`.
- Every overlay reads real data or omits itself; none may fabricate a
  point.

---

## 6. The six benches

Each bench keeps its own plain-English question from the mock verbatim
(`is today normal?`, `with it, or against it?`, `how far under its high?`,
`is this its own bet?`, `what has it done to the book?`, `public facts, one
glance`) — the portfolio-ux skill's "one primary user question" per
disclosure layer, already satisfied by the mock's own copy; do not rewrite
these sentences.

### 6.1 DISTRIBUTION — `is today normal?`

Histogram of `dailyReturns` (full history, or since-buy — implementer's
choice, record which in the handoff since the mock doesn't specify and no
owner sentence exists either way), today's return marked as a vertical
line, mean ± 1σ band. `σ` and annualized vol use the *same* formula as the
portfolio-level figure (`annualizedVolatility`, √252) — reuse the function,
do not hand-roll a second stdev/annualization.

### 6.2 VS MARKET — `with it, or against it?`

Scatter of `(vooReturn, tickerReturn)` shared-date pairs, regression line
at slope = `betaVsVoo`. Uses the already-computed `betaVsVoo` and
`correlationWithVoo` fields (§3) — do not recompute beta inside the
component.

### 6.3 DEPTH — `how far under its high?`

Gauge showing max drawdown and current off-high, computed via `drawdown()`
called directly on `dailyReturns` (since-buy sliced, matching the mock's
own "SINCE BUY" stamp on this bench) — reused exactly as the portfolio-level
figure is computed in `dashboard-data.ts:327`, just fed a single ticker's
return series instead of the portfolio's net-of-flow series.

### 6.4 MOVES WITH — `is this its own bet?`

Correlation bars against other current holdings — this bench needs **no
new data**, it is `correlationRow`, already computed and already exposed by
`getStockDetailData`. The sentence line (mock: *"IBM AND MSFT MOVED
TOGETHER..."*) names the top-`|r|` pair involving this ticker, matching
FB-11's already-shipped "compare by `|r|`, not raw `r`" convention
(`mostCorrelatedPair`, `src/lib/observatory/structure-copy.ts`) — reuse
that function's comparison logic (by import if its signature fits a
single-ticker row, otherwise the same `|a.value| > |b.value|` comparator,
not a new raw-`r` sort).

### 6.5 CONTRIBUTION & POSITION — `what has it done to the book?`

Bar chart ranking **every current holding** by `contributionRanking` (§3),
this ticker highlighted (mirrors `ContributionChart`'s existing sort-by-
contribution-descending behavior — reuse that sort, don't re-derive it).
Four owner-tagged tiles: `VALUE`, `COST BASIS`, `DAY $`, `SINCE BUY $` —
already-existing `value`, `costBasis`, `day`, `gain` fields, each omitted
(not zeroed) when null (e.g. `day` is null on a snapshot-less first day).

### 6.6 THE COMPANY — `public facts, one glance`

52-week range bar + `P/E` · `MKT CAP` · `DIV YIELD` from the existing
`metric` field (`CompanyMetric`, already what `FundamentalsRow` renders —
reuse the same field, new presentation). Analyst consensus bar from the
existing `recommendation` field (already what `AnalystConsensus` renders).
Three-headline news list from the existing `news` field, already filtered
through `isUsableNewsUrl` (FB-24/FB-10 precedent — every link must open the
real article, never a dead or unusable URL). Any of the three sub-parts
(52-week range, consensus, news) that has no data renders its own
already-established empty copy (`FundamentalsRow`/`AnalystConsensus`/
`StockNews`'s existing conditionals — e.g. the current page's own
`hasRecommendation` / `data.news.length > 0` guards) rather than an empty
box.

---

## 7. Type ramp — `CHART_ROOM_TEXT_ROLES`

New file `src/lib/observatory/chart-room-layout.ts` (or extend
`mission-control-layout.ts` if the implementer judges the two role maps
belong in one file — either is acceptable, record the choice in the
handoff), exporting a role→token map in the exact shape and testing
pattern of `MISSING_CONTROL_TEXT_ROLES`: role name, `token` (one of the
five `--type-*` custom properties, current production values only —
`--type-label` is 12px, not the mock's stale 11px), `description`,
`selectors`. A rendered test (`chart-room-text-roles.test.tsx` or
equivalent) asserts computed style per selector, not a source grep.

---

## 8. Mobile (390px)

Single-column stack in source order: strip → graph → DISTRIBUTION → VS
MARKET → DEPTH → MOVES WITH → CONTRIBUTION & POSITION → THE COMPANY. No
horizontal overflow. Every button (`controls button`, overlay toggles,
range/mode buttons) ≥44×44 CSS px — the mock's own `min-height:30px` does
not meet this and must be raised at the 390px breakpoint (desktop may keep
the denser mock sizing if it already clears 44px there, or raise it too —
implementer's call, record which).

---

## 9. Acceptance criteria

20 criteria total (5 behavioral, 9 visual, 1 mobile, 1 accessibility, 1
privacy, 2 tests, 1 build) — at this project's ~20-criteria guideline,
11 of them visual/browser-kind (VIS-01–09, MOB-01, ACC-01), within the
≤12-visual cap.

| ID | Dimension | Risk | Requirement |
|---|---|---|---|
| `BHV-01` | behavioral | critical | Header stat line renders `WEIGHT`/`WEEK`/`30D`/`SINCE BUY`/`EARNINGS T−nD`/`N SESSIONS` from real computed values per §4; each chip is absent (never a zero or fabricated figure) when its source field is null |
| `BHV-02` | behavioral | high | Graph range detents (`7D`/`30D`/`SINCE BUY`/`MAX`) reslice the displayed series correctly via `sliceToRange`; default is `30D` |
| `BHV-03` | behavioral | high | Graph `RETURN`/`PRICE` mode toggle switches the Y-axis basis correctly (indexed-to-100 vs raw `$`); default is `RETURN` |
| `BHV-04` | behavioral | critical | All five graph overlays (`VOO · SAME PERIOD`, `BOOK · SAME PERIOD`, `DEPTH`, `TRADES`, `COST`) are independently toggleable, each sourced from real/existing data per §5, each renders nothing (not a fabricated line) when its source is unavailable for the selected window |
| `BHV-05` | behavioral | critical | Every one of the six benches sources only real, already-computed values (§6); a bench with insufficient underlying data (thin history, too few shared trading days) renders its designed empty state, never a zero or a fabricated number |
| `VIS-01` | visual | high | Full-scale graph capture: default state (`30D`/`RETURN`/`VOO` on) matches the design proof's structure — title, trace line, VOO overlay, axis labels |
| `VIS-02` | visual | medium | DISTRIBUTION bench capture: histogram, today marker, mean±σ band, real σ/annualized-vol stamp |
| `VIS-03` | visual | medium | VS MARKET bench capture: scatter, regression line at the real `betaVsVoo` slope, real correlation stamp |
| `VIS-04` | visual | high | DEPTH bench capture: gauge, real max-drawdown mark and current off-high, computed via `drawdown()` on since-buy `dailyReturns` |
| `VIS-05` | visual | medium | MOVES WITH bench capture: correlation bars matching `correlationRow`'s real values, sentence names the real top-`\|r\|` pair |
| `VIS-06` | visual | high | CONTRIBUTION & POSITION bench capture: real contribution ranking bar with this ticker highlighted, four owner tiles with real (or correctly-omitted) values |
| `VIS-07` | visual | medium | THE COMPANY bench capture: 52-week range, P/E, market cap, div yield, analyst consensus, three real linkable news headlines (or each sub-part's correct empty state) |
| `VIS-08` | visual | medium | `CHART_ROOM_TEXT_ROLES` role→token map exists and a rendered computed-style test confirms every selector resolves to its assigned token, using current production ramp values (12px `--type-label` floor) |
| `VIS-09` | visual | low | The mock's `DEMO DATA · ROUND 6 MOCK · NOT LIVE` stamp is verifiably absent from the shipped page (negative capture) |
| `MOB-01` | mobile | critical | At 390px: single-column stack in source order per §8, no horizontal overflow, every interactive control ≥44×44 CSS px |
| `ACC-01` | accessibility | high | Range/mode/overlay controls are keyboard-operable (tab order, visible focus, correct `aria-pressed` state after activation) |
| `PRV-01` | privacy | critical | `/stock/[ticker]` remains owner-gated exactly as today: unauthenticated request shows only the login form (no figures leak), `robots:{index:false}` unchanged, route never linked from `/share`; regression test covers the unauthenticated path |
| `TST-01` | tests | high | New pure functions (`sliceToRange`, `alignToDates`, the type-role map, any new selector/comparator logic in §6) each have unit tests written before implementation (TDD) and passing |
| `TST-02` | tests | critical | Full suite green: `npm test`, no new failures, no reduction in test count beyond intentional skips |
| `BLD-01` | build | critical | `npm run build` exits 0; route list unchanged (no new route — `/stock/[ticker]` is reused, not duplicated) |

---

## 10. Freeze boundary reminder

Stage two (the doors) is §15's work, not remediation territory for this
section. A review finding that says "this page is unreachable without
typing a URL" is not a valid `BHV`/`VIS` finding against this spec — it is
the roadmap's own explicit two-stage split, cited above in §0 and §1.
