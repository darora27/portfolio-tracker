# Phase 10 §13 specification: universe fixes from the July 30 owner sitting

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: specify`).

Design proof: `docs/phase10-workflow/design-proofs/section-13.md`
Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json`

Authority: `OWNER_FEEDBACK_LEDGER.md` (owner quotes and dispositions) →
`PHASE10.md` §13 (this section's own roadmap scope, including the FB-32
boundary) → `UNIVERSE_IDEAS_6.md` §2 (FB-02) → `UNIVERSE_AUDIT.md` §5.1
(FB-01's derivation method). **§14 is a separate section** (Mission Control
content rework — FB-27, FB-28, FB-29, FB-30, FB-32, FB-33, FB-35 — plus the
Chart Room) and nothing in this document authorizes touching it.

---

## 0. The ledger board

Per `OWNER_FEEDBACK_LEDGER.md` rule 2: every open/designed row is marked
scheduled-here, scheduled-§n, or deferred with owner initials.

| ID | Status at spec time | Disposition |
|---|---|---|
| `FB-01` | designed · numbers fixed by Lead this turn (owner confirmed direction, not exact values) | **scheduled here** — §3 |
| `FB-02` | designed (`UNIVERSE_IDEAS_6.md` §2.2, adopted whole) | **scheduled here** — §4 |
| `FB-05` | regressed-language, softened, 6th report | **scheduled here** — §3 |
| `FB-17` | variant picked (600px), live/capture gap unresolved | **scheduled here** — §5 |
| `FB-22` | open · defect | **scheduled here** — §6 |
| `FB-23` | open | **scheduled here** — §6 |
| `FB-24` | open, choice explicitly delegated to us | **scheduled here** — §6 |
| `FB-25` | open | **scheduled here** — §6 |
| `FB-26` | open · high, core encoding change | **scheduled here, first** — §2 |
| `FB-31` | open | **scheduled here** — §6 |
| `FB-32` | designed, next section | **not this section** — `PHASE10.md` §13: "the top-right block, which dies into the strip in §14." Named here for board completeness only |
| `FB-12` | parked by owner | **not this section** — unchanged, no action |
| `D2` | open · general, "the website is still relatively confusing" | **not newly scheduled** — tracked via `FB-05` (scheduled here, §3) per the row's own disposition ("subsumed rows close"); `FB-08`/`FB-09`/`FB-11`, the row's other named subsumers, are already closed |
| `FB-21` | designed · numbers fixed by owner (§12a Phase C) | **not this section, already implemented** — `.missionDescent`'s `min(1400px, 96vw)` width shipped in §12a (`VIS-10`, reviewer-pass, `docs/phase10-workflow/acceptance/section-12.json`). `PHASE10_STATE.json`'s §12 acceptance note names only FB-01/FB-05/FB-17/FB-12 as the section's unclosed rows, implying this one closed at the sitting — but the ledger row itself carries no `CONFIRMED` quote. This is a ledger-bookkeeping gap in the durable record, not new work; no criterion in this section touches `.missionDescent` again |
| `FB-27` | designed (`MISSION_CONTROL_ARCHITECTURE.md` §4) | **not this section** — `PHASE10.md` §14 (Mission Control content rework, HOLDINGS) |
| `FB-28` | unblocked · designed (`MISSION_CONTROL_ARCHITECTURE.md` §4) | **not this section** — `PHASE10.md` §14 |
| `FB-29` | designed (`MISSION_CONTROL_ARCHITECTURE.md` §4, footer) | **not this section** — `PHASE10.md` §14 |
| `FB-30` | designed (`MISSION_CONTROL_ARCHITECTURE.md` §4, ACTIVITY) | **not this section** — `PHASE10.md` §14 |
| `FB-33` | designed · EARNINGS confirmed | **not this section** — `PHASE10.md` §14 |
| `FB-35` | designed (`MISSION_CONTROL_ARCHITECTURE.md` §4, MIX) | **not this section** — `PHASE10.md` §14 |
| `FB-13` | designed (Chart Room doors) | **not this section** — `PHASE10.md` §14, stage two |
| `FB-10` | CONFIRMED — Jul 29, 2026, his words "news articles open" | **already closed** — named here only because its status cell's quoted text contains the literal substring "open," which the mechanical board-completeness check matches irrespective of the row's actual closed status. No disposition needed |

Rows not touched by this section, unchanged elsewhere on the board:
`FB-16` (§13′, a distinct future item, not this §13), `FB-18`/`D1`/`D3`
(needs-owner/held, parked). Rows already closed (`FB-03`, `FB-04`,
`FB-06`–`FB-09`, `FB-14`, `FB-19`, `FB-20`) need no disposition — they are
not open/designed rows this section could schedule.

Count at this spec's open/designed line, excluding rows this section does
not action (`FB-32`, `FB-12`, `FB-21`, `FB-27`, `FB-28`, `FB-29`, `FB-30`,
`FB-33`, `FB-35`, `FB-13`, `D2`, all already dispositioned above without
new work): **10 rows scheduled here** — the five-row landing-section
threshold is already exceeded by definition (10 > 5), so per rule 2 this
section is itself required to be a landing section. It is: nothing here
opens new scope, every row is a fix, a nudge, or a build against an
already-adopted design.

---

## 1. Operating conditions

- `single_provider_mode` remains active (`PHASE10_STATE.json`, OpenAI quota
  outage). Both seats run under this constraint;
  `docs/phase10-workflow/SINGLE_PROVIDER_MODE.md`'s compensating controls
  are mandatory. Its reserved list (privacy boundary, financial math core,
  any gate change) is not implicated by any criterion in this section.
- `main` is green at section start: `npm test` 112/112 files, 582/582
  tests (1 intentional skip), `npm run build` exit 0 — both independently
  re-run by the §12 accept turn at HEAD `2390059`. No inherited-red
  exception exists. Any red at review is new and is a blocker.
- No criterion is carried into this section from §12; §12's own carried
  item (`BLD-04`) closed clean at acceptance and does not reappear here.

---

## 2. FB-26 — trails and orbital direction move from weekly to daily return

**The largest item, moves first per `PHASE10.md` §13's own instruction —
`TST-03` and `VIS-04` (the trail-sampler verifiers) both sample this field
and must move with it.**

### 2.1 What changes, and what does not

This is a **field swap of the encoding's input**, not a recalibration of
how a given magnitude maps to visual intensity (see the design proof's
"Resolved ambiguities" for why the two are kept separate this turn). The
magnitude-to-visual formulas (angular speed, color ramp, arc length) and
their clamp constants (floor 0.2%, ceiling 12% magnitude, unchanged) stay
exactly as they are; only the return value fed into them changes from
`holding.weeklyReturn` to `holding.dayReturn`, both already-existing,
already-typed fields on `PublicOrreryHolding`
(`src/lib/observatory/orrery.ts:38-51`).

`holding.weeklyReturn` itself is **not removed** — it remains a valid field
for genuinely weekly-labeled text elsewhere (`PlanetDetail.tsx`'s WEEK
chip in its windows line, and any standalone "WEEK X%" display not paired
with a direction/trail word). Only the *encoding* — direction, angular
speed, trail color, trail arc — moves to daily.

### 2.2 Function rename (window-agnostic names)

The same magnitude→visual functions are genuinely reused by the (now
daily) main scene and by the parked DraftRig lap-speed feature (FB-12,
unchanged, still weekly). Rename to decouple the pure mapping from which
return window a caller supplies:

| File | Current name | New name |
|---|---|---|
| `src/lib/observatory/orrery.ts:69` | `directionForWeeklyReturn(weeklyReturn)` | `directionForReturn(returnValue)` |
| `src/lib/observatory/orrery.ts:78` | `angularSpeedForWeeklyReturn(weeklyReturn)` | `angularSpeedForReturn(returnValue)` |
| `src/lib/observatory/universe-palette.ts:194` | `normalizedWeeklyMagnitude(weeklyReturn)` | `normalizedReturnMagnitude(returnValue)` |
| `src/lib/observatory/universe-palette.ts:205` | `rampForWeekly(weeklyReturn)` | `rampForReturn(returnValue)` |
| `src/lib/observatory/scene-model.ts:528` | `trailArcLengthForWeeklyReturn(weeklyReturn)` | `trailArcLengthForReturn(returnValue)` |

Parameter renamed for clarity only; behavior of each function body is
unchanged (same clamps, same math). Also rename
`MIN_WEEKLY_MAGNITUDE`/`MAX_WEEKLY_MAGNITUDE`
(`universe-palette.ts:2-3`) to `MIN_RETURN_MAGNITUDE`/`MAX_RETURN_MAGNITUDE`
— **values unchanged** (`0.002`/`0.12`). `MIN_TRAIL_RETURN`/
`MAX_TRAIL_RETURN` (`scene-model.ts:47-48`) and `MIN_SPEED_RETURN`/
`MAX_SPEED_RETURN` (`orrery.ts:16-17`) already have window-agnostic names;
leave them as-is, values unchanged.

### 2.3 Call sites that move to `dayReturn`

- `scene-model.ts:1043-1044` — planet `direction`/`angularSpeed` (drives
  actual orbital rotation).
- `scene-model.ts:1143` — the currently-dead `direction` variable inside
  the ring descriptor: update to `dayReturn` for consistency, or remove it
  if genuinely unused — implementer's choice, must compile either way.
- `scene-model.ts:1162-1179` — the `trails` array: `direction`, `color`,
  `arcRadians`, `magnitude`, `sweep` all derive from `holding.dayReturn`.
- `scene-model.ts:732` (`radarRingColor`, consumed by
  `SystemPlot.tsx:155`'s Mission Control radar plot) — `rampForReturn(dayReturn)`.
  This is the same color-ramp concept applied to the radar's flat view of
  the same trail encoding; it moves with the 3D scene for consistency.
- `scene-model.ts:1266-1271` (the return→speed-fraction export) —
  `dayReturn`.
- `OrreryScene.tsx:1109-1110` — the DOM evidence hook
  `label.dataset.weeklyReturn = ...` renames to `label.dataset.dailyReturn`,
  sourced from `holding.dayReturn`. This is the attribute `TST-03`'s
  sampler reads to derive its expected color/arc; the sampler script must
  read the renamed attribute and derive its expected value via
  `rampForReturn`/`trailArcLengthForReturn`, not the old names.

**Explicitly unchanged:** `DraftRig.tsx:373` keeps calling the ramp
function with `holding.weeklyReturn` — only the function name updates
mechanically (`rampForWeekly` → `rampForReturn`), the argument stays
`weeklyReturn`, per FB-12's parked status.

### 2.4 Display-label corrections (the "every number carries its window" rule)

Two lines currently pair a **WEEK**-labeled percentage with the
direction/trail word, which would now silently disagree with the
underlying (daily) encoding if left unfixed:

- `OrreryWorld.tsx:469` — `WEIGHT {…} · WEEK {formatPercent(holding.weeklyReturn)} · {directionForWeeklyReturn(…)}`
  → `WEIGHT {…} · TODAY {formatPercent(holding.dayReturn)} · {directionForReturn(holding.dayReturn)}`.
- `OrreryWorld.tsx:635` — `WEEK {formatPercent(holding.weeklyReturn)} · {directionForWeeklyReturn(…)}`
  → `TODAY {formatPercent(holding.dayReturn)} · {directionForReturn(holding.dayReturn)}`.

`OrreryWorld.tsx:472` already reads `TODAY {formatPercent(holding.dayReturn)} · TRAIL {…} · {…}° ARC` — the label was already correct; only the TRAIL/ARC *values* it computes need to move to the renamed daily-sourced functions (§2.3 covers this).

`OrreryWorld.tsx:577` (the belt body line, a standalone `WEEK X%` with no
adjacent direction/trail word) is **not** paired with the encoding and
stays unchanged.

### 2.5 Test debt

`src/lib/observatory/orrery.test.ts`, `scene-model.test.ts`, and
`universe-palette.test.ts` reference the renamed functions/constants
directly and must be updated to the new names — a passing suite against
stale names is not evidence (it would not compile).

### 2.6 Acceptance

- **`TST-03`** (carried name, definition moves with the field): the trail
  sampler asserts hue lock within 10°, ΔE*ab ≤ 8 against the
  payload-derived expectation from `rampForReturn(holding.dayReturn)` (not
  `rampForWeekly`/weekly), and ordering across same-direction holdings —
  for every holding in the fixture, sampled at each holding's own naturally
  unoccluded orbital phase (unchanged sampling method from §11). Literal-hex
  baselines survive only for flat, comet and sun tokens.
- **`VIS-04`** (carried name): trails carry direction and magnitude in a
  captioned 1440×900 temporal per-holding pixel plate, arc 18–30° (the
  arc *band* is unchanged — only its input field moved), ramp lightness
  carries the daily magnitude, fixed 12% white-hot head unchanged as the
  calibration reference. Every threshold and non-method clause from §11 is
  unchanged; only the underlying field is daily.

---

## 3. FB-01 + FB-05 — the two numeric nudges

### 3.1 FB-01 — spacing and zoom, one more small step

**Source:** `src/lib/observatory/orrery.ts` lines 107-116
(`orbitRadiiForPlanetRadii`'s gap formula); `src/lib/observatory/scene-model.ts`
lines 24-25 (`OVERVIEW_BELT_SPAN_PCT`).

**Fix, Lead-computed per the design proof's resolved ambiguity (owner
confirmed direction and proportions, not exact values):**

- Gap formula coefficient: `1.75` → **`1.82`**, additive term `+0.55`
  unchanged: `1.82 × (rᵢ + rᵢ₊₁) + 0.55`.
- `OVERVIEW_BELT_SPAN_PCT`: `0.80` → **`0.75`**.

**Do not touch `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS`** — the proportions
these control are confirmed and out of scope this round; only spread (gap)
and zoom (belt span) move.

**Test debt:** `orrery.test.ts`/`scene-model.test.ts` assertions against
the §12a constants (`1.75×(...)+0.55`, `0.80`) update to the new values.

**Acceptance — measured half only; the row itself still closes on his
sentence:** at the 1440×900 overview capture, minimum edge-to-edge distance
between any two adjacent planet discs at closest approach remains ≥ 1.0×
the larger disc's diameter (the existing floor, re-measured against the new
constants, not assumed), and the full system fits within the frame with
visibly more margin than the §12a capture. `VIS-01`.

### 3.2 FB-05 — raise the ramp's floor once more

**Source:** `src/components/observatory/orrery/orrery.module.css` lines
10-17, the five-token type ramp block.

**Fix:** `--type-label`: `11px` → **`12px`**. No other token changes —
`--type-body` (13px), `--type-title` (15px), `--type-readout` (24px),
`--type-hero` (56px) are all unchanged. The §12a role→token mapping
(`MISSION_CONTROL_TEXT_ROLES`) is unchanged; this section only moves the
value the `--type-label` token itself resolves to.

**Test debt:** `type-ramp.test.ts`'s legal-size set updates from
`[56,24,15,13,11]` to `[56,24,15,13,12]`; `mission-control-text-roles.test.tsx`'s
computed-size assertion for label-role elements updates from `≥11px` to
`≥12px`.

**Acceptance:**
- **`TST-01`**: the rendered/computed-style test (extending §12a's
  `mission-control-text-roles.test.tsx` pattern) asserts every element
  carrying the `genuineLabel` role resolves to exactly 12px, not merely a
  legal ramp value.
- **`VIS-02`**: at 1440×900 with Mission Control open, window-word/label
  text is visibly larger than the §12a capture at the same crop, captured
  for owner review.

---

## 4. FB-02 — the sky, five moves

**Source authority:** `UNIVERSE_IDEAS_6.md` §2.2, adopted whole, values
used verbatim (this spec does not re-derive them).

**Files:**
- CSS starfield layer: `src/components/observatory/orrery/orrery.module.css`
  lines 73-90 (`.starField`).
- Aurora/nebula: `OrreryScene.tsx` lines 775-836 (aurora mesh construction),
  `scene-model.ts` (`auroraDescriptor`, `nebulaForHealth` — search both
  files for these names; exact line numbers were current as of §12a and
  may have drifted, confirm at implementation time).
- Texture generation precedent: `scripts/generate-planet-textures.mjs` is
  the existing offline KTX2-generation pipeline (used for planet surfaces
  in §9); reuse its pattern (asset built offline, committed under
  `public/textures/`, budget-checked against the existing 30MB ceiling) for
  the new nebula filament texture rather than inventing a new toolchain.

**The five moves, exactly as specified:**

1. **Retire the tile wallpaper.** Delete `.starField`'s two repeating
   radial-gradient dot-grid layers and two ellipse washes (lines 76-83 in
   the current rule); keep only the dark base `linear-gradient` and the
   existing pointer-parallax transform. This is a deletion — a performance
   refund, not a new element.
2. **Floor the aurora:** opacity formula `0.02 + wildness × 0.38` →
   **`0.14 + wildness × 0.26`**. Cap unchanged at `0.40`. Add a sampler
   assertion: centre-band sampled alpha ≥ `0.14` (the new floor), so the
   aurora can never silently vanish again.
3. **Texture the nebula:** replace the flat `RingGeometry` color with one
   offline-generated filament KTX2 texture (512×256, tens of KB budget),
   tinted by the existing two health anchors (gold hue 41°, ember hue
   12°). Same sign→hue encoding, same alpha cap `0.18`.
4. **TVA register — vignette + grain, CSS overlay only:** a static radial
   black corner vignette (transparent at centre, ≤ 0.35 at corners,
   darkening only) plus static warm grain baked into the same overlay
   (≤ 0.05 umber). No new encoding — purely ambient framing.
5. **One ecliptic graticule:** a single faint great-circle arc with sparse
   tick marks, ring slate `#66756f`, alpha ≤ 0.10, in the orbital plane.
   Ambient tier, decorative — if it reads as clutter in the first capture,
   it may be cut without further process (it encodes nothing).

**Refused, unchanged from the source doc:** any animated sky element.
Reduced-motion and no-WebGL paths keep the CSS gradient/vignette/grain
(static, unaffected); the fallback sky is unaffected.

**Contrast check (already computed in the source doc, re-confirm rather
than re-derive):** loss-ramp dark end floors at 3.06:1 under worst-case
vignette+grain, above the 3.0 gate.

**Acceptance:** `VIS-05` — before/after captures at 1440×900 showing the
CSS tile gone, the aurora visible at rest (calm-book state), the textured
nebula, the corner vignette/grain, and the graticule (or its documented
absence if cut for reading as clutter).

---

## 5. FB-17 — panel width default, and the live/capture gap

**Source:** `src/components/observatory/orrery/orrery.module.css` line 32
(`--panel-width: 460px`, the CSS default); `OrreryWorld.tsx` lines 160-169
(the capture-only `?panelWidth=` override, unchanged in kind).

### 5.1 Ship the picked default

**Fix:** `--panel-width` default changes from `460px` to **`600px`** — the
number he picked from the §12a capture strip. The capture-only
`?panelWidth=` override stays wired exactly as it is (still useful for any
future 660/720px evidence), now overriding a 600px baseline instead of
460px.

### 5.2 The live/capture disagreement — investigate, don't guess

He reports: *"600 but when I open up npm run build && npm run start the
panel looks too small as it is now."* The capture strip that produced his
pick was captured at a fixed 1440px viewport. The approach-camera panel
rule (`orrery.module.css` lines 2601-2612) is
`width: min(var(--panel-width), calc(100vw - 3rem))` — if his real browser
window is narrower than 1440px logical pixels (a non-maximized window, a
smaller display, or a browser zoom level other than 100%), the
`calc(100vw - 3rem)` term can bind below `--panel-width` and visibly shrink
the panel relative to the fixed-viewport capture, even with the same CSS
custom property value. **Required investigation, before assuming this is
the cause:** measure the panel's actual rendered width at a realistic
range of viewport widths (1280, 1366, 1440, 1536, 1920 — common real
laptop/desktop logical widths) against a production server, and check for
non-100% default browser zoom as a second candidate. Report findings even
if the hypothesis above is wrong — the goal is an honest explanation, not
confirmation of a guess.

**Do not change the `calc(100vw - 3rem)` responsive floor without
recording why** — it exists to keep the panel from overflowing narrow
windows, which is a genuine constraint, not a bug. If the investigation
confirms viewport width as the cause, the fix is documentation (making the
size difference legible/expected, e.g. an explicit note of the current
window size relative to the panel) rather than removing the responsive
behavior — unless the investigation finds an actual defect (e.g. a units
or calc-precedence bug), in which case fix that defect specifically.

**Acceptance:** `VIS-03` — a capture of the live production default (no
query params, real `npm run build && npm run start`) at 1440×900 showing
the panel now defaults to 600px, plus a written, measured explanation
(`raw-fb17-live-vs-capture.json` or equivalent) of the live/capture size
disagreement he reported, covering at least the viewport-width hypothesis
above.

---

## 6. FB-22, FB-23, FB-24, FB-25, FB-31 — the five small defects

### 6.1 FB-22 — yellow haze above the sun

**Source, candidates identified this turn (confirm the actual cause at
implementation, do not guess):** `OrreryScene.tsx` sun construction,
roughly lines 775-929 — three candidate elements: (a) the `aurora` mesh, a
partial/off-axis `RingGeometry` positioned above/behind the sun via
`aurora.position.set(0, outerRadius × sceneModel.aurora.chord.yInOuterRadii, …)`
— geometrically the closest match to "semi-circle haze above the sun"; (b)
two full-sphere additive glow shells (`glowMaterialInner`/`glowMaterialOuter`,
color `#ffb347`); (c) the dashed docking ring (`#ffe4ad`, full 360° around
the sun's equator, not "above" it). Note FB-02 §4 above also touches the
aurora's opacity floor — if the aurora is confirmed as FB-22's cause,
resolve both in the same pass rather than fighting each other; if it is a
distinct element, fix it independently of FB-02's changes.

**Fix:** identify the actual offending element from a live capture and
either remove it, correct its position so it is no longer visible as an
unexplained haze, or correct its opacity/geometry — reviewer grades the
outcome, not the method.

**Acceptance:** `VIS-06` — a 1440×900 overview capture showing no
unexplained yellow/gold haze or glow above the sun, with the implementer's
notes naming the actual identified cause.

### 6.2 FB-23 — anchor the PORTFOLIO chip to the sun

**Source:** `OrreryWorld.tsx` lines 398-404 (`.sunTelemetry` markup),
`orrery.module.css` lines 345-357 (`top: 50%; left: 50%`, frame-relative,
not sun-relative).

**Fix:** reposition `.sunTelemetry` using the sun's actual per-frame
projected screen position, the same technique planet labels already use
(`layoutOverviewLabels`/`projectOverviewPoint`, `scene-model.ts`) rather
than a static frame-center CSS position — so the chip tracks the sun
across overview, approach, sector, and drag-tilt camera states instead of
drifting away from it. Implementer's choice how the position update is
wired (ref + per-frame style write from `OrreryScene.tsx`'s render loop,
matching however planet labels are updated, is the existing pattern to
follow); the graded outcome is that the chip's screen position tracks the
sun's projected position, not a specific wiring mechanism.

**Acceptance:** `VIS-07` — captures at two different camera states (e.g.
overview and approach, or overview before/after a drag-tilt) showing the
chip visibly attached to/directly above the sun in both, not drifted to
frame-center.

### 6.3 FB-24 — moons that do nothing when clicked

**Source, root cause identified this turn:** moon existence and sizing
(`scene-model.ts:1188-1206`) key off `holding.newsCount`, which is
populated (`src/lib/dashboard-data.ts:230-238`, `publicNewsCounts`) from a
filter on headline content and a 7-day recency window — but **not** on
whether the item has a usable URL. The moon's click destination
(`PlanetDetail.tsx:48`, `linkableNews = news.filter(({url}) =>
/^https?:\/\//i.test(url))`) additionally requires a real `http(s)` URL. A
holding can have `newsCount > 0` (moon exists, is clickable) while
`linkableNews.length === 0` (the destination shows nothing) — the owner's
"do nothing" report.

**Decision (Lead, per the design proof's freeze boundary): wire them
correctly rather than remove them.** Moons are a partially-working,
already-designed feature (news volume → moon size, click → the holding's
news) with one locatable bug, not a broken concept; deleting a working
idea over a fixable mismatch is the worse outcome.

**Fix:** the count that determines moon existence/sizing must equal the
same linkable (http/https URL) count the click destination already uses —
either by adding the same `/^https?:\/\//i.test(url)` predicate to
`publicNewsCounts`'s existing filter chain (`dashboard-data.ts:233-237`),
or by extracting a small shared predicate both sites import. Implementer's
choice; the graded outcome is that a moon never exists for a holding with
zero linkable news items, and every moon that does render opens at least
one real, working headline link when clicked.

**Acceptance:**
- **`BHV-01`**: a unit/integration test asserting a holding with
  `newsCount > 0` but zero linkable items produces no moon (or a
  moon-radius of zero, matching the existing `moonRadiusForStoryCount`
  zero-radius-means-absent convention), and a holding with at least one
  linkable item produces a moon whose click destination shows at least one
  real headline.
- **`VIS-08`**: a 1440×900 capture of a moon click transitioning into the
  holding's panel with a real, visible news headline.

### 6.4 FB-25 — the planet panel needs more content

**Source:** `PlanetDetail.tsx` lines 88-92, the stats section, currently
`WEIGHT`, `VOL`, `BETA` only.

**Fix:** add two fields, both already computed and already typed on
`PublicOrreryHolding` (`orrery.ts:38-51`) and currently unused in this
component — no new data plumbing, no new privacy surface:

- **`CONTRIB`** — `holding.contributionPct`, the holding's contribution to
  portfolio return (the dashboard-wide metric named in `CLAUDE.md`'s
  product requirement #1, already computed, never surfaced here).
- **`VS VOO`** — `holding.portfolioRelativeReturn`, same-period
  portfolio-relative return (already TWR-derived elsewhere in the app; do
  not compute a new figure for this field).

Both are optional (`number | null`) — omit the field entirely (not a
zero/dash) when null, matching the existing pattern for the windows line's
optional `30D` chip. Both are percentages, already public-safe (no dollar
figure), so no `/share` privacy change.

**Acceptance:** `VIS-09` — a 1440×900 planet-panel capture for a holding
with both fields populated, showing `CONTRIB` and `VS VOO` present
alongside the existing `WEIGHT`/`VOL`/`BETA`.

### 6.5 FB-31 — remove the orange tabs

**Source, root cause identified this turn:** the orange the owner is
seeing is `src/components/observatory/orrery/orrery.module.css` lines
834-846 (`.missionControl nav a`, inactive background `#3b1f12`, 1px
border box) and lines 862-865 (`.missionControl nav a[aria-current="page"]`,
active background `#7d3d1d`) — the **base/default** tab rules, which apply
whenever no `stripVariant` query param is present, i.e. always, in
production. `FB-08`'s already-`CONFIRMED` "B is fine" boxless/cream-underline
treatment (`[data-strip-variant="b"]` rules, lines 2955-2971) was only ever
built as a capture-only evidence variant and was **never shipped as the
default** — so the orange he is re-reporting is the same never-migrated
rule §12a's variant-strip work left in place.

**Fix:** update the base rules to match the already-confirmed variant B
treatment (do not re-litigate the choice — it is `CONFIRMED`):

```css
.missionControl nav a {
  /* keep existing layout: display, min-height, padding, white-space */
  border: none;
  background: none;
  color: var(--universe-cabinet-window-word);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.missionControl nav a[aria-current="page"] {
  color: var(--universe-cabinet-cream);
  background: none;
  border-bottom: 2px solid var(--universe-cabinet-cream);
}
```

Scope is narrow: only the tab background/border/text-treatment. The
`.missionStrip`'s own `border-bottom`/background (the hero+chips row above
the tabs) is unchanged — that row is FB-32's "top-right block," explicitly
`PHASE10.md` §14, not this section. The now-redundant
`[data-strip-variant="b"]` override rules may stay as harmless duplication
(explicit variant selection) or be removed as dead code — implementer's
choice, does not affect the graded outcome. Variants A and C are unaffected
(gated on their own selectors, unrelated to these base rules).

**Acceptance:** `VIS-10` — a 1440×900 capture of Mission Control's tab
strip at its production default (no query params) showing no orange
background on either the active or inactive tabs.

---

## 7. Regression criteria

- **`MOB-01`** — the sub-1024px fallback is unaffected. This section edits
  `orrery.module.css` (FB-05, FB-17, FB-31), `scene-model.ts`/`orrery.ts`/
  `universe-palette.ts` (FB-01, FB-26), and several component files
  (FB-22/23/24/25) — none of which are fallback work. A 390×844 capture
  plus the existing fallback test suite must show no change in fallback
  layout, text, or horizontal overflow.
- **`PRV-01`** — no privacy or public-data surface is touched. FB-25 adds
  two already-public percentage fields to an existing panel; nothing else
  in this section adds a route, a public field, or a dollar figure. The
  existing `/share` canary tests must pass unchanged, and a diff review at
  candidate time must confirm this.

---

## 8. Sequence

1. **FB-26** (`§2`) — first, per `PHASE10.md` §13's own instruction, since
   `TST-03`/`VIS-04` key off this field and every later capture in this
   section should reflect the corrected encoding, not the stale one.
2. **FB-01, FB-05** (`§3`) — both touch shared files (`orrery.ts`,
   `scene-model.ts`, `orrery.module.css`) that later captures depend on
   being stable; land before the remaining items.
3. **FB-02** (`§4`) — independent of the above; any order relative to §5/§6.
4. **FB-17** (`§5`) — independent.
5. **FB-22, FB-23, FB-24, FB-25, FB-31** (`§6`) — independent of each
   other and of §4/§5; any order.

---

## 9. Global gates, unchanged

`npm test` and `npm run build` both green, independently re-run at
candidate and at review (`TST-02`, `BLD-01`). `G-BOUNDARY`, `G-SECRETS`,
`G-PUBLIC`: no criterion in this section touches privacy, authentication,
secrets, or financial correctness — `PRV-01` exists to prove that claim
rather than merely assert it.

---

## 10. What is explicitly not this section

FB-32's STRIP rebuild, FB-27, FB-28, FB-29, FB-30, FB-33, FB-35 (Mission
Control content rework), and FB-13's Chart Room doors are `PHASE10.md`
§14, not specified here. FB-12
(DRAFT rig) stays parked — `DraftRig.tsx` receives only the one mechanical
rename in §2.3, no behavioral change. FB-16 (XLK replica system) is a
distinct future item (§13′) unaffected by this §13. Nothing in this spec
authorizes recalibrating FB-26's magnitude clamps, widening the type ramp
beyond `--type-label`, or re-deriving FB-01's already-confirmed
proportions.
