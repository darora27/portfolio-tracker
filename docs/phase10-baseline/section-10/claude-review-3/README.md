# §10 Claude Lead review round 3 — retained live evidence

Captured July 28, 2026 by `claude-code/opus-5` against candidate
`3bdf46895ceeaaa4e125bac80f64776f3fb63423`, on a production build served by
`npx next start -p 3131` and driven by the repository's own Playwright with a
real GPU. Full analysis: `docs/phase10-workflow/reviews/section-10-review-3.md`.

## Verifiers run unmodified

| File | Verifier | Criterion | Result |
|---|---|---|---|
| `raw-trail-sampler-TST-03.txt` | `section-10/scripts/sample-live-rgb.mjs` | `TST-03`, `VIS-04` | **abort** — `ASML deltaE 60.479 > 8` |
| `raw-sphere-strip.txt` | `section-10/scripts/capture-live-sphere-strip.mjs` | `DEF-02`, `VIS-01`, `TST-04` | **abort** — `COST chirality failed: normal=-0.4561 mirrored=-0.4153` |
| `raw-long-tasks-BLD-04.txt` | `section-10/scripts/measure-long-tasks.mjs` | `BLD-04` | **fail** — 61/57/55/55/55 ms, five of five over 50 ms |
| `raw-surfaces.txt` | `section-10/scripts/capture-live-evidence.mjs` | `VIS-12`, `MOB-01` | **completed** — 16 `after/` surfaces, 2 `mobile/` captures, `canvas` 0 and no overflow at 390 and 320 px |

The only change to any retained verifier since round 2 is the owner's
`--no-sandbox --disable-setuid-sandbox` launch argument (`2af5b3d`). No
threshold, sample point, or assertion moved.

## Reviewer diagnostic scripts (non-throwing copies and probes)

| File | Purpose |
|---|---|
| `scripts/sample-live-rgb-full-table.mjs` | The section sampler with throws replaced by records, so the whole matrix is visible → `raw-trail-sampler-full-table.json` |
| `scripts/probe-trail-neighbourhood.mjs` | Raw 9×9 pixel neighbourhood the sampler searches at each holding's published sample point, plus 120 px crops → `raw-trail-neighbourhood.json`, `trail-crops/` |
| `scripts/attribute-long-task.mjs` | Same rig as `measure-long-tasks.mjs` plus a CDP CPU profile, self time bucketed into the long-task windows and 100 ms bins → `raw-long-task-attribution.json` |
| `scripts/probe-manifest-vis12.mjs` | Live geometry of every CONTRIBUTION numeral against its signed bar → `raw-manifest-vis12.json` |
| `scripts/probe-question-duplicates.mjs` | Every rendered instance of each bay question, per active station → `raw-question-duplicates.json` |
| `scripts/probe-bay-questions.mjs` | `.bayQuestion` element positions per station → `raw-bay-questions.json` |
| `scripts/probe-mission-control-layout.mjs` | Bay areas and the live type scale → `raw-mission-control-layout.json` (inconclusive for `VIS-08`; recorded as not performed) |

`docs/phase10-baseline/section-10/claude-review-2/scripts/measure-strip-and-chirality.mjs`
was re-run unchanged for the full luminance and chirality table
→ `raw-strip-chirality-full-table.json`.

## Headline numbers

- **Equatorial-band mean luminance (`VIS-01`, pass):** ASML 0.4303, GOOG
  0.3314, COST 0.3522, MSFT 0.4358, IBM 0.2992, INTC 0.1968, CBRS 0.2470,
  NBIS 0.3710 — all inside [0.16, 0.55].
- **Chirality (`DEF-02`, fail):** 6 of 8 worlds fail, against 4 of 8 in round 2.
  CBRS and NBIS regressed from pass to fail. MSFT is unmoved at
  normal −0.5005 / mirrored +0.3117.
- **Trail sampler (`TST-03`, fail):** 7 of 8 exceed ΔE 8; only INTC passes at
  3.39. ASML's published sample point lands inside the planet's own disc.
- **Long task (`BLD-04`, fail):** attributed to Three.js `WebGLPrograms`
  shader-program acquisition (`N @ 2tdjt19k1le0z.js:357`, 34.3 ms self time in
  the 68 ms window), not texture upload (`texSubImage2D` never above 2.5 ms).
- **Mission Control (`VIS-12`, fail):** contribution numerals now clear their
  bars with 0 px overlap on all 13 rows; SCOPE, HAZARD and SIGNALS still render
  their question twice when active.

No `.env*` contents were read, printed, edited, staged, or committed. No
deployment command was run. No application source was changed by this review.
