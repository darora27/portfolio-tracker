# Phase 10 §9 review 5 — Universe craft and depth (remediation round 4)

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- Spec under review: `docs/phase10-workflow/specs/section-9.md`
- Reviewed implementation commit: `589be88fa40bf42566c3834ae72fdd3923335511`
  (`phase10(§9): remediate production-weight planet scale`)
- Diff base (`prev_actor_commit` recorded by the remediating turn):
  `a7558ba838871d8d5bfdbc2417bbfde683efe5fc`
- Repository HEAD at review time: `87bfc8982481188451df5a3ac71b00ae15e97246`
  (`owner: insert §10 Universe colour and material, renumber §11-§16`)
- Prior reviews: `section-9-review.md` (FAIL, F1–F6), `-2` (FAIL, F7),
  `-3` (FAIL, F8), `-4` (FAIL, F9)
- Result: **BLOCKED — owner decision required.** F9 is resolved and verified.
  Three §9 acceptance criteria are red on the current tree for a cause that is
  not the implementation under review.

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path) and applied beneath the authority order in the
spec's §1. It created no new criteria and no advisory findings.

## Summary

The single carried finding, F9, is **fully resolved**. I verified it twice,
independently of Codex: once in the pure scene model across a complete 360°
orbital sweep, and once live at exactly 1440×900 against a production server I
started myself — closing the environment gap Codex recorded honestly rather
than papering over.

But `npm test` is red at HEAD. Both failures were introduced by the owner's
own texture commits landed *after* the implementation under review, and both
break §9 acceptance criteria. Their remedy is the work §10 was chartered to
do two commits later — under a **30 MB** ceiling that directly contradicts
§9's criterion 55. I cannot pass §9 with red tests, and I will not fault the
implementer for the owner's commits or edit §9's acceptance criteria to fit
them. That decision belongs to Devan.

## F9 — RESOLVED

F9 required the OVERVIEW composition to satisfy criterion 18 for the
*production* weight distribution while criterion 17 and spec §4.2's spacing
rule continued to hold, and required the gate to be moved somewhere it can
actually fail.

### What Codex changed

`589be88` touches three files and 8 lines of production source:

- `ORRERY_MAX_RADIUS` 1.8 → 1.95 (`src/lib/observatory/orrery.ts`).
- The additive `ORRERY_PLANET_CLEARANCE` (0.18 world units) surplus is removed
  from adjacent-ring gaps in `orbitRadiiForPlanetRadii`, leaving spacing at
  exactly `1.6 × (r_i + r_i+1)`. The constant is still used for its other
  three purposes in `scene-model.ts`; only the ring-gap surplus is gone.
- The `overviewHoldings` fixture is replaced by `productionOverviewHoldings`
  at the shipped 26.5/20.8/12.5/8.3/7.3/7.2/3.8/3.5% distribution, and the
  360-step sweep now aggregates and asserts the heaviest-diameter band, the
  minimum-diameter floor, the belt span, all planet and label bounds, and the
  spacing ratio.

No trail/orbit sign→colour or sign→direction code is present anywhere in the
diff (verified by grepping the full `589be88` source diff for
colour/hex/sign/direction; zero hits). D1 is untouched.

### Criterion-by-criterion result

| Criterion | Requirement | Model (360° sweep) | Live at 1440×900 | Result |
|---|---|---|---|---|
| 1 | All eight tags legible at rest, fully inside frame | 0 clipped label frames in 360 | 8/8 labels inside, 0 hidden | **PASS** |
| 17 | Belt spans 85–92% of viewport width; no planet clipped | span 88.001% at every phase; 0 clipped planet frames in 360 | 8/8 planets inside | **PASS** |
| 18 | Heaviest ≈68 px; lightest ≥ 22 px | heaviest 64.27–71.21 px (midpoint 67.74); smallest 25.73 px | ASML 66.30–67.41 px (mean 66.85); smallest CBRS 26.57 px | **PASS** |
| spec §4.2 | Ring spacing ≥ 1.6× the sum of adjacent planet radii | minimum ratio exactly 1.600 at every phase | — | **PASS** |

Both of F9's binding constraints held: the belt was not narrowed and the
camera was not moved in (span is unchanged at 88.00%, the same value measured
in review 4), and no criterion was traded against another.

### How I verified it, independently

**Pure model.** I wrote my own throwaway sweep instrument against
`buildOverviewSceneModel` — my own fixture, my own bounds arithmetic, not
Codex's test — stepping `orbitalPhaseRadians` through all 360 integer degrees
at exactly 1440×900 on the eight production weights. It reproduces Codex's
reported numbers exactly: heaviest 64.27–71.21 px, smallest 25.728 px, belt
span 88.001% constant, minimum spacing ratio 1.6, zero clipped planet frames
and zero clipped label frames. The instrument was deleted before commit; its
results are reproduced above and are independently reachable by re-running the
committed sweep test.

**Live.** `npm run start -- --hostname 127.0.0.1 --port 3141` succeeded in
this environment (it did not in Codex's — see `browser-backend.txt`). I ran
the retained `docs/phase10-baseline/section-9/scripts/measure-overview-fit.mjs`
against it, 24 samples over 12 s at exactly 1440×900, reading planet geometry
from the `data-planet-center-*` / `data-planet-radius-px` attributes the render
loop writes each frame — i.e. from the live three.js projection, not the pure
model. Result: `criterion1_allLabelsInsideViewport: true`,
`criterion17_allPlanetsInsideViewport: true`,
`criterion18_heaviestProjectedDiameterPx: 66.85`, `anyLabelHidden: false`,
`consoleErrors: []`. Per-planet mean diameters: ASML 66.85, GOOG 57.75,
COST 56.00, MSFT 31.44, IBM 38.03, INTC 42.08, CBRS 26.67, NBIS 56.12.

Model and live agree — 67.74 px model midpoint against 66.85 px live mean for
the heaviest planet, and 25.73 vs 26.57 px for the smallest. The gate is no
longer pinned at the `MAX_WEIGHT` saturation point: the fixture's heaviest
weight is 26.5%, strictly below the 35% at which `radiusForWeight` saturates,
so the assertion can now fail if the composition regresses.

Evidence committed this turn — done by claude-code/opus-5:

- `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-5.json`
  — the full live measurement output.
- `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-5.png`
  — the post-F9 OVERVIEW frame, `sips`-verified at exactly 1440×900, zero
  console errors during capture.

### The one piece of F9 still outstanding, and why I did not close it

F9 also required recapturing
`docs/phase10-baseline/section-9/after/overview-1440x900.png`. It is still the
pre-F7 frame (last written at `7e37bdd`). I deliberately did **not** overwrite
it: any frame captured now renders the owner's round-3 textures from `f3e1294`,
which are §10 work in flight. Writing that image into §9's `after/` directory
would misrepresent §9's own accepted state as surely as relabelling an older
image would. My frame is filed under `claude-review/` instead, labelled for
what it is. This is part of the decision below.

## Why this is BLOCKED rather than PASS or FAIL

### The failures

`npm test` at HEAD: **2 failed | 497 passed (499)**, both in
`src/lib/observatory/planet-textures.test.ts`.

1. `keeps all eight worlds recognizable at the committed 32-pixel proxy` —
   `expected 0.098092 to be greater than or equal to 0.1`. INTC's
   `luminanceStdDev` is 0.098092 and CBRS's is 0.093008, both under the 0.1
   floor. Breaks **criterion 48** ("the texture manifest test in §10.2 passes
   for all eight tickers").
2. `records the exact on-disk directory total below the binding budget` —
   `expected 22450706 to be less than or equal to 15000000`. Breaks
   **criterion 55** ("total shipped bytes under `public/textures/planets/`
   ≤ 15,000,000"). Note the manifest and the on-disk total still agree
   exactly; only the cap is exceeded.

Together they break **criterion 53** (`npm test` and `npm run build` green).
`npm run build` itself is green: Next.js 16.2.11, TypeScript clean, 23 route
tasks, post-build smoke `/share` 200 and Mission Control manifest 200.

### The cause is not the implementation under review

I traced `totalBytes` and per-ticker `luminanceStdDev` through every commit
between the §9 implementation and HEAD:

| Commit | Subject | totalBytes | Tickers under the 0.1 floor |
|---|---|---|---|
| `bc1b79c` | `phase10(§9): craft the universe operations layer` | 11,727,680 | none (min CBRS 0.101584) |
| `589be88` | `phase10(§9): remediate production-weight planet scale` | 11,727,680 | none (min CBRS 0.101584) |
| `6ee69a8` | `chore: real brand marks…` | 11,727,680 | none |
| `ced5bfd` | `chore: regenerate planet textures with real composited brand marks` | 11,727,680 | none |
| `5ca385d` | `chore: halo-backed brand marks and a texture budget that fits them` | **22,660,766** | **INTC 0.098445, CBRS 0.086677** |
| `f3e1294` | `owner: round-3 colour design, protected brand marks, regenerated textures` | 22,450,706 | INTC 0.098092, CBRS 0.093008 |
| `87bfc89` | `owner: insert §10 Universe colour and material…` | 22,450,706 | same |

Both assertions were green at and through Codex's remediation commit and broke
at `5ca385d`. `planet-textures.test.ts` has not been modified since `bc1b79c` —
the owner's commits changed the textures the test measures without changing the
test. None of the owner's four commits touched `src/` at all
(`git diff --name-only 589be88 HEAD -- src/` is empty), so the geometry under
review is exactly Codex's.

### Why I did not simply fail it back to Codex

Criteria 48, 53 and 55 are genuine §9 criteria, so a bounded finding would be
formally grounded. But it would be wrong in substance:

- The implementer did not cause it, and its own commit satisfied all three.
- The remedy is already chartered elsewhere. `roadmap_amendment_3` inserted
  §10 for exactly this work: step 5 of its sequence is "**Texture
  regeneration** — relight the five dark worlds into the measured luminance
  window, and carve the brand marks into the material stack."
- §10's Build dimension states the payload is "measured at each regeneration
  gate against a **30 MB** ceiling." The owner has already decided the ceiling
  moves. The shipped 22.45 MB is under §10's ceiling and over §9's. `5ca385d`'s
  own subject line — "a texture budget that fits them" — reads as that decision
  being taken, but no test or criterion was updated to record it.

So §9's criterion 55 and §10's Build dimension now state different binding
numbers for the same directory, and the tree satisfies the later one. Whether
§9 closes against its own implementation commit or absorbs §10's texture state
is a scope decision, not a review judgement. Per the standing prompt I am not
authorized to invent new criteria, to relax existing ones, or to guess between
these — so I am stopping here rather than choosing.

## Verification run independently this turn

| Check | Result |
|---|---|
| `npm test` | **FAIL** — 94 files, 2 failed / 497 passed of 499; both failures in `planet-textures.test.ts`, both owner-introduced at `5ca385d` |
| `npm run build` | PASS — Next.js 16.2.11, TypeScript clean, 23 route tasks; post-build smoke `/share` 200 and Mission Control manifest 200 |
| Live production server at `127.0.0.1:3141` | PASS — `/share` 200 |
| Live label + planet geometry at 1440×900, 24 samples over 12 s | PASS — criteria 1, 17, 18 all pass |
| Full 360° pure-model sweep at 1440×900 on production weights | PASS — criteria 1, 17, 18 and spec §4.2 spacing |
| Live console/page errors during measurement and capture | PASS — zero |
| Trail/orbit sign→colour and sign→direction mapping (D1) | Unchanged — zero colour/sign/direction hits in the reviewed source diff |

## Decision for Devan

See `docs/phase10-handoffs/2026-07-28-section-9-claude-lead-to-devan-blocked.md`
for the options and their consequences.
