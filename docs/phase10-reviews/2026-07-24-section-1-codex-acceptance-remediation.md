# Phase 10 §1 Codex Acceptance re-review

Reviewed July 24, 2026 by `codex/gpt-5`.

Scoped commit chain:

- Builder: `507265d6e3427a414f2e2844d8513243ef348198`
- Critic: `bb57bd8eb26ea1c1889e34a961575e839aee57fe`
- Prior refiner: `3887bed60aea9ee82bae0a8f3c58f627a5d6e1d0`
- Prior bookkeeping: `6f92aaa3ce0425efc02aaa7e60dbc477905fb751`
- Acceptance fail review: `dc8d5ab55b82da7dbebb71f409155fa227e5eb49`
- Remediation implementation: `290ce5f5416394786cf1d34516e9d8de301e1ea0`
- Remediation bookkeeping/handoff:
  `dfb654d8993541bab1a863b084689b303ea839f1`

Commits `9cf4ee3` and `bf98491` are unrelated work and receive no §1
credit. The prompt's `bfb8491` does not resolve in this repository; the
actual commit already excluded by the prior review is `bf98491`.

## Result

**FAIL — return one bounded Engineering Reliability finding to Claude
Refiner. Do not begin §2.**

The remediation closes the representative-phone and retained-artifact
gaps: the named Moto G4 profile is genuinely mobile-emulated and
throttled; five raw runs per route are retained; the measurement script
is retained; the R3F patch applies cleanly; and the final application
tree remains CSS-only with no R3F route or direct temporary dependency.

Section §1 still cannot pass because the chosen CSS path fails one of the
explicitly declared performance thresholds in every retained phone run.
The frame-stability PASS is also not evaluated against the predicate
written in the threshold table.

## Remediation verification

| Required remediation | Result | Independent evidence |
|---|---|---|
| Explicit thresholds before measurement | **PARTIAL** | Six explicit thresholds are present and the handoff states they were written before the run. Thresholds and results first enter Git together in `290ce5f`, so the pre-run chronology is attested rather than independently timestamp-provable. |
| Representative phone profile | **PASS** | Raw output and script use Playwright's Moto G4 descriptor: 360×640, DPR 3, mobile UA, `isMobile`, touch, 4× CPU slowdown, and Slow 4G (150 ms RTT, 1.6 Mbps down, 750 Kbps up), five fresh contexts per route. The desktop-emulation limitation is disclosed. |
| Sanitized raw per-run results | **PASS with one evidence limitation** | Five CSS and five R3F runs are retained. Independent recomputation matches the reported load, long-task, memory, and interaction summaries. Per-frame deltas are not retained, so the written `≤16.7 ms` frame predicate cannot be recomputed. |
| Retained measurement script | **PASS** | The script contains the named profile, throttling, fresh-context repetition loop, CDP memory collection, long-task observer, frame sample, interaction test, and sanitized output shape. |
| Retained R3F source patch | **PASS** | `git apply --check docs/phase10-spike-section-1/r3f-spike.patch` passes and the patch reconstructs all five isolated R3F route files. |
| Production cleanup | **PASS** | The R3F route is absent and returns 404. `npm ls three @react-three/fiber @types/three playwright --depth=0` is empty. No §1 source or package manifest differs from `6f92aaa`. |

## Full §1 acceptance dimensions

| Dimension | Result | Evidence |
|---|---|---|
| Behavioral | PASS | Five real chapter links, stable URL state, preserved `mode`/`no3d`, direct links, click/back/forward synchronization, and focus restoration passed live. |
| Visual | PASS | All 13 images have their documented dimensions and were visually inspected. The CSS orbit, inspector, observation plate, and shell concentric fallback remain recognizable. |
| Mobile | PASS | Live 390×844 and 320×844 checks had matching client/scroll widths, 350×44 and 280×44 targets respectively, an intentional flat layout, and the concentric fallback. |
| Accessibility | PASS | One `h1`, one named nav, five native anchors, one current link, one active article, focused active `h2`, no concentric-map focus stops, source/test parity for reduced motion and forced no-3D, and 4.88:1 freshness contrast. |
| Tests | PASS | Current HEAD: 54 files and 310/310 tests passed. The 19 tests from excluded commits receive no §1 credit; §1 source is unchanged from the prior accepted implementation checks. |
| Build | **FAIL (performance-budget subcriterion)** | Next.js 16.2.11 compiled, TypeScript passed, and 16 route tasks generated. The chosen CSS route nevertheless fails its declared zero-long-task budget in all five phone-profile runs. |
| Privacy | PASS | Both retained routes gate logged out; unauthenticated raw HTML contains zero strict two-decimal currency values and no owner/private marker; public/private shell isolation passes; no environment-file contents were accessed or output. |

## Scorecard

| Category | Result | Diagnostic | Evidence |
|---|---|---:|---|
| Product alignment | PASS | 5/5 | Field Journal structure and the three borrowed Night Orbit parts remain present; observation/not-advice and public/private boundaries are intact. |
| Hierarchy | PASS | 4/5 | One selected chapter, inspector, and active plate dominate; the shell is not a card wall. |
| Usefulness | PASS | 5/5 | URL/query state, history, focus, freshness, scope, and retained controls remain useful and valid. |
| Originality | PASS | 4/5 | The orbit is real chapter navigation and the implementation uses no copied branding, assets, or trade dress. |
| Accessibility and mobile | PASS | 5/5 | Semantic state, visible focus, genuine phone layouts, touch targets, fallback, and contrast pass. |
| Engineering reliability | **FAIL** | 3/5 | Source cleanup, reproduction material, phone profile, tests, build compilation, privacy, and console checks pass; the chosen approach does not meet every declared budget and the frame PASS uses a different predicate from the table. |

## Smallest complete blocking finding

### 1. The chosen CSS path does not meet its declared phone-performance budgets

- **Category:** Engineering reliability
- **Criterion:** `PHASE10.md` §1 Build acceptance requires the chosen
  approach to meet recorded performance/bundle budgets.
- **Evidence:** The declared long-task threshold is `0 tasks > 50 ms`.
  Every retained CSS run records exactly one long task, totaling 66–70 ms
  (median 68 ms), so CSS is 0/5 against that threshold. Separately, the
  frame threshold says at least 55/60 frames must be `≤16.7 ms`, while the
  script only counts deltas `>33.4 ms` and retains only
  sample-count/average/max/dropped summaries. Those predicates are not
  equivalent, so the reported frame PASS cannot be independently checked
  against the declared threshold.
- **Impact:** The evidence now proves representative-phone behavior, but it
  also proves the selected approach fails a release budget. Marking §1
  accepted would directly contradict the §1 Build gate. The mismatched
  frame predicate also weakens the required threshold-by-threshold
  evidence.
- **Required change:** Before a fresh run, commit or otherwise retain the
  exact thresholds so their pre-run state is independently auditable.
  Instrument and address the CSS long task so the selected route passes
  every declared threshold. Make the frame predicate and script identical
  (either count/retain the `≤16.7 ms` samples or prospectively declare and
  measure the `>33.4 ms` dropped-frame predicate). Retain the new raw data,
  then remove temporary R3F code/dependencies and rerun tests, build,
  privacy, and cleanup checks.
- **Verification:** Five fresh-context phone-profile runs show CSS PASS
  against every predeclared metric, the retained raw data can recompute
  each PASS exactly, the R3F comparison remains reproducible, and the
  final production tree remains CSS-only and green.

## Independent verification summary

- `npm test`: 54 files, 310/310 passed.
- `npm run build`: compiled successfully; TypeScript passed; 16 route
  tasks generated.
- Browser console on retained routes: 0 warnings, 0 errors.
- `/dev/phase10-spike-r3f`: 404.
- Temporary localhost server stopped after review.
- No implementation source changed. No §2 work started. No deploy.
