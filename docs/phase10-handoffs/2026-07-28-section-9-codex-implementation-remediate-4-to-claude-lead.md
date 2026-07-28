# Phase 10 §9 handoff: Codex Implementation → Claude Lead, remediation 4

Prepared July 28, 2026 by `codex/gpt-5`.

## Outcome

The single bounded finding F9 is remediated and §9 is ready for Claude Lead
review. The production-weight 360° model sweep, focused checks, full test
suite, TypeScript, production build, and state validator are green. The final
live 1440×900 measurement and screenshot remain an explicit environment-only
evidence gap because this CLI cannot bind localhost.

## F9 changes

- Retuned `ORRERY_MAX_RADIUS` from 1.8 to 1.95. The 0.9 visibility floor and
  square-root-of-weight mapping are unchanged — done by codex/gpt-5.
- Removed the prior 0.18 world-unit surplus from adjacent-ring gaps. Spacing is
  now exactly the specification's complete
  `1.6 × (current radius + next radius)` contract; the belt remains fitted to
  88% of viewport width and the camera is not moved in — done by
  codex/gpt-5.
- Replaced the saturated 35%-weight OVERVIEW fixture with the shipped
  26.5/20.8/12.5/8.3/7.3/7.2/3.8/3.5% distribution, whose heaviest holding is
  strictly below `MAX_WEIGHT` — done by codex/gpt-5.
- Strengthened the 360-step 1440×900 sweep gate to aggregate and assert the
  heaviest diameter band, minimum diameter floor, 85–92% belt span, all planet
  and label bounds, projection parity, and the 1.6× spacing rule — done by
  codex/gpt-5.
- Recorded criterion 1, 17, and 18 results and the live-capture limitation in
  `docs/phase10-baseline/section-9/README.md` and
  `browser-backend.txt` without relabelling an older screenshot — done by
  codex/gpt-5.
- Trail/orbit sign→colour and sign→direction mapping is byte-unchanged — done
  by codex/gpt-5.

## Model results at exactly 1440×900

- Criterion 1: PASS — all eight resting ticker labels remain inside the frame
  across all 360 orbital phases — done by codex/gpt-5.
- Criterion 17: PASS — belt span 88.00%, no planet clipped at any phase,
  adjacent spacing exactly 1.6× the radius sum — done by codex/gpt-5.
- Criterion 18: PASS — production ASML spans 64.27–71.21 px across the sweep,
  centred on the ≈68 px target; the smallest diameter is 25.73 px, above the
  22 px floor — done by codex/gpt-5.

## Verification

- Focused Vitest: PASS — 24/24 tests across `scene-model.test.ts` and
  `orrery.test.ts` — done by codex/gpt-5.
- ESLint on the three touched source/test files: PASS — done by
  codex/gpt-5.
- `npx tsc --noEmit`: PASS — done by codex/gpt-5.
- `npm test`: PASS — 94 files, 499/499 tests — done by codex/gpt-5.
- `npm run build`: PASS — Next.js 16.2.11, TypeScript clean, 23 route tasks;
  post-build smoke `/share` 200 and Mission Control manifest 200 — done by
  codex/gpt-5.
- No package manifest changed, no dependency added, and no new route created —
  done by codex/gpt-5.
- No `.env*` content was read, printed, edited, staged, or committed; no
  `vercel --prod` or deployment command was run — done by codex/gpt-5.

## Live evidence gap for review

The required server attempt returned:

```text
$ npm run start -- --hostname 127.0.0.1 --port 3141
Error: listen EPERM: operation not permitted 127.0.0.1:3141
```

Therefore this turn did not run the retained live geometry script or overwrite
`docs/phase10-baseline/section-9/after/overview-1440x900.png`. The current
image remains pre-F9 and is not evidence for the final composition.

Claude Lead must independently start the production build, run
`docs/phase10-baseline/section-9/scripts/measure-overview-fit.mjs` at exactly
1440×900, verify criteria 1, 17, and 18 against the live renderer with zero
console/page errors, and replace the final OVERVIEW screenshot before PASS.

## Review pointers

- Finding: `docs/phase10-workflow/reviews/section-9-review-4.md`, F9.
- Pure sizing/spacing logic: `src/lib/observatory/orrery.ts`.
- Representative full-sweep gate:
  `src/lib/observatory/scene-model.test.ts`.
- Evidence record: `docs/phase10-baseline/section-9/README.md`.

The remediation commit subject is
`phase10(§9): remediate production-weight planet scale`. Per the
non-self-reference rule, the placeholder in `section.remediation_commits`
must be replaced by Claude Lead from `git log -1` at the start of review.
