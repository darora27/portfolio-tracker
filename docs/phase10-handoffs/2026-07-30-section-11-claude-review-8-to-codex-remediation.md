# Phase 10 §11 handoff: Claude Lead (review turn 8) → Codex Implementation (remediation)

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

review returned 1 bounded finding — `MOB-11-1` closed this turn, but a fresh
independent re-measurement of the carried `BLD-04` long-task gate opened a
new finding, `BLD-04-1`.

## What this turn did

- Independently re-verified and **CLOSED `MOB-11-1`**: fresh production
  server (port 3500), this turn's own script copy, candidate `0c3a812`.
  `HOLDINGS` now present alongside `RETURNS`/`RISK`/`NEWS`/`EARNINGS` at both
  390×844 and 320×844; `CORRELATION`/`TRADES` correctly still absent; zero
  banned nouns; zero overflow. Screenshot directly inspected.
- Ran `npm run phase10:acceptance -- check <ledger> --require reviewer` for
  the first time to a completed result (flagged outstanding by review turns
  6 and 7): 93 issues across 44 of 54 criteria. Investigated the actual cause
  before touching anything — read the verifier scripts, directly viewed the
  highest-value candidate screenshots — and confirmed every issue was a
  citation/bookkeeping gap (real evidence already existed and was already
  judged sufficient by the review turns that produced it; `required_artifacts`
  named files no tooling had ever produced). Reconciled `required_artifacts`
  and `reviewer.evidence` to the real, retained files for ~44 criteria (script
  retained at `scripts/reconcile-review-8-ledger.mjs`, every path
  existence-checked before being written). Captured two genuinely-missing
  screenshots fresh (`BHV-20` legend first-visit; `MOB-11`'s own re-check).
  This reduced the ledger check to **zero issues outside one criterion.**
- That one criterion, **`BLD-04`** (carried, high risk, closed since review
  turn 3), did not reconcile clean — independently re-measured it three times
  (unmodified `measure-long-tasks.mjs`, unchanged `<50ms` gate) across two
  separate fresh production server processes: 2 of 3 batches (15 total fresh
  contexts) breach the boundary marginally (52ms once, exactly 50ms once); 1
  of 3 is a clean 0ms pass. Graded **FAIL** per the carried-criteria
  no-assertion rule rather than keeping the passing run. **Opens new finding
  `BLD-04-1`.**
- Ran `npm test` (107 files, 553 tests, zero failures) and `npm run build`
  (exit 0, 18/18 static pages, `/share` smoke pass) — both this turn's own
  independent runs, output retained.
- Changed **no application source**. Touched only the acceptance ledger, the
  review doc, retained evidence under `docs/phase10-baseline/section-11/`,
  this handoff, and `PHASE10_STATE.json`.

## Evidence

- Candidate commit reviewed: `0c3a812f5d755bf3f981741ecff6a9f5f2b2f20c`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `MOB-11.reviewer` → `pass`; `BLD-04.reviewer` → `fail`; ~44 other criteria
  reconciled (citations only, no status change)
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run; `docs/phase10-baseline/section-11/raw-npm-test.txt`)
- Build: `npm run build` — exit 0 (this turn's own independent run;
  `docs/phase10-baseline/section-11/raw-npm-build.txt`)
- BLD-04 evidence: `docs/phase10-baseline/section-11/raw-review-8-bld04-longtasks.json`
  (full 3-run breakdown)
- Review doc: `docs/phase10-workflow/reviews/section-11-review-8.md`
- Reconciliation script: `docs/phase10-baseline/section-11/scripts/reconcile-review-8-ledger.mjs`
- Inherited red: none

## For the next actor

Fix `BLD-04-1` only — see the finding in `PHASE10_STATE.json`'s
`section.findings` and the full writeup in `section-11-review-8.md`. Either
establish genuine headroom below 50ms on the route-owned long task, or
investigate and name the specific cause of this environment's marginal
breaches if it differs from the owner's own clean-running machine. Re-run
`measure-long-tasks.mjs` unmodified on at least two independently fresh
server processes and record every run, not just a passing one — this is
exactly the standard this turn applied. **Do not baseline-subtract or
redefine the gate** — explicit `must_wait_for_codex` item, and the spec has
refused that path five times already.

Do not re-litigate the ledger-hygiene reconciliation from this turn; every
criterion outside `BLD-04` is now clean against `--require reviewer`.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
