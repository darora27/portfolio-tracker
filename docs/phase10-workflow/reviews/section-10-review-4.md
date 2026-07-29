# Phase 10 §10 review, round 4 — FAIL with 3 bounded findings, then triage

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 29, 2026.

- **Candidate:** `0ef1433b51e18d772156ccc8be9d3ed077bc6d34` (HEAD at turn start).
- **Remediation commit under review:**
  `638812332b11b0f01d6d0e877ddcdd5660e66cd3`, the round-3 remediation the owner
  routed here.
- **Application source is identical between the two.**
  `git diff 6388123 HEAD -- src/ public/ scripts/ package.json package-lock.json`
  is empty; the two commits on top are the owner's routing decision and the
  bounded triage rule.
- **Verifier integrity:** `git diff 3bdf468 HEAD -- docs/phase10-baseline/section-10/scripts/`
  is empty. Every retained §10 verifier ran unmodified — no threshold, sample
  point, or assertion changed.
- **Result:** FAIL. One of the four round-3 findings is closed; three remain.
- **Live rig:** production build served by `npx next start -p 3141`, real GPU,
  headless Chromium from the repo's own Playwright.

This is the review turn named by `docs/phase10-workflow/SECTION_10_TRIAGE.md`,
so §7 of this document carries the bounded triage classification. It is a
classification handed to the owner, not a self-authorised exception.

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path).

---

## 1. The two binding gates, run independently

| Gate | Command | Result |
|---|---|---|
| Tests | `npm test` | **PASS** — 99/99 files, 527/527 tests, 0 failures, 5.15s |
| Build | `npm run build` | **PASS** — exit 0, Next.js 16.2.11, route list unchanged, `/share` 200 and Mission Control manifest 200 |

`npm run phase10:acceptance -- check … --require implementer` passed before
review began. §9's inherited red stays closed.

---

## 2. F4 / `VIS-12` — CLOSED

Round 3 left one third of this finding open: SCOPE, HAZARD and SIGNALS each
rendered their bay question twice. Re-measured with the same probe
(`claude-review-4/raw-question-duplicates.json`):

| Station | instances | where |
|---|---|---|
| plot, manifest, scope, hazard, signals, comms, log | **1 each** | `operationsBay > p.bayQuestion` |

All seven bays now render their question exactly once. The contribution-overlap
half stays closed: 0 px horizontal overlap between every CONTRIBUTION numeral
and its signed bar across all 13 rendered rows
(`claude-review-4/raw-manifest-vis12.json`), and `capture-live-evidence.mjs` ran
end to end, reproducing all 16 `after/` surfaces plus both `mobile/` captures.

`VIS-12` → **pass**.

---

## 3. F1 / `TST-03`, high — 7 of 8 holdings now pass; NBIS alone fails

`sample-live-rgb.mjs`, unmodified, aborts with `NBIS deltaE 33.123 > 8`.

Non-throwing full table (`claude-review-4/raw-trail-sampler-full-table.json`):

| Ticker | weekly | expected | sampled | ΔE | hue lock | L |
|---|---|---|---|---|---|---|
| ASML | −12.13% | `#b3241d` | `#b3241d` | **0** | pass | 0.1093 |
| GOOG | −3.93% | `#ff7a73` | `#ff7a73` | **0** | pass | 0.3642 |
| COST | null | `#e3b65c` | `#e3b65c` | **0** | n/a | 0.5056 |
| MSFT | −1.11% | `#ff948e` | `#ff948e` | **0** | pass | 0.4439 |
| IBM | +8.10% | `#7af4aa` | `#77eba4` | 3.52 | pass | 0.6602 |
| INTC | −18.16% | `#b3241d` | `#b3241d` | **0** | pass | 0.1093 |
| CBRS | −7.60% | `#ea544d` | `#eb5951` | 2.10 | pass | 0.2540 |
| NBIS | −21.77% | `#b3241d` | `#621712` | **33.85** | pass | 0.0325 |

This is the largest single-round movement in the section: round 3 failed 7 of 8,
round 4 fails 1 of 8. Ordering is now monotonic in the loss direction —
0.4439 (1.1%) > 0.3642 (3.9%) > 0.2540 (7.6%) > 0.1093 (12.1%) = 0.1093 (18.2%,
both at the ramp's 12% clamp floor) > 0.0325 (21.8%). Round 3's two ordering
violations are gone. ASML's misplaced sample point — round 3's required first
step — is fixed: it now samples the trail exactly, at ΔE 0.

**Diagnosis of the one remaining failure.** NBIS's retained 9×9 neighbourhood
(`claude-review-4/raw-trail-neighbourhood.json`) is a *uniform* `#5b1411`–`#621712`
field — 81 pixels all within one step of each other, at 0.52 × the model colour
`#b3241d`, with hue lock passing (3.75° vs the 3° anchor). A uniform half-value
field over a black void is partial pixel coverage: the ribbon's projected width
on the outermost orbit is under one pixel at the OVERVIEW camera, so every
sampled pixel is the same part-trail/part-void blend.

Compare CBRS, which round 3 called the structural case and which now **passes at
ΔE 2.10**: its neighbourhood shows a 3–4 pixel band at full `#f6635a`/`#ee6158`
with dark rows above and below. The implementer's taper floor
(`trailRibbonHalfWidths`, with the comment "without letting the outer-orbit core
collapse below a pixel at the established OVERVIEW camera") solved exactly this
mechanism for six holdings. It did not reach far enough for the outermost orbit.

**Required change.** Extend the same projected-width floor so NBIS's trail core
covers whole pixels at the sample point. Do not change the verifier, its
thresholds, or its sample points.

---

## 4. F2 / `BLD-04`, high — the long task is unmoved at 56–60 ms

`measure-long-tasks.mjs`, unmodified, five fresh 1440×900 CPU-2× contexts, not
baseline-subtracted (`claude-review-4/raw-long-tasks-BLD-04.txt`):

```
run 1  maximumMs 59      run 4  maximumMs 60
run 2  maximumMs 59      run 5  maximumMs 59
run 3  maximumMs 56      overall maximumMs 60
```

Five of five breach the 50 ms ceiling. Across four rounds the figure has not
moved: 57–61, 62–56, 61–55, 60–56. The round-3 remediation staged WebGL program
families across animation frames and consolidated basic-material program keys —
working directly from round 3's shader-program attribution — and the measurement
is unchanged within noise.

No new attribution was run this round; round 3's CDP profile
(`claude-review-3/raw-long-task-attribution.json`) stands: Three.js
`WebGLPrograms` shader-program acquisition holds ~34 ms of self time inside the
breaching window, and `texSubImage2D` never exceeds 2.5 ms in any 100 ms bin.

Four independent attempts against a correctly attributed cause have not moved
this gate. See §7, bucket B.

---

## 5. F3 / `DEF-02`, high — 6 of 8 fail, and the measurement is reading the panel

`capture-live-sphere-strip.mjs`, unmodified, aborts with
`COST chirality failed: normal=-0.4454 mirrored=-0.4051`.

Full table (`claude-review-4/raw-strip-chirality-full-table.json`):

| World | normalScore | mirroredScore | pass | round 3 | profile σ |
|---|---|---|---|---|---|
| ASML | +0.1089 | −0.1913 | pass | pass | 37.2 |
| GOOG | +0.0929 | −0.2420 | pass | pass | 31.3 |
| COST | −0.4449 | −0.4043 | **fail** | fail | 4.7 |
| MSFT | −0.5077 | +0.2943 | **fail** | fail | 3.2 |
| IBM | +0.0100 | +0.0129 | **fail** | fail | 21.8 |
| INTC | +0.1609 | +0.1654 | **fail** | fail | 2.1 |
| CBRS | −0.1580 | −0.0482 | **fail** | fail | 5.4 |
| NBIS | +0.3929 | +0.3943 | **fail** | fail | 3.6 |

Same six worlds as round 3, and the numbers barely moved — COST −0.4562→−0.4449,
MSFT −0.5005→−0.5077, NBIS 0.3887→0.3929. Round 3's regression did not deepen,
but nothing improved either, despite the round-3 remediation removing the
pre-flop, widening and strengthening the marks, and regenerating all 24 KTX2
maps. **A full texture regeneration that changes the measurement by less than
0.02 is evidence the measurement is not reading the texture.**

**Root cause, measured.** The verifier crops a square of side
`max(64, round(planetRadiusPx × 2))` centred on the planet's published centre and
correlates a luminance profile from that crop's central band. This review
reproduced that crop geometry exactly and intersected it with the rendered DOM
(`claude-review-4/raw-chirality-crop-geometry.json`):

| World | planet centre | radius px | band under the opaque inspector panel |
|---|---|---|---|
| ASML | 1003.3, 451.9 | 366.5 | **85.7%** |
| GOOG | 1002.8, 451.9 | 322.0 | **90.2%** |
| IBM | 946.2, 451.5 | 187.8 | **96.8%** |
| COST | 989.5, 451.8 | 240.9 | **100%** |
| MSFT | 1003.5, 451.9 | 197.7 | **100%** |
| INTC | 1056.5, 452.3 | 190.9 | **100%** |
| CBRS | 1042.9, 452.2 | 190.3 | **100%** |
| NBIS | 1073.1, 452.4 | 191.7 | **100%** |

At the approach camera the selected planet is rendered centred near x ≈ 1000,
and the opaque holding inspector occupies x = 828–1404. The two worlds that
pass are the two whose discs are large enough to extend left of the panel; the
six that fail are sampled almost entirely from panel chrome. The retained crops
(`claude-review-4/chirality-crop-msft.png` and siblings) show this plainly —
MSFT's is the SCOPE chart and TELEMETRY row, with no planet pixel in it.

The published geometry is **correct**, not stale: with every overlay hidden by a
review-only visibility override, MSFT renders as a disc centred at ≈(1010, 452)
with radius ≈198 px, matching `data-planet-center-x/y/radius-px` exactly
(`claude-review-4/panel-free-msft.png`). The planet is where the scene says it
is. It is simply underneath the panel.

**What is underneath the contamination.** Recomputing the same correlation on
the panel-free frames (`claude-review-4/raw-panel-occlusion.json`):

| World | normal | mirrored | pass | profile σ (shipped → panel-free) |
|---|---|---|---|---|
| IBM | +0.125 | +0.080 | **pass** | 21.8 → 19.5 |
| INTC | +0.139 | +0.070 | **pass** | 2.1 → 18.0 |
| COST | +0.427 | +0.463 | fail | 4.7 → 26.0 |
| NBIS | +0.385 | +0.388 | fail | 3.6 → 21.4 |
| MSFT | −0.519 | +0.132 | **fail** | 3.2 → 13.7 |
| CBRS | −0.595 | +0.380 | **fail** | 5.4 → 24.6 |

Two of the six reverse to pass once the panel is out of the way, and every
profile gains 3–8× signal strength. Two — MSFT and CBRS — still fail decisively
with strong signal, so a genuine mirrored mark exists underneath. COST and NBIS
sit inside noise even panel-free.

So `DEF-02` is two separable problems, and §7 sorts them separately.

**This is also a product observation, not only a measurement one.** §10's carved
brand marks are placed on the hemisphere facing the camera, and at the approach
camera that hemisphere is behind an opaque panel for six of eight holdings. The
owner has already reported the same thing from the other direction — *"the planet
panel is slightly too big"* (`OWNER_FEEDBACK_LEDGER.md` §3.1).

---

## 6. Criteria substantiated at this candidate

Every criterion below was exercised this turn against candidate `0ef1433` and
its evidence is retained under `docs/phase10-baseline/section-10/claude-review-4/`.

**Deterministic verifiers, each run with its own declared command**
(`raw-command-verifiers.txt`): `DEF-01`, `BHV-06`, `BHV-07`, `BHV-09`, `BHV-11`,
`BHV-12`, `FIN-01`–`FIN-05`, `VIS-05`, `VIS-06`, `VIS-07`, `VIS-11`, `VIS-13`,
`MOB-02`, `ACC-01`, `ACC-02`, `ACC-04`, `ACC-08`, `FWL-01`–`FWL-05`, `TST-01`,
`TST-05`, `TST-07`, `TST-08`, `BLD-07` — all **pass**. `TST-07`'s two specifics
were read directly rather than inferred: the byte ceiling is `30_000_000` and
the `luminanceStdDev >= 0.1` floor is asserted per world.

**Live and manual verifiers established this round:**

| Criterion | Result | Basis |
|---|---|---|
| `VIS-12` | **pass** | §2 |
| `VIS-01` | **pass** | all eight equatorial-band means 0.1968–0.4358, inside [0.16, 0.55] |
| `TST-04` | **pass** | the capture measures per-world luminance *and* asserts chirality; it is the chirality assertion that aborts |
| `MOB-01` | **pass** | 390×844 and 320×844: `canvas` 0, `scrollWidth === clientWidth`, 27 targets, minimum target 44 |
| `DEF-03` | **pass** | model test green *and* COST, the null-weekly holding, samples the flat token `#e3b65c` at ΔE **0** live |
| `DEF-04` | **pass** | all five belt bodies render visibly (peak luma 73.8–204.4 against a void reference of 10) and all five are in the tab order with 44 px targets |
| `DEF-06` | **pass** | root-caused in the evidence README (the second `.sunTelemetry` text-shadow layer, not scene lighting) and removed — the CSS now carries one shadow layer |
| `DEF-07` | **pass** | ASML at the close camera, 12 samples over 12 s: 0 sun-like pixels at the planet centre in every sample |
| `BHV-10` | **pass** | no far-left prose column; 26 text nodes; the only non-teletype multi-word strings are the seven designed bay questions |
| `VIS-08` | **pass** | one dominant bay (`systemPlotFrame` 690×506, full height) with no two bays the same size and unequal gutters; day readout at **64 px**. Measured deviations from the criterion's own approximations, recorded rather than smoothed: the dominant bay is 47.9% of the viewport (49.9% of the chassis) against "approximately 55%", and the type scale reads 64 → 32 → 16 → 12 → 11 against the stated "64 → 15 → 11" |
| `VIS-10` | **pass** | every ring's border colour is its holding's exact ramp value (ASML/INTC/NBIS `#b3241d`, GOOG `#ff7a73`, COST `#e3b65c`, MSFT `#ff948e`, IBM `#7af4aa`, CBRS `#ea544d`) and blip diameter falls monotonically with weight, 20→14 px across 26.4%→3.5% |
| `VIS-14` | **pass** | prism length 12.8 px after slow travel, 33.6 px after a fast jump; absent entirely under reduced motion |
| `BLD-03` | **pass** | 23,075,805 then 22,804,307 bytes recorded against the 30 MB ceiling, and the unavailable `basisu --version` recorded verbatim with the reason ladder step 4 was not reached |
| `BLD-05` | **pass** | with all 24 texture requests aborted the canvas still paints, all 8 scene labels render, zero page errors, non-zero channel means — deterministic shader art, not black |
| `BLD-06` | **pass** | `public/fonts/chakra-petch/` carries the TTF and `OFL.txt`; `next/font/google` unchanged in `layout.tsx` |
| `TST-02` | **pass** | the only `readFileSync` on source in the §10 test diff is the `FWL-05` hex guard, which identifies itself as structural; every other added string assertion reads rendered markup |
| `TST-06` | **pass** | all seven retained verifiers plus this round's five probes are committed with their raw output |
| `PRV-05` | **pass** | no `.env*` was read, printed, edited, staged or committed; no deployment command was run |
| `TST-03` | **fail** | §3 |
| `BLD-04` | **fail** | §4 |
| `DEF-02` | **fail** | §5 |
| `VIS-04` | **blocked** | its ramp-lightness half is `TST-03`, now failing on NBIS alone |
| `VIS-02` | **blocked** | the carved capital faces the camera on the hemisphere the inspector panel covers; §5's geometry means no shipped-view verifier can read it for six of eight worlds |
| `BHV-05` | **blocked** | same geometry as `VIS-02`; the deterministic phase half is green in `scene-model.test.ts`, and under reduced motion there is no 3D planet view for the clause to apply to |

Sixteen criteria carry reviewer results from round 2 at candidate `3d1882a` and
were not independently re-exercised this turn: `DEF-05`, `DEF-08`, `DEF-09`,
`DEF-10`, `BHV-01`, `BHV-02`, `BHV-03`, `BHV-04`, `BHV-08`, `VIS-03`, `VIS-09`,
`MOB-03`, `ACC-03`, `ACC-05`, `ACC-06`, `ACC-07`. This round's
`audit-live-interactions.mjs` run did exercise the same surfaces without
regression — full 28-stop tab order matching the expected order, every stop
focus-visible at ≥44 px, keyboard destinations for moon/satellite/sector, belt
and Mission Control Escape with focus returned to the sun, radar and manifest
expansion by keyboard, reduced-motion encodings preserved, zero console
messages — but their individual reviewer results are carried, not re-established.

**Nothing is left `not_run`.** Round 3's fifteen never-performed criteria are all
graded above.

---

## 7. Triage classification — `docs/phase10-workflow/SECTION_10_TRIAGE.md`

This is the review turn the triage rule names. Remediation on §10 stops here.
Every open finding is classified below with its reason. **This classification is
handed to Devan; no exception is self-authorised and no gate has been weakened,
redefined, or baseline-subtracted.**

### Bucket A — achievable inside §10

**F1 / `TST-03` — NBIS trail pixel.**
Round 3 nominated this finding for bucket C on the grounds that a sub-pixel
trail core cannot match a model colour. **That hypothesis is disproven.** The
holding round 3 named as the structural case, CBRS, now passes at ΔE 2.10, and
six of the seven round-3 failures closed — four of them at ΔE exactly 0. The
mechanism is understood, the fix already exists in the code (`trailRibbonHalfWidths`'
taper floor), and it needs to reach one more orbit. One holding, known change,
no investigation.

**F3b / `DEF-02` — the genuinely mirrored marks.**
With the panel removed, MSFT (−0.519 / +0.132) and CBRS (−0.595 / +0.380) still
fail decisively with strong signal. Those two marks are actually mirrored and
that is bounded texture-generation work.

### Bucket B — belongs to §11, do not fix twice

**F2 / `BLD-04` — the 50 ms long-task gate.**
Measured at 56–60 ms this round, unmoved across four remediation attempts, the
last of which worked directly from a correct CPU-profile attribution to Three.js
shader-program acquisition. §11's specified work removes exactly the material and
program permutations the profile names: *"Remove the embedded legacy dashboard …
It is deleted, not restyled, and takes its Recharts instances with it,"* plus
pausing the off-screen radar and lazy-mounting below-fold sections
(`PHASE10.md` §11).
**Carried, not closed.** The measurement above must be attached to §11's
acceptance and the gate must clear there.

**F3a / `DEF-02` — the panel-occluded measurement.**
The chirality verifier's sampled band is 96.8–100% inspector-panel chrome for
the six failing worlds. No texture work can move a measurement that contains no
planet. The cause is that the approach-camera panel covers the planet's
camera-facing hemisphere — which is precisely what §11 rebuilds: *"The planet
panel, rebuilt. The planet stays visible on the left; the panel occupies a fixed
rail on the right and is smaller than the mock's,"* answering the owner's own
*"slightly too big."* Once the planet is not behind the panel, `DEF-02`,
`VIS-02` and `BHV-05` all become measurable in the shipped view.
**Carried, not closed**, with the crop-geometry measurement attached.

### Bucket C — not achievable as specified

**None.** §10 ends this section with no criterion demonstrated to be
unsatisfiable. Round 3's single bucket-C candidate was tested this round and
failed to hold up.

### What this asks of the owner

1. Approve or amend the classification above.
2. If approved, authorise one bounded bucket-A remediation: NBIS's trail width
   floor, and the MSFT/CBRS mark chirality. Both have a named mechanism.
3. Decide whether §11 formally adopts F2 and F3a into its acceptance criteria.
4. Note that `VIS-04`, `VIS-02` and `BHV-05` resolve as a consequence of the
   above and are not separate work.

---

## 8. Scope discipline

No new criteria and no advisory findings were introduced. Every finding cites a
declared acceptance criterion and stays inside the round-3 finding's own required
change. Things were noticed in the retained surfaces that no §10 criterion covers
as written — among them the scene readout occluded by the COST planet at OVERVIEW
and the holding panel clipped at the viewport bottom — and they are named here
only so they are not lost; they are new scope for §11, not §10 findings.

`.env*` was never read, printed, edited, staged, or committed. No deployment
command was run. No application source was changed by this review; the only
files it adds are its own evidence and probes.
