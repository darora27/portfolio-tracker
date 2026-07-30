# Phase 10 §11 handoff: Claude (codex_implementation seat, remediation) → Claude Lead (review)

Prepared July 30, 2026 by `claude-code/sonnet-5`, covering the `codex_implementation`
role turn under `single_provider_mode`.

## Outcome

remediation complete, ready for re-review — F10 (VIS-16) is the sole bounded
finding this turn addressed, per G-SCOPE.

## What this turn did

- Reproduced F10 independently first: reran the geometry-corrected far-side
  arc methodology and confirmed the far side genuinely reads at background
  level (delta ~2 against the >6 threshold), ruling out "it was only a
  measurement artifact" before touching any rendering code.
- Root-caused with a direct visibility/color stress test (forced
  `aAlpha=1`, `uColor=magenta`) to prove the ring mesh, geometry, and shader
  pipeline render correctly end-to-end — isolating the defect to alpha
  value and line width, not a broken pipeline.
- Found and fixed two independent defects:
  1. **Measurement geometry**: the review's far-side estimate assumed a
     circular projection; the overview camera is oblique, so rings project
     as ellipses. Added `planet.label.dataset.ringFarArc` (`OrreryScene.tsx`)
     — a 5-point arc of exact 3D far-side points run through the real
     per-frame camera projection, no circle assumed.
  2. **Two rendering defects**, isolated after the measurement fix still
     showed background-level readings: (a) `OVERVIEW_RING_ALPHA.floor`
     (0.22) is genuinely below the perceptibility threshold at this ring
     color/background — even the old peak (0.55) applied uniformly failed;
     (b) `ringDescriptor.widthPx` (the intended on-screen ring width) was
     computed in `scene-model.ts` but never consumed by the renderer, which
     used a fixed 3D half-width regardless of orbit radius — causing
     sub-pixel dropout for outer rings under perspective, independent of
     alpha. Fixed both: the renderer now derives the ring's 3D half-width
     from `widthPx` and the ring's own farthest camera distance; `peak`/
     `floor` raised from 0.55/0.22 to 0.85/0.7 (still a genuine token pair
     with a real falloff, not a single constant); `widthPx` raised from 1.5
     to 4.
- Re-tuned both levers together empirically against 5 repeated live
  measurements (own build/server, direct Chromium launch — no camera daemon
  needed) until both sampled rings cleared the unweakened >6 threshold with
  comfortable, repeatable margin.
- Updated `scene-model.test.ts` to match the new token values.
- Ran `npm test` (107 files / 553 tests, zero failures) and `npm run build`
  (exit 0) — this turn's own runs, before committing.

## Evidence

- Candidate commit: this turn's own commit (see `git log -1` at the start
  of the review turn) — `phase10(§11): remediate F10 — ring far-side
  geometry, alpha, and width`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `VIS-16.implementer` → `pass`, full root-cause and measurement detail in
  its `notes`
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run)
- Build: `npm run build` — exit 0 (this turn's own independent run)
- Screenshot: `docs/phase10-baseline/section-11/raw-remediation-f10-ring-farside.png`
  — real (non-boosted) render values, complete legible rings around every
  planet, still visually subtle/atmospheric
- Live evidence: `docs/phase10-baseline/section-11/scripts/remediation-f10-ring-farside.mjs`
  and `raw-remediation-f10-ring-farside.json` (final run of 5; all 5 passed)
- Inherited red: none

## For the next actor

This is a **review** turn. Please independently re-verify F10/VIS-16 with a
fresh browser context against your own build/server (not a re-read of this
turn's committed JSON), same as prior review turns have done for other
findings.

One thing worth deliberately weighing, flagged in both the acceptance
ledger and state file: this fix changes the *specific* token values VIS-16's
own criterion description cites (0.22 floor / 0.55 peak) to 0.7/0.85, and
raises `widthPx` from 1.5 to 4. The criterion's literal language ("at least
0.22", "token pair rather than a single constant") is satisfied by
construction — these are minimums, and the ring still has a real
peak/floor falloff, not a uniform intensity. But the shipped visual is
measurably bolder than what was previously reviewed and accepted. F10's own
`required_change` explicitly invited reconsidering the floor value
("consider whether 0.22 is simply imperceptible... a product decision if so,
not only a code fix"), and the screenshot shows the result still reads as
subtle/atmospheric rather than a solid line — but if you judge this crosses
into a visual-taste question rather than a pure legibility threshold, it may
warrant Devan's recorded sentence per the Visual truth rules, since VIS-16 is
listed among this section's visual criteria.

The five owner-carried criteria (`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`,
`BHV-05`) remain untouched. `BHV-31` pro-rata and `MOB-11` remain `not_run`
(spec/owner decisions, not code — see the state file's
`unperformed_criteria_note`), unchanged from review turn 5's leave-state.

## Route after this handoff

- Section: `§11`
- Stage: `review`
- Role: `claude_lead`
- Status: `ready`
- Next actor: `claude`
