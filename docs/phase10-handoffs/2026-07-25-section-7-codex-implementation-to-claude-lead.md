# Phase 10 §7 Turn A — Codex implementation to Claude Lead

Date: 2026-07-25

From: codex/gpt-5

To: Claude Lead

State on handoff: `§7` / `review` / `claude_lead` / `ready` /
`next_actor: claude`

## Outcome

Turn A is complete. This commit contains the Phase A spike implementation
only. It selects no runtime winner, contains no measured result, captures no
screenshot or filmstrip, and touches no production Observatory file.

Claude Turn B must run the retained tooling against a real production server,
capture the required still/filmstrip evidence, score all eleven storytelling
rows, apply the Step 1/2/3 decision procedure, and write
`docs/phase10-spike-section-7/DECISION.md`.

## Implemented scope

- [x] Added the owner-gated CSS ceiling route at
  `/dev/phase10-spike-css-world`, using the canonical five
  `OBSERVATORY_CHAPTERS`, synthetic content only, real chapter anchors,
  stage-level camera travel, a continuous three-layer atmosphere, fine-pointer
  parallax, discovery previews, an entrance treatment, and static
  reduced-motion/mobile/`?no3d=1` fallbacks — done by codex/gpt-5
- [x] Added the owner-gated R3F route at
  `/dev/phase10-spike-r3f-world`, using the same semantic content and anchors,
  with a genuinely lazy desktop/motion/WebGL gate, five primitive meshes,
  camera travel, forced context failure via `?forceFail=1`, and bidirectional
  mesh/link hover plus shared navigation callbacks — done by codex/gpt-5
- [x] Preserved server-rendered/no-JS chapter labels, questions, and real
  `href`s in both variants; canvas/duplicate discovery information is
  `aria-hidden` — done by codex/gpt-5
- [x] Added 15 Turn-A tests across four files for no-JS output, keyboard
  semantics, forced failure, reduced motion, current state, hover
  synchronization, route gating, canonical chapter imports, and the
  no-audio/no-portfolio-data/no-physics bounds — done by codex/gpt-5
- [x] Added unrun retained tooling:
  `docs/phase10-spike-section-7/measure-phone.mjs` and
  `measure-desktop.mjs` — done by codex/gpt-5
- [x] The phone tool encodes five fresh Moto G4 / CPU-4× / Slow-4G runs for
  the fallback-only checks and cross-checks known R3F lazy-chunk URLs from the
  desktop output — done by codex/gpt-5
- [x] The desktop tool encodes five fresh 1440×900 / CPU-2× runs for the
  pre-§7 baseline, CSS variant, and R3F variant; it retains raw script bytes,
  long tasks, idle/transition frame deltas, focus-to-settle latency, CDP heap,
  and the four-cycle / twenty-transition R3F leak check — done by
  codex/gpt-5
- [x] Confirmed zero manifest diff after installing the temporary spike
  dependencies with `--no-save`; `three@0.185.1`,
  `@react-three/fiber@9.6.1`, and `@types/three@0.185.1` remain in
  `node_modules` for Turn B as the spec directs — done by codex/gpt-5
- [x] Confirmed no Phase B production file was edited:
  `ObservatoryShell.tsx`, `ChapterOrbit.tsx`, and
  `observatory.module.css` are untouched — done by codex/gpt-5
- [x] Confirmed source contains no audio element, Web Audio use, autoplay
  media, portfolio data import, post-processing dependency, or physics
  dependency — done by codex/gpt-5

## Verification

- [x] `npx tsc --noEmit` passed — done by codex/gpt-5
- [x] Focused §7 tests passed: 4 files, 15 tests — done by codex/gpt-5
- [x] Focused ESLint passed for both route trees and both measurement scripts
  — done by codex/gpt-5
- [x] `npm test` passed: 77 files, 429/429 tests — done by codex/gpt-5
- [x] `npm run build` passed under Next.js 16.2.11; compilation and
  TypeScript succeeded and 18 static-page tasks included both new routes —
  done by codex/gpt-5
- [x] `node --check` passed for both retained measurement scripts — done by
  codex/gpt-5

## Browser evidence gap routed to Turn B

Per §7's operational correction, this Codex environment did not bind
localhost or launch a browser. Codex did not run Playwright, did not start a
server, and did not claim any live visual result. The following remain
deliberately unverified here:

- every §2.3.1 and §2.3.2 measured value and mandatory performance gate;
- real WebGL acquisition, mesh hit-testing, lazy-chunk network timing, frame
  behavior, heap plateau, and focus-to-settle latency;
- real logged-out HTML dollar-pattern checks;
- 1440×900/390×844/320px layout, overflow, target size, contrast, console,
  reduced-motion, forced-failure, and no-JS browser checks;
- all eleven storytelling rows, including observer reactions and the
  y-n10.com comparison;
- all still screenshots and entry/pointer/travel/settled filmstrips.

These are Turn B's explicit live-measurement and decision scope, not omissions
to interpret as a selected result.

## Dependency note

The normal registry request stalled in this restricted environment. The same
exact cached tarballs were restored offline through a temporary writable npm
cache, then installed with `--no-save`. No `.env*` content was read or printed,
and neither manifest changed.
