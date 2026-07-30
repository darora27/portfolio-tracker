# Phase 10 §11 handoff: Codex Implementation (BLD-04-1 remediation, round 2) → Claude Lead (review)

Prepared July 30, 2026 by `claude-code/sonnet-5` (covering `codex_implementation`
under `PHASE10_LOCK owner=codex`, single_provider_mode).

## Outcome

Remediation complete, ready for re-review. `BLD-04-1` is **not closed** — this
turn made real, measured progress (headroom improved, and the finding's
"investigate and name the cause" alternative path is satisfied with rigorous
evidence) but does not claim a pass. Ledger `implementer.BLD-04` is
`deferred_to_reviewer`.

## What this turn did

- Read the finding (`BLD-04-1`) and the handoff from review turn 8. The
  required change offered two paths: establish real headroom below 50ms, or
  investigate and name the specific cause of this environment's marginal
  breaches.
- **Headroom**: split `OrreryScene.tsx`'s construction pipeline into six
  additional per-family `nextConstructionFrame` yield points not previously
  isolated — WebGL context creation + DOM setup, star population, nebula +
  aurora + weather wisps, moons, satellites, belt — following the exact
  pattern remediation-4 already established (each `await nextConstructionFrame()`
  resumes as a microtask within the *next* rAF task, so unyielded code between
  two yields is one atomic long-task candidate; these six spans previously ran
  unchunked).
- Re-measured the unmodified `measure-long-tasks.mjs` against the final code
  across two independent fresh production server processes (ports 4100 and
  4200): 9 batches / 45 fresh 1440×900 CPU-2x contexts. **8 of 9 batches
  clean, 1 batch had a single 51ms context.** This is a real, measured drop
  from review turn 8's documented 2-of-3-batches-breach rate — but not full
  elimination, so the criterion is not graded pass.
- **Root cause**: built `stage-correlate-diag.mjs`, which timestamps every
  `sceneConstructionStage` transition and cross-references it against each
  captured long task. Across every breach this turn observed with that
  instrumentation (11 breaches total, both at baseline overhead and under
  added `MutationObserver` overhead), **the long task's `startTime` falls
  400–650ms *before* the scene's own `"model"` construction stage begins** —
  i.e. before `OrreryScene`'s effect has run at all. Built
  `trace-long-task-diag.mjs` (CDP `Tracing`-based attribution; the tracing
  itself adds overhead, so this script is diagnostic-only, never used for
  grading) which corroborates this: the dominant event inside every captured
  breach window is `HTMLDocumentParser::RunScriptsForPausedTreeBuilder` →
  `EvaluateScript` → `V8.CompileScript`/`V8.ParseProgram` on an **inline
  script** (`notStreamedReason: "inline script"`) at the `/share` URL — this
  is Next.js's inline RSC/flight-payload bootstrap script being parsed and
  compiled by the HTML parser, not any Three.js/OrreryScene code. Built
  `control-long-task-diag.mjs` (a trivial static page, zero app JS, identical
  CPU-2x throttle) which recorded **zero** long tasks across 5 fresh
  contexts, ruling out generic environment/OS noise as sufficient explanation
  by itself.
- **Conclusion**: the chunking strategy pursued across LT-01, remediation-3,
  remediation-4, and this turn was only ever partially right about the
  mechanism. It measurably helps (real headroom gained each round), but the
  remaining marginal breach originates in the route's own React/Next.js
  hydration bootstrap, upstream of scene construction entirely. A full fix
  (code-splitting the 3D world behind `next/dynamic({ ssr: false })`, or
  shrinking the initial RSC payload) is an architecture-level, SSR/loading-
  behaviour change — outside "fix this finding, no unrelated scope" for a
  bounded remediation turn, and a gate-interpretation question the section's
  `must_wait_for_codex` list reserves for Devan. This is structurally similar
  to (but **not** invoked as, and not assumed equal to) the non-precedential
  §1 owner exception for an analogous shared-bootstrap long task — that
  exception was explicit that it sets no precedent for future audits, so this
  turn does not lean on it.
- Updated `docs/phase10-workflow/acceptance/section-11.json`:
  `implementer.BLD-04` → `deferred_to_reviewer` (schema does not allow `fail`
  as a complete implementer status), full evidence list, and notes covering
  both results above. Ran `npm run phase10:acceptance -- check <ledger>
  --require implementer` — valid.
- Ran `npm test` (107 files, 553 tests, zero failures) and `npm run build`
  (exit 0, 18/18 static pages, `/share` smoke pass) — both this turn's own
  independent runs, output retained.
- Changed **application source in one file only**:
  `src/components/observatory/orrery/OrreryScene.tsx` (six new yield points,
  no logic change). Also added three new retained diagnostic scripts and
  their raw evidence under `docs/phase10-baseline/section-11/`, the ledger
  update, this handoff, and `PHASE10_STATE.json`.

Note on filenames: an earlier, unrelated `F9`/`BHV-20` remediation handoff
from earlier in §11's history happens to be named
`...codex-remediation-9-to-claude-review.md` (the `9` there refers to finding
`F9`, not a round count). To avoid colliding with that historical file, this
turn's handoff uses `...codex-remediation-bld04-r2-to-claude-review.md`
instead.

## Evidence

- Candidate commit: recorded by the next turn via `git log` (this file cannot
  contain its own hash)
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `BLD-04.implementer` → `deferred_to_reviewer`
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run; `docs/phase10-baseline/section-11/raw-remediation-9-npm-test.txt`)
- Build: `npm run build` — exit 0 (this turn's own independent run;
  `docs/phase10-baseline/section-11/raw-remediation-9-npm-build.txt`)
- Long-task re-measurement (graded evidence, unmodified script):
  `docs/phase10-baseline/section-11/raw-remediation-9-longtasks-portA.txt`,
  `-portA-2.txt`, `-portB.txt`, `-additional-batches.txt`
- Stage correlation (diagnostic): `docs/phase10-baseline/section-11/scripts/stage-correlate-diag.mjs`,
  `docs/phase10-baseline/section-11/raw-remediation-9-stage-correlation.txt`
- CDP trace attribution (diagnostic, not graded): `docs/phase10-baseline/section-11/scripts/trace-long-task-diag.mjs`,
  `docs/phase10-baseline/section-11/raw-remediation-9-cdp-trace-attribution.txt`
- Control page (diagnostic): `docs/phase10-baseline/section-11/scripts/control-long-task-diag.mjs`,
  `docs/phase10-baseline/section-11/raw-remediation-9-control-trivial-page.txt`
- Inherited red: none

(The `raw-remediation-9-*` evidence filenames were chosen before the handoff
naming collision above was discovered; they do not collide with anything —
only the handoff document name did — so they were left as-is rather than
renamed.)

## For the next actor

Independently re-measure `BLD-04` per the carried-criteria no-assertion rule
(do not accept this turn's numbers without a fresh run). If the reviewer's
own measurement also shows a low-but-nonzero breach rate, the stage-
correlation and CDP-trace evidence in this turn's raw files should make it
straightforward to confirm the same pre-mount, inline-RSC-script signature
independently. Given the fully-diagnosed root cause is now outside
`OrreryScene.tsx`/scene-construction entirely, this looks like a case that
needs an owner decision (route-level architecture change, or an owner-
approved, non-generalizing scoped exception analogous to — but not identical
to — §1's) rather than another chunking attempt. Recommend routing to Devan
if the reviewer agrees the root cause is correctly identified and no further
same-turn remediation is likely to close it.

## Route after this handoff

- Section: `§11`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`
