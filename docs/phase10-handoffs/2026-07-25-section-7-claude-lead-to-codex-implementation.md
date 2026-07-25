# Phase 10 §7 handoff: claude-lead (specify) → codex-implementation (implement)

Prepared July 25, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

- Preflight: confirmed `STOP` absent, `PHASE10_LOCK` owned by `claude`,
  clean tree at `afafa61e58f1dbabc7a1f59f4f0ef49ab9e57b4c`, state at
  §7/`specify`/`claude_lead`/`ready`/`next_actor: claude`, retry budget
  intact (no `-to-devan` blocked handoffs exist for §7 today). Read
  `AGENTS.md`, `PHASE10_PROGRESS.md`, `PRODUCT_DIRECTION.md`,
  `docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`, and
  `PHASE10.md`.
- Invoked the `portfolio-ux` skill before drafting the spec, per the
  standing prompt's requirement for any section that changes/evaluates
  user-facing UI.
- Read the existing accepted §1 Observatory shell implementation in full
  (`ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `ChapterFocusManager.tsx`,
  `chapters.ts`, `observatory.module.css`, `observatory-fallback.test.ts`,
  the `(depth-pull)` route group and `DepthPull.tsx`, both `/` and `/share`
  pages, `usePrefersReducedMotion`, and `docs/phase10-spike-section-1/DECISION.md`'s
  corrected measurement methodology) to ground the spec in real files, real
  props, and real precedent rather than a generic template.
- Wrote `docs/phase10-workflow/specs/section-7.md`: a two-phase spec
  (Phase A spike, Phase B production build) with declared performance
  budgets (reusing §1's corrected Moto G4/CPU4x/Slow4G/added-over-baseline
  methodology) and a declared six-row storytelling rubric per the owner
  amendment's equal-rank requirement. The spec's central architecture
  decision (§3): regardless of which runtime the spike selects, the
  already-accepted CSS 3D `ObservatoryShell`/`ChapterOrbit` remains the one
  true interactive structure — CSS-wins extends it directly; R3F-wins adds
  a purely decorative, `aria-hidden`, lazy-loaded atmosphere/camera layer
  on top of it, so the "no-WebGL fallback" is the pre-existing accepted
  shell itself, not new fallback code. This keeps engineering risk bounded
  and reuses every one of §1's already-passing tests unmodified in either
  outcome.
- Updated `PHASE10_STATE.json`: `stage` → `implement`, `role` →
  `codex_implementation`, `next_actor` → `codex`, `status` stays `ready`,
  `section.spec_doc` → `docs/phase10-workflow/specs/section-7.md`,
  `prev_actor_commit` → `afafa61e58f1dbabc7a1f59f4f0ef49ab9e57b4c` (this
  turn's starting HEAD, per Trap B — never this turn's own commit).
  `verification.tests.status`/`verification.build.status` were already
  `not_run` from the prior accept turn's reset; left as-is.
- Ran `node scripts/phase10-validate-state.mjs`: exit 0.
- This is a spec-only commit — no application source touched, so the
  `npm test`/`npm run build` green-before-commit gate does not apply
  (per `docs/PHASE10_AGENT_WORKFLOW.md` §8 and this prompt's universal
  rules).

## Evidence

- Commit: this turn's single commit —
  `phase10(§7): specify Spatial Observatory spike and production build`
- Tests: not run (spec/state-only commit, no implementation source
  touched)
- Build: not run (spec/state-only commit, no implementation source
  touched)
- Screenshots: none — this turn wrote only a specification document and
  state
- Spec doc: `docs/phase10-workflow/specs/section-7.md`

## For the next actor

`PHASE10_STATE.json` now has `current_section: "§7"`, `stage: "implement"`,
`role: "codex_implementation"`, `next_actor: "codex"`. The next Codex
Implementation turn must:

1. Run Phase A (the spike) exactly as scoped in §2 of the spec: build both
   `/dev/phase10-spike-css-world` and `/dev/phase10-spike-r3f-world`,
   measure both against the declared budgets (§2.3) and storytelling
   rubric (§2.4) using an adapted copy of
   `docs/phase10-spike-section-1/measure-phone-v2.mjs`, and record the
   decision in `docs/phase10-spike-section-7/DECISION.md` **before**
   adding `three`/`@react-three/fiber`/`@types/three` to `package.json`
   (only if R3F wins) — this is a hard section gate, not a suggestion.
2. Then run Phase B exactly as scoped in §5–§6, building on the selected
   runtime per §3's binding architecture decision (which applies
   regardless of which runtime wins — read it before writing any Phase B
   code).
3. Verify every acceptance criterion in §8 with real `npm test`/
   `npm run build` runs and live browser checks at 1440×900, 390×844, and
   320px, capturing evidence per §9–§10.
4. If the Codex CLI environment cannot launch a browser at all, follow the
   existing environment-only exception already documented in
   `docs/phase10-workflow/prompts/codex-implementation.md`'s `implement`
   stage — document the specific unverified criteria, keep tests/build
   green, and transition normally to Claude `review` rather than blocking
   solely on that limitation.
5. Commit implementation and state together
   (`phase10(§7): <short description>`), write the
   `codex-implementation-to-claude-lead` handoff, and stop — do not begin
   review of your own work.

## Decision needed (only if status = blocked)

N/A — status is `ready`.
