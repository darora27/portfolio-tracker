# Phase 10 §9 implementation evidence

Implementation evidence assembled July 28, 2026. Automated and artifact-level
checks are complete. Live checks are deliberately left unverified because the
Codex environment exposed no browser backend; `browser-backend.txt` retains
the exact result. The standing implementation prompt routes these checks to
Claude Lead review instead of treating absent browser infrastructure as a
product failure.

## Automated verification

- `npm test`: PASS — 94 files, 496 tests — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS, exit 0 — done by codex/gpt-5.
- `npm run build`: PASS under Next.js 16.2.11; 18 static-generation tasks
  completed — done by codex/gpt-5.
- Texture manifest proxy: PASS for all eight tickers, including real KTX2
  dimensions, ΔE, luminance standard deviation, identical seam columns, and
  on-disk byte equality — done by codex/gpt-5.
- Pure scene descriptor: PASS for ring/trail construction, projected diameter,
  belt span, spacing, labels, moons, satellites, comet, nebula, starfields,
  and interaction-invariant sun physiology — done by codex/gpt-5.
- Public projections: PASS for the five-field trade log and five-field news
  item, with canary-field rejection and failure-to-empty-news degradation —
  done by codex/gpt-5.
- Planet detail: PASS for exactly five bays, zero paragraphs, ≤60 non-numeric
  words, the `SINCE BUY · SIMPLE` benchmark lockout, and in-place
  Transmissions expansion with retained focus — done by codex/gpt-5.
- Contrast: PASS at ≥4.5:1 from committed source-token pairs for all planet
  labels against both possible dark surfaces, plus orientation, teletype,
  active bay, and bay nameplate text — done by codex/gpt-5.

## Texture ladder and encoder

The authored 2048×1024 source plates remain committed. The largest shipped
tier under the 15,000,000-byte cap is base 1024×512 with 512×256 R8 emissive
and RG8 normal maps — done by codex/gpt-5.

| Base tier | Derived tier | KTX2 map bytes | Result |
|---|---:|---:|---|
| 2048×1024 | 1024×512 | 44,368,743 | over cap |
| 1448×724 | 724×362 | 22,958,079 | over cap |
| 1024×512 | 512×256 | 11,710,317 | shipped |

The full `public/textures/planets/` directory is **11,727,680 bytes** including
the manifest and eight thumbnails. `texture-byte-count.txt` retains the
`wc -c` measurement, and the same total is committed in
`texture-manifest.json` — done by codex/gpt-5.

Basis probe, verbatim:

```text
$ basisu --version
zsh:2: command not found: basisu
exit_status=127
```

The shipped encoder is three.js KTX2Exporter with RGBA8/R8/RG8 payloads and
KHR Zstandard supercompression level 19. No dependency or network build step
was added — done by codex/gpt-5.

## Authored 32-pixel proxy

`texture-thumbs/authored-map-thumbs-strip.png` enlarges the exact committed
32×16 encoded buffers with nearest-neighbour sampling. It is a texture proxy,
not the still-missing live 32 px sphere strip — done by codex/gpt-5.

| Ticker | Dominant colour | Macro silhouette visible in thumb | Emissive signature visible in thumb |
|---|---|---|---|
| ASML | `#5c81ad` | precision-lens continent | cyan optics rings |
| GOOG | `#bcc7ba` | four product districts | white/multicolour fiber boulevards |
| MSFT | `#5f7271` | four-quadrant continent | azure/orange ring roads |
| IBM | `#16295d` | pinstripe monolith range | pale quantum-dome grid |
| COST | `#645d53` | warehouse crater complex | red dock lanes |
| INTC | `#464b54` | copper reconstruction spiral | blue coolant channels |
| NBIS | `#763a74` | newborn accretion scar | violet-white compute terraces |
| CBRS | `#6b5934` | wafer-scale core | cyan coolant rivers |

All eight thumbnails have normalized luminance standard deviation ≥0.10 and
seam maximum ΔE 0 — done by codex/gpt-5.

## Before references

The accepted §8 frames are the pre-§9 visual baseline:

- OVERVIEW:
  `../section-8/claude-review-5/overview-1440x900.png`.
- APPROACH:
  `../section-8/claude-review-5/approach-asml-1440x900.png`.
- Sun docking:
  `../section-8/claude-review-5/sun-hover-1440x900.png`.
- Mobile 390 and 320:
  `../section-8/claude-review-5/mobile-390x844.png` and
  `../section-8/claude-review-5/mobile-320x844.png`.
- Public Mission Control:
  `../section-8/claude-review-3/mission-control-public-1440x900.png`.

There were no §8 versions of the seven new bays, sector map, moons, or
satellites.

## Browser evidence gap for Claude Lead

No after screenshots were captured and no live criterion is claimed as
passing. The exact backend failure is retained in `browser-backend.txt`.
Claude Lead must run the committed scripts and independently verify all items
below before PASS:

- Run `scripts/capture-live-evidence.mjs`; retain 1440×900 frames for OVERVIEW,
  APPROACH, all seven bays, sector, docking, moon focus, and satellite focus.
- Retain 390×844 and 320×844 frames and raw audits proving canvas count 0,
  `scrollWidth === clientWidth`, and every target ≥44 px.
- Run `scripts/measure-long-tasks.mjs`; replace
  `raw-long-task-output.txt` with five fresh-context raw runs at CPU 2×. Every
  route-owned maximum must be <50 ms.
- Run `scripts/sample-live-rgb.mjs`; replace `raw-rgb-pixel-output.txt` and
  verify ring/trail visibility plus docking-ring appearance from actual RGB
  pixels.
- Inspect real 32 px rendered spheres for all eight tickers and retain the live
  strip. The authored-map strip alone is not sufficient.
- Walk the keyboard order: sun, weight-ranked planets, planet moons in the
  same rank order, DRIFT, HAZARD, SUPPLY, sector, belt, then chrome; verify
  Enter destinations, visible focus, Escape, focus return, and back/forward.
- Verify reduced motion live: no WebGL scene, comet, nebula drift, parallax,
  docking rotation/flash, typing, odometer flip, or warp; every encoded value
  must remain in semantic text.
- Verify browser console cleanliness, article new-tab behavior, planet marks
  at APPROACH, label collision yield, comet once-per-load behavior, and the
  public RSC/client payload canaries.

The repository scripts use `PHASE10_BASE_URL` when supplied and otherwise
target `http://127.0.0.1:3000/share`.
