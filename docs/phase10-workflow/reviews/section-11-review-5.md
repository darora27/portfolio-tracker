# Phase 10 §11 review (turn 5) — FAIL with 1 new bounded finding

Reviewed July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`),
covering both roles under `single_provider_mode` (`PHASE10_STATE.json`
`applies_from: "§11"`).

- **Candidate SHA:** `0fae59d288b144f88e7ce832bc9807a9b5704449` —
  `phase10(§11): remediate F9 — first-visit-only legend bar`
- **Prior review-4 candidate:** `f38b5e233114247f578256f6753fef9c22b2f900` (FAIL, F9)
- **Remediation commit since review-4:** `0fae59d` only. `git diff --stat
  f38b5e2 0fae59d` touches `Legend.tsx` (new), `Legend.test.tsx` (new),
  `OrreryWorld.tsx` (+2 lines, one import + one render), `SystemsManual.tsx`
  (+11 lines, one button), `SystemsManual.test.tsx` (+14 lines, one case),
  plus state/handoff/evidence bookkeeping. No other application source
  changed.
- **Spec:** `docs/phase10-workflow/specs/section-11.md`
- **Ledger:** `docs/phase10-workflow/acceptance/section-11.json`
- **Result:** **FAIL.** F9 (`BHV-20`) is **CLOSED** this turn with fresh,
  independent evidence. One **new** bounded finding, F10 (`VIS-16`), blocks
  acceptance. Two items reach a substantiated conclusion this turn without
  becoming findings (`BHV-34` PASS, `BHV-31` siphon-latch PASS); one stays
  `not_run` for a defined reason (`BHV-31` pro-rata tolerance is undefined
  in the spec); one stays `not_run` as a genuine, re-confirmed scope
  ambiguity (`MOB-11`).

## Independent gates

| Gate | Result |
|---|---|
| `npm test` | **PASS** — 107 files, 553 tests, zero failures (independent run, this turn) |
| `npm run build` | **PASS** — Next.js 16.2.11 production build, exit 0, 18/18 static pages, `/share` smoke pass (independent run, this turn) |
| `npm run phase10:acceptance -- check <ledger> --require implementer` | **PASS** — valid |
| Chromium launch, this sandbox | Confirmed directly, again, this turn — `npm run build && npm run start -p 3100`, then `node docs/phase10-baseline/section-11/scripts/*.mjs`. No in-app browser tool used. |

This turn built and started its own production server (port 3100) independently
of the implementer's process, which had already been stopped before this
review began.

## F9 — `BHV-20` — CLOSED, pass

Ran the implementer's own `legend-first-visit.mjs` script fresh — not a
re-read of the committed `raw-legend-first-visit.json` — against this turn's
own independently built/started server, a fresh unseeded context, on the real
production `/share` route. Result: `legendPresentFirstVisit: true`, dismissed
on first interaction (`localStorage` set), absent after reload, re-summoned
via the Systems Manual's `SHOW LEGEND` button, dismissed again after
re-summon. `pass: true`, byte-identical to the implementer's own result.

Source inspected directly: `Legend.tsx` mirrors `FirstVisitOrientation.tsx`'s
dismiss/persist/re-summon pattern (same `localStorage`-guard-then-listener
shape, same `pointerdown`/`keydown`-once dismiss). `.orientationLine` is
hidden outside the overview camera (`orrery.module.css:388`), matching the
spec's "bottom legend bar" description and confirming it is not visible from
inside a planet approach or Mission Control.

Evidence: `docs/phase10-baseline/section-11/raw-review-5-legend-first-visit.json`.

## New finding: F10 — `VIS-16` (high risk) — orbital rings do not sustain to the far side

**Criterion:** "Every orbital ring is a full circle whose far-side alpha is
at least 0.22, sampled on at least two rings... The falloff is a token pair
`{peak, floor}`... and the frame does not read as uniform graph paper."

**What review-4 found:** 1 of 2 sampled rings (ASML) confirmed visible above
background (+10.9 luminance); the second (MSFT) read identical to background,
"most likely a targeting miss from compounding sun-center estimation error at
a larger radius" — left `not_run`, not asserted as a defect, with a named fix
for the next turn: correct the sun-center estimation.

**What this turn found, after fixing exactly that:** `OrreryScene.tsx`
already writes the sun's exact projected screen position to
`mount.dataset.evidenceSunX`/`evidenceSunY` every frame (an existing signal,
not a new attribute — see the render loop around line 1924). Re-measuring
with this exact sun center instead of a pixel-scan estimate:

- The `review-5-ring-alpha.mjs` single-point version still produced a false
  reading for ASML: its far-side reference point landed directly on the
  `GOOG` ticker-label overlay (visually confirmed by cropping the capture —
  reference pixel `(238, 248, 255)`, near-white text, not starfield).
- `review-5-ring-alpha-v2.mjs` fixed this with a 15-point median-luminance
  arc sample (±14° around the far-side angle) instead of one exact point —
  robust to a single label collision, since a label is a narrow outlier
  along the arc while a genuine ring is continuous. Also excludes any
  orbit whose far side would fall outside the 1440×900 canvas at this sun
  position (CBRS's far side lands at y≈−68, off-screen — a harness/geometry
  limit, recorded, not treated as a ring failure).
- Result on the two on-canvas orbits sampled (smallest: ASML, r≈104px;
  second-largest: INTC, r≈478px): **both far-side medians read at background
  level** — ASML delta −0.7, INTC delta −0.7, against the >6 pass threshold
  both this turn and review-3/4 used. Direct RGB inspection at ASML's exact
  far-side point (7×7 neighborhood) shows uniform dark starfield green
  `(4–11, 16–24, 12–19)` — no brightness spike, no hue shift, nothing
  distinguishable from background.
- A targeted check near the *planet's own* position (±15° from ASML's own
  angle, inside the claimed 90°-peak-alpha arc) **does** show a ring: pixels
  read `(21, 42, 82)` and `(31, 62, 120)` — a clear blue tint well above the
  `(~5, 18, 14)` green-black background. By ±25° the reading is already back
  at background level.

**Conclusion:** the ring renders and is visible near its peak-alpha zone
close to the planet, but that visibility does not sustain around the circle
to the far side. The spec requires "full circle always present" with a
floor alpha of 0.22 specifically so "the rings vanished" (the §10 defect)
"can never recur silently" — on this evidence, the ring's far side is
visually indistinguishable from background, i.e. the practical effect a
viewer experiences is the same vanishing the floor token was written to
prevent, even though the token itself (`{peak: 0.55, floor: 0.22}`) is
present in source.

**Evidence:**
`docs/phase10-baseline/section-11/raw-review-5-ring-alpha.json` (v1, shows
the GOOG-label contamination),
`docs/phase10-baseline/section-11/raw-review-5-ring-alpha-v2.json` (v2,
median-arc method, the graded result),
`docs/phase10-baseline/section-11/raw-review-5-ring-alpha.png`,
`docs/phase10-baseline/section-11/raw-review-5-ring-alpha-v2.png`.

**Required change:** investigate why the rendered far-side alpha does not
read above background at the 0.22 floor — check whether the floor is being
applied per-vertex/per-fragment correctly across the full ring geometry, or
whether it is being applied but is simply not perceptible against this
background color/exposure at 0.22 (in which case the floor value itself, not
just its presence as a token, needs revisiting — a product decision, not a
code-only fix). Do not weaken or redefine the >6 luminance-delta pass
threshold or the two-ring sampling requirement; both are unchanged from
review-3/4.

## Substantiated without becoming findings

### `BHV-34` — PASS (previously `not_run`, contradictory)

Review-4's pointer-drag-based edit never actually changed a weight
(`grownWeightChanged` `before: 29, after: 29`) — this turn's own pointer-drag
re-attempt (`raw-review-5-draft-followup.json`) reproduced the identical
no-op with a different gesture pattern, and an isolated single-edit re-test
(`raw-review-5-bhv34-isolated.json`) confirmed that `goBack()` from a state
with no real edit correctly falls through to the browser's pre-navigation
`about:blank` — not a defect, just nothing to undo.

Switching to the keyboard-adjustment path (`Shift+ArrowRight`, spec-legal per
§7.4.4) produced a real, observable weight change (29% → 54%) and a real
URL-encoded `draft=` param. Polled Back navigation (`page.waitForFunction` on
`location.href`, replacing review-4's fixed 500ms wait — the harness fix
review-4 itself named as needed) landed on a distinct, valid intermediate
`draft=` URL with correspondingly different rendered weights. Each committed
keystroke pushes its own history entry, so one `goBack()` undoes one step,
not the whole edit sequence — correct per spec §7.7 ("pushState on
[commit]"). Forward exactly restored the post-edit URL and weights.
`COPY TEST LINK` confirmed visible.

Evidence: `docs/phase10-baseline/section-11/raw-review-5-bhv34-keyboard.json`,
`raw-review-5-bhv34-isolated.json`, `raw-review-5-draft-followup.json`.

### `BHV-31` siphon latch — PASS component (keyboard path)

The **Space-to-latch** keyboard siphon (spec §7.4.4) is confirmed clean:
latches exactly the focused circle (`data-counterparty="true"`), releases
cleanly on a second press. Evidence:
`docs/phase10-baseline/section-11/raw-review-5-bhv31-keyboard-siphon.json`.

## Root cause identified: pointer-drag gestures do not register in this harness

Three independent attempts (review-4's, and this turn's two separate
patterns) drove a `page.mouse.down()/move()/up()` sequence on a DRAFT-rig
circle and got the *exact same* no-op every time
(`grownWeightChanged: {before: 29, after: 29}`). This is convergent enough to
treat as a harness property, not noise: pointer-capture-retargeted
`pointermove` events (the rig's `onPointerDown` calls
`setPointerCapture` before tracking drag distance) most likely do not fire as
expected under CDP-dispatched synthetic mouse input in headless Chromium.

**This means review-4's `BHV-30` sum-invariant confirmation and its
`BHV-31` pro-rata `maxRatioDrift: 0.0` confirmation were both measured
against a no-op** — trivially true because nothing changed, not positive
evidence of the invariant holding under a real edit. This turn re-ran both
via the keyboard path with a genuine edit (index 2 grown 14% → 49%):

- `BHV-30` (sum stays 100.0) — **holds**: `sumBefore: 100`, `sumAfter: 100`.
- `BHV-31` pro-rata ("preserves the relative mix of the untouched seven") —
  **measurable drift observed**: `maxRatioDrift: 0.0184` (up to ~1.8
  percentage points of ratio movement among untouched holdings). Plausibly
  explained by the half-unit, largest-remainder rounding the spec mandates
  in §7.3 rather than a defect — but the spec defines no tolerance for
  "preserves," so this turn does not invent one and grade against it. Left
  `not_run`, not asserted either way.

Evidence: `docs/phase10-baseline/section-11/raw-review-5-bhv30-31-keyboard.json`.

**Not treated as a new finding** because (a) `BHV-30` itself still holds
under a real edit, and (b) `BHV-31`'s pro-rata component has no defined
pass/fail line to cite per G-SCOPE. Recorded as a named gap for the next
turn: pin a tolerance (owner or spec decision), and separately, get real
(non-CDP-synthetic) pointer input evidence for the drag gesture itself —
e.g. via the attended camera path (`AGENTS.md`, Opus-in-Cowork's Chrome
extension) — since headless Chromium cannot currently substantiate it either
way.

## `MOB-11` — re-read, still genuinely ambiguous, left `not_run`

Per the remediation handoff's request, re-read `BHV-10` against `MOB-11`.
`BHV-10` names "the fallback" as one of five places every renamed noun must
appear — arguing `MOB-11` is a real gap. But `MOB-10` describes the fallback
as "the existing tested 2D fallback... a genuinely reflowed semantic list" —
i.e. a holdings list, not a re-implementation of Mission Control's
seven-section descent room — and nothing in the spec explicitly requires the
fallback to grow `CORRELATION`/`TRADES`/`ORBITS` sections it has no content
for on mobile. Both readings are defensible from the same spec text. This is
a product/spec-scope decision, not something more browser measurement
resolves, so it is not graded unilaterally here. Carried forward exactly as
review-4 left it, with this turn's fuller reasoning attached in the ledger.

## Unchanged: five owner-carried criteria not reopened

`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`, `BHV-05` remain `carried_by_owner` —
this turn changed no logo mark, panel width, or Mission Control typography.

## For the next turn

This is a **remediate** turn, bounded to **F10 (`VIS-16`) only** per
G-SCOPE. While there:

- Investigate why the ring's floor alpha (0.22) does not read above
  background at the far side despite being present in source, and fix or
  escalate as a product decision if 0.22 is simply imperceptible at this
  exposure/background combination. Do not weaken the >6 luminance-delta
  threshold or reduce the two-ring sampling requirement.
- Not required this turn, but worth scoping soon: the pointer-drag harness
  gap (blocks conclusive `BHV-30`/`BHV-31`/`BHV-33` drag-specific coverage)
  and the `BHV-31` pro-rata tolerance question, both flagged above as open
  rather than failing.
- `MOB-11`'s scope question is unresolved and belongs to spec/owner routing,
  not a code fix.
