# Phase 10 §9 handoff: Claude Lead (review round 2) → Codex Implementation, remediate

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned 1 bounded finding. All six prior findings (F1–F6) are verified
resolved.

## What this turn did

Reviewed `7e37bdd` (`phase10(§9): remediate review findings`) against
`docs/phase10-workflow/specs/section-9.md`. Ran `npm test` and `npm run build`
independently, started my own production server rather than relying on the
build's smoke, scanned the live public payload for disclosure leaks, decoded
all eight shipped KTX2 base maps at full resolution, inspected every committed
§12 artifact, and measured live label/planet geometry at 1440×900.

Files touched this turn — no application source changed:

- `docs/phase10-workflow/reviews/section-9-review-2.md` (new)
- `PHASE10_STATE.json` (findings replaced with F7, prior findings recorded as
  resolved, `remediation_commits` placeholder replaced with `7e37bdd`,
  `prev_actor_commit` → `7e37bdd`, stage → `remediate`)
- this handoff

## Evidence

- Reviewed commit: `7e37bdda62b0cf9d283b54410f96cffa5828d673` —
  `phase10(§9): remediate review findings`
- Tests: PASS — 94 test files, 497/497 tests
- Build: PASS — Next.js 16.2.11, TypeScript clean, 18 static-generation tasks,
  post-build smoke `Share route smoke: PASS (/share 200; Mission Control
  manifest 200)`
- Independent live probe: `/share`, all seven `?station=` bays,
  `?focus=ASML&camera=approach`, `?camera=sector`, and `/` → 200, empty server
  error log
- Independent privacy scan: zero `$n.nn` matches and zero
  `shares`/`price`/`total`/`realized_gain`/`reason` field names across five
  public surfaces
- Review doc: `docs/phase10-workflow/reviews/section-9-review-2.md`
- Evidence inspected: `docs/phase10-baseline/section-9/` (14 frames at exactly
  1440×900, `mobile/fallback-390x844.png`, `mobile/fallback-320x844.png`,
  `after/live-sphere-strip-32.png`, `raw-long-task-output.txt`,
  `raw-rgb-pixel-output.txt`, `raw-interaction-audit.txt`,
  `raw-capture-output.txt`, `raw-live-scene-diagnostic.txt`)

## For the next actor

Fix **only F7** (`PHASE10_STATE.json` → `section.findings`, and §"Finding" of
the review doc). It is the one criterion pair that fails: at OVERVIEW on a
1440×900 frame, the outermost planet `NBIS` and its tag leave the viewport
(tag bottom 935 against viewport height 900, tag left −8, sphere left edge
−10), so criterion 1 (all eight tags legible at rest) and criterion 17 (no
planet clipped) both fail. This is not a regression you introduced — it was
unobservable while `/share` returned 500, and both criteria were named in F1's
blocked list.

Two things the required change asks for together:

1. Make the composition fit the frame — derive scale from the projected extent
   of the outermost orbit at the OVERVIEW camera rather than from the flat
   `OVERVIEW_BELT_SPAN_PCT` constant, and/or clamp tag placement to the
   viewport.
2. Assert it where it can fail. `scene-model.test.ts:101-102` currently checks
   `belt.viewportSpanPct` against the constant that produced it, which cannot
   fail. Expose projected bounding boxes for every planet and label in
   `buildOverviewSceneModel` and unit-test that all eight stay inside 1440×900
   across a full orbital phase sweep.

Then recapture `after/overview-1440x900.png` and record the criterion 1 and 17
results in `docs/phase10-baseline/section-9/README.md` with executor suffixes.

Do not revisit F1–F6, and do not change trail/orbit sign→colour or
sign→direction mapping (spec §1.1, D1). Do not restructure any surface beyond
what F7's required change names.

One item recorded for §15, deliberately **not** a finding and not for you to
act on now: `npm run build` now boots a production server and fetches `/share`,
which means the build depends on that server and its data sources in whatever
environment runs it, including Vercel's deploy container. It passes here and no
§9 criterion fails because of it; §15 owns deploy and resilience.
