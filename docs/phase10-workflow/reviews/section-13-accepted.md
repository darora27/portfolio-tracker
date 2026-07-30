# Phase 10 §13 — acceptance record

Accepted by: `claude-code/sonnet-5` (Claude Lead, `review`-stage direct accept
path), July 30, 2026.

## Result: ACCEPTED at `33789ee`, one criterion pair closed under a documented owner exception

§13 "Universe fixes from the July 30 owner sitting" is accepted at
`33789eebeb170c1c60a833b5d963bbadbb64f2f7` —
`phase10(§13): sampler walks the trail for a valid sample point`.

**17 of 17 acceptance criteria resolved: 15 pass, 2 (`TST-03`, `VIS-04`)
carried_by_owner under a scoped, non-generalizing owner exception. Zero fail,
blocked, or unproven visual criteria.**

## Why this turn used the direct review-pass-accept path, not legacy `accept`

Review turn 3 recorded `blocked` and routed to Devan, because the sole
remaining finding (`TST-03`/`VIS-04`, ASML's residual ΔE 9.436) needed an
owner ruling this project's precedent required for any acceptance with a
residual failing critical criterion. Devan resolved that block directly in
`f392a049d4a4a9e49dda1404890d5941b00040ff`, granting the exception and routing
state back to `stage: review`, `status: ready`, `next_actor: claude`. Review
turn 4 (`section-13-review-4.md`) confirmed nothing else had changed,
recorded the ruling in the acceptance ledger, fixed an unrelated
evidence-citation gap on two already-passing criteria, and re-ran
`--require reviewer`, which passed — the normal review-pass-accept
precondition. No `accept`-stage bypass was used.

## What the exception rests on: an explicit, non-generalizing owner ruling

Quoted from the owner's ruling (`f392a04`):

> ASML does not [pass], at deltaE 9.436 against the unweakened <=8 gate, and
> the figure reproduced IDENTICALLY across three independent runs including
> one whose script the reviewer wrote from scratch. That is a stable geometry
> ceiling, not sampling noise... This is NOT the "carry" he refused. Carry
> means still-broken-fix-later and defers the problem forward. This is
> understood-and-accepted, cause named, measurement attached, and it travels
> nowhere. Scope is ASML only, TST-03 only; <=8 stays in force for every
> other holding, present and future.

This is a different instrument from §10/§11's `BLD-04` carry (see
`section-11-accepted.md`): a carry says the criterion still fails and moves,
unresolved, to the next section. An exception says the residual is understood,
its cause is named, and it does not travel anywhere. The acceptance ledger's
status vocabulary has no separate enum value for this distinction — both
criteria are recorded as `carried_by_owner` for the mechanical reason that
it is the schema's only lane for an owner-authorized pass on a residual
failure — but the substance, and the full ruling text, live in
`PHASE10_STATE.json`'s `section.owner_exceptions` (now moved into this
history record below) and in the ledger notes themselves.

## No gate was weakened

- The `<=8` ΔE gate, the `<=10` degree hue-distance gate, the `>0.3` chroma
  gate, and the `>=1px` clearance gate are byte-for-byte unchanged from
  §11/§12 through this acceptance.
- The positional search the owner separately authorized in round 2
  (`ee7f12b`) changes only *where* the sampler looks, never *what* the pixel
  must measure — confirmed independently across three rounds of review.
- **The exception is scoped to one ticker, one criterion.** GOOG, IBM, and
  CRM continue to pass; every other current and future holding is still held
  to the unweakened gate.
- Verifier integrity: the sampler's four gates were never touched across the
  implementation or any of the four review turns; only the search-fraction
  walk (`TRAIL_SAMPLE_SEARCH_FRACTIONS`) was added, per the round-2 ruling.

## The excepted criteria, with the measurement they except

Recorded in the acceptance ledger as `carried_by_owner`.

| Criterion | Risk | Measurement at acceptance | Scope of the exception |
|---|---|---|---|
| `TST-03` | critical | ASML's best-achievable ΔE = 9.436 against the unweakened `<=8` gate, reproduced identically across three independent runs (implementer's + two reviewer runs, one written from scratch). Cause: ASML orbits nearest the sun; sun illumination on its ribbon shifts measured colour past tolerance. The criterion does not model scene illumination. | ASML only. `<=8` remains in force for every other holding, present and future. |
| `VIS-04` | high | Shares TST-03's root cause, sampler run, and evidence plate. The arc/12%-white-hot-head/direction clauses remain visually correct for all 8 tickers including ASML. | Same scope as TST-03 — colour-tolerance measurement only. |

**Both close here.** Neither travels to §14.

## Verification at acceptance, independently re-run

Round 4, against the unchanged candidate `33789ee` (confirmed via
`git diff --name-only 33789ee HEAD -- src/ public/ package.json
package-lock.json scripts/` → empty; the owner's ruling commit touched only
roadmap/state/ledger documentation):

- `npm test`: **PASS** — 112 test files, 583/584 passed (1 intentional skip),
  zero failures.
- `npm run build`: **PASS** — exit 0, 18/18 routes, unchanged route list,
  `/share` smoke PASS.
- `npm run phase10:acceptance -- check <ledger> --require reviewer`: **valid.**
- `npm run phase10:validate`: exit 0.

## Section history

§13 ran one implementation round, four review turns, and one remediation
round (`d5208c5` through `33789ee`), plus two owner rulings
(`ee7f12b` — sampler method; `f392a04` — ASML exception). Ten ledger rows:
FB-26 (return-window field swap, weekly → daily), FB-01 + FB-05 (spacing and
type-scale nudges), FB-02 (five sky moves), FB-17 (panel width default +
live/capture investigation), FB-22/23/24/25/31 (five independently
root-caused defect fixes). Full detail in `section-13-review.md` through
`section-13-review-4.md` and in `PHASE10_STATE.json`'s `section` record
(moved to `sections_history` by this turn).

`TST-03`/`VIS-04` are the section's own defining thread: round 1 found 5/8
tickers failing on a fixed sample fraction; round 2's remediation resolved
COST via root-cause investigation but left ASML's structural clearance issue
open; the owner's round-2 ruling authorized a per-holding positional search;
round 3 confirmed that search correctly implemented and ASML's residual
confirmed structural and reproducible; the owner's final ruling accepted that
residual as a scoped, documented, non-generalizing exception rather than a
further carry.

## Owner feedback board

`OWNER_FEEDBACK_LEDGER.md`'s board carries several rows this section's
criteria satisfy but which stay open pending Devan's own taste-oriented
sentence (their own `closes-when`, not a capture): FB-01, FB-05, FB-17,
FB-02, FB-23, FB-24, FB-25. FB-22 and FB-31 already closed on committed
capture in round 2. FB-13 (the Chart Room) and FB-32 (top-right block) were
both touched by the owner's own ruling commit, not by this section's
implementation — see the flag below. None of this blocks §13's acceptance;
the board's `>= 5 open/designed rows means the next section is a landing
section` rule is for the next specify turn to evaluate, not this accept turn.

## Flagged, not fixed: a roadmap numbering collision

The owner's ruling commit (`f392a04`) split the former combined `§14`
("Mission Control content rework + the Chart Room") into a new `§14` (Chart
Room alone, promoted ahead per his direction) and renamed the remainder to
`§15` ("Mission Control content rework") — but `§15` was already the heading
for the pre-existing `/research prioritization and filing context` section.
`PHASE10.md` now has two `## §15.` headings, and the roadmap parser
(`extractRoadmapSections` in `scripts/phase10-workflow-lib.mjs`) does not
check for duplicates, so `npm run phase10:validate` passes silently. This
does not affect §13's acceptance or §14's initialization below (both numbers
are unambiguous), so this accept-only turn did not fix it — the correct fix
(shifting the pre-existing `§15`–`§18` up by one and bumping
`workflow.json`'s `terminal` from 18 to 19) touches several owner-authored
sections and should get the same kind of explicit owner nod the three prior
roadmap amendments each recorded. Recorded as
`PHASE10_STATE.json`'s top-level `roadmap_numbering_conflict` key. **Must be
resolved before anyone specifies the real `§15`.**

## Next

§14 is initialized at `stage: specify`, `role: claude_lead`,
`next_actor: claude`, `status: ready`. Its roadmap title per `PHASE10.md` is
"The Chart Room — individual stock analytics." **No §14 work was done in this
turn** — initializing its state is the full extent of an accept turn. The
next specify turn must read `PHASE10.md` §14 and `UNIVERSE_STOCK_LAB.html`
(the authority, confirmed byte-identical in triplicate by the owner's own
correction this section) before writing anything, and should re-check
`OWNER_FEEDBACK_LEDGER.md`'s board-debt count against
`board_required_from_section: 12` before scoping.

— acceptance recorded by claude-code/sonnet-5
