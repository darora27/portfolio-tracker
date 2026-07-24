# Phase 10 §1 handoff: Claude Refiner → Devan (blocked, not routed to Codex Acceptance)

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Status

Section §1 remains **not accepted**. This pass implemented the exact fix
directed for the single remaining Engineering Reliability finding in
`docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation-2.md`,
but the measured result still fails the declared long-task gate. This is
reported directly to Devan, not resubmitted to Codex Acceptance, because
the acceptance criterion is not met and choosing a further strategy is a
scope decision this pass is not authorized to make on its own.

## What was fixed

Removed `DepthPullProvider` from the unconditional root-layout path
(`src/app/layout.tsx`) and placed it only around the three routes
confirmed (via repo-wide grep) to actually consume it — `/`, `/share`,
`/dev/surface-scratch` — using a Next.js route group with its own nested
layout (`src/app/(depth-pull)/layout.tsx`). No baseline subtraction was
used anywhere and the 50 ms absolute per-task boundary was not changed.

This is a real, verified improvement, confirmed via `tsc --noEmit`,
`vitest run` on `DepthPull.test.tsx`/`observatory-fallback.test.ts`
(14/14), full `npm test` (310/310, 54 files), `npm run build` (16 routes,
unchanged route list), and `curl` 200-status checks on `/`, `/share`,
`/dev/surface-scratch`, `/dev/phase10-spike-css`, and `/dashboard` against
a rebuilt production server.

## Why it doesn't close the finding

Re-measuring `/dev/phase10-spike-css` on the same phone profile (Moto G4 +
CDP CPU 4x + Slow 4G), 5 repetitions, authenticated, grading every
individual `longtask` entry against the absolute 50 ms boundary (no
subtraction): **all 5 runs still contain a task over 50 ms** (66–72 ms;
run 1 has two: 57 ms and 72 ms). Full raw data, per-task attribution, and
resource-timing correlation:
`docs/phase10-spike-section-1/raw/css-longtask-final.json`. Script:
`docs/phase10-spike-section-1/measure-css-longtask-final.mjs`.

The task correlates precisely with the network response of
`_next/static/chunks/3hdj40qmts5sf.js` (React DOM's
`hydrateRoot`/`createRoot` entry points, confirmed by `grep` on the built
chunk) — the same chunk round 2 implicated. But `/dev/phase10-spike-css`'s
authenticated branch (the only branch these measurements exercise) renders
**zero** client components of its own; `DepthPullProvider` is no longer in
its tree at all. The chunk still loads and still costs the same ~60-70ms
under 4x CPU throttle regardless. This means the round-2 root-cause finding
was incomplete: `DepthPullProvider` was *a* source of avoidable hydration
weight (now correctly fixed), but not *the* cause of this specific task —
the cost appears to be Next.js/React's own App Router client bootstrap,
present on this route independent of any component the route or its
layouts render. Full writeup:
`docs/phase10-spike-section-1/DECISION.md`, "Provider-placement root-cause
fix, and why the long-task gate still fails (round 3)".

## Decision needed

This pass did not attempt to change the performance threshold, revive a
baseline-differential predicate, or investigate Next.js/Turbopack chunk
internals — all out of the bounded scope given. Options for how to proceed
belong to Devan:

1. Investigate further whether this chunk load is avoidable at the
   application level (would need to stay bounded and not become a general
   audit).
2. Reconsider whether an absolute whole-page long-task gate is the right
   acceptance criterion for a route inside an App Router app that ships a
   baseline client runtime regardless of page content — this is a policy
   question, not something a remediation pass can decide for itself.
3. Accept CSS 3D over R3F on the strength of the other passing criteria
   and the already-established ~120ms-median cost gap, treating this one
   long-task gate as not decisive.

## Cleanup performed

`playwright` was installed temporarily (`npm install --no-save`) for this
pass's measurement and uninstalled afterward;
`git diff --quiet package.json package-lock.json` confirmed no diff. The
temporary production server (port 3100) was stopped and confirmed via
`lsof`. `OWNER_PASSWORD` was a temporary random literal on the process
command line; no `.env*` file was read, printed, edited, staged, or
committed. §2 was not started and no other §1 passing result was touched.
