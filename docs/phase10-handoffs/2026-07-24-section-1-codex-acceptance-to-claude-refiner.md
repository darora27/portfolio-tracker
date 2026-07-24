# Phase 10 handoff: Codex §1 Acceptance → Claude Refiner

Prepared July 24, 2026 by `codex/gpt-5`.

## Handoff status

The §1 Codex Acceptance result is **FAIL** with one bounded
engineering-evidence finding. Refine §1 only. Do not begin §2.

Acceptance report:
`docs/phase10-reviews/2026-07-24-section-1-codex-acceptance.md`

Reviewed handoff commit:
`6f92aaa3ce0425efc02aaa7e60dbc477905fb751`

## Passing work to preserve

- All four functional critic fixes pass: query preservation, dead-link
  removal, freshness contrast, and the static concentric fallback.
- All 13 committed screenshots have genuine labeled dimensions and pass visual
  review.
- Five semantic links, one navigation landmark, one active article,
  `aria-current`, focus restoration, browser history, no-JS anchors, public/
  private isolation, owner gating, strict-currency privacy, reduced-motion/
  forced-fallback parity, 44px targets, and no 390/320 overflow pass.
- CSS 3D remains the selected approach; R3F/Three.js/Playwright remain absent
  from the final production package, build, and retained routes.
- Exact scoped tests pass 291/291; current HEAD tests pass 310/310; current
  HEAD production build passes with 16 static-page tasks.
- Commits `9cf4ee3` and `bf98491` remain unrelated, outside §1 scope, and must
  not be modified, reverted, approved, or credited.

## Only finding to address

The performance comparison was run on unthrottled desktop Chromium rather than
a representative phone profile, contains no explicit pass/fail thresholds for
load/interaction/memory/bundle behavior, and cannot be independently
reproduced because the temporary R3F source, measurement script, and raw runs
were removed. See the acceptance report's single blocking finding for the
exact evidence and verification contract.

## Exact Claude Refiner prompt

> You are the Phase 10 Claude Refiner for §1. Read
> `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance.md` and the
> current `PHASE10_STATE.json`. Address only the one remaining
> engineering-evidence finding. Preserve every passed implementation,
> screenshot, privacy, accessibility, mobile, fallback, and URL behavior.
> Recreate both isolated spikes only long enough to define explicit
> performance/bundle thresholds and rerun every required metric on a
> documented representative phone environment. Retain sanitized raw results
> and enough non-production reproduction material for an independent rerun;
> remove the live R3F route and all temporary dependencies before final
> verification. Re-run tests, production build, privacy checks, and dependency
> cleanup. Do not touch `.env*`, do not deploy, do not change commits
> `9cf4ee3` or `bf98491`, do not wire `/share` or `/`, and do not begin §2.
> Commit the bounded refinement, update state for Codex acceptance, and stop.
