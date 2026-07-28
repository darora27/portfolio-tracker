# Phase 10 §10 handoff: Claude Lead → Codex Implementation, remediation round 3

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned 4 bounded findings. Both binding gates pass independently; every
finding is a live-render measurement that no unit test covers.

## What this turn did

Reviewed candidate `3bdf46895ceeaaa4e125bac80f64776f3fb63423` (HEAD at turn
start). Its application source is byte-identical to the round-2 remediation
commit `61db1d6` — `git diff 61db1d6 HEAD -- src/ public/ scripts/
package.json package-lock.json` is empty — so the six commits on top (owner
design documents, the owner feedback ledger, the §11 roadmap insertion, and a
launch-argument-only change to the retained Playwright verifiers) do not change
what was reviewed.

No application source was changed. The turn ran every retained §10 verifier
unmodified against a production server on a real GPU, re-ran both binding gates,
filled reviewer results in the acceptance ledger, wrote the review document and
this handoff, and retained all raw evidence.

## Evidence

- Candidate commit: `3bdf46895ceeaaa4e125bac80f64776f3fb63423` — `chore: point
  the final-report marker at the new terminal section`
- Round-2 remediation commit reviewed within it:
  `61db1d68fe5afb5a3c6ec2f04da79389ea432277`
- Acceptance ledger:
  `docs/phase10-workflow/acceptance/section-10.json`, reviewer column;
  `candidate_sha` updated to the reviewed HEAD
- Tests: `npm test` — **99/99 files, 526/526 tests, 0 failures** (independent
  review run)
- Build: `npm run build` — **exit 0**, Next.js 16.2.11, 18 static page tasks,
  route list unchanged, `/share` 200 and Mission Control manifest 200
- Live evidence:
  `docs/phase10-baseline/section-10/claude-review-3/` (README, raw verifier
  output, non-throwing full tables, CPU-profile attribution, pixel crops,
  reviewer probe scripts), plus regenerated
  `docs/phase10-baseline/section-10/after/` and `mobile/`
- Review doc: `docs/phase10-workflow/reviews/section-10-review-3.md`
- Inherited red: none. The tree is green on both gates.

## Findings to remediate

Four, all high risk. Full detail with tables is in the review document; the
state file carries the bounded `summary` and `required_change` for each.

- **F1 / `TST-03`** — the trail sampler fails 7 of 8 holdings. Three separable
  mechanisms are identified from retained pixel neighbourhoods and crops:
  ASML's published sample point sits inside the planet's own disc; the additive
  glow washes bright ramp values toward white; the core is sub-pixel on the
  outer orbits and blends with the void. Start with ASML — it is the only
  failure the colour pipeline alone cannot explain.
- **F2 / `BLD-04`** — 61/57/55/55/55 ms across five fresh contexts. A CDP CPU
  profile attributes the breaching task to Three.js `WebGLPrograms`
  shader-program acquisition (`N @ chunks/2tdjt19k1le0z.js:357`, 34.3 ms self
  time in the 68 ms window), **not** texture upload — `texSubImage2D` never
  exceeds 2.5 ms in any bin, so round 2's staggered map binding worked and was
  not the cause. Work from that attribution.
- **F3 / `DEF-02`** — regression: chirality now fails 6 of 8 worlds, against 4
  of 8 in round 2. CBRS and NBIS moved from pass to fail; MSFT's mirror signal
  is unmoved, so the alpha-mask compositor change did not reach the rendered
  mark. `TST-04` passes, so the verifier is correct.
- **F4 / `VIS-12`** — the contribution-numeral defect is fixed (0 px overlap on
  all 13 rows) and all 16 surfaces plus both mobile captures exist. Only the
  question duplication remains, and only for SCOPE, HAZARD and SIGNALS.

## For the next actor

State is `stage=remediate`, `role=codex_implementation`, `next_actor=codex`,
`status=ready`.

1. Remediate **only** F1–F4. Do not widen scope, do not modify any retained
   verifier, and do not change a threshold, sample point, or assertion to make
   a gate pass.
2. Chromium is now runnable in this repository. `playwright` and
   `playwright-core` are in `node_modules/.bin`, `~/Library/Caches/ms-playwright`
   has a cached Chromium, and the owner's `2af5b3d` added
   `--no-sandbox --disable-setuid-sandbox` to every retained script. The whole
   matrix ran this turn on a real GPU with zero console errors. Start
   `npx next start -p <port>` and run the verifiers with
   `PHASE10_BASE_URL=http://127.0.0.1:<port>/share`. Scripts must live inside
   the repository for ESM to resolve `node_modules`. **Live results are no
   longer deferrable to the reviewer.**
3. The retained verifiers throw on first failure. Copy and patch a script to log
   the full matrix when you need it, and retain the patched copy as evidence —
   `claude-review-3/scripts/` has working examples for each.
4. Re-run `npm test` and `npm run build` green before committing, and re-run
   `capture-live-evidence.mjs` so the `after/` artifacts show the fixes.
5. Fill only the implementer column of
   `docs/phase10-workflow/acceptance/section-10.json` and run
   `npm run phase10:acceptance -- check <ledger> --require implementer`.
6. High-risk criteria still requiring independent live checks at the next
   review are named in `section.unperformed_criteria_note`: sixteen carry
   round-2 reviewer results at the earlier candidate `3d1882a`, and fifteen have
   never been performed (`DEF-01`, the visible-body half of `DEF-04`, `DEF-06`,
   `DEF-07`, `BHV-05`, `BHV-09`, `BHV-10`, `VIS-02`, `VIS-06`, `VIS-07`,
   `VIS-08`, `VIS-10`, `VIS-13`, `VIS-14`, `BLD-05`). None of them is an
   implicit pass.

## Route after this handoff

- Section: `§10`
- Stage: `remediate`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
