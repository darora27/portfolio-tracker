# Phase 10 §9 handoff: Codex Implementation remediation 3 → Claude Lead

Prepared July 28, 2026 by `codex/gpt-5`.

## Outcome

F8 is remediated in source, model geometry, and tests. The worktree is routed
back to Claude Lead `review`. The required post-F8 live 1440×900 measurement
and screenshot remain an explicit environment-only evidence gap: this Codex
environment denied localhost binding and exposed no browser backend.

## Bounded change

- Replaced the affine/fixed-scale planet size model with a clamped
  square-root-of-weight radius scale whose floor keeps small holdings
  selectable — done by codex/gpt-5.
- Removed the uniform `ORRERY_MAX_RADIUS`-derived ring spacing. Each orbit gap
  now derives from its own adjacent radius pair as
  `1.6 × (current + next) + 0.18`, while the first ring preserves the existing
  sun-clearance minimum and makes room for the satellite instruments — done by
  codex/gpt-5.
- Replaced camera-independent `projectedDiameterPx` with exact
  perspective-sphere projection; it is now identical to `bounds.width` for
  the fitted camera — done by codex/gpt-5.
- Wired the live renderer's `data-planet-center-*` and
  `data-planet-radius-px` evidence attributes to the same projection helper,
  so the model and retained live measurement script describe one geometry —
  done by codex/gpt-5.
- Left trail/orbit sign→colour and sign→direction logic byte-unchanged, and
  did not touch any F1–F7 surface — done by codex/gpt-5.

## Acceptance geometry

The 1440×900 unit test builds a new model at every degree of a 360° orbital
phase sweep:

- Criterion 1: every resting ticker-label bound stays inside the viewport —
  done by codex/gpt-5.
- Criterion 17: the perspective-projected belt remains at 88.00%, every
  planet stays inside the viewport, and every adjacent ring gap remains above
  1.6× the radius sum — done by codex/gpt-5.
- Criterion 18: the heaviest fixture planet ranges from 64.93–71.78 px,
  centred on the ≈68 px target; the smallest diameter reached by any planet is
  24.46 px, above the 22 px floor — done by codex/gpt-5.
- The test asserts `projectedDiameterPx === bounds.width` per planet per
  phase, so a fixed pixels-per-world-unit constant can no longer pass against
  itself — done by codex/gpt-5.

## Verification

- Focused Orrery/model tests: PASS — 24/24 — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS — done by codex/gpt-5.
- `npm test`: PASS — 94 files, 499/499 tests — done by codex/gpt-5.
- `npm run build`: PASS — Next.js 16.2.11 compilation and TypeScript, 18
  static-generation tasks, `/share` 200, Mission Control manifest station 200
  — done by codex/gpt-5.
- No `.env*` contents were read, printed, edited, staged, or committed; no
  `vercel --prod` or deployment was run — done by codex/gpt-5.

## Required live review

The current F8 composition could not be captured in this Codex environment:

```text
npm run start -- -p 3132
Error: listen EPERM: operation not permitted 0.0.0.0:3132

npm run start -- -H 127.0.0.1 -p 3132
Error: listen EPERM: operation not permitted 127.0.0.1:3132

In-app browser:
No browser is available
```

`docs/phase10-baseline/section-9/after/overview-1440x900.png` was deliberately
left untouched and remains pre-F8. Claude Lead must independently run
`docs/phase10-baseline/section-9/scripts/measure-overview-fit.mjs` against the
committed production build at exactly 1440×900, confirm criteria 1, 17, and 18
live with zero console errors, and overwrite that screenshot before PASS.
This is the standing prompt's environment-only browser exception, not a
visual pass claim — recorded by codex/gpt-5.

## State and next actor

`PHASE10_STATE.json` is now `current_section: "§9"`, `stage: "review"`,
`role: "claude_lead"`, `status: "ready"`, and `next_actor: "claude"`.
`prev_actor_commit` records Claude Lead's incoming review commit
`2981277cc10dd0efc324dc28c42b6175175dfea6`.
`section.remediation_commits` contains the required non-self-referential F8
placeholder; Claude Lead must replace it with this turn's commit hash from the
clean starting HEAD.
