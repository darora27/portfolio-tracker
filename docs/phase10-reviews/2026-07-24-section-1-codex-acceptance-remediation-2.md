# Phase 10 §1 Codex Acceptance final re-review

Reviewed July 24, 2026 by `codex/gpt-5`.

Scoped commit chain:

- Round-1 acceptance-remediation review: `ca7687f`
- Round-2 remediation implementation:
  `487f66ec6dfc1901d6e9db5f54f8984cccc2e34e`
- Immediate round-2 bookkeeping commit:
  `919e8e8f93cabec403e758ea5ad2bc3bd1c773e9`

Commits `9cf4ee3` and `bf98491` remain unrelated and receive no Phase 10
credit.

## Result

**FAIL — return one bounded Engineering Reliability finding to Claude
Refiner. Do not begin §2.**

The corrected frame measurement passes, all five content runs use the
documented representative-phone throttling, the retained R3F comparison
still fails, temporary R3F code/dependencies are absent, and current-HEAD
tests/build pass.

Section §1 still cannot pass because the long-task result is not a valid,
prospectively declared application of the retained 50 ms RAIL boundary.
The round-2 evidence subtracts aggregate long-task durations from a
different unauthenticated `LoginForm` client tree and then treats the
difference as though it were an individual-task result. The claimed
hydration attribution trace was not retained, and the new differential
predicate first appears in the same commit as its passing raw results.

## Required checks

| # | Required verification | Result | Exact evidence |
|---:|---|---|---|
| 1 | Attribute the 66–70 ms task to shared hydration, not CSS 3D | **FAIL** | The hypothesis is plausible: `src/app/layout.tsx` has wrapped every route in the pre-Phase-10 client `DepthPullProvider` since `5c8664a`, while the CSS spike page has no `"use client"` directive. But `DECISION.md` says the attribution/resource diagnostic was temporary and not retained. `measure-phone-v2.mjs` retains only long-task `startTime`/`duration`, then writes only count/total; it records no attribution entries, resource timing, chunk URL, or chunk-to-source evidence. The raw JSON therefore cannot independently establish that the observed task is the React hydration chunk rather than work coincident with it. |
| 2 | Validate shared-shell subtraction, consistent application, reproducibility, and non-retroactivity | **FAIL** | The baseline is not the same render with only the spatial layer removed: it is an unauthenticated response that hydrates the separate `"use client"` `LoginForm`, while the authenticated CSS route renders a different DOM/RSC tree. The script runs content and baseline as separate sequential five-run groups, then the document manually subtracts aggregate durations. Raw CSS totals are `[80,69,68,67,68]` ms and baseline totals are `[67,66,68,68,68]` ms, yielding paired differences `[13,3,0,-1,0]`; subtracting totals cannot prove that no individual task exceeded 50 ms. The original absolute predicate is committed in `290ce5f`; the differential predicate and the passing raw data first enter Git together in `487f66e`, despite the prior review requiring the next-run threshold to be independently auditable before measurement. The R3F paired differences recompute to `[120,118,121,119,122]` ms with a 120 ms median, not the documented 119 ms. |
| 3 | Keep the 50 ms RAIL boundary unchanged | **PASS for the numeric boundary; FAIL for its application** | The number 50 ms remains written in the round-2 table. However, the measured CSS pages still contain one absolute 67–80 ms task in all five runs. Relabeling the gate as “50 ms added” changes the graded quantity from an individual task to a difference between aggregate totals; it does not make the absolute RAIL task pass. |
| 4 | Correct frame-stability measurement and `>33.4 ms` predicate | **PASS** | The script captures exactly 60 deltas per run and computes `droppedFrames` with `d > 33.4`. Independent recomputation over all 20 arrays matches every retained count: 1,200 samples total, 0 above 33.4 ms, maximum 16.80000000000109 ms. The current decision grades `≤5 of 60` deltas above 33.4 ms, and its 0/60 PASS agrees with the script and raw data. The retained `≤16.7 ms` counts (32–48/60) are correctly labeled informational in the round-2 table. Although `>33.4` would not detect every possible single-vsync miss near 33.333 ms, that edge is immaterial to these runs because every retained delta is at most 16.8 ms. |
| 5 | Five Moto G4 runs use 4× CPU and Slow 4G | **PASS** | The script creates a fresh context for every repetition and calls `Network.emulateNetworkConditions` plus `Emulation.setCPUThrottlingRate({rate: 4})` on every page. Raw metadata records Moto G4, 360×640, DPR 3, mobile/touch, 4× CPU, 150 ms RTT, 1.6 Mbps down, and 750 Kbps up. Each of `css`, `cssBaseline`, `r3f`, and `r3fBaseline` has five runs. |
| 6 | Retained evidence supports independent reproduction | **FAIL for the blocking claim** | The v2 script, 20-run raw JSON, and R3F patch are retained; the JSON parses and the patch passes `git apply --check`. Those artifacts reproduce the aggregate comparison and frame result. They do not reproduce the asserted hydration attribution because its diagnostic code/output was deleted, nor do they establish a prospectively frozen differential threshold. |
| 7 | CSS passes every valid budget; R3F keeps its failures | **FAIL** | CSS passes load, frame, memory, interaction, and bundle figures, but fails the only prospectively declared long-task predicate in all five runs. The replacement differential is not a valid per-task application of that predicate. R3F remains a clear failure: 232,976 B added gzip JS versus 50 KB, plus 118–122 ms paired aggregate long-task deltas (120 ms recomputed median). |
| 8 | No temporary R3F production code/dependency remains | **PASS** | `src/app/dev/phase10-spike-r3f/` is absent; `git apply --check` proves the retained patch is recoverable; `npm ls three @react-three/fiber @types/three playwright --depth=0` is empty. No remediation commit changes `src/`, `package.json`, or `package-lock.json`. |
| 9 | Tests and production build pass | **PASS** | Independent current-HEAD `npm test`: 54 files, 310/310 tests. Independent current-HEAD `npm run build`: Next.js 16.2.11 compiled, TypeScript passed, and 16 static-page tasks generated; the R3F route is absent. |
| 10 | §2 has not started | **PASS** | `/share` and `/` are byte-identical to their pre-§1 state (`git diff --quiet 507265d^..HEAD -- src/app/share/page.tsx src/app/page.tsx`); neither imports the Observatory shell. Round-2 commits change documentation/evidence/state only. |

## Acceptance dimensions

| Dimension | Result | Evidence |
|---|---|---|
| Behavioral | PASS | Prior accepted chapter URL, history, focus, and semantic-control behavior is unchanged by the documentation-only remediation. |
| Visual | PASS | Prior accepted CSS/shell/fallback evidence is unchanged. |
| Mobile | PASS | Prior accepted 390×844 and 320×844 evidence is unchanged; the phone measurement uses the documented Moto G4 emulation. |
| Accessibility | PASS | Prior accepted navigation, focus, fallback, target-size, and contrast behavior is unchanged. |
| Tests | PASS | 54 files and 310/310 tests passed independently at `919e8e8`. |
| Build | **FAIL (performance-budget subcriterion)** | Compilation succeeds, but the chosen CSS page still has an absolute task over the prospectively declared 50 ms boundary in every run. |
| Privacy | PASS | No production source or public/private boundary changed; no environment-file contents were accessed or output during this review. |

## Scorecard

| Category | Result | Diagnostic | Evidence |
|---|---|---:|---|
| Product alignment | PASS | 5/5 | The accepted Field Journal/Night Orbit shell and boundaries are unchanged. |
| Hierarchy | PASS | 4/5 | The previously accepted single-stage hierarchy is unchanged. |
| Usefulness | PASS | 5/5 | The previously accepted URL, focus, freshness, and control behavior is unchanged. |
| Originality | PASS | 4/5 | The orbit remains semantic chapter navigation with no copied assets or trade dress. |
| Accessibility and mobile | PASS | 5/5 | The previously accepted semantic, focus, fallback, contrast, and narrow-layout behavior is unchanged. |
| Engineering reliability | **FAIL** | 3/5 | Frame data, throttling, cleanup, tests, and build are sound; long-task attribution and the replacement pass predicate are not independently valid or prospectively auditable. |

## Smallest complete blocking finding

### Establish one prospective, causally isolated long-task gate

- **Category:** Engineering reliability
- **Criterion:** `PHASE10.md` §1 requires the selected approach to meet
  recorded performance budgets with reproducible evidence.
- **Evidence:** All five CSS content runs retain a 67–80 ms task. The claimed
  shared-hydration attribution trace is not retained. The substitute baseline
  renders a different unauthenticated client tree, and subtracting independent
  aggregate totals does not evaluate the declared per-task 50 ms predicate.
  The substitute predicate first appears in Git with the passing results.
- **Impact:** The evidence can show that R3F is more expensive, but it cannot
  show that CSS meets the declared long-task release gate. Accepting §1 would
  approve a post-result metric change that is neither causally isolated nor
  independently auditable.
- **Required change:** Before measuring, retain the exact graded long-task
  predicate in a separate auditable commit. Use a controlled render that keeps
  authentication, route payload, semantic DOM, and client boundaries constant
  while toggling only the compared spatial implementation, or retain a
  sanitized trace that attributes each task sufficiently to separate shared
  hydration from comparison-layer work. Grade individual tasks against the
  unchanged 50 ms boundary; if an additional component-differential metric is
  useful, define it separately and do not represent a difference of aggregate
  durations as a task count. Rerun five fresh contexts per path, retain the
  attribution/raw output and exact calculation, correct the R3F median, then
  remove temporary R3F code/dependencies and rerun tests/build.
- **Verification:** A reviewer can rerun the retained procedure, reproduce the
  task attribution and PASS without changing the predicate after seeing data,
  verify every CSS run against the recorded gate, and confirm R3F cleanup,
  tests, and build.

## Independent verification summary

- Reviewed HEAD: `919e8e8f93cabec403e758ea5ad2bc3bd1c773e9`.
- `npm test`: 54 files, 310/310 passed.
- `npm run build`: compiled successfully; TypeScript passed; 16 route tasks.
- R3F patch: `git apply --check` passed.
- Direct temporary dependencies: absent.
- Worktree was clean before bookkeeping.
- No implementation source changed. No §2 work started. No deploy.
