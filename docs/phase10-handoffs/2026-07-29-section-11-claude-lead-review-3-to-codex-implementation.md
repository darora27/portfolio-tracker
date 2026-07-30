# Phase 10 §11 handoff: Claude Lead (review) → Codex Implementation (remediate)

Prepared July 29, 2026 by `claude-code/sonnet-5`.

## Outcome

Review returned 2 bounded findings (F7/`TST-03`, F8/`VIS-04`). The 2 findings
carried into this turn from review-2 (F5/`BLD-04`, F6/`VIS-11`) are **CLOSED**
with fresh independent evidence.

## What this turn did

- Independently ran `npm test` (106 files, 549 tests, pass) and
  `npm run build` (exit 0, 18/18 static pages, pass) before touching anything.
- Independently re-measured `BLD-04` twice on separate server starts: **0ms**
  across 5 fresh contexts both times. Closes F5.
- Confirmed `VIS-11` from the fresh contact sheet: the Windows line shows
  `WEEK ▼ 14.3% · 30D ▼ 12.0% · SINCE BUY ▼ 12.0% (SIMPLE)`. Closes F6.
- Re-derived and re-ran `TST-03`'s self-deriving sampler (`sample-live-rgb.mjs`,
  unmodified, reads live DOM coordinates each run) twice on separate server
  starts: **ASML fails both times** at deltaE 79.7 / 81.6, sampling a colour
  nowhere near the expected ramp. New finding F7.
- Recorded F8/`VIS-04` as blocked on F7 per that criterion's own stated
  dependency.
- Independently exercised 34 of the criteria review-2 left `not_run`,
  grading each `pass` with retained live/command evidence in the ledger.
  ~13 remain honestly `not_run` (harness-limitation or not-attempted) —
  see the review doc's "Unperformed matrix" section; these are not implicit
  passes.
- Wrote six new retained verifier scripts under
  `docs/phase10-baseline/section-11/scripts/` (`review-3-audit.mjs`,
  `review-3-audit-2.mjs`, `review-3-sun-ring-pixels.mjs`,
  `review-3-owner-audit.mjs`, `review-3-owner-audit-2.mjs`,
  `sample-live-rgb-diagnostic.mjs`).
- No application source changed. `src/`, `public/`, `package.json` untouched.

## Evidence

- Candidate commit: `e16e9c78e7f50d8ce4d7442caf4ed61b3e668a6a` —
  `phase10(§11): BLD-04 PASSES — the 50ms gate clears after six rounds`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  34 criteria moved to `reviewer: pass`, 2 to `reviewer: fail` (`TST-03`,
  `VIS-04`), ~13 remain `not_run`, 5 remain `carried_by_owner` unchanged.
- Tests: `npm test`, independent review run, 106 files / 549 tests, zero
  failures.
- Build: `npm run build`, independent review run, exit 0.
- Screenshots: `docs/phase10-baseline/section-11/captures/*.png` (10/10, fresh),
  `docs/phase10-baseline/section-11/raw-review-3-*.png` (6 additional
  reviewer-turn screenshots).
- Review doc: `docs/phase10-workflow/reviews/section-11-review-3.md`
- Inherited red: none.

## For the next actor

`PHASE10_STATE.json` routes this to `stage: remediate`, `role:
codex_implementation`, `next_actor: codex`. Under `single_provider_mode`
(active since §11), a Claude Lead turn covering the implementer role should
run this next, per `docs/phase10-workflow/SINGLE_PROVIDER_MODE.md` — state
the mode explicitly at the top of that turn as it always has.

Fix F7 (`TST-03`): re-derive `OrreryScene.tsx`'s `trailSampleAngle`
projection so it lands inside the current 26–46° arc for **every** holding —
the reviewer's hypothesis (not mandated) is that the `VIS-04` arc-shortening
change moved where the ribbon ends without a matching sampler update. Confirm
against the actual rendered geometry, not the hypothesis. Re-run
`sample-live-rgb.mjs` **unmodified** and require all eight holdings to clear
ΔE ≤ 8 plus the hue-lock/ordering checks — do not loosen the gate, re-widen
the arc band, or drop ASML from the fixture. Also glance at `IBM` (ΔE 8.14,
marginal) and `CRM` (chroma 0.294, marginal) while the sampler is being
touched. F8/`VIS-04` resolves once F7 does — record its own pixel evidence
separately, since it is a `visual`-kind criterion.

The re-review after this remediation should prioritize the still-`not_run`
**visual** criteria first (`VIS-14`, `VIS-16`, `VIS-19`, `VIS-20`) since the
visual-truth rule blocks acceptance while any visual criterion is
`not_run`/`deferred`/`blocked`, then `MOB-10`/`MOB-11` (high risk, mobile,
untouched since §10), then the remaining `BHV-*`/`ACC-13` items. Full list in
`docs/phase10-workflow/reviews/section-11-review-3.md`'s "Unperformed matrix."

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
