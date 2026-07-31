# Phase 10 §15 design proof: Mission Control content rework

Status: `existing-package-equivalent`, extended by this document

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

## Intent

- **User question:** *"A lot of information is missing and a lot of the
  information that is there is not necessary… I want Fable to compare this
  website to what already exists for portfolio managers and stock
  screeners."* (Devan, `MISSION_CONTROL_ARCHITECTURE.md` opening quote,
  FB-34). The room must answer, in order, one section each: how am I doing →
  where is everything → what do I own → am I beating the market → what am I
  made of → how bad can it get → what did I do.
- **First-five-second comprehension:** unchanged from the already-accepted
  STRIP — TODAY hero + WEEK/SINCE START TWR/VS VOO/OFF HIGH chips answer "how
  am I doing" before any scroll. This section does not touch that judgment;
  it adds one chip (`NEXT: <ticker> T−nD`) and removes nothing else from it.
- **Primary action or conclusion:** none of the five reworked/new sections
  (HOLDINGS, RETURNS, MIX, RISK, ACTIVITY) requires action; each answers its
  one question from the architecture's §3 table and a visitor can stop after
  any one with a complete answer, per the five-course principle. The two new
  doors (HOLDINGS row, ORBITS ring/blip) are a continuation, not a
  requirement — nothing on this page needs them to be understood.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `MISSION_CONTROL_ARCHITECTURE.md` (owner-adopted July 30 2026, FB-34) | The entire organizing principle (§3), the section-by-section content table (§4, the authority for what goes where), the two named cuts with their rehoming (§5), the EARNINGS ruling (§6), and the hard "no new parts" rule (§1, §10) | Nothing — this is the section's own authority; PHASE10.md §15 states it is "assembled from it and re-derives nothing" |
| `src/components/observatory/orrery/MissionControlRoomContent.tsx` (live, the actual re-wiring target — confirmed the sole caller via `UniverseRoute.tsx:141`; `PublicMissionControlContent.tsx` and `MissionControlBays/*` are a superseded, unused parallel implementation from an earlier iteration and are out of scope) | The established content-section pattern: `LazyMissionSection` wrapper, plain-language helper functions (`signedPercent`/`plainPercent`), the existing HOLDINGS/RETURNS/RISK skeletons this section extends rather than replaces | Its current 8-holding cap, its CORRELATION/EARNINGS/NEWS-as-own-section treatment, its `?holding=…&camera=approach` door destinations — all superseded by this section |
| `src/components/observatory/orrery/orrery.module.css` `:root` + existing room classes (`.holdingsTable`, `.missionHalfRow`, `.roomCorrelation`, `.roomEarnings`, `.roomTrades`) | The already-accepted observatory token system (`--amber`, `--phosphor`, `--type-*` ramp) and the room's existing table/list materials, extended with new classes for MIX/ACTIVITY at the same materials, not new ones | The `.roomCorrelation`/`.roomEarnings` classes themselves — removed with their sections, not repurposed |
| §14's design proof precedent (`docs/phase10-workflow/design-proofs/section-14.md`, "quality deliberately not borrowed" row for `/stock/[ticker]`) | **The load-bearing precedent for this section's single hardest judgment call:** reuse a dashboard component's *math and data shape*, never its Tailwind/light-capable JSX, inside the dark observatory grammar. Confirmed necessary here by direct inspection — `ConcentrationMeter`, `CompositionDonut`, `ExcessReturns`, `WinnersLosers`, `MetricDisclosure` etc. all render `text-text-secondary`/`Card`/`rounded-lg border` Tailwind classes and (for `CompositionDonut`) a 13-hue brand-accent palette rooted at `#7C6FFF` — a different design system than the dark `--amber`/`--phosphor` room. Embedding their JSX verbatim would be exactly the "two-design-systems disease" the architecture document itself names and forbids (§5) | Their JSX is not borrowed at all — new observatory-grammar markup renders their already-computed values instead |
| `src/lib/dashboard-data.ts` (`DashboardData` type, already used by both the current room and the superseded public-content path) | Already-computed fields with no new math needed: `hhi`, `top2ConcentrationPct`, `sectorWeights`/`aiExposureWeights` (`ClassificationWeight[]`), `benchmarkComparisons` (`BenchmarkComparison[]`, one per `BENCHMARK_TICKERS` entry — VOO/VTI/XLK), `holdingsPerformance` (`HoldingsPerformanceSeries`), `holdingRisks` (`HoldingRisk[]`), `movers` (`Mover[]`, already what `WinnersLosers`' movers line needs), `positionRows` (all real holdings, not the 8-planet-capped `publicOrreryHoldings`), `upcomingEarnings` | Nothing — every value this section needs to render already exists on this type; the only plumbing gap is `drawdownSeries`/`dailyReturnBars`/`compositionHistory`, computed by `getHistoryData()` (`src/lib/history-data.ts`) but not yet exposed on `DashboardData` |
| `src/app/history/page.tsx` + `src/lib/history-data.ts` (`getHistoryData`) | The exact, already-tested series this section's RISK (`drawdownSeries`, `dailyReturnBars`) and MIX (`compositionHistory`) panels need — reused by calling the existing function, not by re-deriving drawdown/composition-over-time math a second time | The route's own Tailwind `DataTable` presentation — not reused; the room renders these series in its own observatory grammar, matching the reuse-math-not-JSX rule above |
| `src/lib/observatory/metric-explanations.ts` (already exports `betaExplanation`, `volatilityExplanation`, and builders for `max-drawdown`/`hhi` per its own `METRIC_EXPLANATION_IDS` union) | The existing plain-language-on-demand pattern `MetricDisclosure` already renders — the "one organ worth harvesting" the architecture names explicitly (§5) | `MetricDisclosure`'s own Tailwind chrome — its disclosure *behavior* (button, focus-on-open, reduced-motion respecting) is the reusable part; its wrapper markup is re-skinned to the room's materials exactly as `MISSION_CONTROL_TEXT_ROLES`' pattern already does for typography |

## Negative list

- **A new component, chart primitive, or data computation.** The
  architecture's own acceptance test (§10): "the parts list must contain
  only component names from the inventory, plus the Chart Room." Every
  number in every reworked section must trace to an already-computed
  `DashboardData`/`HistoryData` field or an already-tested pure function.
- **Embedding the Tailwind dashboard components' JSX wholesale.** Would
  reintroduce the two-design-systems problem the architecture explicitly
  diagnosed and forbids (§5) — see the §14-precedent reference row above.
- **A second CORRELATION surface.** The full matrix is retired (architecture
  §5); the TOP-2/HHI line and the Chart Room's `MOVES WITH` bench are its
  only two surviving homes. Do not add a scaled-down matrix "just in case."
- **A standalone EARNINGS section, in any form.** Confirmed cut by the owner
  (architecture §6, §9.1) — chips only: the strip's `NEXT` chip, a per-row
  `T−nD` chip in HOLDINGS, and the Chart Room's own strip.
- **Wiring any door into `/share`/public mode.** `src/app/stock/[ticker]/
  page.tsx`'s own header comment: *"Owner-gated — never part of the public
  `/share` surface."* §14's design proof state matrix confirmed this in
  writing. Public-mode HOLDINGS rows, the public ORBITS radar, and
  public-mode `PlanetDetail` keep their existing `?holding=…&camera=
  approach` destinations unchanged — the three new doors are a
  **private-mode-only** behavior change. This is the section's single
  highest-risk negative-list item; a finding that a public visitor can reach
  the Chart Room is a `PRV-01` failure, not a taste note.
- **Pre-building the ACTIVITY keep/cut branch.** The architecture (§9.2)
  records that verdict as not yet due — the section renames first, the owner
  answers after seeing a capture. Do not build a `/trades` redirect or a
  removal path speculatively.
- **A fabricated number anywhere a source is thin.** Insufficient shared
  history for `VS MARKET`/correlation-derived figures, a holding bought
  today with no sparkline history, a portfolio with no upcoming earnings —
  each renders its already-established empty/absent state (the underlying
  functions' own `minOverlap`/null-field guards), never a zero standing in.

## Design grammar

- **Palette authority:** unchanged — `orrery.module.css` `:root`, the same
  tokens §12/§13/§14 already use. No new hex values. Gain/loss color stays
  restricted to real signed figures.
- **Typography roles:** unchanged five-token ramp (`--type-hero/readout/
  title/body/label`, 12px floor). `MISSION_CONTROL_TEXT_ROLES`
  (`src/lib/observatory/mission-control-layout.ts`) is extended, not
  replaced, with role entries for MIX and ACTIVITY's new/renamed text —
  same rendered-computed-style test pattern, no new token values.
- **Spacing rhythm:** unchanged `MISSION_CONTROL_CSS_PROPERTIES`/existing
  `.missionDescentSection` rhythm. MIX is a new `LazyMissionSection` at the
  same vertical rhythm as its neighbors — no new spacing scale.
- **Component materials:** unchanged flat `--glass` panel, 1px
  `rgba(213,186,140,.32)`-equivalent border, no glassmorphism, no card
  shadows beyond the strip's existing sticky drop shadow — the same
  materials `.holdingsTable`/`.riskInstruments` already use, extended to
  MIX/ACTIVITY rather than introducing a second material language.
- **Interaction language:** the existing per-row ticker `Link`, the
  existing `aria-pressed` toggle pattern (`RETURNS`' per-benchmark toggle
  and the new `BOOK VS MARKET`/`STOCK VS STOCK` mode switch reuse it), the
  existing `<details>`/`<summary>` disclosure pattern already used
  elsewhere in this room (`BY HOLDING ▸` reuses it, not a new widget).
  Every control ≥44×44 CSS px at 390px per the portfolio-ux skill.
- **Motion boundary:** none of this section introduces new motion. No new
  criterion re-tests global reduced-motion handling.
- **Responsive mode:** desktop-first with the existing <1024px static
  fallback (`observatory-fallback.test.ts`, FB-09's mobile-preserving
  override precedent). New/renamed sections (MIX, ACTIVITY) must appear in
  that fallback too, values-only, extending it rather than building a
  second fallback path.

## State matrix

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | every figure in every reworked/new section traces to an already-computed `DashboardData`/`HistoryData` field | `BHV-01`–`BHV-07`, `VIS-01`–`VIS-07` |
| negative values | yes | loss coloring on TODAY/WEEK/RETURNS/RISK/ACTIVITY figures — same sign-agnostic rendering already in use, not a special case | `VIS-02`–`VIS-06` |
| empty / insufficient history | yes | a holding with too little shared VOO history renders `HoldingsPerformanceChart`/`holdingRisks`' own existing null guard; a portfolio with no upcoming earnings omits the `NEXT` chip entirely (not a dash); MIX/RISK series shorter than the snapshot history render whatever they have, per `getHistoryData`'s own behavior | `BHV-02`, `BHV-04`, `BHV-05` |
| stale | yes | inherits the existing app-wide "prices as of `<date>`" badge — no new staleness surface | inherited, no new criterion |
| loading | not relevant | server-rendered content, no new client fetch/suspense boundary | — |
| error | not relevant | no new route, no new error boundary | — |
| private/public | yes | **the section's central risk.** All content reworks (STRIP/HOLDINGS/RETURNS/MIX/RISK/ACTIVITY/footer) render in both modes per the existing `mode==="private"` conditionals already in `MissionControlRoomContent.tsx`, unchanged in kind; the three doors resolve to the Chart Room in private mode only, and public mode keeps its pre-existing `?holding=…&camera=approach` destinations | `PRV-01` |
| reduced motion | yes | unaffected — no new motion | inherited, no new criterion |
| fallback renderer | yes | <1024px static fallback gains values-only MIX/ACTIVITY rows, existing pattern | `MOB-01` |

## Proof surfaces

| viewport / environment | artifact | what this proves |
|---|---|---|
| desktop 1440×900, authenticated, real portfolio | `docs/phase10-baseline/section-15/private-overview-1440x900.png` + per-section crops (STRIP, HOLDINGS, RETURNS both toggle states, MIX, RISK with disclosure open, ACTIVITY, footer) | full descent renders with real data, doors present, CORRELATION/EARNINGS sections absent |
| desktop 1440×900, `/share` (public mode) | `docs/phase10-baseline/section-15/public-overview-1440x900.png` | percentages-only projection, no dollar tiles, no Chart Room links anywhere (negative capture pairs with `PRV-01`) |
| desktop 1440×900, thin-history holding present | `docs/phase10-baseline/section-15/thin-history-1440x900.png` | empty/insufficient-history states render as designed absences, not zeros |
| mobile 390×844, private | `docs/phase10-baseline/section-15/mobile-390.png` | existing fallback carries MIX/ACTIVITY values-only, no horizontal overflow, ≥44px targets |
| the three doors, private mode | `docs/phase10-baseline/section-15/doors-private.json` (URL/navigation trace, not a screenshot) | HOLDINGS row, ORBITS ring/blip, and `FULL ANALYSIS ▸` each resolve to `/stock/<ticker>` |

Captures are produced at implementation/review per `AGENTS.md`'s live
verification and camera protocols — none exist yet at specify time.

## Owner decision

- **Selected direction:** `MISSION_CONTROL_ARCHITECTURE.md` adopted whole,
  per `PHASE10.md` §15's own text ("assembled from it and re-derives
  nothing") and the document's own confirmed rulings (§9.1 EARNINGS as
  chips, CONFIRMED July 30 2026).
- **Rejected alternatives:** none recorded — the architecture document is
  the sole delivered Fable consult (FB-34), benchmarked against brokerage
  pages, Morningstar's portfolio view, and Empower; no competing content
  architecture was ever presented.
- **Approval evidence:** `OWNER_FEEDBACK_LEDGER.md` FB-34 row ("RESOLVED —
  Jul 30, 2026… delivered and adopted"); `MISSION_CONTROL_ARCHITECTURE.md`
  §9 recording the EARNINGS ruling in his own answered question;
  `PHASE10.md` §15's roadmap text citing the same authority.

## Freeze boundary

- **Defect remediation:** wrong numbers, a door that doesn't navigate, a
  privacy leak (a public-mode link reaching the owner-gated route), broken
  toggle state, non-reused math, or a section rendered with the wrong
  content per the architecture's §4 table — all ordinary remediation.
- **New creative direction requiring owner scope:** the ACTIVITY keep/cut-to-
  `/trades` verdict (architecture §9.2) is explicitly not due yet — do not
  treat "he hasn't answered" as a defect. Any request to restyle a
  section's visual treatment beyond reconciling reused Tailwind-component
  data into the existing observatory grammar (i.e., inventing new visual
  language for MIX/RISK/ACTIVITY rather than matching the room's established
  materials) is a new creative direction and needs its own owner-scoped
  section. Restoring the CORRELATION section or the standalone EARNINGS
  section would also be a new creative direction, not a defect fix — both
  are owner-confirmed cuts.

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| STRIP — `NEXT` chip added, EARNINGS nav link removed | `BHV-01` |
| HOLDINGS rework — all holdings, full column set, movers line, TOP-2/HHI line | `BHV-02` |
| RETURNS rework — per-benchmark toggle, `ExcessReturns`, `BOOK VS MARKET`/`STOCK VS STOCK` mode | `BHV-03` |
| MIX — new section | `BHV-04` |
| RISK rework — gauges + two history charts + `BY HOLDING ▸` disclosure + `MetricDisclosure` everywhere | `BHV-05` |
| ACTIVITY rename + column rename | `BHV-06` |
| Footer NEWS demotion; CORRELATION and EARNINGS sections removed | `BHV-07` |
| Three doors wired, private mode | `BHV-08` |
| Privacy — doors mode-gated, `/share` projection unchanged in kind | `PRV-01` |
| STRIP capture | `VIS-01` |
| HOLDINGS capture | `VIS-02` |
| RETURNS capture (both toggle states) | `VIS-03` |
| MIX capture | `VIS-04` |
| RISK capture (disclosure open) | `VIS-05` |
| ACTIVITY capture | `VIS-06` |
| Footer + cuts capture (negative) | `VIS-07` |
| Doors + public-mode negative capture | `VIS-08` |
| 390px fallback collapse | `MOB-01` |
| Keyboard/focus operability (toggles, disclosure) | `ACC-01` |
| New/extended pure-function and data-plumbing unit tests | `TST-01` |
| Full suite green | `TST-02` |
| Production build green, no new route | `BLD-01` |
