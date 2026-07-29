# §10 round-5 review evidence — `claude-code/opus-5`, July 29, 2026

Candidate `3d853411651217ef18e9480b725b3289848b4d27`. Live rig: production build
served by `npx next start -p 3141`, real GPU, headless Chromium from the repo's
own Playwright, 1440×900.

Every retained §10 verifier ran **unmodified** — `git diff 3bdf468 3d85341 --
docs/phase10-baseline/section-10/scripts/` is empty. The probes in `scripts/`
below are review-only measurement tools; none asserts anything, none changes
application source, and none replaces a verifier.

Full narrative: `docs/phase10-workflow/reviews/section-10-review-5.md`.

## Raw verifier output

| File | Verifier | Criterion |
|---|---|---|
| `raw-trail-sampler-TST-03.txt` | `sample-live-rgb.mjs` | `TST-03` — aborts on NBIS ΔE 33.123 |
| `raw-sphere-strip.txt` | `capture-live-sphere-strip.mjs` | `DEF-02` — aborts on COST |
| `raw-long-tasks-BLD-04.txt` | `measure-long-tasks.mjs` | `BLD-04` — 65/57/58/58/57 ms |
| `raw-gates.txt` | `npm test`, `npm run build`, texture manifest | reviewer's own independent gate runs |

## Review probes (`scripts/`)

| Probe | What it measures |
|---|---|
| `sample-live-rgb-full-table.mjs` | The trail sampler's own geometry, recording all eight holdings instead of throwing on the first failure. Copied from round 3, output path only. |
| `probe-trail-neighbourhood.mjs` | The 9×9 pixel field around each published sample point. Copied from round 3, output path only. |
| `probe-trail-mechanism.mjs` | **New this round.** Whether NBIS is limited by partial pixel coverage or by an overall darkening: brightest pixel anywhere near the sample point, ribbon run width in device pixels, and the colour reached elsewhere on the same arc. |
| `probe-trail-overlay.mjs` | **New this round.** The DOM stack at NBIS's sample point and the shipped-versus-panel-free pixel, ruling out any overlay as the cause. |
| `probe-remediation-landed.mjs` | **New this round.** Establishes both authorised fixes reached the shipped artifacts — mark-alpha and thumbnail deltas for F3b, raw ribbon cross-sections for F1 — so the remaining explanation is the measurement, not the change. |
| `probe-panel-occlusion.mjs` | Panel-free chirality, the round-4 method retained for the F3b re-check. Copied from round 4, output path only. |
| `probe-strip-chirality-full-table.mjs` | Shipped-view chirality for all eight worlds plus `VIS-01` equatorial luminance. Copied from round 4, output path only. |

Each copied probe is byte-identical to its original apart from the output
directory; verified with `diff` at run time.

## Key numbers

- `TST-03`: NBIS ribbon peaks at red **93** against the model's **179**, with
  zero pixels in a 49-px cross-section within 2 of the model. INTC, same
  expected colour, shows a 14-px plateau at exactly 179. The wider taper moved
  IBM 3.522 → 0.396 and NBIS 33.846 → 30.522.
- `DEF-02`: flipping the MSFT and CBRS marks changes the generator's mark alpha
  by MAD 113.3 / 74.9 and the shipped thumbnails measurably, while untouched
  GOOG's thumbnail is byte-identical. The panel-free chirality margin moved
  0.018 / 0.021 — inside the five untouched worlds' 0.002–0.011 drift — and did
  not invert sign.
- `VIS-01`: all eight equatorial means in the 0.16–0.55 window after the
  two-texture regeneration.

## Images

- `panel-free-*.png` — approach frames with every overlay hidden by a
  review-only visibility override. The terrain that dominates the chirality
  profile is plainly visible in these.
- `trail-mechanism-overview.png` — the 1440×900 overview the round-5 trail
  measurements were read from.
- `trail-crops/`, `pixel-samples/` — per-holding trail sample crops.
