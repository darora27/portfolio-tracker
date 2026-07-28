# Phase 10 §9 review 3 — Universe craft and depth (remediation round 2)

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- Spec under review: `docs/phase10-workflow/specs/section-9.md`
- Reviewed commit: `78da83f16c0f4bbb0b6dc6962186a92f8501285c`
  (`phase10(§9): remediate overview viewport fit`)
- Diff base (`prev_actor_commit` at the start of the remediation turn):
  `094150b4ac90c744347e4434961ebb2d09bd6031`
- Prior reviews: `section-9-review.md` (FAIL, F1–F6),
  `section-9-review-2.md` (FAIL, F7)
- Result: **FAIL — 1 bounded finding**

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path) and applied beneath the authority order in the
spec's §1. It created no new criteria and no advisory findings.

## Verification run independently this turn

| Check | Result |
|---|---|
| `npm test` | PASS — 94 test files, 499/499 tests |
| `npm run build` | PASS — Next.js 16.2.11, TypeScript clean, 18 static-generation tasks; post-build smoke `/share` 200 and manifest station 200 |
| Live label + planet geometry at 1440×900, 24 samples over 12 s, against a production server I started myself | PASS for criteria 1 and 17 — see below |
| Live projected planet diameter at 1440×900, same run | **FAIL — criterion 18** |
| Live console/page errors during measurement | PASS — zero |

Evidence committed this turn:

- `docs/phase10-baseline/section-9/scripts/measure-overview-fit.mjs` — the
  measurement instrument (`node --check` passes; reads the live per-frame
  `data-planet-center-*` / `data-planet-radius-px` attributes, so the numbers
  come from the live three.js projection, not from the pure model) — done by
  claude-code/opus-5.
- `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-3.json`
  — its full output — done by claude-code/opus-5.
- `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-3.png`
  — the post-F7 OVERVIEW frame, `sips`-verified at exactly 1440×900 — done by
  claude-code/opus-5.

## F7 is resolved

**F7 — the outermost planet and its tag leave the 1440×900 viewport: FIXED,
independently confirmed live.**

`buildOverviewSceneModel` no longer echoes a flat belt-diameter constant. It
now solves an OVERVIEW camera descriptor — distance from the
perspective-projected belt extent, vertical target from the projected outer
orbit, maximum planet radius and resting-label extent — and exposes real
projected bounding boxes for the belt, every planet, and every resting label.
`OrreryScene` consumes that same descriptor for its camera position, target,
FOV and near/far planes, and both the renderer and the model now run labels
through one shared `layoutOverviewLabels` that clamps inside the viewport.

Measured live at exactly 1440×900, 24 samples over 12 seconds, all eight
planets and all eight resting tags are fully inside the frame:

| | Result |
|---|---|
| Labels fully inside viewport | 8 / 8 |
| Planets fully inside viewport | 8 / 8 |
| Extreme label edges | left 108.0, top 151.2, right 1175.2, bottom 671.3 |
| Extreme planet edges | left 112.4, top 127.5, right 1170.0, bottom 618.4 |
| Labels hidden or clipped | 0 |
| Console errors | 0 |

`NBIS`, the planet that previously reached label bottom 935 and label left −8
with its sphere crossing the left edge by 10 px, now sits wholly inside the
frame. `overview-1440x900-review-3.png` shows all eight tags — `ASML`, `GOOG`,
`COST`, `MSFT`, `IBM`, `INTC`, `NBIS`, `CBRS` — legible simultaneously with no
planet clipped. **Criterion 1 passes. Criterion 17's clipping clause passes.**

Criterion 17's belt-span clause also passes, and is now asserted where it can
fail. `belt.viewportSpanPct` is computed as `beltBounds.width / viewport.width`
from the real projection (86.4 → 1353.6 px, **88.00%** of 1440, inside the
85–92% band) rather than the `OVERVIEW_BELT_SPAN_PCT` constant handed back to
its own assertion. I confirmed the live renderer really is at that fitted
camera rather than merely being described by it: the rendered sun disc measures
55 px across on its centre scanlines, giving 21.5 px per world unit for
`SUN_BODY_RADIUS = 1.28`, against 21.97 px predicted from the fitted camera's
projection — a 2% agreement.

The new tests are real coverage, not the forbidden pattern. The 360-step
orbital phase sweep builds a fresh model per degree and asserts every planet
and label bounding box against the frame, and the parity test projects each
planet through an actual three.js `PerspectiveCamera` built from the
descriptor, matching the pure model to eight decimal places. Neither is a
constant compared with itself, and neither uses `expect(source).toContain(...)`.
Trail and orbit sign→colour and sign→direction mapping are byte-unchanged
(spec §1.1, D1), as required.

F1–F6 remain resolved; nothing in this diff touches them.

## Finding

### F8 — the heaviest planet projects to half the required diameter, and two planets fall below the 22 px floor

- **Criterion 18:** "The heaviest planet projects to ≈68 px diameter and the
  lightest to ≥ 22 px, measured from the scene model at the OVERVIEW camera."
  Spec §4.1 states the lever: "retune `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS`
  so the projected on-screen diameter at the OVERVIEW camera lands at ≈68 px
  for the heaviest holding and never below **22 px** for the lightest."
- **Evidence — live.** Same 24-sample run at 1440×900, projected diameter read
  per frame from the live renderer:

  | Weight rank | Ticker | Mean projected diameter | Required |
  |---:|---|---:|---|
  | 1 | ASML | **32.6 px** | ≈68 px |
  | 2 | GOOG | 29.8 px | — |
  | 3 | COST | 29.1 px | — |
  | 4 | MSFT | **21.4 px** | ≥22 px |
  | 5 | IBM | 23.7 px | ≥22 px |
  | 6 | INTC | 25.0 px | ≥22 px |
  | 7 | CBRS | **16.1 px** | ≥22 px |
  | 8 | NBIS | 25.0 px | ≥22 px |

  The heaviest holding renders at 48% of its required diameter. Two planets sit
  below the 22 px floor, `CBRS` by 27%. The smallest diameter observed in any
  frame is 16.04 px.
- **Evidence — from the scene model itself, which now contradicts its own
  number.** For the eight-planet fixture the remediation added
  (`overviewHoldings` in `scene-model.test.ts`), the model reports
  `planets[0].projectedDiameterPx = 68.08` while its own newly added projected
  bounds give that same planet a real width of **41.15 px** at the same
  OVERVIEW camera. `projectedDiameterPx` is still
  `radius * 2 * OVERVIEW_PLANET_PIXELS_PER_WORLD_UNIT` (`scene-model.ts:677`)
  — a fixed 37 px-per-world-unit constant that does not vary with the camera,
  with the number of holdings, or with orbital phase. It was approximately
  right for the pre-F7 hard-coded camera; the fitted camera now sits 1.172×
  farther out, and nothing updated the constant.
- **Why no test caught it.** `scene-model.test.ts:111-112` asserts
  `projectedDiameterPx` is close to 68.08 and that the last planet's is ≥ 22.
  Because `projectedDiameterPx` is `radius × 2 × 37` and the radii come from
  the same fixture, that assertion is the constant checked against itself — it
  cannot fail for any camera, and it passes right now while the rendered
  planets are half the size it claims. This is the same defect F7 identified in
  `belt.viewportSpanPct`, left in place one field over.
- **Honest scope note.** This is not a regression introduced by the F7
  remediation, and I did not catch it in rounds 1 or 2. Under the pre-F7 camera
  the same live measure would have been ≈38 px for the heaviest and ≈19 px for
  the smallest — already failing criterion 18 on both halves. The remediation
  made it ~15% worse by fitting the camera 1.172× farther out, and it is what
  first made the failure measurable, because the projected bounds F7 added are
  the instrument that exposes it.
- **Required change.** Make the OVERVIEW composition satisfy criterion 18 as
  measured by the model's own projection at the fitted OVERVIEW camera:
  heaviest planet ≈68 px diameter, no planet below 22 px, at 1440×900, while
  criterion 17 continues to hold (belt span 85–92%, nothing clipped) and spec
  §4.2's ring spacing stays ≥ 1.6× the sum of adjacent planet radii. Then
  replace the vacuous assertion: make `projectedDiameterPx` derive from the
  same projection as `bounds` (or delete it in favour of `bounds.width`) so one
  number describes the planet, and assert the ≈68 px / ≥22 px gate across the
  full orbital phase sweep the way F7's fit is now asserted, not against a
  fixed px-per-world-unit constant.

  Two traps to avoid, both load-bearing here. First, uniformly enlarging the
  planets does nothing: `ORRERY_RING_SPACING` is itself derived from
  `ORRERY_MAX_RADIUS` (`orrery.ts:10-11`), so raising the radius grows every
  orbit by the same factor, the belt-span fit pushes the camera back by that
  same factor, and the on-screen diameter is unchanged. What has to change is
  the ratio of planet radius to orbit spacing — for example spacing each gap
  from its own adjacent pair of radii, which is literally what §4.2's "1.6× the
  sum of adjacent planet radii" describes, rather than from `MAX_RADIUS × 2 ×
  1.6` uniformly. Second, do not satisfy criterion 18 by narrowing the belt or
  moving the camera in: criterion 17's 85–92% span is not negotiable against
  it.

  If, after removing the uniform-scale trap, the ≈68 px target still cannot be
  reached while holding criterion 17's belt span and §4.2's spacing rule with
  eight planets, do **not** silently trade one criterion against the other:
  stop, record the measured achievable ceiling and the constraint that binds
  it, set `status` to `blocked`, and hand off to Devan. That is a spec conflict
  for the owner to resolve, not an implementation choice.

  Finally, recapture `docs/phase10-baseline/section-9/after/overview-1440x900.png`
  once the composition is final — it is still the pre-F7 frame showing the
  clipped eighth planet, which F7's required change already asked for and the
  browser-permission block prevented. Record the criterion 1, 17 and 18 results
  in `docs/phase10-baseline/section-9/README.md` with executor suffixes. Do not
  change trail/orbit sign→colour or sign→direction mapping (spec §1.1, D1).

## Observed, not a finding

In the post-F7 composition the `COST` tag lands on top of the sun's
`PORTFOLIO · −1.5% · WEAK` readout near frame centre (visible in
`overview-1440x900-review-3.png`). Both remain individually legible and no §9
acceptance criterion governs tag-over-sun-readout occlusion — spec §4.8's
collision yield covers tag-over-tag only — so this is not a finding and Codex
should not act on it. Recording it because the F8 fix will change the
composition again and it may resolve or worsen on its own; if it still reads
badly at acceptance, it is Devan's call whether to bound it into a later
section.

## Next actor

`stage` → `remediate`, `next_actor` → `codex`. Fix only F8. F1–F7 are verified
and settled — do not revisit them, and do not restructure any surface beyond
what F8's required change names.
