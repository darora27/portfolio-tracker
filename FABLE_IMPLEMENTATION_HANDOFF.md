# Fable implementation drop — July 29, 2026

Owner-directed, out-of-band implementation by Fable (cloud session), verified
before delivery: **full test suite 425/425 across 84 files (7 new tests),
`tsc --noEmit` clean, eslint zero new findings, stylesheet parse-verified.**
`next build` could not run in the cloud container because it fetches JetBrains
Mono from Google Fonts at build time (the known §18 fragility) — run
`npm run build` locally; nothing in this drop touches the build pipeline.

## What landed (11 files, all in src/)

| Ledger row | Change | Where |
|---|---|---|
| **FB-05 / F1** small fonts, 3rd report | The round-6 five-token ramp: 56/24/15/13/11, ~112 sizes now resolve through `--type-*` tokens; nothing below 11px on desktop; enforced by a new gate test that fails the build on any off-ramp literal size | `orrery.module.css`, `type-ramp.test.ts`, `mission-control-layout.ts` (+test: 64→56 display size) |
| **FB-03** trails, regressed | Arc band 26–46° → **18–30°** — his "they were a lot better before" band; hue-lightness carries magnitude | `scene-model.ts` (+test band) |
| **FB-17** panel, regressed (380 too small) | Rail width → `--panel-width: 460px` (between his two readings), one-token tweakable — try 420/500 live in devtools | `orrery.module.css` |
| **FB-06** cursor, 4th request | The full flight model: critically damped chase (k 1600, c 80 — overshoot impossible), banks into turns (28° clamp), docks ~145ms after a stop, **holds heading at rest** (his mock decision), exhaust reads ship speed, click-to-fly through the same spring with a 1.4s arrival guarantee. Hit-testing still uses the true pointer — precision untouched. Reduced motion unchanged | `OrreryScene.tsx`, `orrery.module.css` |
| **FB-14** glowy fonts | Text blooms reduced (world title 22px/0.38 → 10px/0.22; orientation 24px/0.32 → 10px/0.20; hover flare 12px/0.7 → 8px/0.45). Signal colours and dark legibility outlines untouched | `orrery.module.css` |
| **F4** SINCE BUY = MAX | Detents that cannot differ no longer render (round 5's own rule); `sinceIndex` prop gives SINCE BUY a real purchase-date window when longer series exist (Chart Room-ready); portfolio instrument now says **SINCE START**; also fixed: a 20-session series can no longer call itself "30 DAYS" | `ReturnInstrument.tsx` (+new test), `MissionControlRoomContent.tsx`, `PlanetDetail.test.tsx` |

## One expected red on your machine

`docs/phase10-baseline/section-11/scripts/review-return-toggle.test.tsx` was
written to *observe the F4 defect* (identical paths). Now that the defect is
fixed it may fail. That is the observation going stale, not a regression —
Opus updates it to assert the new contract (MAX absent when windows are
identical; distinct paths when `sinceIndex` provides pre-purchase history) or
retires it in favour of `ReturnInstrument.test.tsx`.

## Deliberately NOT in this drop

- **F2 (ASML left-third anchor) and F3 (mark visibility at approach)** —
  camera-framing work that cannot be honestly verified without pixels; they
  stay in the routed §11 remediation, to be done WITH captures.
- **The Chart Room and the sky (§12b)** — new surfaces, built through the
  relay under the normal gates, not out-of-band.

## Ledger updates for Opus to apply (one bookkeeping pass)

FB-03 → `landed (18–30°, this commit) — awaiting owner eyes` · FB-05 →
`landed (ramp + gate) — awaiting owner eyes` · FB-06 → `landed — awaiting
owner flight` · FB-14 → `landed — awaiting owner eyes` · FB-17 → `landed
(460px token) — awaiting owner eyes` · F1/F4 in the §11 acceptance ledger →
remediated by this commit, pending capture review. Record this drop in the
§11 record as an owner-directed out-of-band remediation commit.

## What Devan looks at (`npm run dev`, two minutes)

1. Sweep the mouse across the universe, stop, sweep again — the ship should
   trail, bank, dock, and keep pointing where it last flew. Click a planet.
2. The trails — are they yours again?
3. Open Mission Control — small text everywhere should be readable (tabs
   included), the big number slightly smaller, everything less glowy.
4. Click a holding — the panel: wider than yesterday. Say bigger/smaller.
5. RETURNS section — the detents now read 7D · 30D · SINCE START, no dead MAX.

Answer in plain sentences; Opus transcribes them to the ledger. Trails, fonts,
panel, cursor, glow each close ONLY on your sentence.
