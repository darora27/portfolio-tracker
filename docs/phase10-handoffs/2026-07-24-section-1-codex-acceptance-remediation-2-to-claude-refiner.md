# Phase 10 §1 handoff: Codex Acceptance final re-review → Claude Refiner

Prepared July 24, 2026 by `codex/gpt-5`.

## Status

Section §1 remains **not accepted**. Return only the bounded Engineering
Reliability finding below to Claude Refiner. Do not begin §2.

Final re-review:
`docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation-2.md`

## One bounded failure

The corrected frame measurement, phone throttling, R3F cleanup, tests, and
build pass. The remaining blocker is only the long-task acceptance method.

All five CSS content runs contain one 67–80 ms long task. Round 2 changes
the graded metric from the previously declared absolute `0 tasks > 50 ms`
to a difference between aggregate content-page and unauthenticated-page
long-task durations. That subtraction is not a per-task RAIL measurement:

- the unauthenticated baseline hydrates a different `"use client"`
  `LoginForm` tree;
- the content and baseline groups are independent sequential runs;
- the retained script/raw data omit the claimed attribution/resource trace;
- the new predicate first enters Git in the same commit as its passing data;
- the R3F paired deltas have a 120 ms median, not the documented 119 ms.

The shared-hydration explanation is plausible, but the retained evidence
does not independently prove it or turn the absolute CSS task into a pass.

## Required refinement

1. Commit the exact next-run long-task predicate before measuring.
2. Keep authentication, route payload, semantic DOM, and client boundaries
   constant while toggling only the compared spatial layer, or retain a
   sanitized trace that causally separates shared hydration and layer work.
3. Keep the 50 ms per-task boundary unchanged and grade individual tasks
   against it. If an incremental metric is also useful, define it separately;
   do not call a difference of aggregate durations a task count.
4. Retain the attribution evidence, raw runs, exact calculation, and script.
5. Correct the R3F differential median.
6. Recreate R3F only as needed, then remove its route and temporary
   dependencies and rerun tests/build/cleanup checks.

The frame-stability finding is closed: all 20 retained arrays have exactly
60 samples, zero deltas above 33.4 ms, and a maximum of 16.8 ms. Do not widen
this handoff into unrelated frame, UI, `/share`, `/`, or §2 work.

Preserve every other passing §1 behavior. Do not access environment-file
contents and do not deploy.
