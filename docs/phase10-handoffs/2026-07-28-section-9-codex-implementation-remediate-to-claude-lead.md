# Phase 10 §9 Codex remediation → Claude Lead review

Codex Implementation completed the bounded remediation for all six findings
in `docs/phase10-workflow/reviews/section-9-review.md`. The repository is
green, the production route smoke passes, the complete §12 evidence set is
retained, and durable state now routes §9 back to Claude Lead `review`.

## Finding dispositions

- **F1 — production `/share` 500:** moved `MISSION_CONTROL_PANELS` and
  `MissionControlPanelId` from the `"use client"` component into
  `mission-control-panels.ts`, which is safe for both server and client module
  graphs. `npm run build` now starts the completed production build and
  requires HTTP 200 from `/share` and the Mission Control manifest station
  before it can pass — done by codex/gpt-5.
- **F2 — fabricated VOO trace:** removed the hard-coded benchmark polyline.
  Because this view receives no same-period VOO series, the control now
  remains disabled as `VOO UNAVAILABLE`, with its reason reachable through
  the button title. The component test requires one real portfolio polyline
  and no benchmark trace — done by codex/gpt-5.
- **F3 — broken performance script and placeholders:** fixed the retained
  long-task script, retained attribution in its raw entries, and replaced the
  placeholders with five fresh-context CPU-2× runs plus live RGB output. All
  five contexts recorded a 0 ms route-owned maximum; live RGB sampling found
  3,078 changed docking-annulus pixels and 3,397 signed trail pixels — done
  by codex/gpt-5.
- **F4 — hollow sun-invariance test:** the scene descriptor now records
  interaction state, and the test compares the complete sun descriptor across
  idle, planet-hovered, and sun-focused models. It will fail if interaction
  changes sun colour, corona, sunspots, or pulse — done by codex/gpt-5.
- **F5 — missing share-count canary:** the IBM public fixture now uses the
  distinctive `24680.13579` share count, with absence asserted in both the
  public station loop and public LOG render — done by codex/gpt-5.
- **F6 — absent live evidence:** captured all required production frames,
  mobile audits, raw measurements, live 32 px spheres, interaction checks,
  reduced-motion checks, and console diagnostics. The evidence index is
  `docs/phase10-baseline/section-9/README.md` — done by codex/gpt-5.

## Live blockers resolved while closing F6

These fixes are limited to making the review's required live criteria execute
and pass:

- Moved `time` to the beginning of the render callback, fixing the temporal
  dead-zone exception that prevented the WebGL scene from rendering — done
  by codex/gpt-5.
- Direct ray hits for the sun, moons, satellites, and belt now take precedence
  over a nearby planet's magnetic target. A pure regression test covers moon,
  satellite, belt, and ordinary planet selection — done by codex/gpt-5.
- Removed the invalid sRGB assignment from single-channel emissive textures,
  eliminating all eight three.js warnings — done by codex/gpt-5.
- Staged the sun and planet shader programs across the first frames and loaded
  one planet's texture set at a time. Five fresh CPU-2× contexts now remain
  below the absolute 50 ms gate — done by codex/gpt-5.

## Retained evidence

- Production diagnostic:
  `docs/phase10-baseline/section-9/raw-live-scene-diagnostic.txt` records
  `/share` 200, one canvas, all eight labels, and no browser messages — done
  by codex/gpt-5.
- Performance and pixels:
  `raw-long-task-output.txt`, `raw-rgb-pixel-output.txt`, and the corresponding
  retained scripts — done by codex/gpt-5.
- Desktop: OVERVIEW, APPROACH, all seven Mission Control bays, Sector, sun
  docking, moon hover, and satellite hover are under
  `docs/phase10-baseline/section-9/after/` at 1440×900 — done by
  codex/gpt-5.
- Live spheres: `after/live-sphere-strip-32.png` contains exact 32×32 tiles in
  ASML, GOOG, COST, MSFT, INTC, IBM, CBRS, NBIS order — done by codex/gpt-5.
- Mobile: `mobile/fallback-390x844.png` and
  `mobile/fallback-320x844.png`; raw measurements prove zero canvases, equal
  scroll/client widths, and a 44 px minimum target at both sizes — done by
  codex/gpt-5.
- Interaction and reduced motion: `raw-interaction-audit.txt` records the
  complete criterion-37 Tab sequence, visible focus and target dimensions,
  moon/satellite/sector Enter destinations, Sector Back/Forward restoration,
  belt and Mission Control Escape, focus return to the sun, zero reduced-mode
  canvases/animations, preserved semantic encodings, and no console messages
  — done by codex/gpt-5.

The in-app Browser connector still reported `No browser is available` and an
empty backend list. That exact result remains in `browser-backend.txt`.
The repository's retained Playwright scripts nevertheless ran successfully as
children of the canonical build verification against its production server;
no attached-browser success is claimed — done by codex/gpt-5.

## Verification

- `npm test`: PASS — 94 files, 497/497 tests — done by codex/gpt-5.
- `npx tsc --noEmit`: PASS — done by codex/gpt-5.
- `npm run build`: PASS — Next.js 16.2.11 compilation and TypeScript, 18
  static-generation tasks, `/share` 200, manifest station 200 — done by
  codex/gpt-5.
- All retained evidence scripts pass against the production build — done by
  codex/gpt-5.
- `node scripts/phase10-validate-state.mjs`: PASS before commit — done by
  codex/gpt-5.

## State and next actor

`PHASE10_STATE.json` is now `current_section: "§9"`, `stage: "review"`,
`role: "claude_lead"`, `status: "ready"`, and `next_actor: "claude"`.
`prev_actor_commit` correctly remains Claude Lead's incoming review commit
`518165b395e0966fa14b1cae13e26d7a1632df5f`. The remediation commit entry is
the required non-self-referential placeholder; Claude Lead must replace it
with this commit's hash from the clean starting HEAD.

Claude Lead should independently rerun the tests/build, inspect every finding
against the production route and retained artifacts, fill the remediation
hash, and PASS or return only newly evidenced bounded findings.
