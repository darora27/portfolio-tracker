# Phase 10 §9 review 2 — Universe craft and depth (remediation round)

Reviewed by `claude-code/opus-5` (Claude Lead, `review` stage), July 28, 2026.

- Spec under review: `docs/phase10-workflow/specs/section-9.md`
- Reviewed commit: `7e37bdda62b0cf9d283b54410f96cffa5828d673`
  (`phase10(§9): remediate review findings`)
- Diff base (`prev_actor_commit` at the start of the remediation turn):
  `518165b395e0966fa14b1cae13e26d7a1632df5f`
- Prior review: `docs/phase10-workflow/reviews/section-9-review.md`
  (FAIL, six bounded findings F1–F6)
- Result: **FAIL — 1 bounded finding**

The `portfolio-ux` project skill was invoked for this turn via the `Skill`
tool (not the fallback path) and applied beneath the authority order in the
spec's §1. It created no new criteria and no advisory findings.

## Verification run independently this turn

| Check | Result |
|---|---|
| `npm test` | PASS — 94 test files, 497/497 tests |
| `npm run build` | PASS — Next.js 16.2.11, TypeScript clean, 18 static-generation tasks; post-build smoke `/share` 200 and manifest station 200 |
| `npx next start` + live route probe (independent of the build's own smoke) | PASS — `/share`, all seven `?station=` bays, `?focus=ASML&camera=approach`, `?camera=sector`, and `/` all return 200; server log has zero errors |
| Live public-payload privacy scan across five public surfaces | PASS — zero `$n.nn` matches, zero `shares`/`price`/`total`/`realized_gain`/`reason` field names |
| Live label/planet geometry measurement at 1440×900 (24 samples over 12 s) | **FAIL — the outermost planet and its tag leave the viewport** |
| Shipped KTX2 base maps decoded and inspected at full resolution (all 8) | PASS — every mark correctly spelled and legible on authored plates |

## All six prior findings are resolved

**F1 — `/share` 500: FIXED and independently confirmed live.**
`MISSION_CONTROL_PANELS` and `MissionControlPanelId` now live in
`src/components/observatory/orrery/mission-control-panels.ts`, a module with
no `"use client"` directive, imported by both the server component
`UniverseRoute.tsx` and the client component `MissionControl.tsx`. No runtime
value crosses the boundary. Against a production build and server I started
myself, `/share` and every one of the seven `?station=` bays return 200 with
an empty server error log. The required new coverage exists and is real:
`npm run build` is now `node scripts/build.mjs`, which runs `next build` and
then `scripts/verify-share-route.mjs`, starting the completed production build
on an ephemeral port and failing the build unless `/share` and the manifest
station both return 200. This is coverage that would have caught the original
crash — the unit suite could not, because vitest imports the modules directly
where the boundary does not exist.

**F2 — fabricated VOO trace: FIXED.** The hard-coded
`points="0,71 80,66 160,69 240,57 320,52"` polyline is deleted from
`PlanetDetail.tsx`. The component receives no same-period VOO series, so the
control now renders in its unavailable state (`VOO UNAVAILABLE`, disabled,
reason in the button title) — the second of the two dispositions my prior
finding authorized. `PlanetDetail.test.tsx` asserts exactly one `polyline` in
the chart and the disabled control, so a reintroduced literal trace fails the
suite. No invented figure remains on the chart.

**F3 — broken measurement script: FIXED.**
`node --check` now passes on all seven retained evidence scripts. The script is
a genuine instrument, not a stub: a `longtask` `PerformanceObserver` with
`buffered: true`, five fresh contexts, 1440×900, `Emulation.setCPUThrottlingRate`
2×, `networkidle` plus a 5 s settle. `raw-long-task-output.txt` holds five real
runs, each with a 0 ms maximum and zero entries, and `raw-rgb-pixel-output.txt`
holds live sampling (3,078 changed docking-annulus pixels, 3,397 signed trail
pixels). Both placeholders are gone. The 0 ms result is credible given the
remediation's shader-warmup staging and one-planet-at-a-time texture loading.

**F4 — hollow sun-invariance test: FIXED.** The test now builds three separate
scene models (idle, `hoveredTicker: "ASML"`, `portfolioFocused: true`), asserts
the interaction inputs were actually recorded in the model, and then asserts
`planetHovered.sun` and `sunFocused.sun` each deep-equal `idle.sun`. It varies
real interaction state and would fail if any sun body parameter became
interaction-dependent.

**F5 — missing share-count canary: FIXED.** The IBM fixture position now
carries the distinctive `shares: 24680.13579`, asserted absent from both the
public station render loop and the public LOG render, in the same style as the
existing price/total/realized-gain/reason canaries.

**F6 — absent live evidence: FIXED.** The complete §12 set is committed and I
inspected it rather than taking the README's word for it: fourteen 1440×900
frames covering OVERVIEW, APPROACH/planet detail, all seven bays, the sector
map, sun docking, and moon and satellite hover, each verified at exactly
1440×900 with `sips`; exact 390×844 and 320×844 fallbacks with machine-readable
audit (`canvasCount` 0, `scrollWidth === clientWidth`, minimum target 44 px at
both widths); a live 256×32 sphere strip of eight exact 32×32 tiles; the
criterion-37 Tab walk with per-control focus visibility and target dimensions;
Enter destinations, Back/Forward restoration, Escape and focus return; and a
reduced-motion audit showing zero canvases and zero running animations with
every encoding preserved.

Work I confirmed beyond the findings, because F1 had blocked it last round:
the shipped base maps decode to genuine authored plates at 1024×512 with a
correctly spelled, legible, embossed mark on all eight (`ASML`, `GOOG`, `MSFT`,
`IBM`, `COST`, `INTC`, `NBIS`, `CBRS`) — criteria 4 and 14 pass on direct
inspection of the shipped bytes, not on a proxy. Mission Control reads as an
operations room (chassis frame with corner ticks, teletype, folder-tab
nameplates with index numbers, wireframe plot, fuel-gauge and centre-spine
bilateral bars) — criteria 21 and 22. The orientation line is present at
OVERVIEW and in the 390 px fallback — criteria 66 and 28. The teletype quotes
TWR and same-period excess — criterion 39.

## Finding

One criterion pair fails. It is not a regression from the remediation; it is a
property of the accepted implementation that **could not be observed until this
round**, because `/share` returned 500 throughout the prior review. Both
criteria were named in F1's blocked list.

### F7 — the outermost planet and its tag leave the 1440×900 viewport

- **Criterion 1:** "Every planet is nameable at OVERVIEW **without hovering** —
  the below-planet tag is legible at rest at 1440×900 for all eight planets
  simultaneously."
- **Criterion 17:** "The belt ring spans 85–92% of viewport width at OVERVIEW
  with no dead margin, and **no planet is clipped by the 1440×900 viewport**."
- **Evidence.** Measured live against a production build at exactly 1440×900,
  sampling every DOM scene label's bounding rect and each planet's projected
  centre and radius 24 times over 12 seconds. Seven planets stay fully inside
  the frame. `NBIS`, the outermost by orbital rank, does not:

  | Ticker | max label bottom (vh 900) | min label left | min planet left edge |
  |---|---:|---:|---:|
  | ASML / GOOG / COST / MSFT / INTC / IBM / CBRS | 338–748 | 275–1150 | 278–1150 |
  | **NBIS** | **935** | **−8** | **−10** |

  The tag is therefore cut off the bottom edge by up to 35 px and off the left
  edge by up to 8 px, and the sphere itself crosses the left edge by up to
  10 px. This is not a transient: all three committed OVERVIEW-camera frames
  (`after/overview-1440x900.png`, `after/moon-hover-1440x900.png`,
  `after/satellite-hover-1440x900.png`) and both
  `pixel-samples/overview-*.png` show the eighth planet clipped in the
  bottom-left corner with no visible tag — seven tags are legible, not eight.
  `raw-live-scene-diagnostic.txt` records `sceneLabelCount: 8`, which counts
  labels in the DOM and does not test whether they are on screen, and
  `docs/phase10-baseline/section-9/README.md` records no result for criterion 1
  or criterion 17.
- **Why no test caught it.** `scene-model.ts` exposes
  `belt.viewportSpanPct` as the constant `OVERVIEW_BELT_SPAN_PCT = 0.88`
  echoed straight back, and `scene-model.test.ts:101-102` asserts that value is
  between 0.85 and 0.92 — the constant checked against itself, which cannot
  fail. The constant does drive world scale at `scene-model.ts:350`
  (`(viewport.width * OVERVIEW_BELT_SPAN_PCT) / (beltRadius * 2)`), but that is
  a flat-plane assumption; the rendered scene uses a perspective camera over a
  tilted orbital plane, so the near (lower) arc of the outermost orbit projects
  well outside the extent the flat calculation predicts. The model never
  computes a projected extent, so nothing compares the composition to the frame.
- **Required change.** Make the OVERVIEW composition fit the 1440×900 frame
  with every planet and every tag fully inside it — for example by deriving the
  scale from the projected extent of the outermost orbit at the OVERVIEW camera
  rather than from a flat belt-diameter constant, and/or by clamping tag
  placement to the viewport. Then assert it where it can fail: extend
  `buildOverviewSceneModel` to expose the projected bounding box of every planet
  and label at the OVERVIEW camera, and unit-test that all eight fall inside
  1440×900 across a full orbital phase sweep — not against a hard-coded span
  constant. Recapture `after/overview-1440x900.png` and record the criterion 1
  and criterion 17 results in `docs/phase10-baseline/section-9/README.md` with
  executor suffixes. Do not change trail/orbit sign→colour or sign→direction
  mapping (spec §1.1, D1).

## Recorded for §15, not a finding

`npm run build` now starts a production server and fetches `/share` as part of
the build. That is the right coverage for F1 and it passes here. It also means
the build step depends on the production server booting and the page's data
sources resolving in whatever environment runs `npm run build`, which on Vercel
is the deploy build container. This is not a §9 acceptance criterion and
nothing in §9 fails because of it; §15 owns deploy and resilience, and it
should confirm the behaviour there before the first production deploy.

## Next actor

`stage` → `remediate`, `next_actor` → `codex`. Fix only F7. Everything else in
§9 is verified and settled — do not revisit F1–F6, and do not restructure any
surface beyond what F7's required change names.
