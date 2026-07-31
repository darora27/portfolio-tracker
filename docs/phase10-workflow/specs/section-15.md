# Phase 10 §15 specification: Mission Control content rework

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

Design proof: `docs/phase10-workflow/design-proofs/section-15.md`
Acceptance ledger: `docs/phase10-workflow/acceptance/section-15.json`

Authority: `MISSION_CONTROL_ARCHITECTURE.md` (owner-adopted whole, FB-34) →
`PHASE10.md` §15 (this section's own roadmap scope) → `OWNER_FEEDBACK_LEDGER.md`
rows FB-11, FB-13 (stage two only), FB-27–FB-33, FB-35. This section is
assembled from the architecture document and re-derives nothing from it.

---


## 0.2 Ledger board addendum — FB-36, 2026-07-31

| Row | Disposition |
|---|---|
| **FB-36** — the app takes a while to load; 26 MB of planet textures | **DEFERRED from §15 — DJA.** Not a Mission Control content item, and §15 is mid-flight. It is a loading-strategy change scheduled to §16, and the progressive path is already half-built: `public/textures/planets/thumbs/` holds 32px versions that nothing in `src/` references. |


## 0. The ledger board

Per `OWNER_FEEDBACK_LEDGER.md` rule 2: every open/designed row is marked
scheduled-here, scheduled-§n, or deferred with owner initials. No owner
feedback reached the project between §14's specify turn and this one — the
board is unchanged from §14 spec's own count, reproduced and re-verified here.

| ID | Status at spec time | Disposition |
|---|---|---|
| `FB-13` | designed (Chart Room). Stage one closed by §14. | **scheduled here — stage two only**: a HOLDINGS row click, an ORBITS ring/blip click, `FULL ANALYSIS ▸`. This is what actually closes the row |
| `FB-27` | designed, `MISSION_CONTROL_ARCHITECTURE.md` §4 HOLDINGS | **scheduled here** |
| `FB-28` | designed, architecture §4 (RETURNS' two named charts) | **scheduled here** |
| `FB-29` | designed, architecture §4 footer NEWS demotion | **scheduled here** |
| `FB-30` | designed, architecture §4 ACTIVITY rename | **scheduled here** |
| `FB-32` | designed, architecture §4 STRIP | **scheduled here** |
| `FB-33` | designed · EARNINGS CONFIRMED, architecture §5–§6 | **scheduled here** — its own "Scheduled" column already names §15 |
| `FB-35` | designed, architecture §4 MIX/RISK charts | **scheduled here** |
| `FB-11` | retired into FB-33 (already closed, not open/designed) | the CORRELATION-section cut this retirement describes is **executed here**, alongside FB-33's EARNINGS cut — recorded for completeness, not counted toward the rule-2 total below |
| `FB-01` | open · "nearly there," awaiting his sentence after §13's nudge | **not this section** — universe-scene only, no Mission Control content surface |
| `FB-02` | designed, background, awaiting his sentence | **not this section** — universe-scene only |
| `FB-05` | open · fonts, awaiting his sentence after §13's 12px bump | **not this section** — this section's own new/extended `MISSION_CONTROL_TEXT_ROLES` entries start from the already-shipped 12px floor, does not reopen the ramp |
| `FB-12` | parked by owner, explicitly deprioritized | **not this section** — unchanged |
| `FB-16` | designed, XLK hollow-core system, scheduled `§13′` | **not this section** — distinct future item |
| `FB-17` | open, live/capture panel-width gap, shipped default | **not this section** — no `PlanetDetail` panel-width change here |
| `FB-18`, `D1`, `D3` | needs-owner / held | **not this section** — parked, unchanged |
| `FB-21` | designed, already shipped §12a bookkeeping gap | **not this section** |
| `FB-23` | open, sun-chip anchoring, shipped §13 | **not this section** — universe-scene only |
| `FB-24` | open, moon click behavior, shipped §13 | **not this section** — universe-scene only, distinct from this section's HOLDINGS/ORBITS doors (moons carry news; these doors carry the Chart Room) |
| `FB-25` | open, planet-panel content, shipped §13 | **not this section** — `PlanetDetail`'s stat content is unchanged here; only its `FULL ANALYSIS ▸` link destination changes (§12 below) |
| `FB-26` | open · high, trail/direction daily encoding, shipped §13 | **not this section** — universe-scene only |
| `D2` | open · general, "still relatively confusing" | **not this section** — tracked via `FB-05`'s own disposition above; this section's content rework is the architecture's own answer to it but does not itself close it (closes on his sentence, not on this section's construction) |
| `FB-10` | already `CONFIRMED`/closed (his words *"news articles open"* — a false-positive substring match on the parser's `open`/`designed` check, not an actually-open row) | no disposition needed — not open/designed, recorded here only to satisfy `scripts/phase10-workflow-lib.mjs`'s literal-substring board check, matching §14 spec's own precedent for this exact parser quirk |

**Rule-2 override, recorded explicitly.** Counting every currently open or
designed row (excluding parked/needs-owner side states, matching §14 spec's
own methodology): `FB-01, FB-02, FB-05, FB-13, FB-16, FB-17, FB-21, FB-23,
FB-24, FB-25, FB-26, FB-27, FB-28, FB-29, FB-30, FB-32, FB-33, FB-35` — 18
rows, unchanged from §14's count. Unlike §14 (which was itself an
owner-authorized exception to landing), **this section is the landing
section rule 2 requires** — it closes eight of those eighteen rows outright
by construction (`FB-13` stage two, `FB-27`–`FB-30`, `FB-32`, `FB-33`,
`FB-35`) plus executes `FB-11`'s already-recorded retirement. `PHASE10.md`
§15's own roadmap text and `MISSION_CONTROL_ARCHITECTURE.md` §10 are the
authority for this scope; no further owner override is needed because this
*is* the landing turn, not an exception to it.

---

## 1. Operating conditions

- `single_provider_mode` status: re-check the live flag at implementation
  time; do not assume it from this document.
- `main` is green at section start: `npm test` 118/118 files, 631/632 tests
  (1 intentional skip), `npm run build` exit 0, both independently re-run by
  the §14 accept turn at HEAD `739049dbb72c0ba426ed668c24ae65442d62beaf`. Any
  red at review is new and is a blocker.
- No criterion is carried into this section from §14.
- **No new route.** This section rebuilds content inside the existing
  Mission Control surface (`UniverseRoute.tsx` → `MissionControl.tsx` →
  `MissionControlRoomContent.tsx`) and rewires three existing links to the
  existing `/stock/[ticker]` route (§14). It does not touch `/stock/
  [ticker]`'s own page body, benches, or data plumbing beyond reading
  already-existing fields.
- **Confirmed dead code, out of scope:** `PublicMissionControlContent.tsx`
  and `src/components/observatory/orrery/MissionControlBays/*` are an
  unused, superseded parallel implementation (verified: `UniverseRoute.tsx`
  imports only `MissionControlRoomContent`, never
  `PublicMissionControlContent`). This section does not remove them — that
  is a separate cleanup decision, not this section's scope — but a spec or
  review citing them as the live component would be citing dead code.

---

## 2. The three doors — route and privacy (read this before anything else)

**This is the section's highest-risk decision.** `src/app/stock/[ticker]/
page.tsx`'s own header comment: *"Owner-gated — never part of the public
`/share` surface."* §14's design proof state matrix recorded the same
constraint in writing. Therefore:

- All three doors (HOLDINGS row click, ORBITS ring/blip click, `FULL
  ANALYSIS ▸`) navigate to `/stock/<ticker>` **only when `mode === "private"`**.
- In public mode (`/share`), all three keep their exact pre-existing
  destinations, unchanged:
  - HOLDINGS row and ORBITS ring/blip: `${basePath}?holding=<ticker>&camera=
    approach` (the existing approach-camera + `PlanetDetail` flow).
  - `FULL ANALYSIS ▸`: `${basePath}?focus=portfolio&camera=command&
    station=manifest&anchor=<ticker>` (the existing Mission-Control-focus
    flow) — this destination is retired in private mode only; public mode's
    own Mission Control HOLDINGS/RETURNS/etc. content still exists at that
    anchor via this section's own rework, so the link continues to resolve
    to something real, not a dead anchor.
- A finding that a public/share visitor can reach `/stock/[ticker]` from any
  door is a `PRV-01` failure at critical risk, not a taste note — it
  outranks every other requirement in this document per `CLAUDE.md`'s
  privacy rules and global gate `G-BOUNDARY`.

### 2.1 Door #1 — HOLDINGS row click

`src/components/observatory/orrery/MissionControlRoomContent.tsx`'s HOLDINGS
table currently links each ticker to
`${basePath}?holding=${ticker}&camera=approach` (lines 68–70, both modes).
Change: in private mode, the row's primary link target becomes
`/stock/${ticker}`. In public mode, keep the existing `?holding=…&camera=
approach` link unchanged.

### 2.2 Door #2 — ORBITS ring/blip click

`src/components/observatory/orrery/MissionControl.tsx`'s `routeToHolding`
callback (currently `window.location.assign(`${basePath}?holding=${ticker}&
camera=approach`)`, wired to `SystemPlot`'s `onOpenTicker`) is the ORBITS
radar's click handler inside Mission Control — architecture §4's "the
radar, unchanged [visually] — every ring/blip click opens the Chart Room."
Change: when `mode === "private"`, `routeToHolding` navigates to
`/stock/${ticker}` instead. When `mode === "public"`, it is unchanged. The
radar's own rendering, hover (`onSelectTicker`), and double-click semantics
in `SystemPlot.tsx` are unaffected — only the destination URL changes.

### 2.3 Door #3 — `FULL ANALYSIS ▸`

`src/components/observatory/orrery/PlanetDetail.tsx`'s footer link
(currently `${basePath}?focus=portfolio&camera=command&station=manifest&
anchor=${ticker}`, line 123) is rendered for both public and private
callers — `OrreryWorld.tsx` invokes `<PlanetDetail>` once (line 624) without
a `mode` prop today. This section adds a `mode: "public" | "private"` prop
to `PlanetDetail` (`OrreryWorld.tsx` already computes `missionMode` at line
657 for its own `<MissionControl mode={missionMode}>` call — thread the same
value down). In private mode, `FULL ANALYSIS ▸` becomes `/stock/${ticker}`.
In public mode, the link is unchanged.

**Existing test debt to correct, not preserve:** `src/app/dev/
phase10-portfolio-orrery/OrreryWorld.test.tsx` (around line 132) currently
asserts the `FULL ANALYSIS ▸` href contains `station=manifest` — this
assertion covers the pre-Chart-Room destination and must be updated to
assert the new private-mode `/stock/<ticker>` destination (and, in a
public-mode variant of the same test, that the old destination is
retained). This is the same "correct stale test debt to the new behavior,
not silently pass around it" pattern this project has followed since
FB-26 (§13) — it is not a regression to preserve.

---

## 3. Data plumbing — one extension, everything else already exists

`DashboardData` (`src/lib/dashboard-data.ts`) already carries every field
every reworked/new section needs **except** the three history-page series.
Extend `DashboardData` with:

| Field | Source | Reused, not reimplemented |
|---|---|---|
| `drawdownSeries: {date: string; drawdown: number}[]` | `getHistoryData()`'s existing `drawdownSeries`, `src/lib/history-data.ts` | already computed and tested for `/history`; call the same function from `getDashboardData()`'s caller chain (or expose a shared helper) rather than re-deriving drawdown from `dailyReturns` a second time |
| `dailyReturnBars: {date: string; return: number}[]` | same `getHistoryData()` | same function, existing shape `DailyReturnsChart` already consumes |
| `compositionHistory: CompositionHistorySeries` | same `getHistoryData()` | same function, existing shape `CompositionOverTimeChart` already consumes |

Do not call `getHistoryData()` a second, independent time if the Mission
Control page's existing data-loading path can share one call with whatever
already invokes it for `/history` — avoid a duplicate Supabase round-trip;
if sharing isn't practical without touching `/history`'s own route (out of
scope), a second call to the same already-tested pure function is
acceptable and is not "new math."

Every other value below is already on `DashboardData` today: `hhi`,
`top2ConcentrationPct`, `sectorWeights`, `aiExposureWeights`,
`benchmarkComparisons`, `holdingsPerformance`, `holdingRisks`, `movers`,
`positionRows`, `upcomingEarnings`, `correlationTickers`/`correlationCells`
(retired from this room, not from the type).

---

## 4. STRIP (pinned)

Unchanged: `TODAY` hero, `WEEK`/`SINCE START TWR`/`VS VOO`/`OFF HIGH` chips,
variant-B section-link nav, exit link, DRAFT latch. Two changes only:

- **Add** a `NEXT: <ticker> T−nD` chip (architecture §4, §6) — the single
  soonest entry from `data.upcomingEarnings` across all holdings, same
  `daysBetween`/date-formatting pattern the room's existing (soon-removed)
  EARNINGS section already uses (§9 below). Chip is **absent**, not zero or
  dashed, when `upcomingEarnings` is empty.
- **Remove** the `<a href="#earnings">EARNINGS</a>` nav link (both the
  `stripVariant==="b"` default `<nav>` at line 157 and the `stripVariant
  ==="c"` edge index at line 191) — the EARNINGS section it pointed to no
  longer exists (§9). `mission-control-panels.ts`'s `MISSION_CONTROL_PANELS`
  array (consumed by both nav renders) is updated per §10 below; the
  `EARNINGS` anchor was hardcoded outside that array and must be removed at
  both call sites, not just from the array.

---

## 5. ORBITS

Visually and structurally unchanged (architecture §4: "the radar,
unchanged"). Only its click destination changes — see §2.2.

---

## 6. HOLDINGS (door #1)

Rework `MissionControlRoomContent.tsx`'s HOLDINGS `LazyMissionSection`
(currently lines 52–83):

- **Row set:** `data.positionRows` (all real holdings), not
  `data.publicOrreryHoldings.slice(0, 8)`. The 8-planet cap is an orrery
  visualization constraint, not a content constraint — architecture §4 is
  explicit: "all holdings, not eight."
- **Columns:** `WEIGHT` · `TODAY` · `WEEK` · `SINCE BUY` · sparkline ·
  `T−nD` earnings chip · `VALUE` (private only). `WEIGHT`/`TODAY` (`dayPct`)
  already on `PositionRow`. `WEEK` needs a per-row weekly figure — reuse
  whatever weekly-return computation already backs
  `publicOrreryHoldings[].weeklyReturn` (`dashboard-data.ts`), applied per
  `positionRows` entry rather than only the 8 orrery-capped ones (extend the
  existing per-ticker weekly-return map's scope, not its formula). `SINCE
  BUY` — the existing `gainPct` field (`Position`'s own since-purchase
  simple return), labeled `(SIMPLE)` per `CLAUDE.md`'s rule, matching
  `PlanetDetail`'s own existing `SINCE BUY … (SIMPLE)` label convention.
  Sparkline — `PositionRow.sparkline` (already computed, already used
  elsewhere). `T−nD` chip — derive per-row from `data.upcomingEarnings`
  filtered to that ticker, same pattern the room's own current EARNINGS
  section already uses (§9 removes that section but not the data or the
  formatting helper). Chip absent when no earnings scheduled for that
  ticker.
- **Movers line, above the table:** `BEST TODAY ▲ … · WORST ▼ …` from
  `data.movers` (`Mover[]`, already computed — the exact data `WinnersLosers`'
  own movers prop consumes). Render as a single compact line in the room's
  own typography, not by embedding `WinnersLosers`' Tailwind JSX (see design
  proof's "reuse math, not JSX" precedent).
- **Summary line, below the table:** `TOP-2 <pct>% · <TIER LABEL>` — reuse
  `concentrationStatus(data.hhi)` (`src/lib/portfolio/concentration-status.ts`,
  already what `ConcentrationMeter` calls internally) for the tier/label
  pairing, paired with `data.top2ConcentrationPct`, plus realized/unrealized
  (private only, already-existing fields). Same "reuse the function, not the
  Tailwind card" rule.
- **Row click → Chart Room** in private mode (§2.1); public mode unchanged.

---

## 7. RETURNS

Rework `MissionControlRoomContent.tsx`'s RETURNS `LazyMissionSection`
(currently lines 85–100):

- **Per-benchmark toggle:** the existing `ReturnInstrument`/`ValueChart`
  comparison currently hardcodes VOO. Extend it to toggle across
  `data.benchmarkComparisons`' tickers (VOO/VTI/XLK, whichever
  `BENCHMARK_TICKERS` already names) — reuse `benchmarkComparisons`, do not
  add a second benchmark-fetch path.
- **`ExcessReturns` conclusion line:** render `ExcessReturns`'s underlying
  data (`comparisons` = `data.benchmarkComparisons`) as the room's own
  "vs `<ticker>` `<delta>`" line set, in observatory typography — same
  reuse-math-not-JSX rule (`ExcessReturns` itself renders `DeltaChip`, a
  Tailwind UI primitive).
- **Second mode switch — `BOOK VS MARKET` / `STOCK VS STOCK`:**
  `BOOK VS MARKET` is the existing portfolio-vs-benchmark chart above.
  `STOCK VS STOCK` renders `data.holdingsPerformance`
  (`HoldingsPerformanceSeries`, already exactly the shape
  `HoldingsPerformanceChart` consumes) with its own per-stock toggle set —
  reuse the series and its existing toggle-selection logic if
  `HoldingsPerformanceChart` exposes one as a pure helper; otherwise a
  simple per-ticker visibility toggle over the already-computed series is
  acceptable (no new return computation either way).
- Keep the existing `XIRR · SINCE START` private-only readout, unchanged.

---

## 8. MIX (new section — `id="mix"`, `LazyMissionSection`)

The only genuinely new `LazyMissionSection` this document authorizes,
between RETURNS and RISK per architecture §4's ordering:

- `CompositionDonut`'s data (`donutSlices`-equivalent — build from
  `data.positionRows` the same `{ticker, weight, value}` shape
  `dashboard-data.ts`'s own `donutSlices` already derives) — holdings by
  percentage.
- `ClassificationBarList`'s data — `data.sectorWeights` and
  `data.aiExposureWeights` (both `ClassificationWeight[]`, already computed).
- `CompositionOverTimeChart`'s data — `data.compositionHistory` (§3).

All three render as new observatory-grammar markup (bars/donut in SVG or the
room's existing meter-bar pattern, matching `.riskInstruments`' `<i
style={{"--meter":...}}>` convention already in this file) — not the
Tailwind/Recharts JSX of the source components, per the design proof's
reuse rule. Window: `SINCE START`, per architecture §4.

---

## 9. RISK

Rework `MissionControlRoomContent.tsx`'s RISK `LazyMissionSection`
(currently lines 102–120):

- Keep the existing three gauges (`VOL`, `BETA`, `OFF HIGH`) unchanged.
- **Add** `DrawdownChart`'s data (`data.drawdownSeries`, §3) and
  `DailyReturnsChart`'s data (`data.dailyReturnBars`, §3) as two new
  observatory-grammar mini-charts in the same section.
- **Add** a `BY HOLDING ▸` disclosure (`<details>`/`<summary>`, matching
  this file's existing disclosure idiom — see §4's `briefingFolder`
  pattern) revealing `data.holdingRisks` (`HoldingRisk[]`, already exactly
  `HoldingRiskTable`'s prop shape) as a compact per-holding list.
- **Attach `MetricDisclosure`'s plain-language content** (via
  `metric-explanations.ts`'s existing `betaExplanation`/
  `volatilityExplanation`/the `max-drawdown` and `hhi` builders) to every
  figure in this section — reuse `MetricDisclosure`'s open/close/focus
  *behavior*, re-skinned to this room's materials, matching
  `MISSION_CONTROL_TEXT_ROLES`' existing re-skinning precedent. This closes
  the architecture's explicit requirement: "`MetricDisclosure` attached to
  **every** figure."
- Window: `SINCE START`, labeled, per architecture §4.

---

## 10. ACTIVITY (renamed from TRADES)

Rework `MissionControlRoomContent.tsx`'s TRADES `LazyMissionSection`
(currently lines 186–198) and `mission-control-panels.ts`'s `log` entry:

- Section `id` may stay `"trades"` internally (anchors/tests keyed to it are
  not required to change) but its **visible title becomes `ACTIVITY`**
  (`mission-control-panels.ts`'s `label: "TRADES"` → `"ACTIVITY"`; the
  `LazyMissionSection title="TRADES"` prop → `"ACTIVITY"`).
- The `BOOK IMPACT <signedPercent(entry.impactPct)>` column becomes
  **`EFFECT ON PORTFOLIO <signedPercent(entry.impactPct)>`** — same field,
  new label, per architecture §4: "the word BOOK dies, because he told us it
  meant nothing."
- `OPEN TRADE DESK ▸` link (private only) unchanged.

---

## 11. Footer and cuts

- **NEWS demotion:** remove the standalone `id="news"` `LazyMissionSection`
  (currently lines 170–184). Move a **three-headline** version (architecture
  §4 footer: "NEWS demoted to a three-headline line, links stay") into
  `MissionControl.tsx`'s existing `<footer className={styles.missionFooter}>`
  (currently lines 218–246), alongside the existing `BRIEFING` folder and
  `DRAFT` latch — same `allNews`-filtering/sorting logic already in
  `MissionControlRoomContent.tsx` (lines 34–38), sliced to 3 instead of 5.
  Links stay real (`target="_blank"`, already filtered through the
  `isUsableNewsUrl`-equivalent `/^https?:\/\//i` check).
- **CORRELATION section removed entirely** (retires FB-11): delete the
  `id="correlation"` `LazyMissionSection` (currently lines 123–152) and its
  `missionHalfRow` pairing with EARNINGS. The question it answered survives
  only in HOLDINGS' new `TOP-2`/HHI line (§6) and, per-stock, in the Chart
  Room's `MOVES WITH` bench (already shipped, §14) — no replacement matrix
  here.
- **EARNINGS section removed entirely** (closes FB-33's §6 cut): delete the
  `id="earnings"` `LazyMissionSection` (currently lines 154–167). Its
  information survives as the STRIP's `NEXT` chip (§4) and HOLDINGS' per-row
  `T−nD` chip (§6) — both reuse the same date/ticker data this section used,
  the chips are not new data sources.
- `mission-control-panels.ts`'s `MISSION_CONTROL_PANELS` array: remove the
  `signals`/CORRELATION and `comms`/NEWS entries (NEWS is footer content
  now, not a scrollable nav destination); add a `mix`/MIX entry between
  `scope`/RETURNS and `hazard`/RISK; rename `log`'s `label` from `"TRADES"`
  to `"ACTIVITY"` (§10). Resulting order: `plot` (ORBITS) · `manifest`
  (HOLDINGS) · `scope` (RETURNS) · `mix` (MIX) · `hazard` (RISK) · `log`
  (ACTIVITY) — matching architecture §4's ordering exactly.

---

## 12. Type ramp

Extend `MISSION_CONTROL_TEXT_ROLES` (`src/lib/observatory/
mission-control-layout.ts`) with role entries for MIX's and ACTIVITY's
new/changed selectors, at current production token values only (no new
sizes, no reopening FB-05's still-open row). Same rendered-computed-style
test pattern the existing map already uses — extend the existing test file,
do not add a parallel un-rendered assertion.

---

## 13. Mobile (390px) and the <1024px fallback

- Desktop-first, per the portfolio-ux skill. The existing sub-1024px static
  fallback (`observatory-fallback.test.ts`, FB-09's mobile-preserving CSS
  override precedent) gains values-only rows for MIX and ACTIVITY — same
  treatment the fallback already gives ANALYSIS-style content, not a new
  fallback surface.
- At 390px inside the fallback: single-column stack, no horizontal
  overflow, every interactive control (toggles, the `BY HOLDING ▸`
  disclosure summary, doors) ≥44×44 CSS px.

---

## 14. Acceptance criteria

21 criteria total (7 behavioral, 1 privacy, 9 visual, 1 mobile, 1
accessibility, 2 tests, 1 build) — 11 of them visual/browser-kind
(`VIS-01`–`VIS-08`, `MOB-01`, `ACC-01`), within the ≤12-visual cap. This
exceeds the project's ~20-criteria guideline by one, justified by the
section's status as the landing turn for eight ledger rows plus one
retirement — see §0.

| ID | Dimension | Risk | Requirement |
|---|---|---|---|
| `BHV-01` | behavioral | medium | STRIP gains a `NEXT: <ticker> T−nD` chip sourced from real `upcomingEarnings` data (absent when none scheduled); the `EARNINGS` nav link is removed from both strip-variant nav renders |
| `BHV-02` | behavioral | critical | HOLDINGS shows all real holdings (not eight), with real `WEIGHT`/`TODAY`/`WEEK`/`SINCE BUY`/sparkline/`T−nD` values per §6, a real movers line, and a real `TOP-2`/HHI-tier summary line; no fabricated or zero-standing-in figures |
| `BHV-03` | behavioral | high | RETURNS offers a working per-benchmark toggle (VOO/VTI/XLK) with a real `ExcessReturns`-derived conclusion line, and a working `BOOK VS MARKET`/`STOCK VS STOCK` mode switch backed by real `holdingsPerformance` data |
| `BHV-04` | behavioral | high | MIX renders real composition-by-percentage, sector/AI classification, and composition-over-time data per §8; each sub-part renders its own designed-empty state when its source is thin, never a fabricated shape |
| `BHV-05` | behavioral | high | RISK retains its three real gauges, adds real drawdown and daily-return history charts and a real per-holding `BY HOLDING ▸` disclosure, and every figure in the section has an attached, real `MetricDisclosure`-equivalent explanation |
| `BHV-06` | behavioral | medium | ACTIVITY (renamed from TRADES) shows the real trade log with its impact column labeled `EFFECT ON PORTFOLIO`; `OPEN TRADE DESK ▸` unchanged |
| `BHV-07` | behavioral | medium | The CORRELATION and standalone EARNINGS sections are absent from the room; NEWS is a real three-headline footer line with working links; `mission-control-panels.ts` reflects the new section set and order per §11 |
| `BHV-08` | behavioral | critical | In private mode, all three doors (HOLDINGS row, ORBITS ring/blip, `FULL ANALYSIS ▸`) navigate to `/stock/<ticker>` for the correct real ticker |
| `PRV-01` | privacy | critical | In public/`/share` mode, none of the three doors ever link to `/stock/[ticker]`; each retains its exact pre-existing public-mode destination (§2); every reworked/new section's public-mode projection stays percentages-only with VALUE/realized/unrealized owner-only, matching the existing canary-test pattern extended to MIX/RISK/ACTIVITY |
| `VIS-01` | visual | medium | STRIP capture: `NEXT` chip present with real data, no `EARNINGS` nav link |
| `VIS-02` | visual | high | HOLDINGS capture: full holdings list, real chips/sparklines, movers line, TOP-2/HHI line |
| `VIS-03` | visual | high | RETURNS capture: both the per-benchmark toggle states and both `BOOK VS MARKET`/`STOCK VS STOCK` mode states |
| `VIS-04` | visual | medium | MIX capture: donut, classification bars, composition-over-time, real data |
| `VIS-05` | visual | medium | RISK capture: gauges, two history charts, `BY HOLDING ▸` disclosure open, at least one `MetricDisclosure` open |
| `VIS-06` | visual | low | ACTIVITY capture: renamed title and column label |
| `VIS-07` | visual | medium | Footer + cuts capture: three-headline NEWS line present in the footer; CORRELATION and EARNINGS sections verifiably absent (negative capture) |
| `VIS-08` | visual | critical | Private-mode capture/trace showing all three doors resolving to `/stock/<ticker>`, paired with a public-mode capture/trace showing all three doors at their unchanged pre-existing destinations (negative capture for the Chart Room link) |
| `MOB-01` | mobile | high | At 390px, the existing fallback carries MIX and ACTIVITY values-only, no horizontal overflow, every interactive control ≥44×44 CSS px |
| `ACC-01` | accessibility | high | RETURNS' toggles, the `BY HOLDING ▸` disclosure, and the three doors are keyboard-operable with correct focus and `aria-pressed`/`open` state |
| `TST-01` | tests | high | New/extended pure-function and data-plumbing coverage: `DashboardData`'s three new fields (§3), the extended `MISSION_CONTROL_TEXT_ROLES` map, and the corrected `OrreryWorld.test.tsx` door-destination assertions (§2.3), each tested before/alongside implementation |
| `TST-02` | tests | critical | Full suite green: `npm test`, no new failures, no reduction in test count beyond intentional skips |
| `BLD-01` | build | critical | `npm run build` exits 0; route list unchanged (no new route) |

---

## 15. Freeze boundary reminder

The ACTIVITY keep-or-cut-to-`/trades` verdict (architecture §9.2) is not
due yet — a review finding that says "he hasn't decided whether ACTIVITY
stays" is not a valid finding against this spec; it is the architecture's
own explicit sequencing ("the section renames first… do not ask before
then"). Restoring the CORRELATION or standalone EARNINGS sections, or
wiring any door into `/share`, are new creative/privacy decisions outside
this section's authority, not defects of it.
