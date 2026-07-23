# Phase 10 handoff: Codex §0 → Claude Builder §1

Prepared July 23, 2026 by `codex/gpt-5`.

## Handoff status

Phase 10 §0 is complete. Stop before §1 unless Devan explicitly asks Claude to
start it.

Selected direction:

- Structural base: Field Journal
- Retained Field Journal parts: editorial market-relative lead,
  observation-plate chapter stack, evidence marginalia, annotated divergence
  ribbon
- Borrowed Night Orbit parts: orbital chapter navigation, selected-body
  inspector, static concentric fallback
- Signal Constellation is not part of the selected hybrid

The orbit selects a numbered editorial plate. The plate remains the explanatory
content model.

## Read in this order

1. `AGENTS.md`
2. `PHASE10_PROGRESS.md`
3. `PRODUCT_DIRECTION.md`
4. `docs/PHASE10_UX_ARCHITECTURE.md`
5. `docs/PHASE10_AGENT_WORKFLOW.md`
6. `PHASE10.md`
7. `PHASE10_STATE.json`
8. `docs/phase10-design-options/index.md`
9. `docs/phase10-design-options/field-journal/README.md`
10. `docs/phase10-baseline/section-0/README.md`

Before touching files, confirm:

- the worktree is clean;
- the latest commit subject is
  `phase10(§0): baseline selected Field Journal orbital hybrid`;
- no Claude/Codex coding process is active against this repository;
- no `.env*` contents will be accessed or output.

## Baseline facts Claude should preserve

- 239/239 tests passed across 46 files.
- The Next.js 16.2.11 production build passed.
- All 14 required route/viewport screenshots exist.
- Every required 390×844 route had no page-level horizontal overflow.
- Browser console baseline had zero warnings/errors.
- `/share` had zero visible and zero strict raw currency values.
- Private routes gated when logged out; both CSV exports returned 401.
- Production UI and executable source were unchanged in §0.
- Current build source still uses three `next/font/google` imports; §1 should
  measure/record this but must not silently absorb the §13 local-font migration.

## Baseline issues that matter to §1

- No Phase 10 five-chapter navigation exists.
- `/share`, `/`, and `/dashboard` have no `h1`.
- The current public/private first view is magnitude-first rather than
  market-relative and question-led.
- Mobile fits without page overflow but is mostly a compressed version of the
  desktop hierarchy.
- Dense tables/charts remain on the deep routes; §1 must not redesign those
  routes.

## Exact Claude prompt

> You are the Phase 10 Claude Builder for §1 only. Read AGENTS.md,
> PHASE10_PROGRESS.md, PRODUCT_DIRECTION.md,
> docs/PHASE10_UX_ARCHITECTURE.md, docs/PHASE10_AGENT_WORKFLOW.md, PHASE10.md,
> PHASE10_STATE.json, the selected Field Journal option, the §0 baseline
> report, and the latest §0 handoff. Confirm the recorded Field Journal
> structural base and exact Night Orbit borrowed parts. Confirm a clean green
> base and no competing Claude/Codex process. Implement only §1 as a complete
> vertical slice: isolated CSS 3D and bounded R3F/WebGL first-viewport spikes
> with the same semantic content, measured comparison, an explicit decision,
> and then the production five-chapter semantic Observatory shell with URL
> state, focus restoration, public/private modes, freshness slot, reduced
> motion, and complete 2D/no-3D fallback. Read the relevant Next.js 16.2.11
> guides in node_modules before writing code. Add no production 3D dependency
> until the measured decision is recorded. Capture required 1440×900 and
> 390×844 before/after evidence, verify 320px and the fallback states, protect
> all privacy boundaries, run the full tests and production build, commit the
> green builder candidate as phase10(§1): <summary>, update the durable state
> for Codex Critic, and stop. Never access .env* contents, never deploy, and do
> not begin §2.

## Next relay

After Claude commits §1, Devan returns to Codex with:

> Review Claude’s Phase 10 §1 builder commit as the read-only Codex Critic.
> Record the scorecard and handoff, then stop without implementing fixes.
