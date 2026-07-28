# Phase 10 §9 handoff: Claude Lead → Codex Implementation, remediation 4

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned 1 bounded finding (F9). F8's instrumentation half and its
≥ 22 px floor clause are confirmed resolved; its ≈68 px clause is not, and is
carried forward as F9.

## What this turn did

Review-only. No application source changed — this turn's commit touches the
review doc, `PHASE10_STATE.json`, this handoff, and two new pieces of live
review evidence.

I closed the environment gap Codex reported honestly rather than taking the
model numbers on trust: I started a production build on `127.0.0.1:3141`
myself, ran the retained `measure-overview-fit.mjs` against it at exactly
1440×900 (24 samples over 12 s), captured the post-F8 OVERVIEW frame, and
separately drove `buildOverviewSceneModel` across a full 360° orbital phase
sweep on the eight **live production weights** rather than the test fixture.

The `portfolio-ux` project skill was invoked via the `Skill` tool (not the
fallback path). It created no new criteria and no advisory findings.

## Evidence

- Commit: this turn's commit — `phase10(review §9): fail with 1 bounded finding on planet scale`
  (reviewed commit: `e8377855e38d38e1cbbc283464c07ff80237599e`)
- Tests: `npm test` PASS — 94 test files, 499/499 tests
- Build: `npm run build` PASS — Next.js 16.2.11, TypeScript clean, 23 route
  tasks, post-build smoke `/share` 200 and Mission Control manifest 200
- Live evidence:
  `docs/phase10-baseline/section-9/claude-review/raw-overview-fit-review-4.json`,
  `docs/phase10-baseline/section-9/claude-review/overview-1440x900-review-4.png`
  (`sips`-verified at exactly 1440×900)
- Review doc: `docs/phase10-workflow/reviews/section-9-review-4.md`

## For the next actor

`PHASE10_STATE.json` is now `stage: "remediate"`, `role:
"codex_implementation"`, `next_actor: "codex"`, `status: "ready"`.
`prev_actor_commit` records your incoming commit
`e8377855e38d38e1cbbc283464c07ff80237599e`, which also replaces the
placeholder you left in `section.remediation_commits`.

**Fix only F9.** The full statement is in `section.findings[0]` and in §
"Finding" of the review doc. In short:

- What you fixed and must not undo: `projectedDiameterPx` now derives from the
  real perspective sphere projection and equals `bounds.width`; the renderer
  and the measurement script read that same helper; `ORRERY_RING_SPACING` is
  gone and each orbit gap derives from its own adjacent radius pair per spec
  §4.2; the ≥ 22 px floor now passes at 26.45 px live. Criteria 1 and 17 are
  re-confirmed live at your new composition.
- What is still wrong: on the **real** portfolio (heaviest holding 26.5%, not
  the fixture's 0.35), the heaviest planet spans only 59.22–65.35 px across a
  full orbital sweep — it never reaches the required ≈68 px. Live mean 61.49 px.
- Why your gate passes anyway: `overviewHoldings` pins the heaviest weight at
  exactly `MAX_WEIGHT` (0.35), the one value where `radiusForWeight` saturates
  at `ORRERY_MAX_RADIUS`. The gate therefore cannot fail for any portfolio less
  concentrated than 35% in one name.
- Required: satisfy criterion 18 for the production weight distribution, and
  move the gate onto a fixture whose heaviest weight is representative and
  strictly below `MAX_WEIGHT`.

I verified before raising this that ≈68 px is reachable, so this is not a spec
conflict for Devan — the review doc's §"The target is reachable" carries the
measured table. Treat those numbers as diagnostic only; choose the mechanism
yourself. Criterion 17's 85–92% belt span and §4.2's ≥ 1.6× spacing are not
negotiable against criterion 18; if you find you cannot hold all three, set
`status` to `blocked` and hand off to Devan rather than trading one against
another.

Also still outstanding and carried from F8:
`docs/phase10-baseline/section-9/after/overview-1440x900.png` is still the
pre-F7 frame. Recapture it once the composition is final. If your environment
blocks it again, say so plainly as you did this round — do not relabel an
older image.

F1–F8's resolved substance is verified and settled. Do not revisit it, do not
restructure any surface beyond what F9's required change names, and do not
change trail/orbit sign→colour or sign→direction mapping (spec §1.1, D1).

One item recorded as **observed, not a finding** — do not act on it: the
`COST` tag still overlaps the sun's `PORTFOLIO · −2.1% · WEAK` readout near
frame centre. No §9 criterion governs tag-over-sun-readout occlusion.
