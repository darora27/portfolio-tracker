# Phase 10 §10 review, round 3 — FAIL with 4 bounded findings

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- **Candidate:** `3bdf46895ceeaaa4e125bac80f64776f3fb63423` (HEAD at turn start).
- **Remediation commit under review:**
  `61db1d68fe5afb5a3c6ec2f04da79389ea432277`.
- **Application source is identical between the two.**
  `git diff 61db1d6 HEAD -- src/ public/ scripts/ package.json package-lock.json`
  is empty; the six commits on top are owner design documents, the owner
  feedback ledger, the §11 roadmap insertion, and a one-line launch-argument
  change to the retained Playwright verifiers.
- **Verifier integrity:** the only change to any retained §10 verifier since
  round 2 is `chromium.launch({ headless: true })` gaining
  `args: ["--no-sandbox", "--disable-setuid-sandbox"]` (owner commit
  `2af5b3d`). No threshold, sample point, or assertion changed. Every verifier
  in this review ran unmodified.
- **Result:** FAIL. Three of the four round-2 findings are unresolved, and one
  of those regressed. The fourth is two-thirds closed.
- **Live rig:** production build served by `npx next start -p 3131`, real GPU,
  headless Chromium from the repo's own Playwright.

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path).

---

## 1. The two binding gates, run independently

| Gate | Command | Result |
|---|---|---|
| Tests | `npm test` | **PASS** — 99/99 files, 526/526 tests, 0 failures, 4.91s |
| Build | `npm run build` | **PASS** — exit 0, Next.js 16.2.11, 18 static page tasks, route list unchanged, `/share` 200 and Mission Control manifest 200 |

§9's inherited red is closed on the tree and stays closed. Green unit gates and
a failing review are not in conflict: every finding below is a live-render
measurement that no unit test covers.

`npm run phase10:acceptance -- check … --require implementer` passed before
review began.

---

## 2. Findings

### F1 — `TST-03`, high. The trail sampler fails on 7 of 8 holdings.

`docs/phase10-baseline/section-10/scripts/sample-live-rgb.mjs`, unmodified,
aborts with `ASML deltaE 60.479 > 8`.

Non-throwing full table
(`claude-review-3/raw-trail-sampler-full-table.json`):

| Ticker | weekly | expected | sampled | ΔE | hue lock | L |
|---|---|---|---|---|---|---|
| ASML | −12.13% | `#b3241d` | `#451b32` | **60.72** | fail (35.86° off, chroma 0.165) | 0.0228 |
| GOOG | −3.93% | `#ff7a73` | `#ffa69c` | **22.77** | pass | 0.5093 |
| COST | null | `#e3b65c` | `#d5c365` | **12.29** | n/a | 0.5412 |
| MSFT | −1.11% | `#ff948e` | `#dbaea5` | **26.49** | fail (chroma 0.212) | 0.4805 |
| IBM | +8.10% | `#7af4aa` | `#8fe6c6` | **25.01** | fail (14.93° off) | 0.6651 |
| INTC | −18.16% | `#b3241d` | `#ac261d` | 3.39 | pass | 0.1025 |
| CBRS | −7.60% | `#ea544d` | `#9c5047` | **33.90** | pass | 0.1326 |
| NBIS | −21.77% | `#b3241d` | `#9e221b` | **8.74** | pass | 0.0849 |

Two loss-direction ordering violations remain: MSFT |1.11%| samples lighter
than it should relative to GOOG |3.93%| (L 0.4805 vs 0.5093), and ASML |12.13%|
vs INTC |18.16%| (L 0.0228 vs 0.1025).

This is worse than round 2 (6 of 8 failed then; ASML was exact at 0). Note the
live payload moved between rounds — the weekly returns above are this turn's —
so the two tables are not row-comparable, only in aggregate.

**Diagnosis.** This round retains the raw 9×9 pixel neighbourhood the verifier
searches around every sample point plus a 120px crop of each
(`claude-review-3/raw-trail-neighbourhood.json`,
`claude-review-3/trail-crops/`). Three distinct mechanisms are visible, and
they are not the same defect:

1. **ASML's sample point is inside the planet's own disc.** The crop shows the
   blue ASML sphere filling the frame with the red trail leaving it toward the
   lower left; the point the app publishes as `data-trail-sample-x/y` sits on
   the sphere, so the neighbourhood is full of `#ffffff`, `#63aeff`, `#2951f7`.
   No trail colour can ever be sampled there. This is a sample-point placement
   defect in the scene, not a colour defect — the sampler is reading exactly
   where the app told it to.
2. **The additive glow washes bright ramp values toward white.** GOOG, MSFT,
   IBM and COST all sample *lighter and less saturated* than the model colour
   in a consistent direction (`#ff7a73`→`#ffa69c`, `#ff948e`→`#dbaea5`,
   `#7af4aa`→`#8fe6c6`, `#e3b65c`→`#ffec79`). The `glow` pass is additive at
   0.16 width over a 0.09-width opaque core, so it adds the trail's own hue on
   top of the core wherever the two overlap.
3. **The core is thinner than a pixel at the OVERVIEW camera for the outer
   orbits.** CBRS's crop is a literal one-pixel-tall line across a black field,
   and its whole neighbourhood is a uniform `#995047` — a partial-coverage
   blend of `#ea544d` with the void, which is why it reads 33.90 ΔE *darker*
   rather than lighter. NBIS shows the same effect more mildly at 8.74.

**Required change.** Make rendered trail pixels match `rampForWeekly()` within
ΔE 8 for every fixture and restore monotonic lightness ordering within each
direction. Do not change the verifier, its thresholds, or its sample points to
achieve this. The three mechanisms above are leads, not a prescribed fix;
ASML's misplaced sample point is the one that must be understood first, because
it is the only holding whose failure the colour pipeline cannot explain.

---

### F2 — `BLD-04`, high. The route-owned long task still breaches 50 ms, and it is shader compilation.

`measure-long-tasks.mjs`, unmodified, five fresh 1440×900 CPU-2× contexts, not
baseline-subtracted (`claude-review-3/raw-long-tasks-BLD-04.txt`):

```
run 1  maximumMs 61      run 4  maximumMs 55
run 2  maximumMs 57      run 5  maximumMs 55
run 3  maximumMs 55      overall maximumMs 61
```

Five of five breach the ceiling. Unchanged within noise from round 2
(62/56/56/56/57) and round 1 (57–61).

**Attribution.** Round 2's required change was to attribute the task before
changing anything else; the implementer attributed it to batched texture
binding and staggered the uploads across frames, and the gate did not move. So
this review attributed it directly, with a CDP CPU profile on the same rig
(`claude-review-3/raw-long-task-attribution.json`,
`claude-review-3/scripts/attribute-long-task.mjs`).

Inside the 68 ms breaching window:

```
34.3 ms  N                  @ chunks/2tdjt19k1le0z.js:357
 4.7 ms  (garbage collector)
 2.8 ms  getParameters      @ chunks/2tdjt19k1le0z.js:357
 2.2 ms  renderBufferDirect @ chunks/2tdjt19k1le0z.js:381
```

and across the 700–900 ms bins where the task lands, `N` at that same line
holds ~50 ms of self time alongside `getProgramCacheKey`. Line 357 of that
chunk is Three.js's `WebGLPrograms` — **shader program acquisition,
cache-key construction and compilation.** `texSubImage2D` never exceeds 2.5 ms
in any 100 ms bin.

The round-2 change was therefore correct and irrelevant: texture upload is no
longer a cost, and never was the breaching one.

**Required change.** Bring the route-owned long task under 50 ms across five
fresh contexts, working from the shader-program attribution above. Do not
baseline-subtract, redefine the gate, or add a post-processing pass. The
material/program permutation count and when programs are first compiled are
what the profile points at.

---

### F3 — `DEF-02`, high. Mark chirality regressed: 6 of 8 worlds now fail.

`capture-live-sphere-strip.mjs`, unmodified, aborts with
`COST chirality failed: normal=-0.4561 mirrored=-0.4153`.

Non-throwing full table
(`claude-review-3/raw-strip-chirality-full-table.json`):

| World | normalScore | mirroredScore | pass | round 2 |
|---|---|---|---|---|
| ASML | +0.1086 | −0.1911 | pass | pass |
| GOOG | +0.0932 | −0.2425 | pass | pass |
| COST | −0.4562 | −0.4154 | **fail** | fail |
| MSFT | −0.5005 | +0.3117 | **fail** | fail |
| IBM | −0.0020 | +0.0037 | **fail** | fail |
| INTC | +0.1614 | +0.1643 | **fail** | fail |
| CBRS | −0.1557 | −0.0455 | **fail** | *pass* |
| NBIS | +0.3887 | +0.3901 | **fail** | *pass* |

**This is a regression.** Round 2 failed 4 of 8; the round-3 candidate fails 6
of 8, with CBRS and NBIS moving from pass to fail. MSFT's decisive mirror
signal is essentially unmoved (−0.4784/+0.2493 → −0.5005/+0.3117), which means
the alpha-mask compositor change — separating the tint and alpha-join Sharp
pipelines so the pre-flopped mask survives — did not alter the chirality of the
mark that actually reaches the screen.

IBM (−0.0020/+0.0037), INTC (0.1614/0.1643) and NBIS (0.3887/0.3901) fail
*inside noise*: their mark carries almost no measurable luminance signal in the
band the verifier samples, so the comparison there is not a mirror measurement
at all. That is a second, separable problem from MSFT's genuine inversion.

`TST-04` passes — the verifier is correct — so this remains a
texture-generation defect.

**Required change.** Make `normalScore > mirroredScore` hold for all eight
worlds as measured by the section's own verifier. MSFT is the unambiguous
mirror case and the right place to start; the three near-zero worlds need the
mark to produce a measurable signal before their result means anything. Do not
weaken the assertion.

---

### F4 — `VIS-12`, high. Two-thirds closed; three bays still print their question twice.

**Closed this round.** `capture-live-evidence.mjs` ran end to end and
reproduced all 16 `after/` surfaces plus both `mobile/` captures. A live
geometry probe (`claude-review-3/raw-manifest-vis12.json`) measures **0 px
horizontal overlap** between every CONTRIBUTION numeral and its signed bar
across all 13 rendered rows, and every value is fully legible in the retained
`mission-control-manifest-1440x900.png` (`-3.1%`, `-0.5%`, `+0.5%`, `+0.5%`).
The round-2 defect that hid one character of every public financial value is
fixed.

**Still open.** Round 2's required change was to render *each active bay's*
question exactly once. Only MANIFEST was fixed. Locating every rendered
instance of each question text per active station
(`claude-review-3/raw-question-duplicates.json`):

| Station | instances | where |
|---|---|---|
| plot | 1 | `operationsBay > p.bayQuestion` |
| manifest | 1 | `operationsBay > p.bayQuestion` |
| **scope** | **2** | `operationsBay > p.bayQuestion` **and** `railStations > a > span` |
| **hazard** | **2** | `operationsBay > p.bayQuestion` **and** `instrumentStrip > a > span` |
| **signals** | **2** | `operationsBay > p.bayQuestion` **and** `instrumentStrip > a > span` |
| comms | 1 | `operationsBay > p.bayQuestion` |
| log | 1 | `operationsBay > p.bayQuestion` |

This is the same structure the round-2 finding described for MANIFEST — a
persistent rail/strip element plus the active bay — and the same
active-panel suppression already applied to PLOT and MANIFEST closes it.

**Required change.** Suppress the persistent rail and instrument-strip question
for SCOPE, HAZARD and SIGNALS while that bay is the active one, then re-run
`capture-live-evidence.mjs`. Nothing else in `VIS-12` is outstanding.

---

## 3. Criteria substantiated at this candidate

Reviewer results established or re-established this round, against the
round-3 candidate:

| Criterion | Result | Basis |
|---|---|---|
| `BLD-01` | **pass** | `npm test` re-run independently, 526/526 |
| `BLD-02` | **pass** | `npm run build` re-run independently, exit 0 |
| `VIS-01` | **pass** | live sphere-strip after the full texture regeneration; all eight equatorial means inside [0.16, 0.55] (0.1968–0.4358), zero failures |
| `TST-04` | **pass** | the retained capture measures per-world luminance *and* asserts chirality; it is the chirality assertion that aborts |
| `MOB-01` | **pass** | 390×844 and 320×844: `canvas` 0, `scrollWidth === clientWidth`, 27 targets, minimum target 44 |
| `TST-03` | **fail** | F1 |
| `DEF-02` | **fail** | F3 |
| `BLD-04` | **fail** | F2 |
| `VIS-12` | **fail** | F4 |
| `VIS-04` | **blocked** | its ramp-lightness half *is* TST-03, which fails |
| `DEF-03` | **blocked** | the visible-trail half is confirmed live (COST, null weekly, visible minimum-arc trail); the flat-token half sits inside TST-03's failing set at ΔE 12.29 |

## 4. Criteria not performed this round

These carry reviewer results from round 2 at candidate `3d1882a`, or remain
`not_run`. They are explicit work for the next review, not implicit passes.

- **Carried from round 2, not re-run at this candidate:** `DEF-05`, `DEF-08`,
  `DEF-09`, `DEF-10`, `BHV-01`, `BHV-02`, `BHV-03`, `BHV-04`, `BHV-08`,
  `VIS-03`, `VIS-09`, `MOB-03`, `ACC-03`, `ACC-05`, `ACC-06`, `ACC-07`. The
  candidate diff since `3d1882a` is bounded (trail material and width, staggered
  texture binding, the MANIFEST question suppression, the contribution-cell
  split, and all 24 regenerated KTX2 maps), and the full capture matrix ran
  end to end without regression in any of these surfaces, but none was
  independently re-exercised this turn.
- **Never performed:** `DEF-01`, `DEF-04` (visible-body half only; its pointer
  and keyboard halves are confirmed), `DEF-06`, `DEF-07`, `BHV-05`, `BHV-09`,
  `BHV-10`, `VIS-02`, `VIS-06`, `VIS-07`, `VIS-08`, `VIS-10`, `VIS-13`,
  `VIS-14`, `BLD-05`.

A live Mission Control layout measurement was attempted for `VIS-08` and is
retained (`claude-review-3/raw-mission-control-layout.json`), but it could not
distinguish the dominant PLOT chassis from the active-bay container reliably
enough to grade the criterion, so `VIS-08` is recorded as not performed rather
than guessed. The type scale it did read — 64px present as the day readout,
then 16 / 12 / 11.5 / 11 / 10.6 / 10.4 / 9 — is retained for the next round.

## 5. Scope discipline

No new criteria and no advisory findings were introduced. Every finding above
cites a declared acceptance criterion and stays inside the round-2 finding's
own required change. Several things were noticed in the retained surfaces that
are *not* raised here because no §10 criterion currently covers them as
written; if the owner wants them, they are new scope, not §10 findings.

`.env*` was never read, printed, edited, staged, or committed. No deployment
command was run. No application source was changed by this review.
