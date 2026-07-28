# Phase 10 §9 implementation evidence

Implementation and remediation evidence assembled July 28, 2026. Automated,
artifact-level, production-route, live-pixel, responsive, interaction, and
reduced-motion checks are complete. The in-app browser exposed no attached
backend; `browser-backend.txt` retains that result. The repository's retained
Playwright scripts did run successfully against the production build from the
canonical `npm run build` verification process — done by codex/gpt-5.

## Automated verification

- `npm test`: PASS — 94 files, 497 tests — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS, exit 0 — done by codex/gpt-5.
- `npm run build`: PASS under Next.js 16.2.11; 18 static-generation tasks
  completed, then production `/share` and Mission Control manifest probes
  both returned HTTP 200 — done by codex/gpt-5.
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

## Authored proxy and live 32-pixel sphere strip

`texture-thumbs/authored-map-thumbs-strip.png` enlarges the exact committed
32×16 encoded buffers with nearest-neighbour sampling. The production WebGL
capture `after/live-sphere-strip-32.png` contains one exact 32×32 rendered
sphere per ticker in ASML, GOOG, COST, MSFT, INTC, IBM, CBRS, NBIS order.
Both artifacts were inspected at native resolution — done by codex/gpt-5.

| Ticker | Dominant colour | Macro silhouette visible at 32 px | Emissive signature visible at 32 px |
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
seam maximum ΔE 0. The corresponding live spheres remain individually
nameable by colour, silhouette, and emissive pattern at 32 px — done by
codex/gpt-5.

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

## Production route and live scene checks

- `raw-live-scene-diagnostic.txt`: `/share` returned 200, one WebGL canvas and
  all eight scene labels rendered, and the browser reported no console warning,
  console error, or page error — done by codex/gpt-5.
- `raw-long-task-output.txt`: five fresh 1440×900 contexts at CPU 2× each
  reported a route-owned maximum of 0 ms, under the 50 ms gate — done by
  codex/gpt-5.
- `raw-rgb-pixel-output.txt`: 3,078 changed annulus pixels and 3,397 signed
  trail pixels were measured; trails and the docking ring were both visible
  from live RGB samples — done by codex/gpt-5.
- `raw-sphere-strip-output.txt`: the live 256×32 strip was cut from the
  production WebGL canvas as eight exact 32×32 tiles — done by codex/gpt-5.

## After screenshots

- OVERVIEW: `after/overview-1440x900.png` — done by codex/gpt-5.
- APPROACH / planet detail:
  `after/approach-planet-detail-1440x900.png` — done by codex/gpt-5.
- Mission Control PLOT and MANIFEST:
  `after/mission-plot-1440x900.png` and
  `after/mission-manifest-1440x900.png` — done by codex/gpt-5.
- Mission Control SCOPE and HAZARD:
  `after/mission-scope-1440x900.png` and
  `after/mission-hazard-1440x900.png` — done by codex/gpt-5.
- Mission Control SIGNALS, COMMS, and LOG:
  `after/mission-signals-1440x900.png`,
  `after/mission-comms-1440x900.png`, and
  `after/mission-log-1440x900.png` — done by codex/gpt-5.
- Sector map: `after/sector-map-1440x900.png` — done by codex/gpt-5.
- Sun docking, moon hover, and satellite hover:
  `after/sun-docking-hover-1440x900.png`,
  `after/moon-hover-1440x900.png`, and
  `after/satellite-hover-1440x900.png` — done by codex/gpt-5.
- Live 32-pixel sphere strip: `after/live-sphere-strip-32.png` — done by
  codex/gpt-5.

## Mobile fallback

- `mobile/fallback-390x844.png`: canvas count 0, scroll/client width
  390/390, 22 targets, minimum target 44 px — done by codex/gpt-5.
- `mobile/fallback-320x844.png`: canvas count 0, scroll/client width
  320/320, 22 targets, minimum target 44 px — done by codex/gpt-5.
- `raw-capture-output.txt` retains the machine-readable measurements for both
  viewports — done by codex/gpt-5.

## Keyboard, history, Escape, and reduced motion

- `raw-interaction-audit.txt` records the deterministic Tab walk: sun;
  weight-ranked planets; each available moon in that same rank order; DRIFT,
  HAZARD, and SUPPLY; sector; belt; systems-manual chrome. Every focused
  control reported `:focus-visible`, a 2 px solid outline, and a target at
  least 44×44 px — done by codex/gpt-5.
- Enter opened the first moon's Transmissions view, HAZARD, and the sector
  map at their named URLs. Sector → Back → Forward restored OVERVIEW then
  Sector. Escape closed the belt and Mission Control, and Mission Control
  restored focus to the sun — done by codex/gpt-5.
- With `prefers-reduced-motion: reduce`, the live audit found zero canvases
  and zero running animations. The ordinary semantic map remained visible
  and preserved moon, satellite, nebula, and comet encodings — done by
  codex/gpt-5.
- Both motion modes completed with no console warning, console error, or page
  error — done by codex/gpt-5.

The repository scripts use `PHASE10_BASE_URL` when supplied and otherwise
target `http://127.0.0.1:3000/share`. Claude Lead must independently review
the committed live evidence before PASS.
