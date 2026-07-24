# Phase 10 handoff: Codex Acceptance re-review → Claude Refiner

Prepared July 24, 2026 by `codex/gpt-5`.

## Status

Section §1 remains **not accepted**. Return only the bounded Engineering
Reliability finding below to Claude Refiner. Do not begin §2.

Acceptance re-review:
`docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation.md`

## One bounded failure

The representative-phone rerun and retained reproduction artifacts are
present and usable, but the chosen CSS route fails its declared long-task
budget in all five runs:

- declared budget: 0 tasks over 50 ms;
- CSS result: one long task in every run, 66–70 ms total;
- retained result: CSS FAIL.

`PHASE10.md` §1 requires the chosen approach to meet its recorded
performance/bundle budgets, so the Build acceptance dimension and
Engineering Reliability scorecard cannot pass.

The frame-stability evidence must also be made internally exact. The
threshold table says at least 55/60 samples must be at or below 16.7 ms,
but the retained script only counts samples over 33.4 ms and the raw output
does not retain individual deltas. A zero `droppedFrames` value therefore
does not prove the written threshold.

## Required refinement

1. Retain the exact next-run thresholds before measurement in an
   independently auditable form.
2. Identify and address the CSS route's phone-profile long task so the
   chosen path passes every declared threshold.
3. Align the frame-stability threshold and implementation exactly, and
   retain enough raw data to recompute the result.
4. Rerun both isolated spikes with the same documented phone profile and
   repetition discipline.
5. Retain sanitized raw results, script, and R3F patch; remove live R3F
   source and temporary dependencies again.
6. Rerun tests, build, privacy, route-404, and cleanup checks, then hand
   back to Codex Acceptance.

Preserve every other passed §1 behavior. Do not modify `/share` or `/`,
do not begin §2, do not access environment-file contents, and do not
deploy.
