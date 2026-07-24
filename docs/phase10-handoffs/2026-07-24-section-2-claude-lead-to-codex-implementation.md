# Phase 10 §2 handoff: claude-lead → codex-implementation

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Outcome

Spec ready for implementation.

## What this turn did

Read `PHASE10_STATE.json` (stage `specify`, section §2), `PHASE10.md` §2,
`PRODUCT_DIRECTION.md`, and `docs/PHASE10_UX_ARCHITECTURE.md`'s §2/§4/route
sections for the `/share` Pulse job. Read the current implementation
(`src/app/(depth-pull)/share/page.tsx`, `SurfaceActs.tsx`,
`SurfaceGrowthChart.tsx`, `src/lib/dashboard-data.ts`,
`src/lib/surface-copy.ts`, `src/components/observatory/ObservatoryShell.tsx`,
`src/lib/observatory/chapters.ts`, and the §1 preview route
`src/app/dev/observatory-shell/page.tsx`) to ground the spec in real,
already-available data and existing conventions rather than inventing new
plumbing.

Wrote `docs/phase10-workflow/specs/section-2.md`: exact scope (wire the §1
`ObservatoryShell` into production `/share` with real content for the Pulse
chapter only — Forces/Structure/Timeline/Lab stay on the shell's own existing
placeholder, per §3's phasing), deterministic and unit-testable lead/driver
copy rules built on `getDashboardData()`'s existing `twrPct`,
`benchmarkComparisons`, and `positionRows[].contribution` fields (no new
`DashboardData` fields needed), the missing chart text/data alternative
(confirmed by direct read that `SurfaceGrowthChart` has none today), and all
seven `PHASE10.md` acceptance dimensions restated as concrete, numbered,
checkable requirements specific to this section. No implementation source was
touched.

Updated `PHASE10_STATE.json`: `stage` → `implement`, `role` →
`codex_implementation`, `next_actor` → `codex`, `section.spec_doc` → the new
spec path, `prev_actor_commit` → `359d25b` (this turn's own starting `HEAD`).
Ran `node scripts/phase10-validate-state.mjs` — exit 0.

## Evidence

- Commit: `0515874` — `phase10(§2): specify /share Pulse vertical slice`
- Tests: not run — spec-only commit, no implementation source changed.
- Build: not run — spec-only commit, no implementation source changed.
- Screenshots: none — this is a spec doc, not a UI section.
- Spec doc: `docs/phase10-workflow/specs/section-2.md`

## For the next actor

Codex Implementation: read `docs/phase10-workflow/specs/section-2.md` in
full before touching any file. Implement exactly to that spec — do not widen
scope into Forces/Structure/Timeline/Lab content, do not touch
`/share/full` or the private `/` route (both explicitly out of scope in the
spec's §1). Run `npm test` and `npm run build` and confirm both green before
your `implement`-stage commit. Capture the before/after 1440×900 and 390×844
screenshots called for in the spec's §7 under
`docs/phase10-baseline/section-2/`. When done, update
`PHASE10_STATE.json` (`stage` → `review`, `role` → `claude_lead`,
`next_actor` → `claude`, `section.implementation_commit` → your commit hash),
run the validator, and commit with `phase10(§2): <summary>` per
`docs/phase10-workflow/prompts/codex-implementation.md`.

## Decision needed (only if status = blocked)

Not applicable — this turn completed normally.
