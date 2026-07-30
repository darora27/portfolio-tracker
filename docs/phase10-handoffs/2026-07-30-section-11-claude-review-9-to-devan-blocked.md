# Phase 10 §11 handoff: Claude Lead (review turn 9) → Devan

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

blocked — `BLD-04` remains the section's sole open item, and closing it now
requires a decision only you can make.

## What this turn did

- Independently ran `npm test` (107 files, 553 tests, zero failures) and
  `npm run build` (exit 0, 18/18 pages, `/share` smoke pass) against
  candidate `5d91b6e815c1443012031dbe6eba8d1b547790ef` (remediation turn 9's
  further `OrreryScene.tsx` chunking).
- Confirmed via `git diff --stat cbcc9b3 5d91b6e` that the only
  application-source change is the six new `nextConstructionFrame` yield
  points the handoff described — no scope drift.
- Re-measured `BLD-04` independently rather than accepting the implementer's
  numbers (required for any carried criterion): the unmodified
  `measure-long-tasks.mjs`, 3 batches across 2 separate fresh production
  server processes (matching review turn 8's method). Batch A (port 4400,
  first invocation): `59, 0, 0, 0, 0` ms — **FAIL**. Batch B (same process,
  second invocation): `0, 0, 0, 0, 0` — pass. Batch C (second, fully
  separate fresh process, port 4500): `0, 0, 0, 0, 0` — pass. **1 of 3
  batches (15 fresh contexts) breaches** the unchanged `<50ms` gate. Per the
  no-cherry-picking carried-criteria rule (the same rule review turn 8
  applied), graded **FAIL**.
- This does corroborate real, measured progress: review turn 8 found 2 of 3
  batches breaching; this turn finds 1 of 3, in the same range as the
  implementer's own 1-of-9 re-measurement. Progress, not elimination.
- Independently read (did not re-run) the implementer's three diagnostic
  scripts (`stage-correlate-diag.mjs`, `trace-long-task-diag.mjs`,
  `control-long-task-diag.mjs`) and their raw output. The instrumentation
  and control page are sound, and the diagnosis — that the residual breach
  originates in a pre-mount Next.js RSC/hydration bootstrap script,
  400–650ms before `OrreryScene`'s own construction stage begins, not in
  scene-construction code at all — is well-supported and independently
  plausible given this turn's own single, higher (59ms), environment-
  sensitive breach.

## Why this isn't routed to another remediation round

Six chunking rounds (`LT-01`, remediation-3, remediation-4, remediation-9,
plus two carried from §10) have taken the original ~65ms task down to an
occasional environment-sensitive breach whose own root-cause investigation
places it **outside** `OrreryScene.tsx` entirely — before the component's
effect has even run. A seventh chunking attempt has no diagnosed mechanism
by which it could touch a task that starts upstream of scene construction.

The two paths that remain are:

1. **An architecture-level fix** — code-splitting the 3D world behind
   `next/dynamic({ ssr: false })`, or shrinking the initial RSC payload —
   which changes the route's loading behavior and is outside "fix this
   finding, no unrelated scope" for a bounded remediation turn.
2. **An owner-approved, scoped, non-generalizing exception** to the `<50ms`
   gate for this specific pre-mount bootstrap cost, structurally similar to
   (but not the same as) the non-precedential §1 exception for an analogous
   shared-bootstrap long task.

Both are scope/gate decisions, not code fixes. `single_provider_mode`'s
reserved list is explicit that "any gate change" waits for Codex, and
`BLD-04`'s own finding text has said `must_wait_for_codex` since review turn
8. Routing this back to `codex_implementation` — which, under
`single_provider_mode`, is still a Claude Code turn covering that role —
would mean the same model authoring and grading a gate exception with no
independent second-model check, which is exactly what that reserved list
exists to prevent. This is the same class of decision review turn 6
identified for `BHV-31`/`MOB-11` (a spec question no further measurement
resolves) and routed straight to you rather than to remediation.

## Decision needed (status = blocked)

**Which path do you want for `BLD-04`, given `single_provider_mode` is still
active (OpenAI quota not yet restored)?**

- Authorize the architecture-level fix as new, explicitly-scoped work (which
  route/loading-behavior change, and whether it's this section's scope or a
  later one)?
- Grant a scoped, non-generalizing exception now, understanding that doing
  so without Codex's independent check is a deliberate departure from the
  reserved-list rule you adopted?
- Wait until `single_provider_mode` lifts before deciding either, and hold
  `BLD-04` open/carried in the meantime?

Once you decide, the next turn can act on it directly — no further
measurement is needed to make this decision; the diagnosis is complete and
independently corroborated.

## Evidence

- Candidate commit: `5d91b6e815c1443012031dbe6eba8d1b547790ef` —
  `phase10(§11): remediate BLD-04-1 — chunk further, root-cause pre-mount hydration`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `BLD-04.reviewer` → `fail`, `candidate_sha` updated
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own run)
- Build: `npm run build` — exit 0, 18/18 pages, `/share` smoke pass (this
  turn's own run)
- `BLD-04` re-measurement:
  `docs/phase10-baseline/section-11/raw-review-9-bld04-longtasks.json`
- Root-cause diagnostics (implementer's, independently read/assessed, not
  re-run): `docs/phase10-baseline/section-11/scripts/stage-correlate-diag.mjs`,
  `.../trace-long-task-diag.mjs`, `.../control-long-task-diag.mjs`
- Review doc: `docs/phase10-workflow/reviews/section-11-review-9.md`
- Inherited red: none
- Both test servers (ports 4400, 4500) confirmed stopped via `lsof` before
  this commit.

## Route after this handoff

- Section: `§11`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`
