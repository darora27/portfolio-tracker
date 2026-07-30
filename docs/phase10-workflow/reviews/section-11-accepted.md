# Phase 10 §11 — acceptance record

Accepted by: `claude-code/sonnet-5` (Claude Lead, `review`-stage direct
accept path), July 30, 2026.

## Result: ACCEPTED at `5d91b6e`, one criterion carried to §12

§11 "Universe legibility and the draft rig" is accepted at
`5d91b6e815c1443012031dbe6eba8d1b547790ef` —
`phase10(§11): remediate BLD-04-1 — chunk further, root-cause pre-mount hydration`.

**53 of 54 acceptance criteria pass or are not applicable. One (`BLD-04`) is
carried to §12, not closed.**

## Why this turn used the direct review-pass-accept path, not legacy `accept`

Review turn 9 recorded FAIL and routed to Devan blocked, because the sole
remaining finding (`BLD-04-1`) needed an owner ruling on carry-vs-exception
that `single_provider_mode`'s reserved list withholds from a single-provider
Claude turn. Devan resolved that block directly in state (commit `9f561b5`),
ruling **CARRY**, and routed state back to `stage: review`, `status: ready`,
`next_actor: claude` — explicitly for "the next review [to] grade against
the carry and attempt the accept." That is this turn, run as review turn 10.
No `accept`-stage bypass was used; the acceptance ledger's
`--require reviewer` check was re-run and passed after the ledger update
below, satisfying the normal review-pass-accept precondition.

## What the carry rests on: an explicit, non-generalizing owner ruling

Quoted from the owner's commit (`9f561b5`):

> Devan's ruling: CARRY it. Not an exception. The distinction is
> load-bearing... An exception would say the 50ms gate does not apply to
> this cost; none is granted. Carrying says the criterion still fails,
> nobody is pretending otherwise, and it moves to §12 with its number
> attached and must be closed there.

This is exactly the instrument §10 used to carry six criteria into §11 —
see `docs/phase10-workflow/reviews/section-10-accepted.md`, whose acceptance
record states no gate, threshold, verifier, or sample point was weakened.
The same holds here.

## No gate was weakened

- The `<50ms` route-owned long-task boundary is unchanged from §1 through
  this acceptance.
- No measurement was baseline-subtracted.
- **No owner exception was recorded.** `BLD-04` is not being excused; it is
  being moved, failing, to the section that must close it.
- Verifier integrity: `measure-long-tasks.mjs` ran unmodified across all ten
  review turns (confirmed by `git diff` across the section's remediation
  commits touching only `OrreryScene.tsx` and diagnostic-only scripts).

## The one carried criterion, with the measurement it carries

Recorded in the acceptance ledger as `carried_by_owner`.

| Criterion | Risk | Measurement at acceptance | Resolved in §12 by |
|---|---|---|---|
| `BLD-04` | high | 1 of 3 fresh-context batches (15 contexts) breached the unchanged `<50ms` boundary: a single 59ms task, candidate `5d91b6e`. 77 prior runs at 0ms; eleven breaches spanning 57–64ms across the section's history. Root cause: Next.js pre-mount RSC/hydration bootstrap, upstream of `OrreryScene` — six rounds of scene-construction chunking cannot reach it. | An architecture-level SSR/loading-behaviour change (`next/dynamic({ ssr: false })` code-splitting the 3D world, or a smaller initial RSC payload), or an owner-approved scoped exception. §12 must re-run the unmodified verifier and record the result; it may not be closed by assertion. Decided under `single_provider_mode` — the first Codex turn after it lifts should re-review this decision. |

**Must appear in §12's acceptance criteria. Not closed here.**

## Verification at acceptance, re-run independently on the current tree

Run by this turn at HEAD `9f561b52179023f70c89fabfab62ea880df0a146`, one
commit ahead of the accepted candidate (the owner's carry-ruling commit,
which changes no application source):

- `git diff --name-only 5d91b6e HEAD -- src/ public/ package.json
  package-lock.json scripts/`: **empty** — accepted implementation is
  byte-identical to HEAD.
- `npm test`: **PASS — 107 of 107 files, 553 of 553 tests, zero failures.**
- `npm run build`: **PASS** — exit 0, Next.js 16.2.11, 18/18 static pages,
  `/share` smoke pass.
- `npm run phase10:acceptance -- check <ledger> --require reviewer`: **valid.**
- `npm run phase10:validate`: exit 0.

## Provider record

`single_provider_mode` is **true** for §11 (active since 2026-07-30, OpenAI
quota outage). Both implementation and review seats ran as `claude-code/sonnet-5`
covering their respective roles under `PHASE10_LOCK`. Cross-model
independence was suspended for the entire section, including this
acceptance and the `BLD-04` carry decision it executes. Per the owner's
ruling text and the mode's own reserved-list rule, **the first Codex turn
after `single_provider_mode` lifts should re-review the `BLD-04` carry
decision.** `sections_history` records `single_provider_mode: true`
accordingly.

## Section history

§11 ran one implementation round, ten review turns, and nine remediation
rounds (`4658020` through `5d91b6e`), plus one out-of-band owner-directed
Fable drop (`a7f85ac`, covering F1/F4/FB-03/FB-06/FB-14/FB-17) and one
one-attempt-authorized mark repair. Full detail in
`section-11-review.md` through `section-11-review-10.md` and in
`PHASE10_STATE.json`'s `section` record (moved to `sections_history` by this
turn).

`BLD-04` is the section's own carry of §10's `BLD-04` — the same criterion
ID has now failed to close across two sections running. Six rounds of
scene-construction chunking took it from a consistent 55–65ms breach to an
intermittent single-batch 51–59ms breach and correctly diagnosed the
residual cost as upstream of the component being chunked. The standing
lesson from §10 applies again in a different shape: real, measured
improvement is not the same thing as closing a gate, and a criterion can be
legitimately hard to close for reasons outside the turn empowered to close
it.

## Owner feedback board

`OWNER_FEEDBACK_LEDGER.md` §2 already carries an extensive, owner-populated
board of rows routed to `§12a` phases (FB-01, FB-05, FB-08, FB-09, FB-11,
FB-12, FB-15, FB-17, FB-19, FB-20, FB-21) and `§12b` (FB-02, FB-13, FB-16).
None of this is §11 work — §11's own two new owner-feedback items (trail
length, logo visibility) were resolved in-section (see
`closed_findings_history` and `mark_repair` in the moved `sections_history`
record). The board is unchanged by this turn; §12's specify turn is where
`board_required_from_section: 12` first binds and where the board must be
read before writing the spec.

## Next

§12 is initialized at `stage: specify`, `role: claude_lead`,
`next_actor: claude`, `status: ready`. Its roadmap title per `PHASE10.md`
is "The Chart Room, the sky, and flight." **No §12 work was done in this
turn** — initializing its state is the full extent of an accept turn. The
next specify turn must read the standing prompt's "§12a unattended
ordering" section and `OWNER_FEEDBACK_LEDGER.md`'s board before writing
anything, since the owner has already pre-scoped the immediate work to the
`§12a` phases (A–D) rather than the full original `PHASE10.md` §12 scope.

— acceptance recorded by claude-code/sonnet-5
