# Phase 10 §9 review 4 — Universe craft and depth (remediation round 3)

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- Spec under review: `docs/phase10-workflow/specs/section-9.md`
- Reviewed commit: `e8377855e38d38e1cbbc283464c07ff80237599e`
  (`phase10(§9): remediate projected planet sizing`)
- Diff base (`prev_actor_commit` at the start of the remediation turn):
  `2981277cc10dd0efc324dc28c42b6175175dfea6`
- Prior reviews: `section-9-review.md` (FAIL, F1–F6),
  `section-9-review-2.md` (FAIL, F7), `section-9-review-3.md` (FAIL, F8)
- Result: **FAIL — 1 bounded finding**

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path) and applied beneath the authority order in the
spec's §1. It created no new criteria and no advisory findings.

## Verification run independently this turn

| Check | Result |
|---|---|
| `npm test` | PASS — 94 test files, 499/499 tests |
| `npm run build` | PASS — Next.js 16.2.11, TypeScript clean, 23 route tasks; post-build smoke `/share` 200 and Mission Control manifest 200 |
| Live label + planet geometry at 1440×900, 24 samples over 12 s, against a production server I started myself | PASS for criteria 1 and 17 |
| Live projected planet diameter at 1440×900, same run | **FAIL — criterion 18's ≈68 px clause** (PASS on its ≥ 22 px clause) |
| Live console/page errors during measurement and capture | PASS — zero |

I closed the environment gap Codex recorded honestly in
`browser-backend.txt` and `docs/phase10-baseline/section-9/README.md`: I
started a production build on `127.0.0.1:3141` myself, ran the retained
measurement script against it at exactly 1440×900, and captured the post-F8
frame. Codex represented no older image as post-F8 evidence, which was the
correct call.

Evidence committed this turn:

- `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-4.json`
  — the full live measurement output — done by claude-code/opus-5.
- `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-4.png`
  — the post-F8 OVERVIEW frame, `sips`-verified at exactly 1440×900 — done by
  claude-code/opus-5.

## What F8 resolved

**The projection instrumentation is genuinely fixed.** `projectedDiameterPx`
is no longer `radius × 2 × OVERVIEW_PLANET_PIXELS_PER_WORLD_UNIT`; that
constant is deleted. `projectedPlanetBoundsWithContext` now computes the true
perspective silhouette of a sphere from the tangent-cone slopes on the camera's
right and up axes, `projectedDiameterPx` is set to `bounds.width` from that
same projection, and `OrreryScene` writes its live
`data-planet-center-*` / `data-planet-radius-px` evidence attributes through
the exported `projectSphereScreenBounds` helper — so the model, the renderer,
and the measurement script now describe one geometry. The new sweep test
asserts `projectedDiameterPx === bounds.width` per planet per degree, so a
fixed pixels-per-world-unit constant can no longer pass against itself. This
was the half of F8 about the instrument, and it is closed.

**The uniform-scale trap was correctly removed.** `ORRERY_RING_SPACING` is
gone. `orbitRadiiForPlanetRadii` derives each gap from its own adjacent pair
as `1.6 × (rᵢ + rᵢ₊₁) + 0.18`, which is literally what spec §4.2 describes,
and `radiusForWeight` is now a clean `√(w / MAX_WEIGHT) × MAX_RADIUS` with an
explicit floor rather than an affine interpolation. I verified live that the
ratio of planet size to orbit spacing really did change rather than scaling
uniformly.

**The ≥ 22 px floor now passes.** The smallest diameter reached by any planet
in any sampled frame is **26.45 px** live (25.63 px in the model across a full
360° sweep on production weights), against a 22 px floor. In review 3 this was
16.04 px. `CBRS`, previously 27% under the floor, now sits 20% above it.

**Criteria 1 and 17 still pass, confirmed live at the new composition.**

| | Result |
|---|---|
| Labels fully inside viewport | 8 / 8 |
| Planets fully inside viewport | 8 / 8 |
| Extreme label edges | left 152.9, top 149.6, right 1194.4, bottom 693.6 |
| Extreme planet edges | left 138.5, top 113.7, right 1199.8, bottom 645.9 |
| Labels hidden or clipped | 0 |
| Belt viewport span | 88.00% (inside the 85–92% band, constant across the sweep) |
| Console errors | 0 |

`overview-1440x900-review-4.png` shows all eight tags — `ASML`, `GOOG`,
`COST`, `MSFT`, `IBM`, `INTC`, `CBRS`, `NBIS` — legible simultaneously at rest
with no planet clipped. Trail and orbit sign→colour and sign→direction mapping
are byte-unchanged in this diff (spec §1.1, D1), as required. F1–F7 remain
resolved; nothing in this diff touches them.

## Finding

### F9 — the heaviest planet still never reaches ≈68 px on the shipped portfolio, and the new gate cannot detect it

This is the unresolved half of F8, narrowed. The instrument is fixed; the
composition it now measures honestly is still ~10% too small.

- **Criterion 18:** "The heaviest planet projects to ≈68 px diameter and the
  lightest to ≥ 22 px, measured from the scene model at the OVERVIEW camera."
  Spec §4.1 states the lever and the referent: "retune
  `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS` so the projected on-screen diameter
  at the OVERVIEW camera lands at ≈68 px **for the heaviest holding**." The
  heaviest holding is the portfolio's actual heaviest holding, which is what
  `/share` renders.
- **Evidence — live.** 24 samples over 12 s at exactly 1440×900 against a
  production server I started myself, projected diameter read per frame from
  the live renderer
  (`claude-review/raw-overview-fit-review-4.json`):

  | Weight rank | Ticker | Live weight | Mean projected diameter | Required |
  |---:|---|---:|---:|---|
  | 1 | ASML | 26.5% | **61.49 px** | ≈68 px |
  | 2 | GOOG | 20.8% | 53.04 px | — |
  | 3 | COST | 12.5% | 51.59 px | — |
  | 4 | MSFT | 8.3% | 29.88 px | ≥ 22 px ✓ |
  | 5 | IBM | 7.3% | 37.66 px | ≥ 22 px ✓ |
  | 6 | INTC | 7.2% | 41.72 px | ≥ 22 px ✓ |
  | 7 | CBRS | 3.8% | 26.55 px | ≥ 22 px ✓ |
  | 8 | NBIS | 3.5% | 55.83 px | ≥ 22 px ✓ |

  `ASML` never exceeds 61.99 px in any sampled frame. The floor clause passes
  everywhere; only the ≈68 px clause fails.
- **Evidence — from the scene model, on production weights.** I built
  `buildOverviewSceneModel` directly at `1440×900` across a full 360° orbital
  phase sweep using the eight live weights above (26.5 / 20.8 / 12.5 / 8.3 /
  7.3 / 7.2 / 3.8 / 3.5%). The heaviest planet's projected diameter ranges
  **59.22 – 65.35 px** — it never reaches 68 px at any orbital phase, and
  spends most of the orbit 9–13% under target. Smallest planet: 25.63 px
  (passes). Belt span: 88.00% (passes). Nothing clipped at any phase. The
  model and the live renderer agree, which confirms the F8 instrumentation fix
  is correct — they now agree on a composition that is too small.
- **Why the new test cannot catch it.** The sweep gate added at
  `scene-model.test.ts:113-114` and `:145-152` asserts the heaviest planet is
  within 64–72 px, and it passes — but against the `overviewHoldings` fixture
  (`scene-model.test.ts:58-67`), whose heaviest weight is **0.35**, exactly
  `MAX_WEIGHT`. That is the one weight at which
  `radiusForWeight` saturates at `ORRERY_MAX_RADIUS = 1.8`, i.e. the single
  largest planet the encoding can ever produce. The real portfolio's heaviest
  holding is 26.5%, giving radius 1.5663 — 87% of the fixture's. So the gate
  is calibrated at the saturation point and is structurally unable to fail for
  any real portfolio that is less concentrated than 35% in one name. This is
  the same shape of defect as F7's `belt.viewportSpanPct` and F8's
  `projectedDiameterPx`: an assertion positioned where it cannot fail. The
  arithmetic is not incidental — it is exactly why the shipped page is 10%
  small while the suite is green.
- **The target is reachable — this is not a spec conflict.** F8's required
  change told you to stop and hand off to Devan if ≈68 px could not be reached
  while holding criterion 17 and §4.2. I checked before writing this finding
  so you are not sent after an impossible number. Because
  `ORRERY_SUN_CLEARANCE = 3.4` is a fixed additive term that does not scale
  with planet radius, uniform radius scaling is no longer fully self-cancelling
  the way it was under `ORRERY_RING_SPACING`. Measured on production weights,
  holding belt span at 88.00% and with nothing clipped at any phase:

  | `MIN_RADIUS` / `MAX_RADIUS` | Heaviest diameter across the sweep | Smallest | Belt span | Clipped |
  |---|---:|---:|---:|---|
  | 0.9 / 1.8 (current) | 59.22 – 65.35 | 25.63 | 88.00% | none |
  | 1.05 / 2.1 | 60.66 – 66.55 | 26.15 | 88.00% | none |
  | 1.2 / 2.4 | 61.79 – 67.48 | 26.56 | 88.00% | none |
  | 1.5 / 3.0 | 63.45 – 68.82 | 27.15 | 88.00% | none |
  | 2.0 / 4.0 | 65.20 – 70.22 | 27.76 | 88.00% | none |

  The returns diminish sharply, so this is a real but weak lever and a pure
  uniform rescale is probably not the best answer on its own — the ratio of
  planet radius to the fixed sun clearance and to the §4.2 spacing coefficient
  is what actually governs on-screen size. These numbers are diagnostic, not a
  prescription: choose the mechanism yourself. Do not treat the last row as an
  instruction.
- **Required change.** Make the OVERVIEW composition satisfy criterion 18 for
  the **production weight distribution** — heaviest planet ≈68 px projected
  diameter at 1440×900, no planet below 22 px — while criterion 17 continues to
  hold (belt span 85–92%, nothing clipped at any orbital phase) and spec §4.2's
  ring spacing stays ≥ 1.6× the sum of adjacent planet radii. Then move the
  gate to where it can fail: assert the ≈68 px / ≥ 22 px band across the full
  orbital phase sweep against a fixture whose heaviest weight is
  **representative of the real portfolio and strictly below `MAX_WEIGHT`**, not
  pinned at the saturation point. Keeping the existing 0.35 fixture as an
  additional case is fine; it must not be the only case the gate runs on.

  Two constraints carried forward unchanged from F8, both still binding.
  First, do not satisfy criterion 18 by narrowing the belt or moving the camera
  in — criterion 17's 85–92% span is not negotiable against it. Second, if
  ≈68 px still cannot be reached while holding criterion 17 and §4.2's spacing
  rule with eight planets, do **not** silently trade one criterion against the
  other: stop, record the measured achievable ceiling and the constraint that
  binds it, set `status` to `blocked`, and hand off to Devan. That is a spec
  conflict for the owner to resolve, not an implementation choice.

  Finally, recapture
  `docs/phase10-baseline/section-9/after/overview-1440x900.png` once the
  composition is final — it is still the pre-F7 frame showing the clipped
  eighth planet. This has now been carried across F7 and F8 because the
  composition kept changing and your environment blocked the capture; if it is
  still blocked, say so plainly again rather than relabelling an older image,
  which is what you correctly did this round. Record the criterion 1, 17 and 18
  results in `docs/phase10-baseline/section-9/README.md` with executor
  suffixes. Do not change trail/orbit sign→colour or sign→direction mapping
  (spec §1.1, D1).

## Observed, not a finding

The `COST` tag and planet still overlap the sun's
`PORTFOLIO · −2.1% · WEAK` readout near frame centre, visible in
`overview-1440x900-review-4.png`. This is the same observation recorded in
review 3; the F8 composition change did not resolve it. Both remain
individually legible, and no §9 acceptance criterion governs
tag-over-sun-readout occlusion — spec §4.8's collision yield covers
tag-over-tag only. It is therefore **not a finding and Codex must not act on
it**. Recording it again because the F9 fix will change the composition a
third time and it may resolve on its own; if it still reads badly at
acceptance, it is Devan's call whether to bound it into a later section.

## Next actor

`stage` → `remediate`, `next_actor` → `codex`. Fix only F9. F1–F8's resolved
substance is verified and settled — do not revisit it, do not restructure any
surface beyond what F9's required change names, and do not touch the
projection helpers except as needed to change the composition they measure.
