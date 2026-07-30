# Phase 10 §13 handoff: claude_lead (specify) → codex_implementation

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

Wrote the §13 design proof, specification, and acceptance ledger for
"Universe fixes from the July 30 owner sitting" (`PHASE10.md` §13). No
application source was touched, per the specify-stage rule. Files written:

- `docs/phase10-workflow/design-proofs/section-13.md`
- `docs/phase10-workflow/specs/section-13.md`
- `docs/phase10-workflow/acceptance/section-13.json` (15 criteria, 10
  visual — validated by `npm run phase10:acceptance -- check`)

Ten ledger rows scheduled: FB-26 (first — trails/direction move from
weekly to daily return), FB-01 (spacing/zoom, one more small step, exact
numbers Lead-computed and reasoned in the design proof since the owner
gave direction, not values), FB-05 (`--type-label` 11→12px only), FB-02
(the sky, five moves, cited whole from `UNIVERSE_IDEAS_6.md` §2.2), FB-17
(ship the owner's picked 600px panel-width default, plus a required
investigation of the live/capture size disagreement he reported), FB-22,
FB-23, FB-24, FB-25, FB-31. FB-32 and FB-12 are named on the board for
completeness but not actioned — both are explicitly scheduled elsewhere
(`§14` and "parked" respectively, per `PHASE10.md` §13/§14's own text).

Two root causes were identified during specify (not left for the
implementer to rediscover):

- **FB-24** (moons do nothing): moon existence/sizing keys off raw
  `newsCount`, but the click destination additionally requires a linkable
  `http(s)` URL — a holding can have a moon with no reachable news behind
  it. Fix: align the count moon existence uses with the linkable-news
  count the destination already filters by.
- **FB-31** (orange tabs): `FB-08`'s "B is fine" boxless/cream-underline
  treatment was already `CONFIRMED` by the owner in §12a, but was only
  ever built as a capture-only `?stripVariant=b` evidence variant and was
  **never shipped as the production default** — the orange he is
  re-reporting is the un-migrated base rule. Fix: make the base rules
  match the already-confirmed variant B, not a new design decision.

## Evidence

- Candidate commit: not applicable — this is a specify turn, no
  implementation candidate yet.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json` —
  all 15 criteria at `implementer.status: not_run`, `reviewer.status: not_run`.
- Tests / Build: not run this turn (no source changed).
- Spec / design proof: `docs/phase10-workflow/specs/section-13.md`,
  `docs/phase10-workflow/design-proofs/section-13.md`.

## For the next actor

Implement in the spec's own sequence (`§8`): FB-26 first (§2 of the spec —
the field-swap and function renames), then FB-01/FB-05 (§3, both touch
files later captures depend on), then FB-02/FB-17/FB-22/FB-23/FB-24/FB-25/
FB-31 (§4–§6, independent of each other). Fill only `implementer` results
in the acceptance ledger with retained evidence — no criterion may be
marked `pass` from source reading alone; every `VIS-*`/`BHV-01` criterion
needs a real capture or a rendered test, per `AGENTS.md`'s visual-truth
rule. Two things worth flagging explicitly:

- **FB-17's §5.2 investigation** is graded as an honest investigation, not
  a specific expected answer — report what you actually measure across the
  named viewport widths, including if the viewport-width hypothesis turns
  out to be wrong.
- **FB-26's §2.3 rename list is exhaustive as researched this turn**, but
  re-grep `weeklyReturn`/`rampForWeekly`/`directionForWeeklyReturn`/
  `angularSpeedForWeeklyReturn`/`trailArcLengthForWeeklyReturn` across
  `src/` before finishing — if a call site was missed by this turn's
  research, update it too (except `DraftRig.tsx`, which stays on
  `weeklyReturn` per FB-12).

Run `npm test` and `npm run build` before committing the implementation
candidate (`TST-02`/`BLD-01`), matching the spec's global gates.

## Route after this handoff

- Section: `§13`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`

## Decision needed (only if status = blocked)

Not applicable — status is `ready`.
