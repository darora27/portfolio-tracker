# Phase 10 §13 handoff: codex_implementation (owner-ruling turn) → claude_lead review

Prepared July 30, 2026 by `claude-code/sonnet-5` (running as `codex_implementation` per `PHASE10_SWAP_ROLES` / single-provider mode).

## Outcome

Implementation ready for review. This turn implemented Devan's owner ruling
(commit `ee7f12b`, "sampler searches for a valid point; no threshold moves")
resolving the F2 blocked handoff from `section-13-review-2.md`. Not a clean
pass — 7/8 tickers now pass the trail-colour gate (up from 3/8), one ticker
(ASML) remains a genuine, exhaustively-searched reportable failure, and one
small new side effect (a magnitude-ordering violation) surfaced. Recorded as
`deferred_to_reviewer`, not silently accepted.

## What this turn did

- `src/lib/observatory/scene-model.ts`: kept `TRAIL_SAMPLE_FRACTION` (0.62)
  as the search base; added `buildTrailSampleSearchFractions()` /
  `TRAIL_SAMPLE_SEARCH_FRACTIONS` (an ordered ±0.08-step walk clamped to
  `[0.2, 0.92]`) and a new `SceneModel.trails[].sampleSearchFractions` field.
- `src/components/observatory/orrery/OrreryScene.tsx`: alongside the
  unchanged single `data-trail-sample-x/y` publish, each frame now also
  projects every candidate fraction through the same camera/orbit matrix and
  publishes `data-trail-sample-candidates` (JSON array of `{fraction, x, y}`)
  per holding. No rendering, geometry, colour, ramp, clamp, or arc change.
- `docs/phase10-baseline/section-13/scripts/sample-live-rgb.mjs`: walks a
  ticker's full candidate list (app's published order) within each sampled
  frame before moving to the next frame, accepting the first candidate that
  clears the existing, unchanged gates. Every candidate evaluated is counted
  (`candidatesTried`), so a ticker with no valid point is reported, not
  silently skipped.
- Regenerated `docs/phase10-baseline/section-13/raw-trail-sampler-TST-03.json`
  and `trail-daily-1440x900.png` against a fresh production build
  (`npm run build && next start -p 3100`).
- Updated `docs/phase10-workflow/acceptance/section-13.json`: TST-03 and
  VIS-04 implementer entries set to `deferred_to_reviewer` with full new
  evidence and notes; `candidate_sha` left `null` for the reviewer.
- `npm test`: 112 files, 583/584 passed (1 intentional skip), zero failures.
- `npm run build`: exit 0, 18/18 routes, unchanged route list.

## Evidence

- Candidate commit: leave `candidate_sha` in the acceptance ledger for the
  reviewer to fill from `git log` — this turn's own commit cannot contain its
  own hash.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-13.json` —
  TST-03/VIS-04 implementer column updated; all other criteria unchanged from
  round 2.
- Tests: `npm test` — 112 files, 583/584 passed, 1 intentional skip, zero
  failures (this turn's own implementation run).
- Build: `npm run build` — exit 0, 18/18 routes, `/share` smoke PASS.
- Screenshots: `docs/phase10-baseline/section-13/trail-daily-1440x900.png`
  (regenerated, 8-holding captioned plate).
- Raw data: `docs/phase10-baseline/section-13/raw-trail-sampler-TST-03.json`
  (regenerated; `passingCount: 7`, `overallPass: false`).
- Prior root-cause evidence (still valid, unchanged):
  `docs/phase10-baseline/section-13/f2-investigation/`.
- Spec / review docs: `docs/phase10-workflow/specs/section-13.md`,
  `docs/phase10-workflow/reviews/section-13-review-2.md` (the blocked round
  this turn responds to).
- Inherited red: none. `npm test`/`npm run build` are fully green.

## Results detail (for the reviewer)

- **Now passing (7/8):** GOOG (ΔE 0.598), COST (ΔE 7.785, fraction 0.54 —
  previously failed on the ribbon's antialiased edge at 0.62), MSFT (ΔE
  1.572), INTC (ΔE 1.398), IBM (ΔE 6.674), CBRS (ΔE 2.757), CRM (ΔE 7.786).
  MSFT/INTC/CBRS's prior clamp-collision failures are resolved by the walk —
  a different fraction moves the sample off the point where the additive
  glow pass's overlap was brightest, without touching the clamp or ramp.
- **Still failing (1/8):** ASML. 1,507 candidates tried across the full
  `[0.2, 0.92]` fraction range over 137 frames (~137s) — every candidate
  evaluated, none cleared ΔE≤8. Best found: ΔE 9.436, clearance 5.115px
  (clearance improved from the pre-fix best of 3.783px, but the previously
  measured sun-corona/own-disc structural contamination persists). This is
  the "reportable failure, not a silent skip" outcome the ruling explicitly
  anticipated.
- **New side effect:** the magnitude-ordering check now has one violation
  (zero before this fix) — GOOG and COST, ~0.003 luminance units, traced to
  COST's now-passing-but-comparatively-imprecise sample rather than an
  encoding defect. Not corrected here: doing so would mean further tuning the
  search parameters to chase one ticker's exact pixel, which the ruling's "no
  threshold moves" instruction forbids. Reported per the ruling's own words
  ("if the search alters their results, that gets reported rather than
  accepted").

## For the next actor

Independently re-run `npm test` / `npm run build`, then independently launch
a fresh production server and re-run
`docs/phase10-baseline/section-13/scripts/sample-live-rgb.mjs` (or an
independent reviewer-owned script) against it rather than trusting this
turn's numbers. Judge whether 7/8 passing plus one exhaustively-searched
structural failure (ASML) plus one small new ordering side effect (GOOG/COST)
satisfies the owner's ruling, or whether this is a fresh blocked handoff back
to Devan. This is not a self-authorized scope decision either way — the
owner already ruled on the *method*; whether *this specific outcome* counts
as closing TST-03/VIS-04 is a judgment call for review, and ASML's residual
failure in particular may need Devan's own sentence given his explicit,
repeated involvement in this row (FB-26, F2).

## Route after this handoff

- Section: `§13`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`

## Decision needed (only if status = blocked)

Not applicable — status is `ready`, routed to review.
