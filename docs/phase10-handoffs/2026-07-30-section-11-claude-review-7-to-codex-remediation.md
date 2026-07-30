# Phase 10 §11 handoff: Claude Lead (review turn 7) → Codex Implementation (remediation)

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

review returned 1 bounded finding — `MOB-11` fails; `BHV-31` closes as a pass.

## What this turn did

- Graded the two criteria the owner ruled on 2026-07-30 (commit `8ce63e2`,
  spec `docs/phase10-workflow/specs/section-11.md` §11.0):
  - **`BHV-31`** — owner set the pro-rata ratio-drift tolerance at 0.02. The
    already-measured `maxRatioDrift` (0.0184, from review turn 5's real
    keyboard-driven edit) is below it. **PASS**, no new measurement needed.
  - **`MOB-11`** — owner ruled the fallback does not need to grow
    `CORRELATION`/`TRADES`/`ORBITS`. Re-ran the naming sweep fresh against
    this turn's own production server at current HEAD anyway, since code has
    changed since the last measurement (review turn 4): unchanged result —
    `RETURNS`/`RISK`/`NEWS`/`EARNINGS` present, `CORRELATION`/`TRADES`
    absent (correctly, per the ruling), but **`HOLDINGS` is also absent**.
    Read the source directly: the fallback's per-ticker holdings list is an
    already-existing, fully-rendered section with no label at all, while
    every sibling section (`RETURNS`, `RISK`, `EARNINGS`, `NEWS`) carries an
    explicit `"X / ..."` prefix. This is a genuine, narrow finding under the
    owner's own corrected reading (existing sections need correct current
    names) — not a re-opening of the CORRELATION/TRADES/ORBITS question he
    just closed.
- Independently re-ran `npm test` (107 files, 553 tests, zero failures) and
  `npm run build` (exit 0, 18/18 pages, `/share` smoke pass) — both this
  turn's own runs.
- Did not touch application source.

## Evidence

- Candidate commit (unchanged since review-6):
  `e8faf0d3ae6ce7f14f9a9f0b44205f51f0b4ae77`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `BHV-31.reviewer` → `pass`, `MOB-11.reviewer` → `fail`
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run)
- Build: `npm run build` — exit 0 (this turn's own independent run)
- Live check: `docs/phase10-baseline/section-11/scripts/review-7-mob11.mjs`,
  `raw-review-7-mob11.json`, `raw-review-7-fallback-390.png`,
  `raw-review-7-fallback-320.png`
- Review doc: `docs/phase10-workflow/reviews/section-11-review-7.md`
- Inherited red: none

## For the next actor

Fix exactly one thing: **`MOB-11-1`**. In
`src/components/observatory/orrery/OrreryWorld.tsx`, the fallback's `<nav
aria-label="Portfolio bodies">` (around line 347) renders the per-ticker
holdings list at `<ol className={styles.holdingList}>` (line 361) with no
section label, while its siblings (`RETURNS` line 436, `RISK` line 441,
`EARNINGS` line 447, `NEWS` line 408) all carry an explicit `"X / ..."`
prefix. Add a matching `"HOLDINGS / ..."`-style label for the holdings list.
Do **not** add `CORRELATION`, `TRADES`, or `ORBITS` sections — the owner's
2026-07-30 ruling (spec §11.0) explicitly excludes that; adding them would be
new scope he didn't ask for and would itself be a new finding.

Verify live (390×844 and 320×844) that `HOLDINGS` now appears in
`document.body.innerText`, that `RETURNS`/`RISK`/`EARNINGS`/`NEWS` still do,
and that `CORRELATION`/`TRADES` remain correctly absent. Run `npm test` and
`npm run build` before committing.

Everything else in the ledger is already `pass`/`carried_by_owner` — this is
the only open item. The full `npm run phase10:acceptance -- check <ledger>
--require reviewer` ledger-hygiene gap (flagged in review turns 6 and 7) is
**not** this remediation's scope; leave it for the review/accept turn after
this one.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
