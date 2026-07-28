# Phase 10 §10 — Universe colour, material, and command structure

Specification written by `claude-code/opus-5` (Claude Lead, `specify` stage),
July 28, 2026.

Implementer: Codex Implementation. Implement to this document. Every acceptance
criterion in §12 is a pass/fail gate with a matching entry in
`docs/phase10-workflow/acceptance/section-10.json`; nothing here is a
placeholder.

The `portfolio-ux` project skill was invoked for this turn via the `Skill` tool
(not the fallback path) and applied beneath the authority order in §2. The
design-proof gate is satisfied by
`docs/phase10-workflow/design-proofs/section-10.md`, which cites the
owner-approved package for six of the eight required items and decides the
remaining two (state matrix, freeze boundary).

---

## 0. Premises verified against the code before scope

Six things about the shipped build were checked directly this turn. Each one
changes what the implementation should do, so they are recorded rather than left
to be rediscovered mid-round.

### 0.1 The sun and the belt rocks are already pointer targets

`OrreryScene.tsx:823` includes `sun` and every belt rock in `pickTargets`, and
`sun.userData.orreryTarget = "portfolio"` is set at line 516.
`resolveOrreryPointerTarget()` gives a direct `"portfolio"` hit precedence over
the magnetic assist. **So owner defects 4 and 5 are not missing hit targets.**
Two mechanisms are the likely causes and both must be checked before a fix is
written:

- The belt rock body is `IcosahedronGeometry(0.11, 0)` scaled to roughly
  `0.7 × 0.5 × 0.55` (line 724–732). At the OVERVIEW camera that is a
  near-invisible mark, which matches the owner's words exactly — *no visible
  body* first, *cannot be clicked* second. The magnetic assist for the belt is a
  32px radius around a body the user cannot see.
- The sun's *visible* disc is its corona and glow, which are larger than the
  1.28-unit picked sphere. A pointer aimed at what looks like the sun can miss
  the only pickable geometry.

Root-cause both, fix the cause, and prove the fix with a behavioural test
(`DEF-04`, `DEF-05`). Do not "fix" this by adding a second invisible hit plane
that makes empty space clickable.

### 0.2 The trail sign is the defect, exactly as reported

`createTrailGeometry()` (`OrreryScene.tsx:208`) sets
`sign = direction === "counterclockwise" ? -1 : 1` and sweeps the arc from the
planet through `+sign × length`, i.e. **with** the direction of travel. The
trail leads the planet. Flip the sign of the sweep — not the direction token,
which also drives colour and must not move (§2.2). Update the trail-geometry
test to assert the arc lies behind the planet's current orbital angle for both
directions (`DEF-01`).

### 0.3 The starfield really is two fixed sizes and a uniform scatter

`createStarField(760, -4, 0.045)` and `createStarField(430, -11, 0.032)`
(lines 477–478) each emit a `Points` cloud with one `PointsMaterial` size and
positions drawn from a uniform sphere. There is no magnitude distribution, no
clustering, and no bright-star treatment. This is half of the graph-paper read
and `VIS-06` replaces it wholesale.

### 0.4 Axial spin currently encodes day return

`axialSpinForDayReturn()` (`src/lib/observatory/orrery.ts:121`, bounded by
`ORRERY_MIN_AXIAL_SPIN = 0.05` / `ORRERY_MAX_AXIAL_SPIN = 0.55`) is consumed at
`scene-model.ts:714` and applied at `OrreryScene.tsx:1036`. De-encoding it means
deleting the function and its encoding-ledger row, not merely retuning it — the
freed channel is **banked** and nothing may take it (`BHV-06`, `BHV-07`).

Moon orbits advance at `delta * (0.72 + index * 0.08)` (`OrreryScene.tsx:1158`),
a period of about 8.7 s. The owner's "far too fast" is reproducible; the target
of ~40 s means a rate near 0.157.

### 0.5 There is no aurora yet

`grep` for `aurora` across `src/` returns nothing. Revision 1 proposed it and it
was never built. `nebulaForHealth()` exists (`scene-model.ts:514`) and is a
different object — a health-keyed wisp behind the system, capped at alpha 0.15
by §9. **The aurora is a new build in work package F**, not a retune, and its
0.40 alpha cap does not license raising the nebula's 0.15 cap.

"The radar" in `UNIVERSE_IDEAS_3.md` §7 is the existing PLOT bay
(`MissionControlBays/SystemPlot.tsx`), a 2D-canvas top-down wireframe. There is
no separate radar component to build; `VIS-10` and `BHV-03` upgrade that one.

### 0.6 The seven bays already exist; their *composition* is the defect

`mission-control-panels.ts` already declares `PLOT 00 · MANIFEST 01 · SCOPE 02 ·
HAZARD 03 · SIGNALS 04 · COMMS 05 · LOG 06`. §9 built them. §10 does **not**
re-enumerate or rename bays — it changes their sizes, materials, type scale,
word budget, and click-through. Keep the ids, the `?station=` URL grammar, and
`aria-current` exactly as accepted.

Planet-detail bay labels currently render at `0.56rem` (≈9px) and headings at
`0.94rem` (`orrery.module.css:1085–1096`), which reproduces the owner's
"text is too small" report.

---

## 1. The inherited red — §10's first exit criterion

`npm test` is **red at this section's start** with exactly two failures in
`src/lib/observatory/planet-textures.test.ts`:

| assertion | value at HEAD | gate |
|---|---|---|
| `manifest.totalBytes` | 22,450,706 | ≤ 15,000,000 (§9's cap) |
| minimum `luminanceStdDev` | 0.093008 (CBRS); INTC 0.098092 | ≥ 0.1 |

Both were introduced by owner texture commits landed on top of §9's reviewed
implementation. They are **not §10 implementation defects and must never be
raised as findings against §10's implementer.** They are §10 work item 5, and
closing them is binding:

1. Raise the byte ceiling in `planet-textures.test.ts` from `15_000_000` to
   `30_000_000` — the figure `PHASE10.md` §10's Build dimension already states.
   Change that number and nothing else about the test's structure.
2. **Verify — do not assume — that relighting lifts INTC and CBRS to
   `luminanceStdDev` ≥ 0.1.** The relight in §5 targets equatorial-band mean
   *luminance*; standard deviation is a different statistic and raising the mean
   can flatten it. Measure after regeneration. If any world still misses the
   floor, that is a texture-authoring problem to solve in this section, not a
   reason to move the floor.
3. **`npm test` must be green — zero failures — before the implementation
   commit** (`BLD-01`). The §9 owner exception that permitted a red `main` ends
   here and does not generalize.

---

## 2. Authority order and binding constraints

Authority for §10, highest first:

1. `PRODUCT_DIRECTION.md`'s decision hierarchy — privacy/security, then
   financial correctness, then route usefulness, then accessibility, then
   hierarchy, then resilience, then art direction, then convenience.
2. `UNIVERSE_IDEAS_3.md` revision 2 (the accepted round-3 design).
3. `UNIVERSE_PALETTE_3.html` (the computed palette board).
4. `docs/reference/` and its `README.md`.
5. `PHASE10.md` §10.
6. This specification, which resolves conflicts among the above into checkable
   requirements.

Round 3 supersedes `UNIVERSE_IDEAS_2.md` wherever the two conflict. §9's spec
remains the authority for everything §10 does not touch.

Standing gates carried in unchanged from §7/§8/§9 — none may be weakened,
redefined, or baseline-subtracted:

- Route-owned long task **< 50 ms** on the established rig (1440×900, CPU 2×,
  five fresh contexts). No post-processing pass is added.
- **Desktop-first.** Below 1024px the existing tested fallback ships unchanged:
  `canvas` count 0 at 390px and 320px, no horizontal overflow, no sub-44px
  targets. No mobile 3D.
- The semantic DOM is the accessible source of truth. No essential information
  exists only in WebGL, motion, colour, speed, or direction.
- Reduced motion preserves every encoding.
- Contrast of new text verified by **computed WCAG ratio from source tokens**,
  never by eye.
- `/share` is public and read-only: zero dollar amounts, zero owner-only fields,
  in HTML, RSC payload, and client bundle.

### 2.1 D1 — the unreproduced green trail, and why §10 may still touch trail colour

§9 froze trail colour logic under D1: an owner report of a green trail on a
holding that was down for the week, never reproduced, source mapping verified
correct. §10 changes trail colour by owner direction — magnitude moves into
lightness within each semantic hue.

The freeze is resolved, not ignored, by splitting it:

- **The sign→hue mapping does not change.** Up is green (anchor 143°), down is
  red (anchor 3°). Changing it is out of scope and is named in the design
  proof's freeze boundary as new creative direction.
- **Lightness within the hue is what §10 changes**, per the owner's own ask.
- The new sampler assertions in `TST-03` are a **stronger D1 detector than the
  freeze was.** The hue lock (±10° of the anchor) would fail loudly on any
  holding whose trail rendered in the wrong band, and the ordering assertion
  would fail on any inverted magnitude. Implement them so they run over every
  holding in the fixture, not a sampled subset.
- If the owner names a contradicting ticker during this section, stop and treat
  it as severe, exactly as §9 required.

### 2.2 D2 — "the website is still relatively confusing"

**Decision: §10 closes D2.** It is not carried again.

§9 closed it with one orientation line, and the owner's live review still
produced "zooming out reaches the sector map with no explanation of what it is."
That is a specific, bounded instance of the general complaint, and §10's Mission
Control restructure addresses the rest. D2 closes on exactly three requirements,
and nothing further is licensed by it:

- `DEF-08` — the sector map states what it is, in the scene, without a click.
- `BHV-04` — every bay names the question it answers and has a working
  destination. A bay that answers nothing is deleted, not decorated.
- `VIS-08`/`VIS-09` — one dominant bay, one huge number, and a visible material
  split, so the eye is told where to start.

If the owner reports confusion again after §10, it re-opens as new owner scope
for a later section rather than as a §10 finding. That boundary is recorded in
the design proof.

---

## 3. Scope

### 3.1 In scope — seven work packages

Sequenced per `UNIVERSE_IDEAS_3.md` §11, which deliberately lands the contract
before any pixel moves.

| ID | Package | Source |
|---|---|---|
| **A** | `universe-palette.ts` — one source of colour truth, firewall v2, five ramp LUTs, contrast table, CSS custom properties, sampler upgrade | IDEAS_3 §1, §3.3, §9 |
| **B** | Sun scale, trails (ramps, arc length, behind-the-planet), spin de-encoding and new motion rates | IDEAS_3 §3, §4, §5 |
| **C** | Star population and ring vertex-alpha falloff — the graph-paper cure | IDEAS_3 §6 |
| **D** | Mission Control restructure — dominant PLOT, 64px readout, material split, word budget, radar colour and click-through, widened planet-detail panel | IDEAS_3 §7 |
| **E** | Texture regeneration — relight the five dark worlds, carve the marks into the material stack, byte-gated | IDEAS_3 §2 |
| **F** | Aurora, weather wisps, brand-first entry, radar sweep | IDEAS_3 §2.1, §2.2.3, §7 |
| **G** | Prism cursor exhaust | IDEAS_3 §8 |

The ten carried owner defects are distributed across these packages and are
listed as their own criteria (`DEF-01`–`DEF-10`) so none can be lost.

### 3.2 Explicitly out of scope — do not touch

- **The sign→hue mapping** (green = up, red = red-band down) and the trail
  *direction* token. Only lightness, arc length, and geometry sign change.
- **The void `#020706`**, the nebula's 0.15 alpha cap, and the two stolen bands.
  Three revisions have now said the void does not change.
- **Spending the banked spin channel.** No new encoding may be re-homed onto any
  ambient scene property.
- **Bay identity.** No bay is added, removed, or renamed; `MissionControlPanelId`
  and the `?station=` grammar stay as accepted.
- **Any route other than `/` and `/share`.** `/dashboard`, `/compare`,
  `/research`, `/history`, `/trades`, `/stock/[ticker]`, `/share/full` keep their
  accepted behaviour and tests exactly.
- **The mobile/no-WebGL/reduced-motion fallback's structure.** It is re-verified
  and re-tokenized, not redesigned.
- **The financial math libraries.** §10 adds no new return, risk, or benchmark
  computation. The aurora re-encodes the weekly series the SCOPE already draws.
- **`src/components/surface/PortfolioOrrery.tsx`** — the unrelated Phase 9
  component with a colliding name.
- **`docs/reference/README.md`** — §8's record. Do not edit it. Its no-logo
  caution was superseded for §9 onward by owner decision; everything else in it
  stands, including that `planet-surface-mood-reference.jpg` must not be
  reproduced literally.
- **`PRODUCT_DIRECTION.md` reconciliation** — a separate later task.
- **Post-processing passes and automatic audio**, of any kind.

---

## 4. Work package A — `universe-palette.ts`, the contract

Build this first. Nothing else in §10 may hard-code a colour.

### 4.1 The module

New pure module `src/lib/observatory/universe-palette.ts` exporting:

- **Tokens**, grouped by tier: `signal` (gain/loss/flat/comet/sun-up/sun-down/
  white-hot core), `cabinet` (cream, teletype, amber chrome, burnt orange, umber,
  bay glass, void, ring slate), `glass` (the twelve instrument lights),
  `matter` (the eight `brandHex` values and the five relight accents),
  `paper` (`#f0e2c4` / `#2b1a10`), and `ambient` (nebula and aurora washes).
- **Five ramp LUTs**, each a function `(t: number) => string` backed by a
  64-entry table with the stops from `UNIVERSE_PALETTE_3.html`:
  - decorative: `rampAurora`, `rampEmber`, `rampIce`
  - signal: `rampGain` (`#1f7a46` → `#63ef98` → `#a9ffcf`),
    `rampLoss` (`#ff9d97` → `#ff665f` → `#b3241d`)
- **`rampForWeekly(weeklyReturn: number | null)`** — the single entry point the
  scene uses: clamps `|weeklyReturn|` to the existing 0.2%–12% window, maps it to
  `t ∈ [0, 1]`, and returns the gain or loss ramp sample. `t = 0.5` must return
  exactly `#63ef98` / `#ff665f` so every screenshot to date stays continuous.
  `null` returns the flat token `#e3b65c`.
- **The extended contrast table** and a `contrastRatio(a, b)` helper using the
  standard WCAG relative-luminance formula already used by
  `observatory-contrast.test.ts`.
- **The firewall checker**: `hueChroma(hex)`, `isInStolenBand(hue)`, and
  `firewallViolations(tokens)` returning the offending tokens rather than
  throwing, so the test can report them all at once.
- **`UNIVERSE_CSS_VARIABLES`** — a serializable record mapping token names to
  `--universe-*` custom-property names, plus the emitted CSS block that
  `orrery.module.css` and the fallback consume.

No `three` import, no DOM, no WebGL. Pure and unit-testable.

### 4.2 The firewall, stated exactly

Two directions, both enforced by `src/lib/observatory/universe-palette.test.ts`,
which runs inside `npm test`:

1. **Outward.** For every token in the `signal`-exempt tiers — that is, every
   `cabinet`, `glass`, and `ambient` token, and every one of the 64 samples of
   `rampAurora`, `rampEmber`, and `rampIce` — if its chroma (max−min channel,
   normalized to 0–1) is **> 0.30**, its hue must fall **outside** both
   125°–165° and 345°–20°. `matter` and `paper` are exempt, and are asserted
   anyway with the result recorded, because §9 of the round-3 document already
   checked them out of caution.
2. **Inward.** For every one of the 64 samples of `rampGain` and `rampLoss`, hue
   must stay **within ±10°** of its anchor (143° gain, 3° loss). Luminance must
   be **monotonic** along each ramp. Both dark ends must clear **≥ 3:1 against
   the void `#020706`** (the computed figures are 3.80 and 3.08); the neon end is
   17.28:1.
3. **Ambient alpha.** Every `ambient` token ships with its alpha and the test
   asserts **≤ 0.18** for washes. The aurora is the one declared exception at
   **≤ 0.40**, spent explicitly for the relit worlds; it is asserted at its own
   cap and named as an exception in the test's message.

`PHASE10.md` §10 says this is "enforced by lint." **Resolution:** `npm run lint`
is not one of the two binding verification gates, so the firewall ships as a
vitest suite (which is) plus a **single-source-of-truth guard**: a test that
scans `scene-model.ts`, `OrreryScene.tsx`, `orrery.module.css`, and
`MissionControlBays/*` for any 6-digit hex literal whose value equals a palette
token, and fails naming the file and line. That guard asserts *source structure*,
not rendered behaviour, so it does not violate the `expect(source).toContain(...)`
prohibition in §11 — the prohibition is about proving what the user sees.

### 4.3 The sampler upgrade

`docs/phase10-baseline/section-9/scripts/sample-live-rgb.mjs` is the existing
live sampler. §10 carries it forward to
`docs/phase10-baseline/section-10/scripts/` and replaces its literal-hex trail
baselines with encoding assertions, run from the same public payload the scene
reads:

1. **Hue lock** — sampled trail-core pixels sit within ±10° of the anchor
   (143° gain / 3° loss) at chroma > 0.30.
2. **Expected colour** — ΔE\*ab ≤ 8 between the sample and
   `rampForWeekly(weekly)` computed from the payload.
3. **Ordering** — for any two same-direction holdings, the larger `|weekly|`
   samples lighter (gain) or darker (loss).
4. **Literals stay literal** for what did not change: flat `#e3b65c`, comet
   `#f4f0df`, sun `#f5c45d` / `#d65a24`.

Raw output is committed. Every holding in the fixture is sampled, not a subset.

---

## 5. Work package B — sun, trails, spin

### 5.1 The sun

`sunRadius = max(2.4, 1.25 × largest planet radius)`. With the current book that
is `max(2.4, 1.25 × 1.95) = 2.4375` against the shipped `SUN_BODY_RADIUS = 1.28`.
Derive it in the scene model from the computed planet radii; never hard-code
2.4375.

The satellite ring, first orbit, docking ring, label, hover states, and the
camera's belt-fit binary search all derive from that radius already and must
re-fit themselves. Corona parameters scale with radius; the corona alpha curve
(0.018–0.073) is **unchanged**, so centre brightness grows with area, not
intensity.

The sun must be the largest body in the scene at every camera state (`VIS-03`),
and must not occlude ASML during rotation at close camera (`DEF-07`) — the
increased radius makes this worse before it makes it better, so re-check the
close-camera clearance after the rescale.

### 5.2 Trails

- **Arc length 36°–64°**, replacing `MIN_TRAIL_DEGREES = 18` /
  `MAX_TRAIL_DEGREES = 30`, scaled by the same clamped weekly magnitude.
- **Colour from `rampForWeekly()`**, not from a direction-only token.
- **Trails render behind the planet** — flip the geometry sweep sign
  (`DEF-01`). The `direction` token itself does not move.
- **The white-hot head is fixed**: the first **12%** of arc, constant intensity,
  on every trail, so it works as a calibration reference beside the trail body.
- **A near-flat holding still renders a trail** (`DEF-03`): below the 0.2% clamp
  floor the trail renders at minimum arc in the flat token `#e3b65c`. Nothing is
  the one thing it may not render.
- Under reduced motion, static trails keep taper plus white head so direction
  still reads.

### 5.3 Spin, de-encoded

Delete `axialSpinForDayReturn()` and its consumers. Planets spin **prograde**
(with their orbit) at seeded periods of **80–140 s**, derived from the ticker
hash so the system never looks gear-locked. **Moon orbits slow to ~40 s
periods**; moons stop axial spin entirely.

Day return keeps every place it is already read — the hover chip, the manifest,
the teletype, and the fallback text. The encoding ledger, the Systems Manual,
and the fallback prose **drop the spin row** (`BHV-07`). Nothing takes the freed
channel.

Because spin is now scenery, **brand-first entry becomes legal** (§8.3).

---

## 6. Work package C — the graph-paper cure

### 6.1 Stars become a population

Replace both uniform `Points` clouds:

- **Magnitude distribution:** ~70% faint 1px at 0.25–0.45 alpha, ~25% at 2px,
  ~4% bright 3px, and the **twelve brightest gain 4-point diffraction spikes**.
- **Clustering:** positions sampled from 2–3 seeded gaussian fields over a
  uniform floor.
- **Geography:** star density **×1.8** within the aurora band.
- Round-3 accent tints stand: cyan 1-in-23, violet 1-in-41.

All of it is init-time and seeded, so it is deterministic and assertable from the
scene model.

### 6.2 Rings stop being compass circles

Each orbit ring gains a **vertex-alpha falloff along its own ellipse** — about
**0.50** in the arc nearest its planet, decaying to about **0.10** at the far
side, as if the body lights its own road. Hover behaviour is unchanged. Rings
stay **slate** — per-holding hue is refused in the 3D scene and adopted only in
the radar (`VIS-07`, `VIS-10`).

---

## 7. Work package D — Mission Control and the planet detail panel

No datum currently rendered may be deleted. Everything moves.

### 7.1 One dominant bay

PLOT grows to **~55% of the overlay**, full height, left side, with a true
chassis (2px frame, corner ticks). The right rail stacks MANIFEST, SCOPE,
LAUNCH; a narrow bottom strip carries HAZARD and SIGNALS as instruments.
**No two bays are the same size.** Gutters differ deliberately: dominant 20px,
strip 10px. Tabs size to their names. Stamps sit slightly over frame edges. The
concentration verdict stays a dashed rubber stamp.

### 7.2 One huge number

The teletype strip keeps its typed line, but the day number becomes a real
instrument readout at **64px** — the largest thing in the room. The type scale
spans **64 → 15 → 11px**. The current everything-at-≈12px flatness is the defect.

### 7.3 Materials split, visibly

- Instruments stay **black glass** with CRT-curved 10px bezels.
- **LOG and BRIEFING become parchment** — `#f0e2c4` paper, `#2b1a10` umber ink
  (13.02:1 AAA), 2px corners, a deckled edge, file-folder tabs.

### 7.4 The word budget, enforced

The far-left prose column is **deleted**. Its content compresses into the
teletype line and a `BRIEFING ▸` paper folder that unfolds on demand and folds
away. Nameplates ≤ 2 words. No sentence appears outside the teletype. Headlines
wrap once.

### 7.5 The radar earns its keep

- **Rings take their holding's signal-ramp colour at its current week value**,
  with a small ticker label at each ring's outer edge.
- **Blip size ∝ weight.** Hover still flares scene plus row.
- **Click a ring or blip → that holding's manifest row expands in place** into a
  detail card (sparkline, day/week/weight, latest headline). Enter or
  double-click → full planet view. Reachable by keyboard, not pointer-only.
- **The sweep**: period equals the data-refresh interval, so it honestly encodes
  staleness. Under reduced motion there is no sweep and a timestamp stamp takes
  its place.

The canvas stays `aria-hidden`; MANIFEST remains its complete text equivalent,
and the click-through must therefore also be reachable from the MANIFEST rows.

### 7.6 Every bay names its question

| Bay | The question it answers | Click-through |
|---|---|---|
| PLOT | where is everything, and how was the week | ring → holding card |
| MANIFEST | what do I own, at what weight | row → detail card |
| SCOPE | am I beating the market | range detents, benchmark toggle |
| HAZARD | how much can this hurt | → drawdown history |
| SIGNALS | what moves together | cell → pair-line on PLOT |
| LAUNCH | what's next on the calendar | row → that ticker's card |
| COMMS | what's being said | headline → article |
| LOG (paper) | what did I do | entry → trade context |

The question text is rendered, not merely documented — that is half of D2's
closure. Bays keep their accepted ids and `?station=` grammar (§0.6).

### 7.7 The planet detail panel

Owner defect 10. The panel widens to **~40% of the viewport, minimum 560px**;
the planet **shrinks and moves left**. Body text **15px**, headlines 15px, the
ID-plate day number **64px** to match the teletype's scale logic. The ≤ 60-word
budget is unchanged and the larger type now enforces it physically.

Typeface: **Chakra Petch 600** for nameplates, tabs, and ID plates; all numerals
stay in the mono stack with `tabular-nums`.

---

## 8. Work package E — texture regeneration

### 8.1 The luminance target, measured from the render

**Equatorial-band mean relative luminance ∈ [0.16, 0.55]** for all eight worlds,
verified from the **live sphere-strip capture**, not from the source map, because
the render includes lighting. The window is empirical: it is the span the three
worlds the owner can already see occupy (MSFT 0.157, ASML 0.207, GOOG 0.551).

Relight the five dark worlds by keeping the identity **hue** and raising the
**value structure** — the night-city strategy:

| World | Keeps | Gains |
|---|---|---|
| IBM | deep navy `#16295d` terrain | monolith tops + pinstripe edge-light in `#8fa3d6` (L 0.37), ~18% band coverage; denser quantum-dome emissive |
| INTC | slate plains | slate lifted to `#5a6270`; molten copper rivers widened |
| COST | concrete world | concrete lifted to `#8a8274` (L 0.23); red signage stays matte paint |
| NBIS | violet accretion scar | scar core brightened to `#a05a9e` (L 0.17); violet-white terrace emissive |
| CBRS | bronze wafer | wafer sheen to `#9c7d3f` (L 0.22); cyan coolant rivers widened |

All five accents are `matter` and clear the firewall; assert them anyway.

**Also verify `luminanceStdDev` ≥ 0.1 for all eight** after regeneration (§1).
Mean and standard deviation move independently; do not assume the relight fixes
both.

### 8.2 The marks: carve, don't stamp

The vector still lands in post, but it stops being an image over a painting and
becomes an **input to the material**:

- Its albedo is the world's material treatment **multiplied by the underlying
  terrain's luminance**, so ground shows through.
- Its silhouette is embossed into the **normal map** so engine light rakes across
  it.
- Its emissive copy glows on the night side.
- Its mask is edge-eroded a few pixels so the boundary weathers.

**Three capitals** at 120° longitude spacing, within ±18° latitude, where
equirectangular stretch is ≤ 5% — which removes the warp complaint without
pre-distortion math. One instance is always within 60° of facing the camera;
worst-case foreshortening 0.5×, still legible.

**The mirrored-mark defect** (owner defect 2) is a compositor orientation bug —
flipY / seam-roll ordering. Fix it in the pipeline and add a **chirality
assertion** to the sphere-strip capture so it cannot regress silently
(`DEF-02`, `TST-04`).

Rejected and not to be built: generation-time wordmarks, billboard marks that
counter-rotate against the surface, and dropping surface marks.

### 8.3 Brand-first entry

Because spin is decorative, the planet view sets rotation phase on entry: the
camera arrives with the nearest capital facing the viewer, then the slow spin
resumes. Suppressed under reduced motion (the phase is still set; the transition
is not animated). Zero standing cost at OVERVIEW, where the 32px test — colour,
macro silhouette, emissive signature — remains the identity carrier.

### 8.4 The byte ladder

~23 MB sits against the **30 MB** ceiling and denser emissive costs bytes.
Measure at each gate and record the measured total:

1. Regenerate all eight in one pass (relight + carved marks together).
2. **Emissive maps to aggressive ETC1S** — soft glow tolerates its artifacts
   better than any other content in the pipeline. Measure.
3. If > 30 MB: normal maps to 512×256 for CBRS and NBIS (smallest projected
   discs; macro relief survives).
4. If still > 30 MB: base to 1024×512 for those same two.

**If step 4 is ever reached, record it in `PHASE10_PROGRESS.md` rather than
absorbing it silently.** §9 established that this pipeline is zstd-compressed
raw RGBA rather than a GPU block format; if no ETC1S encoder can be obtained in
the implementation environment, record the exact command output and move down
the ladder rather than fabricating a compression result.

---

## 9. Work package F — aurora, wisps, sweep

The aurora is **new** (§0.5).

- One **prebaked texture**, re-encoding the weekly `|return|` series the SCOPE
  already draws — percent magnitudes only, no dollar quantity (`FIN-03`).
  Calm week → indigo, nearly gone; wild week → pink-cream flare, sampled from
  `rampAurora`.
- **Upper-sky chord**, whose nearest screen-space approach to the sun's disc is
  **≥ 1.2 sun radii**. The revision-1 diagonal through frame centre is dead: a
  dominant central body is exactly what that diagonal never had to negotiate.
- **Alpha ≤ 0.40**, the one declared exception to the 0.18 ambient cap, spent
  explicitly for the relit worlds.
- **Star density ×1.8 inside the band** (§6.1).
- The **void and nebula caps do not move.**

**Weather wisps** at the poles: magenta `#b3479e` when the health scalar is
positive, indigo `#3d5aa8` when negative, alpha ≤ 0.10. They encode the sign of
the health scalar and are named in the Systems Manual as such.

**The radar sweep** is specified in §7.5.

---

## 10. Work package G — the prism cursor exhaust

The one surviving whimsy, unchanged from round 2: the rocket cursor's exhaust
renders as a short prism spread whose **length ∝ pointer speed**. Disabled
entirely under reduced motion. It carries no data and is the only object in §10
permitted not to. It ships last and is the first thing to report as incomplete
if the section runs out of room.

---

## 11. Testing rules

### 11.1 The prohibition, restated

`expect(source).toContain(...)` — and file-text `toMatch` — **is not valid
coverage for rendered behaviour**. §8 shipped five such guards; one passed while
the trails it claimed to protect were fogged to invisibility. Rendered behaviour
is verified by **scene-graph assertions** (against the pure model in
`scene-model.ts`), **DOM assertions**, or **live pixel assertions**.

The single-source-of-truth hex guard in §4.2 is the one deliberate exception, and
it is an exception in form only: it asserts that a colour literal is *absent*
from a source file, which is a statement about code structure, not about what the
user sees. Name it as such in its test description so review does not have to
re-derive the distinction.

### 11.2 What must be asserted from the scene model

`buildOverviewSceneModel()` already exists and is the mechanism. §10 extends it
and asserts, at minimum: sun radius against the `max(2.4, 1.25 × maxPlanetRadius)`
rule; trail colour from `rampForWeekly` for a fixture spanning both signs and both
clamp boundaries; trail arc within 36–64°; trail geometry lying **behind** the
planet's orbital angle for both directions; the fixed 12% head; the flat-token
trail at sub-clamp magnitude; ring vertex-alpha endpoints; star magnitude buckets
and cluster seeding; aurora chord clearance ≥ 1.2 sun radii; wisp hue from the
health sign; and per-planet spin period within 80–140 s with no dependence on
`dayReturn`.

### 11.3 Live evidence that the model cannot prove

Retained scripts under `docs/phase10-baseline/section-10/scripts/`, with raw
output committed:

- **Sphere-strip capture**, extended from §9's, now measuring per-world
  **equatorial-band mean luminance** and asserting **mark chirality**.
- **Trail sampler**, upgraded per §4.3.
- **Long-task measurement**, five fresh contexts at 1440×900, CPU 2×.
- **Fallback capture** at 390×844 and 320×844 with `canvas` count and
  `scrollWidth === clientWidth` recorded.

### 11.4 Encoding-function rules

Every new or changed encoding function is pure, deterministic, clamped, and unit
tested against hand-computed fixtures **including clamp boundaries and the
`null` case**: `rampForWeekly`, trail arc length, ring falloff alpha, star
magnitude bucket, spin period, moon orbit period, aurora sample from weekly
magnitude, wisp hue, radar ring colour, blip radius from weight, and sun radius.

---

## 12. Acceptance criteria

Every criterion below has a matching entry in
`docs/phase10-workflow/acceptance/section-10.json` under the same ID.

### Owner defects carried from §9 (`DEF`)

1. **DEF-01** — Trails render **behind** the planet, for both orbital
   directions, asserted from the scene model and visible in a 1440×900 still.
2. **DEF-02** — Brand marks render with correct chirality on the sphere, proven
   by a chirality assertion in the sphere-strip capture, for all eight worlds.
3. **DEF-03** — A holding whose weekly magnitude is at or below the 0.2% clamp
   floor still renders a visible trail, at minimum arc in the flat token.
4. **DEF-04** — Every asteroid-belt holding has a **visible body** at OVERVIEW
   and is activatable by pointer and keyboard; the root cause is recorded rather
   than worked around.
5. **DEF-05** — The sun is activatable by pointer and keyboard **from every
   camera state**, including fully zoomed out; the root cause of the reported
   failure is recorded.
6. **DEF-06** — The unexplained orange shadow is root-caused, named in the
   evidence README, and removed.
7. **DEF-07** — The sun does not occlude ASML during rotation at the close
   camera, re-verified after the sun rescale.
8. **DEF-08** — Zooming out to the sector map presents an in-scene explanation
   of what it is, without a click, present in the semantic DOM.
9. **DEF-09** — Every moon and satellite has a working destination reachable by
   pointer and keyboard, and its readout is present as text.
10. **DEF-10** — The planet-detail panel is ≥ 40% of the viewport (minimum
    560px) with the planet shrunk and moved left; body text 15px, ID-plate
    number 64px, bay labels ≥ 11px; the ≤ 60-word budget still holds.

### Behavioral (`BHV`, `FIN`)

11. **BHV-01** — Every planet is identifiable at OVERVIEW without hovering, all
    eight legible simultaneously at 1440×900.
12. **BHV-02** — Belt bodies, moons, satellites, and the sun are activatable by
    pointer **and** keyboard from every camera state, each with a visible focus
    indicator.
13. **BHV-03** — Radar rings and blips click through to their holding: the
    manifest row expands in place into a detail card; Enter or double-click opens
    the full planet view; both paths work from the keyboard.
14. **BHV-04** — Every bay renders the question it answers and has a working
    destination per §7.6.
15. **BHV-05** — Brand-first entry: the planet view arrives with the nearest
    capital facing the camera, then resumes spin; suppressed as animation under
    reduced motion.
16. **BHV-06** — Axial spin is decorative only: prograde, seeded 80–140 s, with
    no dependence on `dayReturn`; moons orbit at ~40 s and have no axial spin.
17. **BHV-07** — The encoding ledger, Systems Manual, and fallback prose no
    longer list spin; day return is still present in the hover chip, manifest,
    teletype, and fallback text.
18. **BHV-08** — Every camera state is one gesture (Escape or empty-space
    double-click) from OVERVIEW.
19. **BHV-09** — The radar sweep's period equals the data-refresh interval, and
    that relationship is stated in the Systems Manual.
20. **BHV-10** — Mission Control's word budget holds: no prose column, nameplates
    ≤ 2 words, no sentence outside the teletype, headlines wrap once.
21. **BHV-11** — Empty states render without throwing: no moon, no comet, and an
    empty belt are all valid frames.
22. **BHV-12** — A texture, news, or quote source failure degrades gracefully —
    shader art for an unloaded map, no moon and a `NO TRANSMISSIONS` line for
    absent news — and never blanks the scene or blocks Mission Control.
23. **FIN-01** — Every visual channel introduced or changed by §10 encodes one
    real computed number and is named in the Systems Manual: trail lightness ←
    weekly magnitude, trail arc ← weekly magnitude, radar ring colour ← that
    holding's week, blip size ← weight, aurora ← the weekly series, wisp hue ←
    health sign, sweep period ← refresh interval.
24. **FIN-02** — Market-relative readings derive from **TWR**, same period,
    never simple return; any since-purchase number stays labelled `SIMPLE`.
25. **FIN-03** — The aurora re-encodes the weekly series the SCOPE already draws,
    in **percent magnitudes only**; no dollar quantity reaches it.
26. **FIN-04** — `rampForWeekly` consumes the real clamped weekly magnitude
    (0.2%–12%) and returns exactly `#63ef98` / `#ff665f` at `t = 0.5`.
27. **FIN-05** — Unavailable values render `—` with the reason reachable, never
    `0.0%` and never a fabricated figure.

### Visual (`VIS`)

28. **VIS-01** — Each world's **equatorial-band mean luminance sits in
    [0.16, 0.55]**, asserted from the live sphere-strip render, for all eight.
29. **VIS-02** — Marks read as **carved into the terrain**, sharing its lighting
    and grain, at three capitals 120° apart within ±18° latitude, with at least
    one instance facing the camera within 60° at all times.
30. **VIS-03** — The sun is the **largest body in the scene** at every camera
    state, with `sunRadius = max(2.4, 1.25 × largest planet radius)` derived in
    the scene model.
31. **VIS-04** — Trails carry **direction and magnitude in a single still
    frame** at 1440×900: arc 36–64°, ramp lightness, fixed 12% white-hot head.
32. **VIS-05** — Both signal ramps ship with the shipped hexes as exact
    midpoints, monotonic luminance, and dark ends floored ≥ 3:1 on the void.
33. **VIS-06** — The starfield is a population: magnitude distribution
    (~70%/~25%/~4%), gaussian clustering over a uniform floor, diffraction spikes
    on the brightest twelve, and ×1.8 density inside the aurora band.
34. **VIS-07** — Orbit rings carry vertex-alpha falloff (~0.50 near the planet →
    ~0.10 at the far side) and stay slate; no per-holding hue appears in the 3D
    scene.
35. **VIS-08** — Mission Control has one dominant bay (PLOT at ~55%, full height,
    left), no two bays the same size, deliberately unequal gutters, and a type
    scale spanning 64 → 15 → 11px with the day number at 64px.
36. **VIS-09** — The material split is visible: black-glass instruments with
    CRT-curved bezels versus **parchment** LOG and BRIEFING (`#f0e2c4` paper,
    `#2b1a10` ink), with the prose column deleted.
37. **VIS-10** — Radar rings take their holding's signal-ramp colour at its
    current week value, each with a ticker label, and blip size is proportional
    to weight.
38. **VIS-11** — Chrome colour is **constant across health states**: forced
    negative and forced positive health fixtures produce identical chrome tokens,
    with only the plot and scope trace tinting.
39. **VIS-12** — 1440×900 evidence exists for **every** named surface: OVERVIEW,
    planet detail, each Mission Control bay, the sector map, the sun docking
    state, and the radar click-through detail card.
40. **VIS-13** — The aurora renders as an upper-sky chord whose nearest
    screen-space approach to the sun's disc is ≥ 1.2 sun radii, at alpha ≤ 0.40;
    the void and nebula caps are unchanged.
41. **VIS-14** — The prism cursor exhaust renders with length proportional to
    pointer speed and is fully disabled under reduced motion. It is the one
    object in §10 permitted to encode no data, and it is the designated tail if
    the section runs out of room.

### Desktop-first scope (`MOB`)

42. **MOB-01** — `canvas` count is **0** at 390px and 320px, with no horizontal
    overflow and no target under 44×44 CSS pixels, re-verified live.
43. **MOB-02** — The fallback's structure is unchanged and now inherits the
    palette through `--universe-*` custom properties rather than duplicated
    hexes.
44. **MOB-03** — Every new semantic control and explanation added by §10 appears
    in the 390px fallback as ordinary list content in reading order.

### Accessibility (`ACC`)

45. **ACC-01** — The semantic DOM remains the accessible source of truth: every
    §10 encoding exists as text.
46. **ACC-02** — Trail magnitude is carried by **arc, lightness, and text** — no
    encoding lives only in colour, motion, or glow.
47. **ACC-03** — Radar rings, belt bodies, moons, satellites, and the sun are
    real focusable controls in a deterministic, documented order, each with a
    visible focus ring.
48. **ACC-04** — Contrast of every new or changed text token is verified by
    **computed WCAG ratio from source tokens** — including the parchment pair
    (13.02:1 expected), the Chakra Petch nameplates, the bay question lines, and
    the 64px readout — at ≥ 4.5:1 normal and ≥ 3:1 large.
49. **ACC-05** — `prefers-reduced-motion` disables the sweep, twinkle, cursor
    exhaust, brand-first phase animation, and warp, while **preserving every
    encoding** those channels carry.
50. **ACC-06** — The radar canvas stays `aria-hidden`, MANIFEST remains its
    complete text equivalent, and the click-through is reachable from the
    MANIFEST rows by keyboard.
51. **ACC-07** — Under reduced motion, a timestamp stamp replaces the sweep so
    staleness is still conveyed.
52. **ACC-08** — Mission Control keeps its dialog semantics: `role="dialog"`,
    `aria-modal`, labelled by its title, Escape closes, focus returns to the sun
    control.

### The colour firewall (`FWL`)

53. **FWL-01** — Every decorative or instrument token at chroma > 0.30 falls
    **outside** hue 125°–165° and 345°–20°.
54. **FWL-02** — Ambient washes are hue-exempt but alpha-capped **≤ 0.18**, with
    the aurora's ≤ 0.40 as the single declared, named exception.
55. **FWL-03** — Every one of 64 samples of each signal ramp stays within **±10°**
    of its anchor, with monotonic luminance and dark ends ≥ 3:1 on the void.
56. **FWL-04** — All five ramps are transit-tested at **64 samples** and the
    results are asserted, not merely printed.
57. **FWL-05** — `universe-palette.ts` is the single source of colour truth: no
    hex literal equal to a palette token value appears in `scene-model.ts`,
    `OrreryScene.tsx`, `orrery.module.css`, or `MissionControlBays/*`.

### Tests (`TST`)

58. **TST-01** — Every new or changed encoding function is pure, deterministic,
    clamped, and unit-tested against hand-computed fixtures including clamp
    boundaries and the `null` case (§11.4).
59. **TST-02** — **No new `expect(source).toContain(...)` or file-text `toMatch`
    is added as coverage for rendered behaviour**; the §4.2 hex guard is the one
    declared structural exception and says so in its description.
60. **TST-03** — The trail sampler asserts hue lock ±10°, ΔE\*ab ≤ 8 against the
    payload-derived expectation, and ordering across same-direction holdings, for
    every holding in the fixture.
61. **TST-04** — The sphere-strip capture measures per-world equatorial-band mean
    luminance **and** asserts mark chirality.
62. **TST-05** — Rendered behaviour is asserted from the scene model, the DOM, or
    live pixels, per §11.2.
63. **TST-06** — Every live measurement script is retained in the repository with
    its raw output committed.
64. **TST-07** — `planet-textures.test.ts`'s byte ceiling reads `30_000_000`, and
    all eight worlds meet the unchanged `luminanceStdDev ≥ 0.1` floor —
    **verified after regeneration, not assumed**.
65. **TST-08** — `npx tsc --noEmit` exits 0.

### Build (`BLD`)

66. **BLD-01** — `npm test` is **green with zero failures** before the
    implementation commit, closing §9's inherited red (§1).
67. **BLD-02** — `npm run build` passes.
68. **BLD-03** — The texture payload is measured at each regeneration gate
    against the **30 MB** ceiling, every measured total is recorded, and reaching
    ladder step 4 is written to `PHASE10_PROGRESS.md` rather than absorbed.
69. **BLD-04** — The route-owned long task stays **< 50 ms** across five fresh
    contexts at 1440×900, CPU 2×, with raw per-run output committed. Not
    baseline-subtracted, not redefined. No post-processing pass is added.
70. **BLD-05** — Textures still stream after first paint; the first contentful
    frame does not block on any map.
71. **BLD-06** — Chakra Petch is **self-hosted and vendored** as a static asset
    with its OFL licence committed; no `next/font/google` change and no new
    build-time network dependency (§16 owns the font migration).
72. **BLD-07** — No new production dependency. Any encoder added for §8.4 is a
    `devDependency`; a vendored Basis transcoder is a static asset, not a runtime
    package import.

### Privacy (`PRV`)

73. **PRV-01** — `/share` stays public with **zero dollar amounts and zero
    owner-only fields** in HTML, RSC payload, and client bundle — including in
    every new encoded channel (trail lightness, radar ring colour, blip size,
    aurora, wisps).
74. **PRV-02** — The radar click-through detail card shows nothing the public
    manifest does not already show.
75. **PRV-03** — The existing canary tests continue to pass and are extended to
    the detail card and the aurora payload.
76. **PRV-04** — The owner gate on `/` is retained, and a valid owner session
    cookie presented to `/share` still yields public content only.
77. **PRV-05** — No `.env*` contents are read, printed, edited, staged, or
    committed, and `vercel --prod` is never run.

---

## 13. Evidence to capture and commit

Under `docs/phase10-baseline/section-10/`:

- 1440×900 screenshots for every surface in `VIS-12`.
- The live sphere-strip capture with the per-world equatorial-band luminance
  table and the chirality result.
- Trail-sampler raw output (hue lock, ΔE, ordering) for every holding.
- Raw long-task output, five fresh contexts, and the retained script.
- 390×844 and 320×844 fallback screenshots with `canvas` count and
  `scrollWidth === clientWidth` recorded.
- Texture byte measurements at **every** ladder gate, and the encoder outcome
  verbatim if ETC1S could not be obtained.
- `README.md` recording: the ladder step reached, the per-world luminance and
  `luminanceStdDev` before and after, the root cause found for each of
  `DEF-04`, `DEF-05`, and `DEF-06`, the reduced-motion check, the keyboard
  walk-through for `ACC-03`, and every artifact path.

Every checklist item completed in any document gets an executor suffix
(`— done by codex/<model>`).

---

## 14. New and changed files (minimum)

**New**

- `src/lib/observatory/universe-palette.ts` + `universe-palette.test.ts`
- `public/fonts/chakra-petch-*` + its OFL licence
- `assets/planet-textures/` regenerated sources and marks
- `docs/phase10-baseline/section-10/` (scripts, raw output, screenshots, README)

**Changed**

- `src/lib/observatory/scene-model.ts` — sun radius rule, trail ramp and arc,
  trail-behind geometry, spin periods, star population, ring falloff, aurora,
  wisps
- `src/lib/observatory/orrery.ts` — `axialSpinForDayReturn` deleted; trail-degree
  constants retuned
- `src/lib/observatory/planet-textures.test.ts` — byte ceiling `30_000_000`
- `src/lib/observatory/planet-identity.ts` — relight accents
- `src/components/observatory/orrery/OrreryScene.tsx` — trail geometry sign,
  starfield, ring alpha, aurora, wisps, brand-first entry, belt-body and sun
  targeting fixes, prism exhaust
- `src/components/observatory/orrery/MissionControl*.tsx` and
  `MissionControlBays/*` — dominant bay, materials, type scale, word budget,
  radar colour/labels/sweep/click-through, bay question lines
- `src/components/observatory/orrery/PlanetDetail.tsx` — widened panel, type
  sizes
- `src/components/observatory/orrery/SectorMap.tsx` — the explanation line
- `src/components/observatory/orrery/SystemsManual.tsx` — spin row removed, new
  encodings named
- `src/components/observatory/orrery/orrery.module.css` — palette custom
  properties, materials, type scale
- `scripts/generate-planet-textures.mjs` — relight, carved marks, chirality fix,
  byte ladder

---

## 15. Implementation sequence

`UNIVERSE_IDEAS_3.md` §11's order, which lands the contract before any pixel
moves and puts the riskiest measurement early:

1. **A** — `universe-palette.ts`, firewall v2, five ramp LUTs, sampler upgrade.
2. **B** — sun scale, trail ramps and arc lengths, trail-behind fix, spin
   de-encoding and new rates.
3. **C** — star population and ring falloff.
4. **D** — Mission Control restructure and the planet-detail panel.
5. **E** — texture regeneration, byte-gated. Close the inherited red here.
6. **F** — aurora, weather wisps, brand-first entry, radar sweep.
7. **G** — prism exhaust.

Run `npm test` and `npm run build` after each package. If a package cannot be
completed, **finish every other package in full** and report exactly what was
left and why — do not silently narrow scope, and do not leave uncommitted work.
Package G is the designated tail if the section runs out of room.
