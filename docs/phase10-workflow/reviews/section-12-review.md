# §12a review — PASS

Reviewer: `claude-code/sonnet-5` (Claude Lead), 2026-07-30.
Candidate: `2390059473ad2a0da2b64ee7a9ecce35d5e532b1` (HEAD at turn start,
`phase10(§12): implement §12a — close the ledger board, BLD-04 clears`).
Ledger: `docs/phase10-workflow/acceptance/section-12.json` (19 criteria).

## Independent verification performed

- `npm test`: 112 test files, 582 passed, 1 skipped (intentional — variant A
  of the FB-08/FB-15 tab strip has no tab surface by design), zero failures.
  Matches the implementer's own run exactly.
- `npm run build`: exit 0, 18 routes, byte-identical route list to the
  retained `raw-npm-build.txt`, `/share` smoke PASS.
- Read the complete diff (`git diff 6a9eeb6 2390059 -- src/`) line by line
  against the spec: `orrery.ts`, `scene-model.ts`, `mission-control-layout.ts`,
  `structure-copy.ts`, `orrery.module.css`, `OrreryWorld.tsx`,
  `MissionControl.tsx`, `DraftRig.tsx`, and every new/changed test file. Every
  changed constant, selector, and formula matches the spec's named numbers
  exactly (FB-01's radii/gap/belt-span, FB-21's `min(1400px, 96vw)`, FB-05's
  role→token table, FB-12's 30–90s band with inverse-magnitude ordering
  preserved algebraically).
- Independently recomputed `orphaned: []` from the committed
  `raw-fb20-label-body-pairs.json` rather than trusting the implementer's
  summary.
- Independently counted visible rows in the open BODIES group from
  `exit-terminal-grouped-1440x900.png`: 1 (sun) + 8 (holdings) = 9, exactly at
  the `≤9` ceiling.
- Re-ran `docs/phase10-baseline/section-11/scripts/measure-long-tasks.mjs`
  (unmodified) two additional times against a freshly built production server
  of this same candidate — 10 more fresh 1440×900 CPU-2× contexts, all 0ms,
  addressing the handoff's request for extra confidence given BLD-04's carry
  history of intermittent single-batch breaches. Combined with the
  implementer's own batch: 15 fresh contexts this round, all clean. `BLD-04`
  closes, not carried to §12b.
- **Closed the one implementer gap (`VIS-08`).** The implementer correctly
  could not reach the owner-gated `/` route (no `OWNER_PASSWORD` credential,
  must not read `.env*`). As reviewer, followed the same non-secret-reading
  pattern §1's acceptance remediation 3 used and had accepted: started a
  fresh production server on a separate port with a self-chosen temporary
  `OWNER_PASSWORD` process-env override (never reading any `.env*` contents),
  authenticated via `POST /api/auth/login` with that self-chosen password,
  confirmed the real portfolio has exactly 8 holdings, opened DRAFT, and
  captured `docs/phase10-baseline/section-12/reviewer/draft-rig-1440x900.png`.
  Confirmed live: MOTION OFF by default, the DRAFT latch present in the strip
  nav, the coach line visible on first open, zero console errors. `VIS-08` is
  not left `deferred_to_reviewer`.

## Result

All 19 ledger criteria: **pass**. Zero bounded findings. `npm run
phase10:acceptance -- check docs/phase10-workflow/acceptance/section-12.json
--require reviewer` → valid.

## Why this does not accept-and-advance

Per the section's own spec (§7, "Phase D") and the standing prompt's
owner-adopted "§12a unattended ordering" (§8.5), this section's Phase D is a
**review-turn** action, not implementation: assemble `REVIEW_SITTING.md` and
the contact sheet, then route to `stage: owner-sitting`, not
`accept_and_advance`. This is deliberate and distinct from a normal
review-pass: `OWNER_FEEDBACK_LEDGER.md` rule 4 ("rows close only on an owner
quote or a committed capture") means a criteria-ledger `pass` on `FB-01`,
`FB-05`, `FB-08`/`FB-15`, `FB-09`, `FB-11`, `FB-12`, `FB-17`, and `FB-21`
proves only the mechanical half of each row — the board itself stays open
until Devan's sentence closes it. `FB-19` and `FB-20` are the exception: their
own closes-when conditions are satisfied by capture alone (no taste
judgment involved), and are marked `CONFIRMED` on the board in this same turn
(see `OWNER_FEEDBACK_LEDGER.md` and the note below).

`workflow.json`'s `owner-sitting` stage is legal here: "Legal only when every
criterion is pass or parked_owner" — all 19 are `pass`, none `parked_owner`.

## Ledger board update this turn

- `FB-19`: `open` → `CONFIRMED — Jul 30, 2026 (capture)`. Closes on capture
  per its own closes-when text; independently re-verified (geometry JSON,
  intersects=false; header text untruncated).
- `FB-20`: `open` → `CONFIRMED — Jul 30, 2026 (capture)`. Closes on capture
  per its own closes-when text; independently recomputed `orphaned: []`.
- All other rows this section touches (`FB-01`, `FB-05`, `FB-08`, `FB-09`,
  `FB-11`, `FB-12`, `FB-15`, `FB-17`, `FB-21`) remain their current board
  status — their mechanical half is proven (this ledger), but the row itself
  awaits Devan's sentence at the sitting. Not closed here; not asserted as
  closed.

## Next

Routed to `stage: owner-sitting`, `next_actor: devan`, `status: ready`. See
`REVIEW_SITTING.md` at the repo root and
`docs/phase10-baseline/section-12/contact-sheet.md` (12 frames).
