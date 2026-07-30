# Phase 10 §11 review, turn 9 (claude-code/sonnet-5)

Candidate: `5d91b6e815c1443012031dbe6eba8d1b547790ef` —
`phase10(§11): remediate BLD-04-1 — chunk further, root-cause pre-mount hydration`
(remediation turn 9, on top of review turn 8's `cbcc9b3`).

## Scope

Review turn 8 left exactly one open finding, `BLD-04-1`, and explicitly noted
the ledger-hygiene reconciliation from that turn should not be re-litigated.
This turn verifies `BLD-04-1` only; no other criterion is expected to be
affected because the candidate's only application-source change is six new
`nextConstructionFrame` yield points inside `OrreryScene.tsx` (confirmed via
`git diff --stat cbcc9b3 5d91b6e` — the diff also touches only new
diagnostic scripts under `docs/phase10-baseline/section-11/`, the ledger, the
handoff, and state/context bookkeeping).

## Independent verification this turn

- `npm test`: 107 files, 553 tests, zero failures (this turn's own run).
- `npm run build`: exit 0, 18/18 pages generated, `/share` smoke check pass
  (this turn's own run).
- `npm run phase10:acceptance -- check <ledger> --require implementer`: valid.

## `BLD-04` (carried, high risk) — independently re-measured, still FAIL

Per the carried-criteria rule, the implementer's own numbers are not
accepted without a fresh, independent re-run. Ran the unmodified
`measure-long-tasks.mjs` three times across two separate fresh production
server processes, matching review turn 8's methodology exactly:

| Batch | Server | Per-context (ms) | Result |
|---|---|---|---|
| A | fresh process, port 4400 | 59, 0, 0, 0, 0 | **FAIL** |
| B | same process as A, second invocation | 0, 0, 0, 0, 0 | PASS |
| C | second, completely separate fresh process, port 4500 | 0, 0, 0, 0, 0 | PASS |

Full raw output: `docs/phase10-baseline/section-11/raw-review-9-bld04-longtasks.json`.
Both servers confirmed stopped via `lsof` before this commit.

1 of 3 independent batches (15 total fresh contexts) breaches the unchanged
`<50ms` boundary. Per the same no-cherry-picking rule review turn 8 applied,
the two clean batches cannot be cherry-picked over the one that breached —
graded **FAIL**, not pass.

This does corroborate the implementer's claim of real, measured improvement:
review turn 8 documented 2 of 3 batches breaching; this turn finds 1 of 3.
The implementer's own remediation-9 re-measurement (9 batches / 45 contexts,
1 of 9 breaching at 51ms) is in the same range. The single breach this turn
observed was higher (59ms) than the marginal 50–52ms breaches review turn 8
recorded — consistent with a task whose timing is environment-sensitive
rather than a fixed-cost regression, which lines up with the implementer's
root-cause diagnosis below rather than contradicting it.

### Root-cause diagnosis — independently assessed, not re-run

The implementer's remediation turn built three diagnostic scripts (not
graded, retained for evidence): `stage-correlate-diag.mjs` (timestamps every
`sceneConstructionStage` transition against captured long tasks, 11 breaches
observed, every one starting 400–650ms *before* `OrreryScene`'s own `"model"`
stage begins), `trace-long-task-diag.mjs` (CDP tracing; every captured breach
window is dominated by `HTMLDocumentParser::RunScriptsForPausedTreeBuilder →
EvaluateScript → V8.CompileScript/V8.ParseProgram` on an inline script at the
`/share` route — Next.js's inline RSC/flight-payload bootstrap, not
Three.js/OrreryScene code), and `control-long-task-diag.mjs` (a trivial
static page, identical throttle, zero long tasks across 5 contexts — rules
out generic environment noise as sufficient explanation alone).

I read all three scripts and their raw output rather than accepting the
narrative. The instrumentation and control page are sound: the stage-marker
timestamps are written synchronously at the start of each construction
phase, the long-task attribution is read from the unmodified
`PerformanceObserver` buffer the graded script also uses, and the control
page is a legitimate zero-app-JS baseline. The diagnosis — that the residual
marginal breach originates upstream of `OrreryScene`, in the route's own
hydration bootstrap — is well-supported by this evidence and independently
plausible given this turn's own timing (a single, environment-sensitive
59ms spike rather than a reproducible fixed cost).

### Why this does not go back to `codex_implementation`

Six chunking rounds (`LT-01`, remediation-3, remediation-4, remediation-9,
and the two before those already recorded in `§10`'s carried history) have
now converted the original ~65ms single task into an occasional
environment-sensitive breach whose own root-cause investigation places it
**outside** `OrreryScene.tsx` entirely. A seventh remediation attempt at
chunking scene construction further has no diagnosed mechanism by which it
could touch a task that starts before the scene's effect runs. The two
remaining paths are:

1. An architecture-level change — code-splitting the 3D world behind
   `next/dynamic({ ssr: false })`, or shrinking the initial RSC payload —
   which changes the route's loading behavior and is out of scope for a
   bounded "fix this finding" remediation turn.
2. An owner-approved, scoped, non-generalizing exception to the `<50ms`
   gate for this specific pre-mount bootstrap cost, structurally similar to
   (but not the same as, and not invoked by this turn) the non-precedential
   §1 exception for an analogous shared-bootstrap long task.

Both are scope/gate decisions, not code fixes, and both fall inside
`single_provider_mode`'s reserved `must_wait_for_codex` list ("the privacy
boundary, the financial math core, and **any gate change**"). `BLD-04`'s own
finding text has said "must_wait_for_codex" since review turn 8. Routing
this back to `codex_implementation` (which, under `single_provider_mode`, is
still covered by a Claude Code turn) would mean this same model authoring
and grading a gate exception with no independent second-model check —
exactly what the reserved list exists to prevent. This is the same class of
decision review turn 6 identified for `BHV-31`/`MOB-11` (spec questions no
amount of further measurement resolves) and routed directly to Devan rather
than to remediation.

## Verdict: FAIL — blocked, routed to Devan

`BLD-04-1` remains open. No new bounded finding is added; the existing
finding is retained with this turn's corroborating measurement and the
independently-assessed root cause. The section cannot accept while `BLD-04`
is failing, and no further remediation turn can be expected to close it
without an owner decision on which of the two paths above to take (or
whether to wait for `single_provider_mode` to lift before deciding a gate
change at all).

## Contact sheet

Not regenerated — `BLD-04` is a timing gate, not a visual criterion, and no
visual criterion changed this turn. `docs/phase10-baseline/section-11/contact-sheet.md`
remains the section's sheet from a prior turn.

## Evidence

- Candidate: `5d91b6e815c1443012031dbe6eba8d1b547790ef`
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own run)
- Build: `npm run build` — exit 0, 18/18 pages, `/share` smoke pass (this turn's own run)
- `BLD-04` re-measurement: `docs/phase10-baseline/section-11/raw-review-9-bld04-longtasks.json`
- Root-cause diagnostics (implementer's, independently read and assessed,
  not re-run): `docs/phase10-baseline/section-11/scripts/stage-correlate-diag.mjs`,
  `docs/phase10-baseline/section-11/scripts/trace-long-task-diag.mjs`,
  `docs/phase10-baseline/section-11/scripts/control-long-task-diag.mjs`,
  and their `raw-remediation-9-*` output files.
