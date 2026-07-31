# Phase 10 §14 design proof: The Chart Room, stage one — the page

Status: `existing-package-equivalent`, extended by this document

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

## Intent

- **User question:** "I clicked into one stock — what actually happened to
  it, is it normal, and what has it done to my book?" (`OWNER_FEEDBACK_LEDGER.md`
  FB-13, four reports, his words: *"I just want that to be implemented at
  some point."*)
- **First-five-second comprehension:** the header stat line plus the
  full-scale graph's own title (`<WINDOW> · <RETURN>`) answer "how is this
  stock doing, over what window" without scrolling — the same pattern the
  Mission Control STRIP already uses for the whole portfolio.
- **Primary action or conclusion:** none of the six benches requires action;
  each answers one plain question (its own `<span class="q">`) and the
  visitor can stop after any one of them with a complete answer to that
  question, per the five-course principle.

## Annotated references

| reference | exact quality borrowed | quality deliberately not borrowed |
|---|---|---|
| `UNIVERSE_STOCK_LAB.html` (repo root, tracked, byte-identical across its three copies, md5 `2879d448097aa40683f9c33c5bfeaf0c`) | The entire stage-one structure verbatim: strip layout, full-scale graph with its four range detents / two modes / five overlays, the six-bench grid with each bench's plain-English question, the CONTRIBUTION & POSITION owner-tagged tiles, THE COMPANY plate | Its own inline `:root` token block (`--type-label:11px` etc.) — stale, predates FB-05's already-shipped 12px bump; its demo PRNG data generator; its `§3 FLIGHT MODEL LIVE` rocket-cursor re-implementation (already shipped elsewhere, not this section's work); its stage-two nav (`VISIT PLANET ▸`, `◂ BACK`) — bound to §15 |
| `src/components/observatory/orrery/orrery.module.css` `:root` (lines 9-32) | The already-accepted, already-owner-confirmed token values this mock's palette maps onto 1:1 by role: `--type-hero/readout/title/body/label` (12px at `--type-label`, post-FB-05), `--amber`, `--phosphor`, `--ink`≈`--cream`, `--panel`≈`--glass` | Nothing rejected — this is the production source of truth the mock's stale copy must be reconciled against, not re-derived |
| `src/lib/observatory/mission-control-layout.ts` `MISSION_CONTROL_TEXT_ROLES` (FB-05's role→token map, §12a) | The pattern itself: an explicit role→token map plus a rendered computed-style test, not a source-parse-only one | Its specific selectors — Mission Control's, not this page's |
| `src/app/stock/[ticker]/page.tsx` (pre-existing, owner-gated, `dynamic = "force-dynamic"`, `robots: {index:false}`) | The route itself (`/stock/[ticker]`), its session-gate pattern, and its data source `getStockDetailData` | Its Tailwind/light-capable "old dashboard" visual language (`StatCard`, `DataTable`-adjacent classes) — superseded here by the observatory system, per `PHASE10.md` §15's own framing that the pre-universe dashboard's *content*, not its look, is what survives |
| `src/components/dashboard/{CorrelationHeatmap,ContributionChart,BetaTable,HoldingRiskTable}.tsx` and their backing lib (`correlationMatrix`, `perHoldingRisk`, `computeBenchmarkComparison`, `drawdown`, `annualizedVolatility`, `buildHoldingsPerformance`) | The math and the already-tested data shapes only — correlation, beta, volatility, drawdown, contribution ranking | Their JSX/Tailwind presentation — the six benches are new SVG-based single-ticker views per the mock, not embeds of the whole-portfolio table components |

## Negative list

- **A second, competing palette.** No new hex values. Every color in this
  page must trace to an existing observatory token or an already-approved
  ramp value (gain/loss/flat, `UNIVERSE_IDEAS_3.md`'s firewall tiers).
- **A literal `--type-label:11px` redeclaration.** The mock predates FB-05;
  shipping its stale value would regress a closed legibility fix on a brand
  new surface.
- **A rebuild of the four named dashboard components' math.** Re-deriving
  correlation, beta, volatility, drawdown, or contribution independently
  would create a second source of truth for numbers Mission Control and the
  old dashboard already compute and test.
- **A fabricated number anywhere the mock shows demo data.** The mock says
  so about itself (`DEMO DATA · ROUND 6 MOCK · NOT LIVE`); the shipped page
  drops that stamp entirely because nothing on it may still be fabricated —
  insufficient history is an absent/designed-empty state, never a zero.
- **Wiring the doors.** A HOLDINGS row click, an ORBITS ring/blip click, and
  `FULL ANALYSIS ▸` are `PHASE10.md` §15's stage two, explicitly bound there
  "so it cannot slip behind content work a fourth time." Building any of
  them here would pre-empt that binding.
- **A second CSS custom-property namespace.** New tokens this page needs
  that the orrery module doesn't yet define (`--void`, `--glass`, `--gain`,
  `--loss`, `--trace`, `--baseline`, `--teletype`, `--word`, `--umber`,
  `--slate`, `--flat`) are added once, at the values the mock already uses
  (verified against `UNIVERSE_IDEAS_3.md`'s firewall/gain-loss rules before
  use), not redefined per-component.

## Design grammar

- **Palette authority:** `src/components/observatory/orrery/orrery.module.css`
  `:root`, extended (not replaced) with the mock's additional role names at
  the mock's own values, pre-checked against `UNIVERSE_IDEAS_3.md`'s
  firewall tiers. Gain/loss color use is restricted to real signed figures
  (return, contribution, drawdown, day change) — never decorative.
- **Typography roles:** the same five-token ramp (`--type-hero/readout/
  title/body/label`), current production values (12px floor, post-FB-05).
  A new `CHART_ROOM_TEXT_ROLES` map (mirroring `MISSION_CONTROL_TEXT_ROLES`)
  assigns every text role on this page — header ticker name, hero TODAY
  figure, chip labels, bench headers, bench questions, tile labels/values,
  news — to one of the five tokens, asserted by a rendered computed-style
  test rather than trusted from source.
- **Spacing rhythm:** `main{width:min(1360px,calc(100% - 3rem))}` from the
  mock, consistent with FB-21's `min(1400px,96vw)` precedent of using
  available width rather than a fixed narrow column.
- **Component materials:** flat `--glass` panel backgrounds with a 1px
  `rgba(213,186,140,.32)`-equivalent border, no glassmorphism blur, no card
  shadows beyond the strip's existing sticky drop shadow — matches the
  negative list's "avoid generic AI defaults."
- **Interaction language:** the mock's own button states (`aria-pressed`,
  dashed border + amber for the owner-only COST overlay toggle) carried
  through unchanged; every control ≥44×44 CSS px at the 390px breakpoint
  per the portfolio-ux skill, even though the mock's own hit targets are
  drawn smaller (a demo-viewport artifact, not a spec).
- **Motion boundary:** none of stage one introduces new motion. The rocket
  cursor is out of scope (already shipped, `§3 FLIGHT MODEL LIVE`); if the
  page happens to sit under the same global cursor layer as the rest of the
  authenticated app, that's inherited behavior, not new work, and no
  criterion below re-tests it.
- **Responsive mode:** desktop-first with an intentional 390px collapse
  (portfolio-ux skill "Desktop and mobile" section) — the graph, the four
  bench cards, and the two plate cards stack to a single column in source
  order (graph → DISTRIBUTION → VS MARKET → DEPTH → MOVES WITH →
  CONTRIBUTION & POSITION → THE COMPANY), never cropped.

## State matrix

| state | relevant? | intended composition or behavior | proof |
|---|---|---|---|
| real data | yes | every figure on the page traces to a real computed value (Finnhub quote/candle, Supabase snapshot, or an existing tested pure function) | `BHV-01`–`BHV-05`, `VIS-01`–`VIS-07` |
| negative values | yes | loss coloring (`--loss`) on TODAY/window returns, DISTRIBUTION's today marker, DEPTH's worst mark, CONTRIBUTION bars — same sign-agnostic rendering the universe scene already uses, not a special case | `VIS-01`, `VIS-04`, `VIS-05` |
| empty / insufficient history | yes | fewer than 5 shared trading days: VS MARKET and MOVES WITH render their existing "not enough shared history" null state (`perHoldingRisk`'s and `correlationMatrix`'s own `MIN_OVERLAP`/`minOverlap` guards, unchanged) rather than a fabricated line or a zero; a ticker bought today has no DISTRIBUTION histogram and the bench says so | `BHV-05` |
| stale | yes | inherits the app-wide "prices as of `<date>`" badge (`CLAUDE.md` API-failure rule) when Finnhub is unavailable — no new staleness surface, no new badge design | `BHV-01` |
| loading | not relevant | server component, no client-side data fetch/suspense boundary introduced | — |
| error | yes | a ticker with no held position (never traded, or fully sold) renders the existing 404 (`getStockDetailData` returning `null`), unchanged | `PRV-01` regression coverage |
| private/public | yes | route stays exactly as owner-gated as it is today — session-checked, `robots:{index:false}`, never linked from `/share`; every owner-tagged tile in the mock (`VALUE`, `COST BASIS`, `DAY $`, `SINCE BUY $`, the `COST` overlay) is safe to render unconditionally because the whole route is owner-only, not because of a new per-field check | `PRV-01` |
| reduced motion | yes | no motion introduced by this page to gate; existing global reduced-motion handling elsewhere is unaffected | inherited, no new criterion needed |
| fallback renderer | not relevant | this is a flat server-rendered page, not part of the WebGL/CSS-fallback scene graph | — |

## Proof surfaces

| viewport / environment | artifact | what this proves |
|---|---|---|
| desktop 1440×900, authenticated, real holding with ≥30 sessions of history | `docs/phase10-baseline/section-14/overview-1440x900.png` + per-bench crops | full-scale graph default state (30D/RETURN/VOO-on), all six benches render with real data, type-role map holds |
| desktop 1440×900, thin-history holding (< `MIN_OVERLAP` shared VOO days or bought this week) | `docs/phase10-baseline/section-14/thin-history-1440x900.png` | empty/insufficient-history state renders as a designed absence, never a zero or a crash |
| mobile 390×844 | `docs/phase10-baseline/section-14/mobile-390.png` | single-column collapse, no horizontal overflow, ≥44px targets, unchanged source order |
| unauthenticated request to `/stock/[ticker]` | regression test, not a new capture (unchanged behavior) | privacy boundary holds — login form only, no figures leak |

Captures are produced at implementation/review per `AGENTS.md`'s live
verification and camera protocols — none exist yet at specify time, per
this gate's own review rule ("automated checks verify... Claude Lead still
judges meaning" happens at review, not spec).

## Owner decision

- **Selected direction:** `UNIVERSE_STOCK_LAB.html` stage one, adopted
  whole, per `PHASE10.md` §14's own text ("Authority... fully specified")
  and FB-13's disposition ("SCHEDULED AS ITS OWN SECTION, §14").
- **Rejected alternatives:** none recorded — this mock is the sole
  candidate reviewed across FB-13's four reports; no competing direction
  was ever presented.
- **Approval evidence:** `OWNER_FEEDBACK_LEDGER.md` FB-13 row, his words
  *"I just want that to be implemented at some point"*; `PHASE10_STATE.json`
  section note citing owner ruling commit `f392a049` promoting this section
  ahead of the Mission Control rework.

## Freeze boundary

- **Defect remediation:** bugs against this spec (wrong numbers, broken
  overlays, non-reused math, privacy leaks) are ordinary remediation.
- **New creative direction requiring owner scope:** wiring the doors
  (HOLDINGS row click, ORBITS click, `FULL ANALYSIS ▸`) is `PHASE10.md`
  §15's stage two by explicit roadmap text, not a defect of this section.
  Any request to restyle the six benches beyond reconciling the mock's
  stale tokens against the production ramp is a new creative direction and
  needs its own owner-scoped section.

## Acceptance-ledger mapping

| proof item | criterion ID(s) |
|---|---|
| Header stat line, real data only | `BHV-01` |
| Graph range detents | `BHV-02` |
| Graph RETURN/PRICE mode | `BHV-03` |
| Graph overlays (VOO/BOOK/DEPTH/TRADES/COST) | `BHV-04` |
| Six-bench real-data sourcing, no fabrication | `BHV-05` |
| Full-scale graph capture | `VIS-01` |
| DISTRIBUTION bench | `VIS-02` |
| VS MARKET bench | `VIS-03` |
| DEPTH bench | `VIS-04` |
| MOVES WITH bench | `VIS-05` |
| CONTRIBUTION & POSITION bench | `VIS-06` |
| THE COMPANY bench | `VIS-07` |
| Type-role → token map | `VIS-08` |
| Demo-data stamp absent | `VIS-09` |
| 390px collapse | `MOB-01` |
| Keyboard/focus operability | `ACC-01` |
| Privacy boundary unchanged | `PRV-01` |
| New pure-function unit tests | `TST-01` |
| Full suite green | `TST-02` |
| Production build green | `BLD-01` |
