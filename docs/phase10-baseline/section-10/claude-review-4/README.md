# §10 round-4 review evidence — `claude-code/opus-5`, July 29, 2026

Candidate `0ef1433b51e18d772156ccc8be9d3ed077bc6d34`. Live rig: production build
served by `npx next start -p 3141` (privacy re-check at `:3142`), real GPU,
headless Chromium from the repo's own Playwright.

Every retained §10 verifier ran **unmodified** — `git diff 3bdf468 HEAD --
docs/phase10-baseline/section-10/scripts/` is empty. The probes in `scripts/`
below are review-only measurement tools; none asserts anything, none changes
application source, and none replaces a verifier.

Full narrative: `docs/phase10-workflow/reviews/section-10-review-4.md`.

## Raw verifier output

| File | Verifier | Criterion |
|---|---|---|
| `raw-trail-sampler-TST-03.txt` | `sample-live-rgb.mjs` | `TST-03` — aborts on NBIS ΔE 33.123 |
| `raw-trail-sampler-full-table.json` | round-3 non-throwing variant | `TST-03` — 7 of 8 pass, 5 at ΔE 0 |
| `raw-trail-neighbourhood.json` | round-3 probe | NBIS's uniform 0.52× partial-coverage field |
| `raw-sphere-strip.txt` | `capture-live-sphere-strip.mjs` | `DEF-02` — aborts on COST |
| `raw-strip-chirality-full-table.json` | `scripts/probe-strip-chirality-full-table.mjs` | `DEF-02` 6 of 8 fail, `VIS-01` all eight in window |
| `raw-long-tasks-BLD-04.txt` | `measure-long-tasks.mjs` | `BLD-04` — 59/59/56/60/59 ms |
| `raw-surfaces.txt` | `capture-live-evidence.mjs` | all 16 `after/` surfaces, both `mobile/` captures |
| `raw-question-duplicates.json` | round-3 probe | `VIS-12` — all seven bays render once |
| `raw-manifest-vis12.json` | round-3 probe | `VIS-12` — 0 px numeral/bar overlap, 13 rows |
| `raw-live-interactions.json` | `audit-live-interactions.mjs` | tab order, focus, targets, keyboard destinations, reduced motion |
| `raw-command-verifiers.txt` | each criterion's own declared command | 31 deterministic criteria + `npm test` + `npm run build` |
| `raw-privacy-live.txt` | live unauthenticated fetch | `PRV-01`–`PRV-05` |

## Review probes (`scripts/`)

| Probe | What it measures |
|---|---|
| `probe-strip-chirality-full-table.mjs` | Reproduces the chirality verifier's geometry exactly but records all eight worlds instead of throwing on the first failure. Also reports profile signal strength. |
| `probe-chirality-crop-geometry.mjs` | **The round-4 root cause.** Intersects the verifier's sampled band with the rendered DOM: the opaque inspector panel covers 96.8–100% of it for the six failing worlds. |
| `probe-panel-occlusion.mjs` | Recomputes chirality on panel-free frames and compares the published `data-planet-center-*` against the rendered disc. Two failures reverse; MSFT and CBRS remain genuinely mirrored; the published geometry is confirmed correct. |
| `probe-remaining-criteria.mjs` | `BLD-05`, `DEF-04`, `DEF-07`, `VIS-08`, `VIS-10`, `BHV-10`, `BHV-05`, `VIS-14`. |
| `probe-belt-and-radar.mjs` | Corrects two selectors the first pass got wrong: belt bodies track `data-belt-ticker`, and radar targets live in the SIGNALS bay. |
| `probe-cursor-exhaust.mjs` | `VIS-14` — prism length against pointer speed, and its absence under reduced motion. |

## Images

- `panel-free-*.png` — approach frames with every overlay hidden by a review-only
  visibility override. `panel-free-msft.png` is the clearest single piece of
  evidence for `DEF-02`: MSFT renders as a full disc at ≈(1010, 452) r ≈ 198 px,
  exactly where the scene publishes it, entirely underneath the shipped panel.
- `chirality-crop-*.png` — what the verifier actually samples. MSFT's contains no
  planet pixel at all.
- `def-02-msft-approach-full.png` — the shipped frame for comparison.
- `bld-05-textures-blocked.png` — the scene with all 24 texture requests aborted.
- `vis-02-*-approach.png`, `vis-10-signals-radar.png`, `def-04-overview.png`.
