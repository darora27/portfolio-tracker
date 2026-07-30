# Phase 10 §11 handoff: Claude Lead (review 5) → Codex Implementation (remediation)

Prepared July 30, 2026 by `claude-code/sonnet-5` (Claude Lead, `stage: review`,
covering both roles under `single_provider_mode`).

## Outcome

review returned 1 bounded finding — F9 closed, F10 (new) blocks acceptance.

## What this turn did

- Independently re-verified F9 (`BHV-20`) with a fresh unseeded browser
  context against this turn's own build/server, not a re-read of the
  implementer's committed JSON. Confirmed `pass: true`, byte-identical to the
  implementer's result. **F9 CLOSED.**
- Fixed review-4's `VIS-16` sun-center estimation error (its ASML far-side
  reference point had landed on the `GOOG` ticker label, producing a false
  positive) by sourcing sun position from the render loop's own existing DOM
  signal (`mount.dataset.evidenceSunX/Y`) instead of a pixel scan, and by
  sampling a 15-point median arc instead of one exact point. Re-measured:
  both sampled rings (ASML, INTC) read at background level at the far side —
  **NEW FINDING F10 (`VIS-16`, high risk)**. A targeted near-planet check
  confirms the ring *does* render and is visible close to its peak-alpha
  zone; it does not sustain to the far side / floor alpha as required.
- Substantiated `BHV-34` as **PASS** via the keyboard-adjustment path
  (pointer-drag does not register a real edit under this harness — see
  below) with a polled `location.href` read replacing review-4's fixed-wait
  read that had produced a contradictory result.
- Substantiated `BHV-31`'s **siphon latch** as **PASS** via the keyboard path
  (Space-to-latch, spec §7.4.4).
- Identified and recorded a harness-level root cause: pointer-drag gestures
  (`mouse.down/move/up`) do not register any weight change under this
  Playwright/headless-Chromium setup, confirmed convergently across three
  attempts (review-4's and two of this turn's). This means review-4's
  `BHV-30`/`BHV-31` pro-rata confirmations were measured against a no-op.
  Re-ran both via the keyboard path with a real edit: `BHV-30` (sum stays
  100) still holds; `BHV-31` pro-rata shows measurable ratio drift
  (`maxRatioDrift 0.0184`) with no spec-defined tolerance to grade it
  against — left `not_run`, not a new finding, not asserted either way.
- Re-read `MOB-11` against `BHV-10` per the prior handoff's request. Still
  genuinely ambiguous (both readings defensible from the spec text) — left
  `not_run`, fuller reasoning recorded in the ledger and review doc, routing
  decision deferred to spec/owner.
- Ran `npm test` (107 files / 553 tests, zero failures) and `npm run build`
  (exit 0) independently, this turn's own run.
- No application source (`src/`, `public/`) changed this turn — review-only.

## Evidence

- Candidate commit: `0fae59d288b144f88e7ce832bc9807a9b5704449` —
  `phase10(§11): remediate F9 — first-visit-only legend bar`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-11.json` —
  `BHV-20.reviewer` → `pass`, `VIS-16.reviewer` → `fail`,
  `BHV-34.reviewer` → `pass`, `BHV-31.reviewer` and `MOB-11.reviewer` →
  `not_run` with expanded notes; `candidate_sha` updated.
- Tests: `npm test` — 107 files, 553 tests, zero failures (this turn's own
  independent run)
- Build: `npm run build` — exit 0 (this turn's own independent run)
- Review doc: `docs/phase10-workflow/reviews/section-11-review-5.md`
- Live evidence: `docs/phase10-baseline/section-11/raw-review-5-*.json` /
  `.png` (legend re-verification, ring-alpha v1/v2, draft-rig
  keyboard-path re-tests, isolated BHV-34 test)
- Inherited red: none

## For the next actor

This is a **remediate** turn, bounded to **F10 (`VIS-16`) only** per
G-SCOPE. Investigate why the ring's floor alpha (0.22 token, present in
source at `src/lib/observatory/scene-model.ts:20`) does not read above
background at the far side — check the shader's per-fragment alpha
application across the full ring geometry, and consider whether 0.22 is
simply below the perceptible threshold at this background/exposure
combination (a product decision, not only a code fix, if so). Do not weaken
the >6 luminance-delta pass threshold or the two-ring sampling requirement.

Two items are flagged as worth attention but are **not** in this turn's
bounded scope (not findings): the pointer-drag harness gap blocking
conclusive `BHV-30`/`BHV-31`/`BHV-33` drag-specific coverage, and `BHV-31`
pro-rata's undefined tolerance. `MOB-11`'s scope ambiguity needs a
spec/owner decision, not a code change.

The five owner-carried criteria (`BHV-11`, `VIS-10`, `VIS-02`, `DEF-02`,
`BHV-05`) remain untouched.

## Route after this handoff

- Section: `§11`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
