# Phase 10 handoff: Codex §1 Critic → Claude Refiner

Prepared July 23, 2026 by `codex/gpt-5`.

## Handoff status

The §1 Codex Critic result is **FAIL** with five bounded findings. Refine §1
only. Do not begin §2.

Critic report:
`docs/phase10-reviews/2026-07-23-section-1-codex-critic.md`

Builder candidate:
`507265d6e3427a414f2e2844d8513243ef348198`

## Read in this order

1. `PHASE10_PROGRESS.md`
2. `AGENTS.md`
3. `PRODUCT_DIRECTION.md`
4. `docs/PHASE10_UX_ARCHITECTURE.md`
5. `docs/PHASE10_AGENT_WORKFLOW.md`
6. `PHASE10.md`
7. `PHASE10_STATE.json`
8. `docs/phase10-reviews/2026-07-23-section-1-codex-critic.md`
9. `docs/phase10-spike-section-1/DECISION.md`
10. `docs/phase10-baseline/section-1/README.md`
11. This handoff

## Exact Claude Refiner prompt

> You are the Phase 10 Claude Refiner for §1. Read the current state and the
> Codex Critic report. Address only the five recorded blocking findings:
> complete and truthfully dimension the required CSS-vs-R3F measurements and
> screenshots; preserve private/no3d query state across chapter links; remove
> the retained CSS spike's dead link to the removed R3F route; raise freshness
> label contrast to at least 4.5:1; and implement the selected static
> concentric fallback without duplicate controls or mobile overflow. Preserve
> every passed behavior. Use genuine 1440×900, 390×844, and 320px checks and
> verify screenshot pixel dimensions before documenting them. Temporarily
> restoring R3F for measurement is allowed only inside §1; remove its code and
> dependencies again before the final verification and commit. Re-run the
> section tests, full tests, production build, privacy checks, and visual
> checks. Do not touch `.env*`, do not deploy, do not wire the shell into
> `/share` or `/`, and do not begin §2. Commit the green refinement as
> `phase10(§1): refine critic findings`, update state for Codex acceptance
> review, prepare the Codex handoff, then stop.

## Findings to close

1. Required spike runtime measurements are missing, all committed desktop
   images labeled 1440×900 have different pixel dimensions, and no genuine
   390×844 screenshot is committed.
2. Chapter links drop `mode=private` and `no3d=1`.
3. The retained CSS spike links to removed `/dev/phase10-spike-r3f`.
4. The freshness label is 3.82:1 at 12.8px/400.
5. The exact selected static concentric fallback is absent.

## Preserve

- Five semantic links, one navigation landmark, and one active article.
- Current `aria-current`, focus restoration, browser history, and no-JS
  anchor behavior.
- Single-DOM fallback with no duplicate focus stops.
- 44px mobile targets and no 390px/320px horizontal overflow.
- Public/private render isolation, owner gating, and dollar privacy.
- CSS 3D as the recorded production decision and zero final R3F dependency.
- No production route wiring; `/share` and `/` remain later-section work.

## Stop condition

Stop after the green §1 refiner commit and Codex acceptance handoff. Devan
returns to Codex with:

> Act as the Phase 10 Acceptance Reviewer for §1. Independently verify the
> complete section diff, behavior, evidence, tests, build, privacy, mobile,
> reduced motion, fallback, and all scorecard categories. Mark §1 complete
> only if every category and acceptance criterion passes. Otherwise return
> the smallest complete failure list to Claude Refiner. Do not begin §2.
