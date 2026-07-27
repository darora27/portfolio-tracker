# Phase 10 §8 — Stock Market Universe implementation evidence

Implemented July 27, 2026 by codex/gpt-5.

## Outcome

`/share` is now the Stock Market Universe: eight snapshot-stable planets,
ranked orbits, still-readable comet trails, axial spin, ticker labels, a
health-encoded sun, an asteroid belt, lock-on targeting, OVERVIEW / APPROACH /
COMMAND camera states, Mission Control, a summonable systems manual, and a
localStorage-gated first-visit orientation. The five accepted public chapter
components survive unchanged inside Mission Control. Below 1024px, the
semantic list remains the complete zero-WebGL presentation.

## Design decisions recorded from the §8 spec

1. **"Clicking the sun opens the existing dashboard" means Mission Control,
   not `/dashboard`.** `/dashboard` remains owner-gated and dollar-bearing;
   Mission Control is the public overlay built from the already public-safe
   Pulse, Forces, Structure, Timeline, and Lab components. — done by
   codex/gpt-5
2. **Sun health reads from `data.dailyChangePct` and `data.twr7d`, both
   already TWR-consistent.** `healthScalarForPortfolio` only receives those
   two return fields plus annualized volatility. — done by codex/gpt-5
3. **Sunspot input is `data.allTimeHigh.pct`, already public-safe.** No dollar
   drawdown enters the sun shader or semantic health description. — done by
   codex/gpt-5
4. **Belt hysteresis reads "yesterday's" membership from
   `snapshot_positions`, not a new table.** The existing snapshot query now
   includes `value`; the latest prior snapshot produces the previous top-eight
   set. — done by codex/gpt-5
5. **Per-holding day return (`dayReturn`) reuses the existing simple daily
   price-change field, unlabeled as such in the UI beyond text.** It drives
   axial-spin magnitude and appears as its own `Today` value, never beside a
   benchmark claim. — done by codex/gpt-5
6. **Texture generation is a committed static asset pipeline, not a live
   AI-image dependency.** This environment used the spec-authorized
   deterministic procedural fallback. The offline script keys its art by
   ticker identity, exports equirectangular base/emissive/normal maps, applies
   KTX2 Zstandard supercompression, and performs no network request. The
   image-generation skill informed the no-logo, company-world art direction;
   the built-in image generator was not used because repeatable
   equirectangular KTX2 source maps were required. — done by codex/gpt-5

## Texture budget — declared before final regeneration

The final committed regeneration is required to pass both thresholds:

- total of all 24 maps (8 tickers × base/emissive/normal): **≤ 300,000 bytes**;
- every individual map: **≤ 24,000 bytes**.

All textures load after two animation frames from the already-lazy desktop
scene, so the server-rendered semantic first paint and the sub-1024px fallback
request none of them.

Final post-declaration measurement:

| Maps | Total bytes | Smallest | Largest | Average | Result |
|---:|---:|---:|---:|---:|---|
| 24 | 247,022 | 721 | 21,234 | 10,292.6 | PASS |

Both the 300,000-byte total and 24,000-byte per-map budgets pass.

## Automated verification

- `npm test`: **PASS**, 85 files and 466/466 tests. — done by codex/gpt-5
- `npm run build -- --webpack`: **PASS**, Next.js 16.2.11 compiled,
  TypeScript passed, and all 19 page-generation tasks completed. The sandbox
  denied DNS for both Google Fonts and Supabase; the successful verification
  used Next's documented Google-font mock hook with an already cached WOFF2
  and the prior successful build's still-current Next fetch cache. Neither
  workaround is committed. The default Turbopack build stalled at compilation
  while DNS was unavailable, including with its build worker disabled. —
  done by codex/gpt-5
- §8-focused ESLint: exit 0 across every touched source, test, and script file.
  — done by codex/gpt-5
- Full-repository ESLint is not a Phase 10 commit gate and remains non-green
  from pre-existing failures in `TimelineChapter.tsx`, `CountUpSettle.tsx`,
  and the unrelated CSS `PortfolioOrrery.tsx`; no §8-touched file appears in
  the final focused-lint output.

## Browser and visual evidence gap

The CLI sandbox denied both production-server bind attempts before any browser
could connect:

```text
listen EPERM: operation not permitted 0.0.0.0:3100
listen EPERM: operation not permitted 127.0.0.1:3100
```

Per the Codex Implementation standing prompt's environment-only browser rule,
the complete green implementation is preserved and the following live checks
are explicitly routed to Claude Lead review:

- 1440×900 OVERVIEW, lock-on, rendezvous, settled APPROACH, belt panel,
  systems manual, Mission Control, weak-vs-strong sun, and paused-trail
  screenshots/filmstrip;
- 60-second no-overlap observation and OVERVIEW clipping check;
- pointer lock-on/click, keyboard `Tab`+`Enter`, Escape, empty-space
  double-click, direct link, browser back/forward, and exact camera-state
  restoration;
- 390×844 and 320×844 live assertions for zero canvas, zero horizontal
  overflow, and ≥44px targets;
- reduced-motion and `?no3d=1` live presentation;
- browser console warning/error count;
- the §2.3.2 five-context 1440×900 / CPU-2× long-task measurement.

This is an evidence gap, not a claimed pass. No known visual, interaction,
mobile, console, accessibility, or performance failure was observed and
waived; the environment could not launch the local server needed to perform
those checks.

## Before reference

The accepted pre-§8 placeholder-sphere Orrery evidence remains indexed at
`docs/phase10-baseline/section-7/README.md`. No after screenshot is claimed in
this environment.
