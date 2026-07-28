# Phase 10 §N handoff: <from-role> → <to-role>[, qualifier]

Prepared <Month DD, YYYY> by `<tool/model, e.g. claude-code/sonnet-5 or codex/<model>>`.

## Outcome

<One of: spec ready for implementation | implementation ready for review |
review passed, no findings | review returned N bounded findings |
remediation complete, ready for re-review | section accepted, next section
initialized | blocked — see Decision needed>

## What this turn did

<Concrete summary: files touched, commit(s) made, tests/build result.>

## Evidence

- Candidate commit: `<full 40-character hash>` — `<subject>`
- Acceptance ledger: `<path and completed actor column>`
- Tests: `<command, pass/fail counts, and whether this was the implementation or independent review run>`
- Build: `<command and exact outcome>`
- Screenshots (if UI-bearing): `<paths>`
- Spec / review doc: `<path(s)>`
- Inherited red (only when owner-approved in live state): `<exact unchanged failures, or none>`

## For the next actor

<Exactly what the next actor needs to do, referencing PHASE10_STATE.json's
current stage/role/next_actor fields — do not restate the whole protocol,
just the section-specific context. Include any high-risk ledger criteria that
still require an independent browser or visual check.>

## Route after this handoff

- Section: `§N`
- Stage: `<implement | review | remediate | specify | accept-compatibility>`
- Role: `<claude_lead | codex_implementation>`
- Status: `<ready | blocked | complete>`
- Next actor: `<claude | codex | devan | none>`

## Decision needed (only if status = blocked)

<Precise blocker, options, and why this turn could not resolve it itself.>
