# Phase 10 §10 handoff: Claude Lead → Codex Implementation, remediation

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned **6 bounded findings** (F1–F6), two of them on `critical`
criteria. Both binding gates are green at the candidate; the failures are all in
the live matrix that no unit test covers.

## What this turn did

No application source changed. This turn ran the deferred live matrix, recorded
reviewer results, and routed the section to remediation.

- Independently re-ran `npm test` (99 files, **525/525**) and `npm run build`
  (18 static page tasks, route list unchanged, `/share` 200 + Mission Control
  manifest smoke) at the candidate.
- Ran the six retained verifier scripts against a `next start` production build
  at `http://127.0.0.1:3131/share`, 1440×900.
- Added `docs/phase10-workflow/reviews/section-10-review.md`, reviewer results
  and `candidate_sha` in the acceptance ledger, and retained evidence under
  `docs/phase10-baseline/section-10/claude-review/`.

**Codex's deferral was honest and correctly executed** — nothing live was claimed
without its artifact. The difference is environmental: `playwright` and cached
Chromium are present in this repository's own `node_modules`, and the scene
renders on a real GPU headlessly (`ANGLE (Apple, Apple M2, OpenGL 4.1)`, all 24
planet `.ktx2` maps HTTP 200, zero console errors). Prefer that path next turn.

## Evidence

- Candidate commit: `457f90f6dff6c4e64bde22cee0c9725b32ce0c36` —
  `phase10(§10): complete universe legibility pass`
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-10.json` —
  reviewer column filled: **6 fail, 9 pass, 62 not_run**; `candidate_sha` set
- Tests: `npm test` — **PASS**, 525/525 across 99 files (independent review run)
- Build: `npm run build` — **PASS**, route list unchanged
- Screenshots: `docs/phase10-baseline/section-10/claude-review/surfaces/`
  (16 surfaces at 1440×900) and `.../claude-review/mobile/` (390×844, 320×844)
- Raw measurement output: `.../claude-review/raw-*.txt`
- Reviewer scripts: `.../claude-review/scripts/`
- Review doc: `docs/phase10-workflow/reviews/section-10-review.md`
- Inherited red: **none** — §9's two `planet-textures.test.ts` failures are
  closed (`BLD-01`), the byte ceiling reads `30_000_000`, and INTC/CBRS clear
  the unchanged `luminanceStdDev ≥ 0.1` floor. `main` is green again.

## The six findings

| ID | Criterion | Risk | One line |
|---|---|---|---|
| F1 | `VIS-01` | critical | 7 of 8 worlds outside `[0.16, 0.55]`; INTC regressed against §9 |
| F2 | `BHV-02` | critical | Satellites unreachable by pointer — corona pick meshes swallow them |
| F3 | `DEF-09` | high | Same cause: satellite destinations keyboard-only |
| F4 | `TST-03` | high | Trail sampler fails ΔE, hue lock and ordering |
| F5 | `BLD-04` | high | Long task 61 ms vs the 50 ms gate; §9 measured 0 ms |
| F6 | `VIS-12` | high | No 1440×900 evidence existed; capture aborts on F2 |

Full evidence, root causes and the required change for each are in the review
doc. Two things worth carrying into the work:

- **F2's root cause is in your own README.** The `DEF-05` fix gave both corona
  glow meshes the `portfolio` target; after the §5.1 sun rescale the satellites
  orbit inside that footprint. Fix precedence, not by adding a hit plane — and
  do not revert `DEF-05`.
- **F1 has a calibration caveat.** §9's committed strip does not reproduce the
  `MSFT 0.157 / ASML 0.207 / GOOG 0.551` figures the spec quotes as the window's
  basis; measured with the same formula it gives 0.0386 / 0.105 / 0.384. If you
  conclude the window is unreachable as written, **route it to Devan as a
  spec-level decision — do not move the floor yourself.**

## For the next actor

State is `stage=remediate`, `role=codex_implementation`, `next_actor=codex`.

1. Fix **only** F1–F6. No new scope; the spec's out-of-scope list still binds.
2. Re-run every retained verifier to completion. F2 currently blocks
   `capture-live-evidence.mjs` at its first screenshot, so clearing it is what
   makes most of the visual matrix reachable.
3. **27 criteria are `not_run`, not passed** — listed in the review doc §5 and in
   `section.unperformed_criteria_note`. Once F1–F5 land they become reachable and
   are your work to exercise, with retained artifacts. `VIS-06` is worth checking
   first: the overview still reads as an even dot lattice rather than a clustered
   population.
4. `DEF-04`'s pointer and keyboard halves are confirmed working; only its
   *visible body* half is unperformed. Two pixel probes disagreed because the
   body-to-label offset is unknown, so no defect is asserted — verify it properly
   rather than assuming either way.
5. F6's capture surfaced defects to fold in under their own criteria
   (`DEF-10`, `VIS-08`, `VIS-09`, `BHV-10`): the planet-detail ID plate clipped
   off the top of the viewport, a `LOG` chip rendered dark-on-dark with a trade
   row clipped mid-glyph, every bay question rendered twice, and an empty
   MANIFEST table under the PLOT rail.
6. `npm test` and `npm run build` must both be green before the remediation
   commit, and `main` must not go red again.

## Route after this handoff

- Section: `§10`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
