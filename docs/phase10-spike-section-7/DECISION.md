# Phase 10 §7 Phase A — spike decision record

**Result: FAIL / NO WINNER. Neither variant is selected.**

Written by claude/fable-5 (Claude Lead, Turn B, `review` stage) on
July 25, 2026, from the retained measurements, screenshots, and filmstrips
captured against a real production server at `http://localhost:3100`. Turn A
(`codex/gpt-5`, commit `2f78b1b`) built both spike routes and the measurement
tooling and deliberately selected nothing; this document completes the
measurement and decision half.

Format follows `docs/phase10-spike-section-1/DECISION.md`: declared thresholds
first, measured results second, procedure third, reasoning last.

---

## 0. Outcome in one paragraph

Both spike variants were built, measured live, and photographed. On the
declared **reliability** gates the CSS variant passes everything and the R3F
variant fails one: a route-owned long task of **59–60 ms in 5 of 5 runs** on
the desktop rig, where both the pre-§7 baseline and the CSS variant produce
zero. The R3F variant additionally ships **no pointer parallax at all** —
verified live (the parallax custom properties read `0` at every pointer
position) and at source (`src/app/dev/phase10-spike-r3f-world/` contains no
`pointermove` listener). On the **storytelling** gate, which `PHASE10.md` §7
ranks equal to performance, the owner reviewed both first viewports and
rejected both as production candidates. Because §2.4's "a row failed by both
variants means neither may be selected as-built" rule is triggered, and
because the owner has explicitly rejected both, **no winner is recorded and
CSS is not selected by default.** §7 returns to `remediate` with a new,
owner-defined target: the **Portfolio Orrery** (§6 below).

---

## 1. Measurement environment

| | |
|---|---|
| Server | Real production build (`npm run build` + `next start`), `http://localhost:3100` |
| Auth | Temporary localhost-only `OWNER_PASSWORD` process override; no `.env*` file contents were read, printed, or committed at any point |
| Desktop rig | `docs/phase10-spike-section-7/measure-desktop.mjs` — 1440×900, CDP CPU 2× throttle, no network throttle, 5 fresh contexts per route |
| Mobile rig | `docs/phase10-spike-section-7/measure-phone.mjs` — Playwright "Moto G4" descriptor (360×640 @3×, touch), CDP CPU 4× throttle, Slow-4G network throttle, 5 fresh contexts per route |
| Visual/interaction rig | `docs/phase10-spike-section-7/capture-evidence.mjs` — 1440×900 screenshots, `.webm` recordings, and live computed-style reads at four pointer positions |
| Baseline route | `/dev/observatory-shell?mode=public` — the pre-§7 `ObservatoryShell` as committed |
| Raw data | `raw/desktop-scene.json`, `raw/mobile-fallback.json`, `../phase10-baseline/section-7/capture-report.json` |
| Dependencies | `three@0.185.1`, `@react-three/fiber@9.6.1`, `@types/three@0.185.1` present in `node_modules` only, installed `--no-save` by Turn A. `git diff --quiet package.json package-lock.json` reports **no diff**; neither package appears in `package.json`. |

### 1.1 Two corrections to `measure-desktop.mjs` made before the run

Both are recorded here rather than silently applied. The corrected file is
committed with this decision.

1. **Focus predicate.** `clickChapterAndSettle` waited for
   `document.activeElement.textContent?.trim() === label`. The focused `h2`
   contains the chapter number as well as its label, so the strict equality
   never matched and every run would have hung. Changed to `.includes(label)`.
2. **Transition frame sampling.** The transition RAF sample was started
   *after* `clickChapterAndSettle` returned — i.e. after the 900 ms window it
   was meant to observe had already elapsed, which yields an always-empty
   array. The sampling promise is now started before the click and awaited
   after it, so it observes the actual transition.
3. **Leak-check start chapter.** The R3F leak cycle began at `Forces`, which
   the interaction-latency click had just navigated to; clicking an
   already-active chapter's own link is a no-op and produces no focus change,
   so the cycle would have hung. The sequence now starts at `Structure`.

---

## 2. §2.3.1 Mobile-fallback confirmation (Moto G4 / CPU 4× / Slow 4G, 5 runs each)

This profile's only job is to confirm the mobile/narrow fallback path; per
§2.3.1 it is never used to score or disqualify the desktop scene.

| Check | Threshold | Baseline | CSS | R3F | Result |
|---|---|---|---|---|---|
| R3F lazy-chunk requests at <1024px | 0 | 0 | 0 | **0** | PASS (all) |
| Load `goto`→`networkidle` | ≤ 5000 ms, no regression | 2860–2891 ms (med. 2874) | 2238–2247 ms (med. 2245) | 2247–2254 ms (med. 2252) | PASS (all; both variants load *faster* than baseline) |
| Long tasks > 50 ms, added over baseline | 0 added | one 65–67 ms task per run | one 65–68 ms task per run | one 65–68 ms task per run | PASS (all; added = 0) |
| Frame stability, idle | 0 dropped frames > 33.4 ms | 0 | 0 | 0 | PASS (all) |

**Note on the shared 65–68 ms task.** It appears identically on the
*unmodified pre-§7 baseline*, so it is not introduced by either variant. This
is the same shared Next.js/React root-bootstrap task root-caused and
documented in `docs/phase10-spike-section-1/DECISION.md` (rounds 2 and 3), and
it is why §2.3.1's row is written as an *added-over-baseline* differential.
No §7 evidence re-litigates or re-uses §1's owner exception.

**Mobile-fallback verdict: PASS for both variants.** The fallback does not
regress, and the R3F chunk is never requested at phone width — confirmed from
the network log, not inferred.

---

## 3. §2.3.2 Desktop WebGL-scene measurement (1440×900 / CPU 2×, 5 runs each)

| Metric | Threshold | Baseline | CSS | R3F | Result |
|---|---|---|---|---|---|
| Initial-bundle JS added over baseline (encoded) | ≤ 50 KB | 153,848 B | 153,020 B (**−828 B**) | 154,411 B (**+563 B**) | PASS both |
| R3F lazy chunk (post-mount only) | ≤ 260 KB, and 0 B of the initial bundle | n/a | n/a (no chunk) | **235,270 B (229.8 KB)** across 2 chunks, **0 B initial** | PASS |
| Load `goto`→`networkidle` | ≤ 3000 ms, no regression | 602–616 ms (med. 610) | 528–531 ms (med. 528) | 634–648 ms (med. 638) | PASS both (R3F +28 ms vs baseline median) |
| **Long tasks > 50 ms added over baseline** | **0** | **0 in 5/5 runs** | **0 in 5/5 runs** | **1 in 5/5 runs — 59, 60, 60, 59, 59 ms** | **CSS PASS · R3F FAIL** |
| Frame stability, idle (60-sample) | 0 dropped > 33.4 ms | 0/60 | 0/60 | 0/60 | PASS all |
| Frame stability, during chapter travel | ≥ 90% frames ≤ 33.4 ms | 100% | 100% | 100% | PASS all |
| Settled `JSHeapUsedSize` added over baseline | ≤ 40 MB | 2.81–2.83 MB | 2.79 MB (**≈ −0.02 MB**) | 5.81–5.84 MB (**≈ +3.0 MB**) | PASS both |
| Repeated-transition leak (4 cycles × 5 transitions = 20) | growth cycle 1→4 ≤ 10 MB | n/a | n/a | −2.02, −1.25, +0.47, +1.28, **+2.55 MB** (max) | PASS — no monotonic growth; the scene plateaus |
| Interaction latency (click → focused `h2` → settled) | ≤ 900 ms | 970–992 ms (med. 975) | 994–1020 ms (med. 995) | 975–1006 ms (med. 979) | **Row invalid as instrumented — see 3.2** |

### 3.1 The R3F long task is route-owned, and it is the real finding

The task is not a shared-bootstrap artifact and must not be excused as one:

- The **pre-§7 baseline produces zero** long tasks on this exact rig, in all
  five runs. The §1 situation (where the task existed identically on the
  unmodified baseline) does not apply here.
- The **CSS variant on the same rig also produces zero**, in all five runs.
- The task's start time (131.3, 134.8, 135.9, 137.0, 147.4 ms) sits inside the
  window in which the two lazily-requested R3F chunks
  (`3imkzi2f4gq5q.js`, 234,117 B; `0dcit9joezcnw.js`, 1,153 B) are evaluated.
- Its duration is stable and reproducible: 59–60 ms, once per run, 5/5.

Under the declared gate ("0 tasks > 50 ms of added time"), **R3F fails the
reliability gate and is disqualified from selection under §2.5 Step 1.** The
50 ms boundary is unchanged and the observation is recorded without
subtraction, averaging, or reclassification.

### 3.2 The interaction-latency row is an instrument artifact, not a result

`clickChapterAndSettle` returns `click + waitForFunction(focus) + a fixed
page.waitForTimeout(900)`. Every measured value therefore carries a constant
900 ms floor, and **the unmodified pre-§7 baseline fails the ≤900 ms
threshold too** (970–992 ms). The row cannot discriminate between variants and
is not used to pass, fail, or score anything. Subtracting the fixed wait, the
actual focus-to-settle cost is: baseline 70–92 ms, CSS 94–120 ms, R3F
75–106 ms — all far inside budget.

This is recorded, not quietly dropped. It is the same class of defect §1 found
in its "≤16.7 ms per frame" predicate: a threshold that no correct
implementation, including the untouched baseline, could satisfy as written.
Whoever next revises `measure-desktop.mjs` should measure click → focus →
`transitionend`/settle directly instead of appending a fixed wait.

---

## 4. Pointer-parallax check (live computed-style reads, 1440×900)

Four pointer positions per variant; values read from live computed style, not
from source. Raw data: `../phase10-baseline/section-7/capture-report.json`.

| Pointer position | CSS `--parallax-x/y` | CSS `.atmosphere` translate | CSS `.orbitCamera` translate X | R3F `--parallax-x/y` | R3F `.atmosphere` translate | R3F `.orbitCamera` translate X |
|---|---|---|---|---|---|---|
| (300, 300) | −0.583 / −0.333 | (4.081, 1.665) | 40.05 | **0 / 0** | **(0, 0)** | **48.00** |
| (720, 450) | 0.000 / 0.000 | (0, 0) | 47.21 | **0 / 0** | **(0, 0)** | **48.00** |
| (1140, 600) | 0.583 / 0.333 | (−4.081, −1.665) | 55.32 | **0 / 0** | **(0, 0)** | **48.00** |
| (400, 700) | −0.444 / 0.556 | (3.108, −2.780) | 43.16 | **0 / 0** | **(0, 0)** | **48.00** |

- **CSS: parallax present.** Two layers move by different magnitudes
  (`.atmosphere` ≈ ±4 px, `.orbitCamera` ≈ ±7.6 px), which is what §2.4 row 6
  asks for on the offset half of the requirement.
- **R3F: parallax entirely absent.** Every read is identical at every pointer
  position. Root cause is not canvas pointer capture — it is a straightforward
  omission:
  `grep -rn "pointermove" src/app/dev/phase10-spike-r3f-world/` returns
  **nothing**. The R3F variant never attaches a parallax listener. The CSS
  variant does (`CssWorld.tsx:37`).

**R3F fails §2.4 row 6 outright.** CSS satisfies the layer-offset half; an
explicit front/back **occlusion change** between an object pair was not
isolated in the retained reads, so CSS scores row 6 as *partial*.

---

## 5. §2.4 storytelling rubric — the gate both variants fail

`PHASE10.md` §7 Section gate 2: "the storytelling gate is required — a
technically clean but non-immersive result fails §7 regardless of which
runtime was selected."

### 5.1 Owner verdict (decisive, recorded verbatim in substance)

Devan reviewed both idle 1440×900 first viewports and rejected both as
production candidates:

- **CSS** "reads as a clean dashboard placed on an infinite perspective grid,
  rather than a detailed spatial world. Its ellipses have no apparent
  meaning."
- **R3F** "reads as low-quality generic spheres. The moving bodies do not have
  an understandable portfolio purpose."
- "The owner explicitly rejects both production candidates. Therefore, no
  second unprimed viewer is necessary to establish a winner: neither may be
  selected."

**No second unprimed viewer was recruited, and no second reaction has been
fabricated or paraphrased into existence.** Rows 1, 7, 10, and 11 each require
independent human reactions or a live side-by-side session; where those were
not performed, this document says so rather than inventing them. The owner's
rejection makes them moot for *selection* purposes — there is nothing left to
select between — but it does not convert an unperformed session into a
recorded one.

### 5.2 Independent corroboration from the retained screenshots

The reviewer's own direct observation of
`../phase10-baseline/section-7/screenshots/css-world-idle.png` and
`r3f-world-idle.png` matches the owner's description:

- The **CSS** viewport is five rounded rectangular label plates and one
  content card arranged over a receding dot-grid. Two faint concentric
  ellipses sit in the middle of the field with no label, no referent, and no
  object travelling along them.
- The **R3F** viewport adds one large green low-poly icosahedron (which
  overlaps the `h1`) and two dark-blue spheres to that same composition. The
  spheres carry no portfolio meaning, share no ground plane or lighting
  direction with the DOM plates, and the same unexplained ellipses remain
  behind them.

### 5.3 Row-by-row

| # | Row | CSS | R3F | Evidence |
|---|---|---|---|---|
| 1 | World-entry legibility (unprimed viewer says "a world") | **FAIL** | **FAIL** | Owner verdict, §5.1. No second unprimed viewer run; none fabricated. |
| 2 | Continuous environment (one shared frame of reference) | **PARTIAL** | **FAIL** | Grid/horizon is shared, but the unexplained ellipses belong to nothing; R3F's spheres share no ground plane or light direction with the plates. |
| 3 | Coherent world persistence across ≥3 chapter changes | PASS | PASS | `capture-report.json` → `chapterTravelSequence`: `atmosphereUnchangedNode: true` across Forces → Structure → Timeline on both. |
| 4 | Camera-like movement with real perspective change | PASS | PASS | `.orbitCamera` `matrix3d` changes both rotation and translation between resting states (e.g. CSS `48,16,55` → `−83.22,61.55,95`, rotation term `0.0712` → `−0.1127`), with a distinct captured mid-frame. |
| 5 | ≥3 distinguishable depth layers in the first viewport | PASS | PASS | CSS: atmosphere `z −4` / orbitCamera / plate `z 6`. R3F: atmosphere `z −4` / canvasStage `z 1` / orbitCamera `z 4` / plate `z 7`. |
| 6 | Layered depth with occlusion (parallax) | **PARTIAL** | **FAIL** | §4. CSS offsets two layers by different magnitudes; no isolated occlusion change. R3F has no parallax at all, live and at source. |
| 7 | Chapter selection reads as travel (unprimed observer language) | **NOT ESTABLISHED** | **NOT ESTABLISHED** | No observer session was run. Not fabricated. Moot for selection per §5.1. |
| 8 | Foreground plate anchored in the world | **FAIL** | **FAIL** | The plate carries a perspective-consistent `matrix3d`, but by direct observation reads as a rectangular card overlaid on the field; nothing in either scene shares shadow or light with it. |
| 9 | Discovery affordance on hover/focus | PASS | PASS | `discoveryHoverOpacity: "1"` on both; idle/hover screenshot pairs retained for both. |
| 10 | Memorable, blind-comparable transitions (world-scale language) | **FAIL** | **FAIL** | Filmstrips exist and the transitions are distinct from §1's `obs-enter`, but the owner's recorded reaction is the opposite of world-scale language for both. No blind-comparison session with independent viewers was run. |
| 11 | Captures y-n10.com's transferable qualities | **NOT PERFORMED** | **NOT PERFORMED** | No side-by-side session against `https://y-n10.com/` was conducted this turn. Recorded as not performed rather than asserted. |

**Rows failed by BOTH variants: 1, 2 (partial/fail), 6 (partial/fail), 8, 10.**

§2.4's own rule applies verbatim: *"a row failed by both variants means
neither may be selected as-built — the implementation must be revised until at
least one variant passes all eleven rows before Phase A's decision is
recorded."*

---

## 6. §2.5 decision procedure — applied, and why it terminates at Step 1

**Step 1 — mandatory gates.**

| Gate | CSS | R3F |
|---|---|---|
| Accessibility (five real anchors, static reduced-motion variant, contrast, `aria-hidden` duplication) | PASS — verified by Turn A's 15 component tests plus source read | PASS — same basis |
| Privacy (owner-gated `/dev/*` route, no dollar patterns in unauthenticated HTML, no portfolio data imported) | PASS — `page.tsx` renders `LoginForm` on an invalid/missing session; both spike trees import only `OBSERVATORY_CHAPTERS` and synthetic copy | PASS — same basis |
| Fallback (`?no3d=1` / forced WebGL failure, no-JS server-rendered links) | PASS — covered by Turn A's tests | PASS — `?forceFail=1` covered by Turn A's tests |
| **Reliability (every §2.3.1 and §2.3.2 row)** | **PASS** | **FAIL — 59–60 ms route-owned long task, 5/5 runs (§3.1)** |

R3F is **disqualified at Step 1**. CSS advances.

**Step 2 — equal-weighted score.** Not computed, and deliberately so. Step 2
scores only variants that reached it, and CSS is the only one — but a
one-variant score cannot produce a comparison, and §2.4's "failed by both"
rule has already fired, which forbids selecting *either* variant as-built.
Computing a score for CSS alone would manufacture the appearance of a
selection process that has no candidates.

**Step 3 — selection: NONE.**

CSS is **not** selected. It passed the technical gate and lost the
storytelling gate, and `PHASE10.md` §7 ranks the storytelling gate equal to
performance. Selecting CSS here would be exactly the "technically clean but
non-immersive result" Section gate 2 forbids. The CSS-as-tie-breaker clause in
§2.5 Step 3 breaks ties *between gate-and-rubric-passing variants*; it is not a
default winner when both variants fail the rubric.

---

## 7. What replaces the target: the Portfolio Orrery

Recorded by Devan, July 25, 2026, as a product-direction correction. The full
normative scope now lives in `PRODUCT_DIRECTION.md` ("Portfolio Orrery"),
`PHASE10.md` §7, `docs/PHASE10_UX_ARCHITECTURE.md` §3.1, and
`docs/phase10-workflow/specs/section-7.md` §R. Summarised here so this record
stands alone:

`/share` opens with a genuinely full-viewport portfolio solar system. The
central **sun is the portfolio as a whole** — it never leads with or reveals
total account dollar value publicly; activating it opens the portfolio-level
summary (composition, return, market-relative context). Each **planet is one
actual public-safe holding**, not an Observatory chapter. **Radius encodes
portfolio weight** on a perceptually sensible, clamped scale — larger
positions visibly larger, small holdings still visible and selectable.
**Orbit direction encodes trailing weekly performance** (positive → clockwise,
negative → counterclockwise, unavailable/flat → an explicitly labelled neutral
behaviour) and **orbital speed increases monotonically with |weekly % change|**
under safe min/max clamps, deterministically, unit-tested, and explained by an
on-screen legend. **Orbital paths must be the planets' real trajectories** — the
unexplained ellipses that failed row 2 are prohibited. Hover/focus/selection
**stabilises** a planet and opens a **semantic holding inspector**
(ticker/company, weight, weekly return, portfolio-relative context, public-safe
analytics, link to deeper stock information) with URL-restorable state that
works with browser back/forward.

**R3F is the intended visually dominant desktop runtime for the remediation**,
with the existing semantic DOM as the accessible source of truth and the CSS
shell as the no-WebGL/reduced-motion fallback — despite R3F losing Step 1
above, because the owner's direction is that the failing long task is to be
*fixed*, not routed around. Per the owner's instruction, Codex must first
attempt real optimisation of the 59–60 ms route-owned task and implement the
missing pointer parallax. **The 50 ms gate is not to be weakened.** If the
task cannot be brought under the gate after one bounded optimisation round,
the measured result returns to Devan for an explicit decision — CSS is not to
be silently selected instead.

Art direction is **"portfolio command observatory"**: dark outer-space
environment, 1980s CRT phosphor green and amber accents, restrained scanlines,
neon telemetry glow, analog-future HUD framing, retrofuturist control-room
typography; polished/professional first, playful/experimental second.
Translate the broad qualities of classic space-opera control panels,
optimistic atomic-age futurism, and analog time-bureaucracy — copy no
protected logos, characters, props, or exact compositions.

Every prior binding rule survives unchanged: privacy and no-public-dollar
boundaries, honest math and labelling, mobile as a deliberate static or
simplified 2D orbital map/list, reduced motion freezing orbital movement, a
synchronised semantic holding list and inspector for keyboard and
screen-reader users, and **no essential information existing only in WebGL,
motion, colour, speed, or direction.**

---

## 8. Retained evidence index

| Artifact | Path |
|---|---|
| Desktop raw (5 runs × 3 routes, incl. leak cycles) | `raw/desktop-scene.json` |
| Mobile-fallback raw (5 runs × 3 routes) | `raw/mobile-fallback.json` |
| Desktop measurement script | `measure-desktop.mjs` |
| Mobile measurement script | `measure-phone.mjs` |
| Screenshot/filmstrip/pointer-read script | `capture-evidence.mjs` |
| Live pointer reads, depth layers, travel matrices | `../phase10-baseline/section-7/capture-report.json` |
| 1440×900 screenshots (11, dimension-verified) | `../phase10-baseline/section-7/screenshots/` |
| `.webm` recordings — world entry, pointer exploration, chapter travel, both variants | `../phase10-baseline/section-7/filmstrips/` |
| Evidence README | `../phase10-baseline/section-7/README.md` |
| Turn A handoff | `../phase10-handoffs/2026-07-25-section-7-codex-implementation-to-claude-lead.md` |
| Turn B review | `../phase10-workflow/reviews/section-7-review.md` |

Screenshot dimensions were verified before documenting: all eleven PNGs are
exactly 1440×900. Recordings are real `.webm` captures, not screenshot
filmstrips — §10's "do not claim a recording was captured when only a
screenshot pair exists" caveat does not apply.

## 9. Evidence gaps, stated plainly

These were not performed this turn and are not asserted anywhere above:

- A second independent unprimed viewer for rows 1, 7, and 10.
- A live side-by-side session against `https://y-n10.com/` for row 11.
- 390×844 / 320px screenshots of the spike routes (the mobile *rig* ran and
  passed; the mobile *stills* were not captured).
- A logged-out HTML dollar-pattern check executed live this turn (the gate is
  satisfied at source and by Turn A's tests).
- An isolated front/back occlusion-change observation for CSS row 6.

None of these change the outcome: R3F is disqualified on a measured
reliability gate, and both variants are rejected on the storytelling gate by
the owner.
