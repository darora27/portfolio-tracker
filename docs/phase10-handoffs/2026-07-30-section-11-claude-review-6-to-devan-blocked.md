# Phase 10 §11 handoff: Claude Lead (review turn 6) → Devan

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

blocked — see Decision needed. F10 (`VIS-16`) closed with zero new bounded
findings against application code; the section cannot accept without two
decisions only you can make.

## What this turn did

- Independently re-verified F10/`VIS-16` (the ring far-side alpha/width
  remediation): own production build, own server (fresh port, independent
  of the implementer's already-stopped process), the implementer's own
  measurement script re-run fresh 5 times. All 5 runs clear the unweakened
  `>6` luminance-delta threshold on both sampled rings (ASML 17.0–20.9,
  CBRS 13.2–18.2) with comfortable margin. A fresh full-overview screenshot
  corroborates: every ring reads as a complete faint circle, not confined
  to the near-planet arc, and the frame doesn't read as "uniform graph
  paper." **F10/VIS-16 CLOSED.**
- Independently re-ran `npm test` (107 files, 553 tests, zero failures) and
  `npm run build` (exit 0, 18/18 pages, `/share` smoke pass) — both this
  turn's own runs.
- Confirmed via `git diff --stat` that the remediation touched only
  `OrreryScene.tsx`, `scene-model.ts`, `scene-model.test.ts` in application
  source — no scope drift beyond F10.
- Per your own instruction recorded in `PHASE10_STATE.json`
  (`unperformed_criteria_note`: "decide whether to route BHV-31 pro-rata /
  MOB-11 as new findings or spec questions"), decided both are **spec
  questions, not code findings** — see below.

## Evidence

- Candidate commit: `e8faf0d3ae6ce7f14f9a9f0b44205f51f0b4ae77` —
  `phase10(§11): remediate F10 — ring far-side geometry, alpha, and width`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `VIS-16.reviewer` → `pass`
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run)
- Build: `npm run build` — exit 0 (this turn's own independent run)
- Screenshots: `docs/phase10-baseline/section-11/raw-review-6-overview-ring-check.png`
- Review doc: `docs/phase10-workflow/reviews/section-11-review-6.md`
- Inherited red: none

## Decision needed (status = blocked)

Two open acceptance criteria block accept and can't be resolved by more
measurement — both are yours to decide:

**1. `BHV-31` — pro-rata rounding tolerance.** With a real keyboard-driven
edit, the seven untouched holdings' relative mix drifted by up to 1.8
percentage points (`maxRatioDrift: 0.0184`), plausibly just the half-unit
rounding the spec already mandates. The spec never defines a tolerance for
"preserves the relative mix," so nobody can grade this pass/fail without you
setting a number. **What maximum ratio drift is acceptable?**

**2. `MOB-11` — does the mobile fallback need new sections?** The spec can
be read two ways: either the below-1024px fallback must grow
`CORRELATION`/`TRADES`/`ORBITS` sections it doesn't currently show (because
`BHV-10` says every renamed noun appears "in the fallback"), or the fallback
only needs to correctly name the sections it already has (because `MOB-10`
describes it as "the existing tested... holdings list," not a mobile
reimplementation of Mission Control). **Which is it?**

Once you answer both, the next review turn grades them and (assuming no
other findings) attempts a full accept — which will also need to close a
pre-existing ledger-hygiene gap (`docs/phase10-workflow/reviews/section-11-review-6.md`,
"Not attempted this turn" section) unrelated to either of these two
questions.

## Route after this handoff

- Section: `§11`
- Stage: `review`
- Role: `claude_lead`
- Status: `blocked`
- Next actor: `devan`
