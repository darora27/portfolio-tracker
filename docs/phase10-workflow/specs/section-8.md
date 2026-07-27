# Phase 10 §8 — The Stock Market Universe — `/share` rebuilt

Written by: claude-code/sonnet-5 (Claude Lead, `specify` stage)

Authority, in order when anything here seems to conflict: `UNIVERSE_DIRECTION.md`
(owner brief) → `UNIVERSE_IDEAS.md` (accepted creative response, including its
inline corrections) → `PHASE10.md` §8 → `docs/reference/README.md` (visual
references and their cautions) → this document. `PRODUCT_DIRECTION.md`'s
description of `/share` as a five-chapter Field Journal with an Orrery entrance
is superseded for this section by the three documents above; its Decision
hierarchy (security/privacy → financial correctness → user question →
accessibility → hierarchy → performance → art direction → convenience) and its
non-goals (no dollar amounts on `/share`, no logos/wordmarks, no fake data)
remain fully binding. `CLAUDE.md`'s financial math rules remain binding without
exception. The `portfolio-ux` skill was consulted while writing this spec: its
"one dominant visual per layer," "no essential information only in motion,
colour, speed, or direction," and "avoid generic AI defaults" rules are
restated as concrete criteria throughout §9 below, and its review-time
checklist (screenshots, hierarchy, overflow, target sizes, keyboard operation,
reduced motion/fallback, privacy, tests, build) frames §9's dimension grouping.

This is the largest single Phase 10 section to date. It replaces the
five-chapter `/share` navigation and the current placeholder-sphere Orrery
(built in §7) with the full Stock Market Universe: rank-based orbits, an
axial-spin day-return channel, comet trails, a health-encoded sun, an asteroid
belt with hysteresis, lock-on targeting, a three-camera-state system, a
per-ticker texture pipeline, a diegetic "Mission Control" overlay absorbing the
retired chapters' analysis, a summonable systems manual, and a one-time
first-visit orientation. Below 1024px nothing changes — the existing tested
fallback ships unchanged.

**Owner amendment, July 27, 2026 (round two):** the bounded remediation in
`docs/phase10-handoffs/2026-07-27-section-8-devan-to-codex-implementation-remediate-2.md`
supersedes this document only where it explicitly says so. In particular,
`/` now shares the Stock Market Universe implementation with `/share` while
retaining its owner gate; native 512×256 texture resolution, non-occluding
ticker labels, four return-to-OVERVIEW paths, and simpler Mission Control
chrome are required. The former `/` out-of-scope statement below is retained
as specification history, not current direction. — recorded by codex/gpt-5

## 0. Correcting a premise before scope: the runtime is raw three.js, not R3F

`PRODUCT_DIRECTION.md` and `PHASE10.md` §7 both describe "React Three Fiber"
as the production runtime. **That is not what shipped.** `package.json`
contains `three@0.185.1` only — `@react-three/fiber` and `@react-three/drei`
are not dependencies. The accepted §7 implementation
(`src/components/observatory/orrery/OrreryScene.tsx`) is raw imperative
three.js (`new Scene()`, `new WebGLRenderer()`, a manual `requestAnimationFrame`
loop, manual raycasting), and this is enforced by a regression test:
`src/app/dev/phase10-portfolio-orrery/OrreryScene.source.test.ts` asserts
`expect(source).not.toMatch(/@react-three\/fiber|import \* as THREE/)`. This
section **continues the raw-three.js architecture** — it does not introduce
`@react-three/fiber`/`@react-three/drei` as a new dependency. (A separate,
unrelated file literally named `R3fScene.tsx` exists at
`src/app/dev/phase10-spike-r3f-world/` — it is also raw three.js internally, a
dead §7 A/B-spike leftover never wired into production. Do not confuse it with
anything in this section; it is untouched, out of scope, see §1.)

## 1. Scope — the smallest complete vertical slice

Rebuild `/share`'s public entry point end-to-end: a full-viewport Stock Market
Universe with rank-ordered orbits, size-by-weight planets, comet trails, axial
spin, a health-encoded sun, an asteroid belt, lock-on targeting, a
rendezvous camera sequence, per-ticker planet textures, a "Mission Control"
overlay absorbing the retired five-chapter analysis, a summonable systems
manual, and a one-time first-visit orientation. Retire the five-chapter
`/share` navigation and the session-scoped entrance from `/share` only. Every
number rendered continues to come from the existing, unmodified financial math
core.

### In scope

- Extending `src/lib/observatory/orrery.ts` (§3): new pure encoding functions
  (orbit radius by rank, axial spin, health scalar, sunspot intensity, belt
  hysteresis), new fields on `PublicOrreryHolding`, all unit-tested against
  hand-computed fixtures including clamp boundaries and the unavailable case.
- Extending `src/lib/dashboard-data.ts` (§4): projecting `dayReturn` onto
  `publicOrreryHoldings`; exposing the portfolio-level health inputs already
  computed (`twr7d`, `dailyChangePct`, `volatilityPct`, `allTimeHigh.pct`) to
  the Orrery; querying the most recent prior snapshot's top-8 membership for
  belt hysteresis.
- Rewriting `src/components/observatory/orrery/OrreryScene.tsx` (§5-§8): rank-
  based orbit placement, comet trail geometry, axial spin, sun health
  rendering (color/corona/pulse/sunspots), the OVERVIEW/APPROACH/COMMAND
  camera system, lock-on targeting, the asteroid belt, and the per-ticker
  texture pipeline (equirectangular base + emissive + normal maps, KTX2,
  lazy-streamed after first paint).
- Rewriting `src/components/observatory/orrery/OrreryWorld.tsx` (§9, §11):
  visually removing the always-on 13/21-entry list and legend in favor of a
  compact HUD, while keeping the full semantic content in the accessible DOM;
  adding the summonable systems manual and first-visit orientation; adding the
  belt panel; wiring Mission Control.
- New `src/components/observatory/orrery/MissionControl.tsx` (§10): the
  sun's destination overlay, reusing the five existing, already-accepted,
  already privacy-tested chapter content components verbatim.
- New `src/components/observatory/orrery/SystemsManual.tsx` and
  `FirstVisitOrientation.tsx` (§11.3).
- A texture-generation script under `scripts/` (§8.4) and its committed static
  output under `public/textures/planets/` for the eight starting tickers.
- Editing `src/app/(depth-pull)/share/page.tsx` (§12): removing the
  `ObservatoryShell`/`ObservatoryEntrance` mounts, wiring the new
  `?planet=`/`?camera=`/`?manual=1` URL state, passing the new data fields.
- Deleting `src/components/observatory/ObservatoryEntrance.tsx` and its test
  (§12) — confirmed by direct grep to be used only by `/share`'s mount; no
  other route references it.
- Before/after screenshots and motion evidence per §14's Visual criteria.

### Explicitly out of scope (do not touch)

- `src/components/observatory/ObservatoryShell.tsx`, `ChapterOrbit.tsx`,
  `ChapterFocusManager.tsx`, `src/lib/observatory/chapters.ts`, and every
  `*Chapter.tsx` component's **own internal implementation** — confirmed by
  direct grep still mounted by `src/app/(depth-pull)/page.tsx` (the private
  `/` owner briefing). None of this is deleted; §10 imports the five chapter
  components as-is into Mission Control. Do not edit their internals to
  "reskin" them structurally — Mission Control's HUD chrome is a wrapping
  shell around them (§10), not a rewrite of what's inside them.
- `src/app/(depth-pull)/page.tsx` (the private `/`) — unaffected. §8 is
  `/share` only, per `PHASE10.md`'s Purpose statement.
- `src/app/dashboard/page.tsx` and everything under `src/components/dashboard/`
  — the real, owner-gated, dollar-bearing dashboard is untouched. **Mission
  Control is not this route and does not link to it** — see §10's design
  decision for why "the dashboard the sun opens," read literally, cannot be
  the owner-gated `/dashboard`.
- `src/app/share/full/page.tsx` — untouched. It remains the existing public
  full-detail compatibility route; Mission Control does not replace, embed, or
  redirect to it (per-component reuse happens via the chapter components
  directly, not via this page). Its own migration remains a separate,
  unopened decision per `PRODUCT_DIRECTION.md`'s route table.
- `src/components/surface/PortfolioOrrery.tsx` and its test — an unrelated
  pure-CSS decorative widget on the homepage's `SurfaceActs.tsx`. Shares a
  name with this section's subject matter and nothing else. Do not edit it,
  do not rename it, do not "consolidate" it with anything in this section.
- `src/app/dev/phase10-spike-r3f-world/**` — the dead §7 A/B-spike route. Not
  linked from production, not reachable from `/share`. Leave it exactly as it
  is; deleting it is a separate, unbounded cleanup decision this section does
  not need to make.
- `src/app/dev/phase10-portfolio-orrery/**` (the owner-gated §7 reference-study
  route and its tests) — may be updated only insofar as it imports the same
  `OrreryWorld`/`OrreryScene` components this section changes and must not be
  left broken; do not redesign this route itself or its own acceptance
  contract beyond what's needed to keep it compiling and passing against the
  new component APIs.
- `src/lib/math/*`, `src/lib/portfolio/*` (including `holdings-performance.ts`,
  `trailing-return.ts`, `drawdown.ts`, `all-time-high.ts`) — read-only. Every
  new Orrery/sun input this section needs (`dayReturn`, `twr7d`,
  `dailyChangePct`, `volatilityPct`, `allTimeHigh.pct`) is already computed by
  existing, accepted, tested math. No new financial calculation is invented;
  §3/§4 only project and re-scale already-correct numbers.
- `src/components/dashboard/*` components reused by Mission Control's chapter
  content (none directly — the chapters already only pull public-safe fields)
  — no dashboard component is imported into `/share` by this section.
- Trades, research, history, compare routes — untouched.
- Any new runtime dependency beyond what §8.4 requires for KTX2
  decode/loading (`three`'s own built-in `KTX2Loader` + its required Basis
  transcoder WASM, which three.js already ships — no new npm package). No
  physics engine, no postprocessing library, no popover/tabs framework, no
  `@react-three/*` package (§0).

## 2. Design decisions to record verbatim in the evidence doc (§16)

These resolve ambiguities the brief and idea documents deliberately left open
or under-specified against the *current* codebase. Record each rationale so a
later section doesn't need to rediscover it.

**2.1 "Clicking the sun opens the existing dashboard" means Mission Control,
not `/dashboard`.** `/share` is public and unauthenticated; `/dashboard` is
owner-gated and dollar-bearing (`isValidSession` cookie check,
`export const dynamic = "force-dynamic"`). Literally navigating an anonymous
`/share` visitor to `/dashboard` is impossible without either breaking the
owner gate (a privacy violation ranked #1 in the Decision hierarchy) or
redirecting to a sign-in form (breaking `UNIVERSE_IDEAS.md`'s "you never leave
the place" requirement). `PHASE10.md`'s own Purpose text resolves this:
*"The analysis inside those chapters is not discarded; it moves into the
dashboard that opens when the sun is selected."* Mission Control **is** that
dashboard — a new public overlay assembled from the same five chapter
components (`PulseChapter`, `ForcesChapter`, `StructureChapter`,
`TimelineChapter`, `LabChapter`) already mounted in `/share` today, wrapped in
HUD chrome, not a link to the private route.

**2.2 Sun health reads from `data.dailyChangePct` and `data.twr7d`, both
already TWR-consistent.** Direct read of `dashboard-data.ts` confirms
`dailyChangePct` is computed via `dailyChangePercent(totalValue,
prevSnapshot.totalValue, netFlowsToday)` — net of today's cash flow, i.e.
exactly `CLAUDE.md`'s `r_t = (V_t − F_t) / V_{t−1} − 1`. `twr7d` is
`trailingReturn(portfolioIndexSeries, 7)` against the TWR-chained growth
index — a genuine trailing-week TWR, not a since-purchase or simple figure.
Both are already returned on `DashboardData` (`dailyChangePct: number`,
`twr7d: number | null`) — no new financial computation, only new consumption.

**2.3 Sunspot input is `data.allTimeHigh.pct`, already public-safe.**
`AllTimeHighInfo = { pct: number; peakDate: string }` from
`src/lib/math/all-time-high.ts`, computed off the dollar-free growth-index
series and already consumed by the public `TimelineChapter` today (confirmed:
`share/page.tsx` passes `allTimeHigh={data.allTimeHigh}` into a chapter
already covered by the canary-value privacy test). `pct` is the current
distance below peak (0 or negative) — exactly `UNIVERSE_IDEAS.md`'s "distance
from all-time high." No dollar figure is touched.

**2.4 Belt hysteresis reads "yesterday's" membership from `snapshot_positions`,
not a new table.** `CLAUDE.md`'s schema already stores one `snapshot_positions`
row per ticker per snapshot date. §4.2 queries the most recent `snapshots` row
strictly before today's date, joins `snapshot_positions`, computes top-8 by
each row's `value / snapshots.total_value` in that historical dataset, and
passes that ticker set into `resolveBeltMembership` (§3.5) as
`previousMembership`. No schema migration, no new table.

**2.5 Per-holding day return (`dayReturn`) reuses the existing simple daily
price-change field, unlabeled as such in the UI beyond text.** Axial spin
encodes a single stock's *own* day-over-day price move
(`positionRows[].dayPct`, from `dayChange(shares, price, prevClose)`) — this
is standard single-instrument daily price change, not a portfolio-level
figure subject to `CLAUDE.md`'s TWR/XIRR same-period-comparison rules (those
rules govern portfolio-level and benchmark-relative figures). It is not
displayed as a headline return claim, only as a spin-rate encoding with the
exact percentage available as text in the semantic list/inspector — consistent
with `CLAUDE.md`'s general practice of showing per-holding day moves
(`movers`, `WinnersLosers`) as simple daily price changes elsewhere in the
accepted product.

**2.6 Texture generation is a committed static asset pipeline, not a live
AI-image dependency.** `UNIVERSE_DIRECTION.md`/`UNIVERSE_IDEAS.md` describe
per-ticker art generated once and cached — this must not become a production
runtime dependency on an external image-generation API (that would violate
"no new build-time network dependency," mirror the exact font-fetch fragility
`CLAUDE.md`/§14 is already working to remove, and cannot be privacy- or
budget-bounded). §8.4 specifies a **committed, offline, deterministic texture
generation script** producing static files checked into `public/textures/`.
The script may call an external generation API interactively when run by a
developer (outside the test/build pipeline, exactly like the `docs/reference/`
mood images were produced), but the **committed output**, not the generation
step, is what `npm run build` and the runtime depend on. If no such
interactive generation is available in the implementing environment, the
script must fall back to a deterministic **procedural** generator (canvas/JS,
seeded per ticker identity — never per array index, per §0's correction of the
current index-keyed shader) that still satisfies §8's technical requirements
(equirectangular aspect, per-ticker visual distinctness, KTX2 compression, no
logos/wordmarks) even if it does not yet reach the photographic mood-board
fidelity `docs/reference/planet-surface-mood-reference.jpg` illustrates.
Record in the evidence doc which path was used.

## 3. `src/lib/observatory/orrery.ts` — extended pure module

Unchanged, reused verbatim: `radiusForWeight` (planet **size** by weight —
this stays the encoding for mesh scale, unrelated to spatial orbit distance),
`directionForWeeklyReturn`, `angularSpeedForWeeklyReturn`,
`weeklyReturnForPrices`, `companyNameForTicker`, all four exported constants.

### 3.1 `PublicOrreryHolding` — new fields

```ts
export type PublicOrreryHolding = {
  ticker: string;
  companyName: string;
  weight: number;
  weeklyReturn: number | null;
  portfolioRelativeReturn: number | null;
  volatilityPct: number | null;
  betaVsVoo: number | null;
  /** New: today's simple daily price change for this single holding. Drives axial spin (§3.3). Not a portfolio-level or TWR figure — see design decision 2.5. */
  dayReturn: number | null;
};
```

### 3.2 Orbit radius by rank (replaces the private, un-exported,
un-tested `orbitRadiusForIndex` inside `OrreryScene.tsx`)

```ts
export const ORRERY_SUN_CLEARANCE = 3.4; // minimum sun-to-first-orbit distance — see docs/reference/README.md's composition-risk caution on concept-desktop-overview.png: the heaviest planet must not crowd the sun, the primary health indicator
export const ORRERY_RING_SPACING = 0.62;

/** rank is 1-indexed, 1 = heaviest holding. Heaviest orbits innermost (the gravity metaphor, UNIVERSE_IDEAS.md §2). One planet per ring by construction — overlap is structurally impossible, not tuned away. */
export function orbitRadiusForRank(rank: number): number {
  if (rank < 1 || !Number.isInteger(rank)) {
    throw new RangeError(`orbitRadiusForRank: rank must be a positive integer, got ${rank}`);
  }
  return ORRERY_SUN_CLEARANCE + (rank - 1) * ORRERY_RING_SPACING;
}
```

Tests: `rank=1` returns exactly `ORRERY_SUN_CLEARANCE`; monotonically
increasing for ranks 1-8; `rank=0`/non-integer/negative throws.

### 3.3 Axial spin (day return)

```ts
export const ORRERY_MIN_AXIAL_SPIN = 0.05;
export const ORRERY_MAX_AXIAL_SPIN = 0.55;
const MIN_SPIN_RETURN = 0.001;
const MAX_SPIN_RETURN = 0.06;

/** Spin RATE encodes |day return| magnitude only — direction is not spin-encoded (design decision: the brief specifies orbit direction as the sign channel; a second, independent sign channel on the same body was rejected as redundant and untested for legibility). Exact day-return sign remains available as text everywhere this field reaches the DOM (§9, §11). */
export function axialSpinForDayReturn(dayReturn: number | null): number {
  if (dayReturn === null) return ORRERY_MIN_AXIAL_SPIN;
  const clamped = Math.min(MAX_SPIN_RETURN, Math.max(MIN_SPIN_RETURN, Math.abs(dayReturn)));
  const normalized = (clamped - MIN_SPIN_RETURN) / (MAX_SPIN_RETURN - MIN_SPIN_RETURN);
  return ORRERY_MIN_AXIAL_SPIN + normalized * (ORRERY_MAX_AXIAL_SPIN - ORRERY_MIN_AXIAL_SPIN);
}
```

Tests: `null` → `ORRERY_MIN_AXIAL_SPIN` (a planet always visibly rotates — a
motionless sphere would misread as "not real 3D," not as "flat day"); value
below/above the clamp bounds; monotonicity; a known midpoint fixture
hand-computed.

### 3.4 Health scalar (the sun)

```ts
/**
 * h ∈ [-1, 1]. Day weighted 60/40 over week (UNIVERSE_IDEAS.md §1), each
 * leg normalized against the portfolio's own recent volatility so a -1% day
 * on a 37%-vol portfolio and a -1% day on an 11%-vol portfolio read
 * differently. annualizedVolatilityPct must already be a decimal (e.g. 0.37
 * for 37%), matching data.volatilityPct's existing units.
 */
export function healthScalarForPortfolio(
  dayReturnPct: number,
  weekReturnPct: number,
  annualizedVolatilityPct: number,
): number {
  const safeVol = Math.max(annualizedVolatilityPct, 0.02); // floor avoids divide-by-near-zero on a placid or brand-new portfolio
  const dailySigma = safeVol / Math.sqrt(252);
  const weeklySigma = safeVol / Math.sqrt(52);
  const dayZ = dayReturnPct / dailySigma;
  const weekZ = weekReturnPct / weeklySigma;
  const blended = 0.6 * dayZ + 0.4 * weekZ;
  return Math.max(-1, Math.min(1, blended / 2)); // /2: ~2 blended standard deviations reach the clamp, so an ordinary day sits well inside [-1,1] and only a genuinely extreme day/week pins it
}
```

Test fixtures (hand-computed): a flat day/week on any volatility → `h` near
`0`; a `-1%` day on a `37%`-vol portfolio → weak but not pinned (matches
`UNIVERSE_IDEAS.md`'s "an ordinary breath, not a crisis" framing — assert
`h > -0.5`); an extreme `-8%` day → pinned at exactly `-1`; a `+8%` day →
pinned at exactly `1`; the same `-1%` day on an `11%`-vol portfolio produces a
more negative `h` than on the `37%`-vol portfolio (assert strict inequality —
this is the "same -1% reads stronger/weaker" requirement made checkable).

### 3.5 Sunspot intensity (drawdown from all-time high)

```ts
const SUNSPOT_FULL_INTENSITY_DRAWDOWN = -0.20; // -20% from ATH reads as maximally spotted

/** currentDrawdownFromAthPct is data.allTimeHigh?.pct ?? 0 (0 or negative; null allTimeHigh — e.g. no snapshot history yet — maps to 0, an honest "unknown, assume none" default, never a fabricated spot). Returns 0..1. */
export function sunspotIntensityForDrawdown(currentDrawdownFromAthPct: number): number {
  const clamped = Math.max(SUNSPOT_FULL_INTENSITY_DRAWDOWN, Math.min(0, currentDrawdownFromAthPct));
  return clamped / SUNSPOT_FULL_INTENSITY_DRAWDOWN;
}
```

Tests: `0` → `0`; `-0.137` (today's real figure per `UNIVERSE_IDEAS.md`) →
`0.685`; `-0.20` and beyond → `1` (clamped); a positive input (should never
occur, but the type is `number`) → `0`.

### 3.6 Belt membership with hysteresis

```ts
export const ORRERY_BELT_HYSTERESIS_BAND = 0.005; // 0.5%, per UNIVERSE_IDEAS.md §5
export const ORRERY_PLANET_COUNT = 8;

export type BeltResolution = { planetTickers: readonly string[]; beltTickers: readonly string[] };

/**
 * currentWeights: every current holding, any order. previousMembership: the
 * top-8 ticker set as of the most recent PRIOR snapshot (§4.2), or null if
 * no prior snapshot exists (first-ever run) — falls back to plain top-8.
 * A ticker already a planet stays a planet unless its weight falls more
 * than the hysteresis band below the 8th-ranked current weight. A ticker
 * already in the belt is promoted only if its weight rises more than the
 * band above the 8th-ranked current weight. This makes the boundary sticky
 * without ever contradicting today's true weight order for anything NOT
 * near the boundary.
 */
export function resolveBeltMembership(
  currentWeights: readonly { ticker: string; weight: number }[],
  previousMembership: ReadonlySet<string> | null,
  hysteresisBand = ORRERY_BELT_HYSTERESIS_BAND,
): BeltResolution {
  const sorted = [...currentWeights].sort((a, b) => b.weight - a.weight);
  if (!previousMembership || sorted.length <= ORRERY_PLANET_COUNT) {
    return {
      planetTickers: sorted.slice(0, ORRERY_PLANET_COUNT).map((h) => h.ticker),
      beltTickers: sorted.slice(ORRERY_PLANET_COUNT).map((h) => h.ticker),
    };
  }
  const boundaryWeight = sorted[ORRERY_PLANET_COUNT - 1].weight; // 8th-ranked current weight
  const planetTickers: string[] = [];
  const beltTickers: string[] = [];
  for (const h of sorted) {
    const wasPlanet = previousMembership.has(h.ticker);
    const isPlanet = wasPlanet
      ? h.weight >= boundaryWeight - hysteresisBand
      : h.weight > boundaryWeight + hysteresisBand;
    (isPlanet ? planetTickers : beltTickers).push(h.ticker);
  }
  // If hysteresis produces more or fewer than 8 planets (possible right at
  // the boundary with clustered weights), truncate/extend by strict current
  // weight order so the invariant "exactly min(8, N) planets" always holds —
  // hysteresis controls WHICH ticker occupies the boundary slot, never the
  // total count.
  const ranked = [...planetTickers, ...beltTickers].sort(
    (a, b) => sorted.find((h) => h.ticker === b)!.weight - sorted.find((h) => h.ticker === a)!.weight,
  );
  return {
    planetTickers: ranked.slice(0, ORRERY_PLANET_COUNT),
    beltTickers: ranked.slice(ORRERY_PLANET_COUNT),
  };
}
```

Tests (the required "churn fixture" from `PHASE10.md`'s Tests acceptance
item): two tickers whose weights are `0.1%` apart straddling the boundary,
with the lighter one previously a planet — assert membership is unchanged
(no swap) on a run where the gap stays inside the band; a ticker whose weight
moves clearly `>0.5%` past the boundary — assert it swaps; `previousMembership:
null` → plain top-8; fewer than 8 total holdings → every holding is a planet,
belt is empty; the invariant test (exactly `min(8, N)` planets for several
synthetic weight distributions, including one exact tie at the boundary).

## 4. `src/lib/dashboard-data.ts` changes

### 4.1 Project `dayReturn` onto `publicOrreryHoldings`

In the existing `positions.map(...)` building `publicOrreryHoldings` (§3.1's
new field), read the already-computed `positionRows` entry for the same
ticker and add `dayReturn: positionRows.find((p) => p.ticker === position.ticker)?.dayPct ?? null`.
`positionRows` is already computed earlier in the same function — no new
query.

### 4.2 Belt-hysteresis previous-membership query

New, small, isolated addition (does not touch any existing return value or
computation): after the existing `snapshots`/`trades` fetch, query the most
recent `snapshots` row with `date < today` (reuse the exact `prevSnapshot`
pattern already used for `dailyChangePct`, §2.2), then fetch that snapshot's
`snapshot_positions` rows, compute each ticker's weight as
`value / previousSnapshotTotalValue`, and pass the top-8 ticker set (or
`null` if no prior snapshot exists) into `resolveBeltMembership` alongside
today's `publicOrreryHoldings` weights. Store the result
(`{ planetTickers, beltTickers }`) as a new `orreryBelt` field on
`DashboardData`.

### 4.3 Expose portfolio health inputs

No new fields needed beyond what already exists (design decisions 2.2/2.3):
`dailyChangePct`, `twr7d`, `volatilityPct`, `allTimeHigh` are already on
`DashboardData` and already reach `/share`'s `page.tsx` today. §12 wires them
into the new Orrery props; this subsection is a confirmation, not a change.

## 5. Comet trails, orbit rings, and always-visible labels

Extend `OrreryScene.tsx`'s per-planet scene-graph construction (the existing
`Group` → `Group` → `Mesh` structure, §0/§13 of the research this spec is
built on — kept intact):

- **Orbit rings** become faint, neutral, thin torus/line geometry at each
  planet's `orbitRadiusForRank(rank)` — visible enough to read as "this is a
  path," not colored by performance (the red→green gradient relocates to the
  trail, per `UNIVERSE_IDEAS.md` §3's explicit correction of the brief's own
  suggestion).
- **Comet trail**: a tapering, additively-blended ribbon or particle strip
  trailing each planet along its orbital path. Taper direction communicates
  orbit direction without a legend; length is proportional to
  `angularSpeedForWeeklyReturn` (already-existing function, already the
  correct "week magnitude" input) mapped to a bounded trail-length range;
  color is a fixed red→green gradient keyed by `directionForWeeklyReturn`
  (green = clockwise/positive, red = counterclockwise/negative, a third
  neutral tone for `"neutral"`). Trail length and taper must be legible in a
  **single static frame** — this is the acceptance-required reduced-motion
  proof that direction/speed/sign all survive a freeze (§14 Accessibility item
  ~46).
- **Ticker labels**: every planet renders an always-visible ticker label
  (sprite/CSS2DObject-equivalent, billboard-facing the camera, or an
  overlaid absolutely-positioned DOM label synced to the projected 3D
  position each frame — implementer's choice, but it must track the planet
  through OVERVIEW, lock-on, and APPROACH without lag or misregistration).
  Closes `UNIVERSE_DIRECTION.md` problem 4 ("No labels").
- Planet **size** continues to use the unchanged `radiusForWeight(weight)`
  (§3, unchanged). Planet **spatial placement** now uses
  `orbitRadiusForRank(rank)` where `rank` is the 1-indexed position in
  `orreryBelt.planetTickers` sorted by weight descending (heaviest = rank 1)
  — **not** array index, closing the "color/pattern changes when trade order
  changes" bug noted during research (§8 below fixes the same root issue for
  textures).

## 6. The OVERVIEW / APPROACH / COMMAND camera system

Three named camera states, no free orbit (`UNIVERSE_IDEAS.md` §6):

- **OVERVIEW** (default, `?camera=` absent or `overview`): whole system
  framed with margin at a fixed elevation of ~25° off the orbital plane —
  this single choice is required to (a) keep every planet unclipped at
  1440×900 regardless of belt size, (b) read depth (spheres, not circles),
  and (c) match `docs/reference/concept-desktop-overview.png`'s composition.
  Pinch/scroll zoom is bounded (does not allow zooming past a minimum that
  clips a planet or a maximum that flattens the elevation to 0°); drag tilts
  at most ±10° of additional parallax, never a full free-orbit tumble.
- **APPROACH** (`?planet=TICKER`, §7): the rendezvous sequence and the
  planet's stabilized close orbit.
- **COMMAND** (`?focus=portfolio` — reuse the existing param name and value
  from today's sun-selection href, do not invent a new one): camera settles
  near the sun; Mission Control (§10) opens.

`Escape` or double-click/tap on empty space always returns to OVERVIEW from
either APPROACH or COMMAND — one gesture from home, matching the existing
`closeLink` pattern in `OrreryWorld.tsx` (§9 threads this through the same
URL-clearing mechanism already proven for inspector-close).

## 7. Lock-on targeting and the rendezvous

Extends, does not replace, the existing stabilization mechanism already in
`OrreryScene.tsx`'s render loop (the `stabilized` branch easing orbital
rotation toward `initialAngle`, scaling `+8%`, ramping the shader's `uActive`
uniform — all of this is kept verbatim as the foundation).

- **Lock-on radius**: when the pointer comes within a generous magnetic
  radius of a planet's mesh **or** its always-visible ticker label (≥44px
  including the label, per `UNIVERSE_IDEAS.md` §4), that planet's orbital
  advance eases to a stop via the existing stabilization branch — **axial
  spin (§3.3/§5, new this section) is explicitly excluded from the
  stabilization branch and continues at its own rate** — the day-encoding
  stays alive while the week-encoding (orbital position) pauses. A HUD
  reticle (bracket corners, not a filled shape, consistent with the CRT/HUD
  art direction) renders around the stabilized planet. Clicking anywhere
  inside the reticle bounds — not only the mesh's exact raycast hit —
  selects it.
- **Keyboard**: `Tab` cycles planets in weight-rank order (not array-index
  order — this changes from today's implicit index order to explicit
  `orreryBelt.planetTickers` rank order) applying the same reticle/stabilize
  visual; `Enter` travels (triggers the same navigation the existing
  `navigateToHolding` callback performs).
- **Rendezvous** (selecting a planet, i.e. entering APPROACH): the camera
  leaves OVERVIEW and arrives alongside the planet on a curved (not linear)
  path, target duration ~800ms, interruptible by a second selection or
  `Escape` mid-flight. The rest of the system dims/defocuses (a depth-of-field
  or simple opacity/desaturation falloff on non-selected bodies — either is
  acceptable; the requirement is "the rest of the system falls dim," not a
  specific post-processing technique, and no post-processing library beyond
  what's already permitted stays in scope — see §1's out-of-scope
  "postprocessing" note inherited from the existing `OrreryScene.source.test.ts`
  assertion, which this section must update if a bounded, code-level
  dim/defocus technique is added that the old regex would now false-flag;
  do not add a full postprocessing pipeline/library to satisfy this).
  The planet settles left-of-center, still spinning at its true axial rate,
  terminator line visible if the lighting model supports it. The holding
  panel (§9's inspector, HUD-chrome content) draws on the right with a
  staggered reveal (~150ms apart between sub-elements), not an instant swap.
- **Reduced motion**: the rendezvous crossfades directly to the settled
  APPROACH end state (camera position, dimmed background, drawn-on panel) —
  no curved flight, no staggered reveal timing, matching the existing
  `usePrefersReducedMotion`-gated pattern already used elsewhere in this
  component tree (`MetricExplain`, `ObservatoryEntrance`).
- Returning to OVERVIEW (`Escape`/close) reverses along the same curve (or
  crossfades under reduced motion) — the user is never teleported.

## 8. The sun

Rewrite the sun's material/animation inside `OrreryScene.tsx` to consume a
`portfolioHealth` prop computed from §3.4/§3.5's pure functions (computed once
per request in `page.tsx`/`OrreryWorld.tsx`, passed down — not recomputed
inside the scene):

```ts
type PortfolioHealth = {
  h: number; // healthScalarForPortfolio output, -1..1
  sunspotIntensity: number; // sunspotIntensityForDrawdown output, 0..1
};
```

- **Color temperature**: interpolate a fixed three-stop gradient by `h` —
  deep ember red (`h = -1`) → warm amber (`h = 0`) → white-gold (`h = +1`),
  replacing the current fixed two-color amber gradient
  (`vec3(0.86,0.24,0.035)` ↔ `vec3(1.0,0.78,0.28)`) with an `h`-driven
  three-stop mix. Match `docs/reference/concept-sun-health-states.png`'s five
  discrete named states (Strong/Steady/Flat/Weak/Struggling) as check
  points, not as the only five renderable states — `h` is continuous.
- **Corona**: width/opacity of the existing two `AdditiveBlending` glow
  shells scales with `h` (wide and active near `+1`, contracted and thin near
  `-1`) — reuse the existing shell geometry, drive their scale/opacity
  uniforms from `h` instead of the current fixed `0.12`/`0.045` constants.
- **Pulse (breathing)**: the existing `Math.sin(time * 1.35) * 0.012` pulse
  becomes rate- and depth-modulated by `h` — slower and shallower as `h`
  falls toward `-1` (never faster/more violent — `UNIVERSE_IDEAS.md`: "a
  struggling sun goes quiet, not violent").
- **Sunspots**: dark patches on the sun's surface, intensity/coverage driven
  by `sunspotIntensity` (0 = none, 1 = maximally spotted) — a new shader
  input independent of `h`, so a good day inside a drawdown shows both a
  brightening sun and visible spots simultaneously (`UNIVERSE_IDEAS.md`'s
  explicit "honest" requirement).
- **No facial anatomy** — `UNIVERSE_IDEAS.md`'s explicit rejection ("On faces:
  don't"). This is a hard constraint, not a style preference; a review
  finding should flag any eyes/mouth/expression shape on the sun as a §2/§R
  non-goal violation, not an aesthetic nitpick.
- **Milestone flare**: on a new all-time high (`data.allTimeHigh?.pct === 0`
  and `peakDate` equal to the most recent chart date — implementer verifies
  the exact "is today's point the new peak" condition against
  `all-time-high.ts`'s actual output shape), trigger one dramatic prominence
  arc animation, not a recurring effect, not confetti.
- **Name + day % on the sun's face**: render the portfolio's public label
  (reuse whatever short product/portfolio name is already used elsewhere in
  the public product — do not invent new copy) and `formatPercent(data.
  dailyChangePct)` as HUD-mono text overlaid on or immediately adjacent to
  the sun mesh, in both the WebGL layer and (per accessibility, §9) the
  semantic DOM — so color is never the sole carrier of health, satisfying
  `UNIVERSE_IDEAS.md`'s explicit colorblind-safety point.

## 9. Semantic DOM: visual removal, not deletion

`OrreryWorld.tsx`'s current always-rendered 13-entry `<ol>` (§4 of the
research: 4 data points per entry plus a debug R/ω readout) and always-on
`<aside aria-label="Orbit encoding legend">` are the direct target of
`UNIVERSE_DIRECTION.md` problems 6/7/9 and are explicitly addressed by
`UNIVERSE_IDEAS.md` §9's correction: **"the panel may be removed visually,
never semantically."**

- The visible OVERVIEW HUD shows only: the sun + its name/percentage label,
  planets + always-visible ticker labels, trails, the belt as a labeled ring
  (§5, §11.2) — nothing else ambient.
- The existing `<nav aria-label="Portfolio bodies">` `<ol>` and
  `<aside aria-label="Orbit encoding legend">` are **visually hidden**
  (`sr-only`-equivalent CSS: clipped, zero-size, not `display:none` or
  `visibility:hidden`, which would remove them from the accessibility tree)
  but remain in DOM reading order, remain keyboard-navigable (each `<li>`'s
  `<Link>` remains a real, focusable, Tab-reachable control — this is the
  thing that already carries keyboard operation today; do not also delete
  keyboard support while visually hiding the list), and continue to carry
  every encoded value as text: weight, weekly return, direction (existing
  four fields) **plus the new `dayReturn`/axial-spin value and each planet's
  belt/planet-rank status** (new, since those are new encoded channels this
  section adds — the accessibility contract in `PHASE10.md`'s Purpose
  ("every encoded value also exists as text") extends to every value this
  section newly encodes, not only the values §7 already covered).
- The debug-style `R {radius} · ω {speed}` readout (`aria-hidden="true"`
  today, purely decorative) may be dropped entirely — it was never part of
  the accessible content, only visual noise; dropping it is not a
  regression.
- Drop the always-on legend `<aside>` to be summonable-only (§11.1); the
  visually-hidden semantic list version may remain always-in-DOM (it costs
  nothing once visually hidden) or be merged into the summonable manual's
  content — implementer's choice, as long as the encoding meanings remain
  reachable by both a sighted mouse/keyboard user (via the `?` manual, §11.1)
  and a screen-reader user (via linear reading order) without requiring
  either to guess.

## 10. Mission Control — the sun's destination overlay

New `src/components/observatory/orrery/MissionControl.tsx`. Per design
decision 2.1, this reuses the exact five chapter components and exact prop
wiring `src/app/(depth-pull)/share/page.tsx` already builds for
`ObservatoryShell`'s `chapterContent` map today — that wiring is lifted
verbatim into Mission Control, not rewritten:

```tsx
<MissionControl
  active={/* which of the 5 chapters is showing — reuse resolveObservatoryChapter/chapters.ts unmodified */}
  onCameraStateChange={/* preserves camera state per PHASE10.md's requirement — see below */}
>
  {activeChapterId === "pulse" && <PulseChapter {...same props share/page.tsx already builds} />}
  {activeChapterId === "forces" && <ForcesChapter {...same props} />}
  {activeChapterId === "structure" && <StructureChapter {...same props} />}
  {activeChapterId === "timeline" && <TimelineChapter {...same props} />}
  {activeChapterId === "lab" && <LabChapter {...same props} />}
</MissionControl>
```

- Opens as a full-screen sheet over the Orrery when `?focus=portfolio` is
  present (COMMAND camera state, §6) — the canvas keeps rendering behind it,
  dimmed/defocused (not unmounted — "camera state" must survive the round
  trip per `PHASE10.md`'s explicit requirement: *"selecting the sun opens the
  existing dashboard as an overlay that preserves camera state."* Closing
  Mission Control must restore OVERVIEW (or wherever the camera was before
  COMMAND) exactly, not reset to a default framing.
- Chapter switching inside Mission Control reuses `resolveObservatoryChapter`/
  `observatoryChapterHref` (`src/lib/observatory/chapters.ts`, **unmodified,
  imported as-is** — this is the one piece of the retired `ObservatoryShell`
  wiring this section explicitly keeps, since it is pure URL-state logic with
  its own existing tests and no coupling to `ChapterOrbit`'s visual orbital
  navigation).
- Restyle only the wrapping chrome (HUD framing, CRT scanline treatment,
  retrofuturist typography for headers/labels) — the chapters' own internal
  content, layout, and every canary-value-tested string stay byte-identical.
  This is intentionally the same "wrap, don't rewrite" pattern §6's
  `MetricDisclosure`-vs-`MetricExplain` design decision established: editing
  an already-accepted, already-tested chapter component to fit a new visual
  frame is out of scope; wrapping it is in scope.
- Mission Control is **not** a new route — it renders within `/share` under
  the existing `?focus=portfolio&chapter=...` query contract (`page.tsx`
  already resolves both params today), satisfying "no new public route... 
  without a recorded privacy decision" by not creating one.

## 11. Legend, systems manual, and first-visit orientation

### 11.1 Summonable systems manual

New `SystemsManual.tsx`: a `?` HUD button (visible, ≥44×44px, HUD-styled) and
a global `?` keydown handler (only when no text input/textarea has focus, and
only outside APPROACH/COMMAND to avoid stealing `?` from any future text
entry) opens a dismissable overlay containing the full encoding legend —
supersedes the always-on `<aside aria-label="Orbit encoding legend">`. Content:
every encoding this section defines (size=weight, orbit-radius=rank,
direction=week-sign, orbit-speed=week-magnitude, axial-spin=day-magnitude,
trail-taper=direction, trail-length=week-magnitude, trail-color=week-sign,
sun-color/corona/pulse=health, sunspots=drawdown, belt=holdings-9-plus).
`Escape` or tap-outside dismisses, returning focus to the `?` button.

### 11.2 The asteroid belt

Belt tickers (`orreryBelt.beltTickers`, §4.2/§3.6) render as small, tinted,
irregular rock geometry along one shared outer ring beyond the 8th planet's
orbit, each with a small always-visible ticker tag, tinted by that holding's
day-return sign (reuse `directionForWeeklyReturn`-equivalent sign logic
applied to `dayReturn`, or the existing weekly direction — implementer's
choice, document which in the evidence doc). Selecting/tapping the belt
(one shared control, not one per rock, consistent with "tap the belt" in
`UNIVERSE_IDEAS.md` §5) opens a panel listing all belt holdings with the same
inspector grammar §9's `HoldingInspector` already establishes (weight, week
return, direction — reuse `formatPercent`/`directionForWeeklyReturn`
verbatim), no new panel language. A promotion (a belt ticker crossing into
`planetTickers` on a later snapshot) is a visible one-time accretion moment
the next time that ticker renders as a planet; demotion is quiet (no exit
animation required).

### 11.3 First-visit orientation

New `FirstVisitOrientation.tsx`, replacing the discarded session-scoped
`ObservatoryEntrance` (§12 deletes that component): a three-beat, skippable,
typed-CRT-text sequence (~8s total, per `UNIVERSE_IDEAS.md` §11), gated by a
**`localStorage`** flag (not `sessionStorage` — this is the explicit
distinction `UNIVERSE_IDEAS.md` draws: "runs once ever, not once per
session"). Beats: "This is a portfolio." → "Planets are its holdings — orbit
is their week, spin is their day." → "Tap anything." Any pointerdown/keydown
skips immediately. Under `<1024px`, reduced motion, or `no3d=1`, this does
not run (mirrors `ObservatoryEntrance`'s existing disable conditions — those
conditions transfer, only the storage key and beat content change). One
micro-hint, independent of the flag: the first two planet selections in a
session show "spin = today · orbit = this week" in the inspector/APPROACH
panel header, then never again (a separate, small, `sessionStorage`-scoped
counter — this one *is* session-scoped, deliberately, since it's a
progressive hint not a one-time-ever orientation).

## 12. `src/app/(depth-pull)/share/page.tsx` rewrite

- Remove the `ObservatoryShell` mount and the `<section id="portfolio-observatory">`
  wrapper entirely.
- Remove the `ObservatoryEntrance` import/mount; delete
  `src/components/observatory/ObservatoryEntrance.tsx` and
  `ObservatoryEntrance.test.tsx` (confirmed unused elsewhere by direct grep,
  §1).
- Keep `getDashboardData()` and `getPublicTimelineData()` calls (Mission
  Control's chapter content still needs both, per §10).
- Add `camera` and `manual` to the `searchParams` type
  (`?camera=overview|approach|command`, defaulting to `overview` when absent
  or invalid; `?manual=1` opens the systems manual, §11.1). Continue
  supporting the existing `holding`/`focus`/`no3d` params unchanged in
  contract (validate `holding` against `data.publicOrreryHoldings` exactly as
  today).
- Pass `data.publicOrreryHoldings` (now carrying `dayReturn`), `data.
  orreryBelt` (§4.2), and a `portfolioHealth` object built from §3.4/§3.5
  applied to `data.dailyChangePct`, `data.twr7d ?? 0`, `data.volatilityPct`,
  `data.allTimeHigh?.pct ?? 0` into the rewritten `OrreryWorld`.
- The five chapter-content JSX blocks currently built inline for
  `ObservatoryShell.chapterContent` move, verbatim, into whatever prop shape
  `MissionControl` (§10) expects — this is a relocation of existing,
  unmodified JSX/prop-building code, not new logic.

## 13. Mobile, reduced motion, no-WebGL — unchanged, re-verified only

`PHASE10.md`'s Desktop-first scope acceptance item and `UNIVERSE_DIRECTION.md`
§6 are explicit: **no mobile investment, the existing fallback ships
unchanged.** This section's obligation below 1024px is verification, not
construction:

- `OrrerySceneLoader.tsx`'s `canRenderOrrery` gate (min-width 1024px,
  reduced-motion check, WebGL-context probe) is reused as-is; do not weaken
  or bypass it for any of this section's new visual features.
- Every new encoding this section adds (axial spin, sunspots, belt, health)
  must have a text equivalent in the semantic DOM (§9) so the `<1024px`
  fallback (which renders only that DOM, per today's CSS media-query
  fallback pattern) stays complete without needing its own bespoke 2D
  rendering of these new channels — the existing list-based fallback format
  extends naturally (more `<dl>`/`<span>` fields), it does not need a new UI
  paradigm.
- New automated test (§14 Tests, and flagged as a real gap by this spec's
  research): a `matchMedia`-stubbed test asserting **zero canvas elements**
  render when `window.matchMedia("(min-width: 1024px)")` is stubbed to
  `false` — this specific path was previously verified only by ad hoc
  Playwright evidence, never by a committed vitest test. Add it alongside the
  existing reduced-motion canvas-absence test.

## 14. Acceptance criteria

Organized by `PHASE10.md` §8's exact eight named dimensions.

### Behavioral

1. Every planet (all 8, plus every belt member via the belt panel) is
   identifiable without clicking — always-visible ticker labels in OVERVIEW,
   belt tag labels in the belt panel.
2. A planet can be reliably selected while the system is in motion: hovering
   or Tab-focusing within the lock-on radius (§7) eases its orbital advance
   to a stop before click/Enter is required; a full 10-repetition manual or
   scripted click-accuracy check against a moving, non-stabilized target is
   not required, but selecting the stabilized target via mouse click and via
   `Tab`+`Enter` must both work reliably in the evidence capture.
3. Camera state is always one gesture (`Escape` or empty-space
   double-click/tap) from OVERVIEW, from both APPROACH and COMMAND.
4. Selection state (`?planet=`/`?holding=`, `?focus=portfolio`, `?camera=`)
   is URL-restorable and survives browser back/forward — direct-link and
   back/forward checks required in evidence (§16).
5. Selecting the sun opens Mission Control without resetting or reloading the
   canvas/camera; closing Mission Control restores the exact prior camera
   state (not a default OVERVIEW reset unless OVERVIEW was in fact the prior
   state).
6. `Tab` cycles planets in weight-rank order; `Enter` travels to the focused
   planet.
7. The belt control opens the belt panel listing every belt holding with
   weight/week-return/direction, matching the existing inspector field
   grammar.
8. The systems manual opens via the `?` button and the `?` key, and closes
   via `Escape` or tap-outside, returning focus to the `?` button.
9. The first-visit orientation plays once ever (`localStorage`-gated, not
   session-gated), is fully skippable by any pointerdown/keydown, and never
   plays again after being seen or skipped.
10. Belt promotion/demotion only changes at snapshot-time boundaries with the
    hysteresis band applied — a same-day re-render with unchanged underlying
    weights never flips membership.

### Visual (storytelling/craft gate — required, per `portfolio-ux`'s "avoid
generic AI defaults" and `PRODUCT_DIRECTION.md`'s decision-hierarchy rank 7)

11. OVERVIEW reads as spheres in space at a real elevation off the orbital
    plane, not circles on a flat plane — matches
    `docs/reference/concept-desktop-overview.png`'s composition, not
    literally reproduced.
12. No two planets overlap at any point in their orbits, at any moment in an
    extended (e.g. 60-second) observation window — structurally guaranteed by
    §3.2's one-planet-per-ring rank assignment, not tuned by inspection alone.
13. No planet is clipped by the 1440×900 viewport in OVERVIEW, for the
    current 8-planet configuration and for a synthetic 8-planet fixture at
    maximum belt/weight spread used in testing.
14. Orbit direction and relative speed are readable from a **single still
    frame** (a reduced-motion or literally-paused screenshot) via trail taper,
    trail length, and trail color alone — required screenshot evidence, not
    only a code-level claim.
15. The sun's weak/struggling states (today's real condition — the portfolio
    is negative per `UNIVERSE_IDEAS.md`) are art-directed with the same care
    as a strong state — required side-by-side screenshot evidence of at
    least two distinct health states (today's real weak state, and one
    synthetic strong-state fixture), matching the "down must not mean ugly"
    requirement, not merely a color swap.
16. No facial anatomy on the sun (§8's hard constraint).
17. Real 1440×900 screenshots and short motion evidence (video or filmstrip,
    consistent with §7's precedent — `docs/phase10-baseline/section-7/`'s
    established evidence format) required for: initial OVERVIEW entry after
    first-visit orientation; multiple differently-sized planets; simultaneous
    clockwise and counterclockwise motion; lock-on reticle on a stabilized
    planet; the rendezvous in progress; the settled APPROACH state with the
    holding panel drawn on; the belt and its panel; the summoned systems
    manual; Mission Control open; and the reduced-motion/`no3d=1`/mobile
    fallbacks.
18. Every visual object present encodes portfolio information or supports
    spatial orientation — no unexplained ellipse, ring, or geometric mark
    ships (checkable directly against the encoding table in §11.1's manual
    content: every rendered visual element must have a corresponding entry).

### Desktop-first scope (unchanged fallback — owner decision, not a
deferral)

19. Below 1024px: `document.querySelectorAll("canvas").length === 0` at both
    390×844 and 320×844, verified live (not only by source inspection).
20. Below 1024px: the semantic holding list (visually hidden above 1024px per
    §9, but the ONLY presentation below it) renders as a genuinely reflowed
    list — no horizontal page overflow
    (`document.documentElement.scrollWidth === clientWidth`), no control
    under 44×44 CSS px.
21. No mobile-specific 3D scene, camera system, or WebGL code path is added —
    confirmed by the same `canRenderOrrery` gate (§13) unmodified in its
    breakpoint/media-query logic.
22. `?no3d=1` still forces the flat fallback at any viewport width,
    unchanged in contract.

### Accessibility

23. The semantic DOM (visually hidden holding list, legend content, belt
    list) remains the accessible source of truth: every encoded value this
    section adds or keeps (weight, week return, direction, **day return /
    axial spin, planet-vs-belt status, health scalar-derived state, drawdown**)
    exists as real text somewhere in reading order, not only in WebGL,
    motion, colour, speed, or direction.
24. Reduced motion freezes all orbital and axial motion while preserving
    every encoding as static, readable state (trails/labels/sun state remain
    at their current values, not reset to a neutral default).
25. The visually-hidden list and legend remain keyboard-Tab-reachable and
    screen-reader-readable (not `display:none`/`visibility:hidden` — a real
    visually-hidden technique that keeps the accessibility tree intact).
26. Lock-on reticle, rendezvous, and Mission Control's open/close transitions
    all move focus predictably (to the inspector heading on selection, back
    to the trigger control on close — same contract §5/§7 of the §7 spec
    already established and this section must not regress).
27. The `?` manual button and belt control are both real, visibly labeled,
    keyboard-operable controls (button semantics, not `div`+`onClick`).
28. Contrast of every new text element (sun name/percentage overlay, HUD
    labels, manual content, belt tags) is verified by computed WCAG ratio
    from source tokens (reuse or extend `observatory-contrast.test.ts`'s
    established pattern), not by eye.
29. Canvas/WebGL content remains `aria-hidden="true"` wherever it duplicates
    semantic content (unchanged from today's `canvasLayer` treatment).

### Financial honesty

30. The sun's health scalar (`h`) is computed exclusively from
    `data.dailyChangePct` and `data.twr7d` (both TWR-consistent, net-of-flow)
    per §3.4/design decision 2.2 — never from a simple or since-purchase
    return. A source-level check (grep or direct code review) confirms no
    simple-return field feeds `healthScalarForPortfolio`.
31. `dayReturn`/axial spin, being a per-holding simple daily price change
    (design decision 2.5), is never rendered as a headline claim and never
    placed beside a benchmark figure measured over a different period or
    convention — it appears only as a spin-rate encoding plus its own
    unadorned percentage in the semantic list/inspector.
32. Sunspot intensity derives only from `data.allTimeHigh.pct` (already
    dollar-free, already TWR-index-based) — never from a raw dollar
    drawdown figure.
33. Belt rank/membership derives only from `weight` (already a percentage,
    dollar-free) — never from raw position value.

### Tests

34. `orrery.test.ts` (extended): every new pure function in §3
    (`orbitRadiusForRank`, `axialSpinForDayReturn`, `healthScalarForPortfolio`,
    `sunspotIntensityForDrawdown`, `resolveBeltMembership`) is tested against
    hand-computed fixtures including clamp boundaries and the
    unavailable/null case, per each function's own test list above.
35. Belt hysteresis is tested against the required churn fixture (§3.6) —
    same-boundary-gap-within-band → no swap; clearly-crossed → swap;
    `previousMembership: null` → plain top-8; fewer than 8 holdings → no
    belt.
36. A `matchMedia`-stubbed narrow-viewport test asserts zero canvas elements
    below 1024px (§13's flagged new coverage — does not exist today).
37. `dashboard-data.test.ts` (or equivalent, wherever `getDashboardData`'s
    existing tests live) covers: `publicOrreryHoldings[].dayReturn` populated
    correctly from `positionRows`; `orreryBelt` correctly reflects a
    synthetic prior-snapshot fixture.
38. `OrreryWorld`/`OrreryScene` source-level regression tests
    (`OrreryScene.source.test.ts`'s established pattern) are updated to match
    this section's real architecture: the `no @react-three/fiber` assertion
    stays; the `no textureLoader/useLoader` assertion is **replaced** with a
    check appropriate to the new texture pipeline (e.g., asserting textures
    load via the KTX2 path and are ticker-keyed, not index-keyed) — do not
    leave a stale assertion that would make the new, intentional texture code
    fail its own regression test.
39. Mission Control's chapter-content wiring is tested for prop-parity with
    today's `ObservatoryShell.chapterContent` build (same fields, same
    values) — a regression test proving nothing was dropped in the
    relocation (§10, §12).
40. Full existing suite remains green; `ObservatoryEntrance.test.tsx` is
    removed together with the component it tests (§12), not left orphaned or
    skipped.
41. `FirstVisitOrientation` and `SystemsManual` each get a test file covering
    their gating condition (`localStorage` flag vs. `sessionStorage`
    micro-hint, respectively), skip behavior, and disable conditions
    (`<1024px`/reduced-motion/`no3d=1`).

### Build

42. `npm run build` passes; no new build-time network dependency (design
    decision 2.6 — texture generation is offline/committed, not a live build
    dependency).
43. The route-owned long task stays under 50ms on the §2.3.2 rig
    (`docs/phase10-spike-section-7/measure-desktop.mjs`, 1440×900, CPU 2×,
    five fresh contexts) — the gate §7 cleared is not weakened, redefined, or
    baseline-subtracted for this section. Re-run this exact script against
    the completed §8 implementation and record results in the evidence doc.
44. Texture payloads (KTX2-compressed, per ticker) are measured and budgeted
    explicitly in the evidence doc — total initial-paint bundle stays
    unaffected (textures stream after first paint, per §1/§8.4), and a
    stated total/per-texture byte budget is declared before measuring, not
    discovered after.
45. No new runtime npm dependency beyond three.js's own built-in
    `KTX2Loader`/Basis transcoder (already shipped inside the `three`
    package — confirm no separate `three-ktx2`-style package is added).
46. `package.json`/`package-lock.json` show no `@react-three/fiber`,
    `@react-three/drei`, or physics/postprocessing package additions (§0/§1).

### Privacy

47. `/share` remains public and read-only; zero dollar amounts, zero
    owner-only fields, in HTML/RSC payload/client bundle — including in every
    newly encoded value (sunspot intensity, health scalar, axial spin, belt
    rank) and including inside Mission Control's chapter content (already
    canary-tested today; the relocation must not weaken that coverage).
48. The existing canary-value tests in `share/page.test.tsx` continue to
    pass, updated only where the always-on legend string assertion (§9,
    `"ORBIT ENCODING"` unconditional check) must change to reflect the new
    summonable behavior — no other privacy assertion is loosened.
49. Mission Control introduces no new route, so no new privacy-decision
    surface is created (§10) — confirm no new `src/app/**/page.tsx` was
    added for it.
50. Belt/planet membership, health scalar, and every new field never expose
    raw share counts, dollar values, or cost basis — only weight (%), returns
    (%), and derived scalars.

## 15. New/changed files (minimum)

- `src/lib/observatory/orrery.ts` (edit, §3) + `orrery.test.ts` (edit)
- `src/lib/dashboard-data.ts` (edit, §4) + its existing test file (edit)
- `src/components/observatory/orrery/OrreryScene.tsx` (rewrite, §5-§8)
- `src/app/dev/phase10-portfolio-orrery/OrreryScene.source.test.ts` (edit,
  §14 item 38)
- `src/components/observatory/orrery/OrreryWorld.tsx` (rewrite, §9, §11)
- `src/app/dev/phase10-portfolio-orrery/OrreryWorld.test.tsx` (edit, kept
  passing against the new component API — §1's out-of-scope note)
- `src/components/observatory/orrery/orrery.module.css` (edit)
- `src/components/observatory/orrery/MissionControl.tsx` + `.test.tsx` (new)
- `src/components/observatory/orrery/SystemsManual.tsx` + `.test.tsx` (new)
- `src/components/observatory/orrery/FirstVisitOrientation.tsx` +
  `.test.tsx` (new)
- `src/components/observatory/ObservatoryEntrance.tsx` +
  `ObservatoryEntrance.test.tsx` (deleted, §12)
- `src/app/(depth-pull)/share/page.tsx` (rewrite, §12)
- `src/app/(depth-pull)/share/page.test.tsx` (edit)
- `scripts/generate-planet-textures.*` (new, §8.4/2.6) +
  `public/textures/planets/*` (new, committed static output)

## 16. Evidence to capture and commit

- `docs/phase10-baseline/section-8/README.md`: before (today's five-chapter
  shell + placeholder-sphere Orrery, one 1440×900 capture) and after
  screenshots/motion evidence per §14 item 17; console warning/error count;
  live direct-link and back/forward checks for `?planet=`, `?focus=portfolio`,
  `?camera=`, `?manual=1`.
- The §2.3.2 rig's full output (`measure-desktop.mjs` re-run against the
  completed implementation) — §14 item 43.
- Texture budget table (§14 item 44) with the declared thresholds stated
  before measurement.
- Record every design decision in §2 verbatim, plus which texture-generation
  path (§8.4/2.6) was actually used.
- Record the belt-hysteresis churn-fixture test output and the health-scalar
  hand-computed fixtures (§3.4/§3.5) so a later reviewer can re-verify the
  arithmetic without re-deriving it.
