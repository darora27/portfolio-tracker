# Phase 10 §10 handoff: Claude Lead → Codex Implementation, remediation round 2

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned 4 bounded findings. Both critical findings from round 1 are
closed; two round-1 findings remain open on the same criteria, one criterion
failed on its first-ever execution, and one is partially remediated.

## What this turn did

Changed no application source. Ran the complete live matrix the previous turn
could not reach, filled reviewer results in the acceptance ledger, and routed
§10 back to remediation.

- Independent gates: `npm test` 99 files / 526 tests PASS;
  `npm run build` PASS (route list unchanged, `/share` 200 + Mission Control
  manifest smoke).
- Ran every retained section verifier unmodified against a `next start`
  production build at `http://127.0.0.1:3131/share`, headless Chromium from the
  repository's own `node_modules`, real GPU
  (`ANGLE (Apple, Apple M2, OpenGL 4.1)`).
- Wrote `docs/phase10-workflow/reviews/section-10-review-2.md` and retained all
  raw output and scripts under
  `docs/phase10-baseline/section-10/claude-review-2/`.
- Filled `reviewer` results for 26 criteria: 21 pass, 4 fail, 1 blocked.
- Recorded `3d1882a116ef116f21a529eaa050f17f88875def` as the candidate SHA in
  the ledger and replaced the placeholder in
  `section.remediation_commits` with that hash.

## Evidence

- Candidate commit: `3d1882a116ef116f21a529eaa050f17f88875def` —
  `phase10(§10): remediate live verification failures`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-10.json`
  (reviewer column; implementer column re-checked with `--require implementer`)
- Tests: `npm test` — 99 files, 526/526 pass. Independent review run.
- Build: `npm run build` — Next.js 16.2.11, compiled, TypeScript clean, route
  list unchanged, `/share` 200 and Mission Control manifest 200.
- Screenshots: `docs/phase10-baseline/section-10/after/` (16 surfaces at
  1440×900) and `docs/phase10-baseline/section-10/mobile/` (390×844, 320×844),
  all produced by `capture-live-evidence.mjs` running end-to-end.
- Review doc: `docs/phase10-workflow/reviews/section-10-review-2.md`
- Round-2 raw evidence and scripts:
  `docs/phase10-baseline/section-10/claude-review-2/`
- Inherited red: none. §9's exception is closed and `main` is green on both
  gates.

## Closed this turn — do not re-open

- **`VIS-01`** (round-1 F1): all eight worlds inside `[0.16, 0.55]`; INTC
  reversed 0.0164 → 0.2432. The window was not moved.
- **`BHV-02`** (round-1 F2): all three satellites acquire by pointer; HAZARD
  5/5 by direct aim (was 0/60). The sun kept its pointer surface.
- **`DEF-09`** (round-1 F3): HAZARD → `station=hazard` 5/5, DRIFT →
  `station=scope`, SUPPLY → `station=comms` 7/9.

## For the next actor

Four bounded findings, in the review doc's section 3. This is the entire
authorized scope — change nothing else.

1. **F1 / `TST-03`** — `sample-live-rgb.mjs` aborts at `GOOG deltaE 13.022 > 8`.
   6 of 8 holdings exceed ΔE 8, IBM still fails hue lock at 22.88° with chroma
   0.067, and one loss-direction ordering violation remains (MSFT L 0.278 darker
   than ASML L 0.341). The opaque-core change fixed ASML exactly and removed one
   ordering violation, so the diagnosis was right and incomplete.
2. **F2 / `BLD-04`** — 62/56/56/56/57 ms across five fresh 1440×900 CPU-2×
   contexts (and 69/59/55/55/56 ms on an earlier identical run). The module
   worker did not clear the gate. Attribute the remaining ~56 ms task at
   ~570–590 ms after navigation before changing anything else. No
   baseline subtraction, no gate redefinition, no post-processing pass.
3. **F3 / `DEF-02`** — first execution of the chirality assertion, now reachable
   because `VIS-01` passes. 4 of 8 worlds fail: MSFT (normal −0.478 vs mirrored
   +0.249) and INTC (normal −0.278 vs mirrored +0.211) are decisive; COST and
   IBM fail on sign within noise. `TST-04` passes, so the guard is fine — the
   textures are not.
4. **F4 / `VIS-12`** — the evidence half is closed. Two round-1 defects remain:
   the MANIFEST bay renders its question twice (`MissionControl.tsx:155` plus
   `ManifestBay.tsx:21`; the PLOT equivalent was fixed and this one missed), and
   the MANIFEST CONTRIBUTION cell draws its bar over the numeral, hiding a
   character of a public financial value.

After remediation, re-run every retained verifier to completion and populate the
required artifacts. `VIS-04` (critical) is recorded **blocked** on F1 and must
be re-run once the trail sampler passes.

Sixteen criteria remain unperformed and are explicit work, not implicit passes:
`DEF-01` `DEF-03` `DEF-04` `DEF-06` `DEF-07` `BHV-05` `BHV-09` `BHV-10`
`VIS-02` `VIS-06` `VIS-07` `VIS-08` `VIS-10` `VIS-13` `VIS-14` `BLD-05`.
`DEF-04`'s pointer and keyboard halves are confirmed; only its visible-body half
remains. Round 1's `VIS-06` "even dot lattice" observation is withdrawn as
unsubstantiated — the lattice is a reticle overlay, not the starfield.

## Route after this handoff

- Section: `§10`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
