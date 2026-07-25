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

## Amendment (owner-directed correction, July 25, 2026)

Before this handoff's Codex Implementation turn began, Devan reviewed
`docs/phase10-workflow/specs/section-7.md` and found it too conservative to
guarantee the immersive spatial result requested for §7: it could pass every
criterion while shipping a CSS-styled dashboard with, at most, a decorative
canvas behind it. Devan directed nine corrections (see the spec's own
"Owner correction (July 25, 2026)" section for the full list); this
amendment records what changed so Codex does not implement against the
description in "What this turn did" above, which is now superseded.

**The "central architecture decision" summary above no longer applies as
written.** It previously said: "regardless of which runtime the spike
selects, the already-accepted CSS 3D `ObservatoryShell`/`ChapterOrbit`
remains the one true interactive structure — CSS-wins extends it directly;
R3F-wins adds a purely decorative, `aria-hidden`, lazy-loaded
atmosphere/camera layer on top of it." That is corrected: `ObservatoryShell`/
`ChapterOrbit` remain the one true *semantic and interactive structure*
(chapters, URL state, focus, keyboard/touch/screen-reader operation — this
part is unchanged and still binding), but if R3F wins, its canvas may become
the visually *dominant* production spatial scene, its five meshes respond to
pointer hover/activation synchronized with the real chapter links, and
`aria-hidden` means the canvas's information is accessibly duplicated
elsewhere — not that the canvas is visually subordinate or decorative. Read
the spec's §3 in full before writing any Phase B code; it is the binding
architecture regardless of which runtime wins.

Also changed and binding on this Codex turn:

- The Phase A decision procedure (spec §2.5) is now: four mandatory
  pass/fail gates (accessibility, privacy, fallback, reliability), then an
  equally weighted performance/storytelling score among gate-passing
  variants, with CSS only as the tie-breaker — not "select R3F only if it
  beats CSS, otherwise default to CSS."
- The storytelling rubric (spec §2.4) grew from six to eleven rows and is
  strengthened so gradients, translated layers, and hover labels alone
  cannot pass it.
- Screenshot filmstrips or short recordings are now required (spec §2.4,
  §10) for world entry, pointer exploration, chapter travel, and settled
  states — a static before/after screenshot pair no longer satisfies the
  visual acceptance criteria.
- The performance methodology (spec §2.3) now has two separate profiles: a
  Moto G4/Slow 4G mobile-fallback confirmation (proves the fallback never
  requests R3F and does not regress — it is not a scoring input for the
  desktop scene), and a 1440×900 CPU-throttled desktop measurement of the
  actual WebGL scene, with declared memory/lazy-chunk budgets and a new
  repeated-transition leak check.
- The entrance sequence's duration is decoupled from chapter-travel's (spec
  §5.1): it may run up to 3000 ms if justified and stays skippable; chapter
  navigation itself keeps its own quick 400-900 ms budget.

No application code, dependencies, or `PHASE10_STATE.json` fields changed in
this amendment — `current_section`, `stage`, `role`, `status`, and
`next_actor` are exactly as this handoff already left them. Implement
against the current `docs/phase10-workflow/specs/section-7.md` in full, not
against this handoff's original "What this turn did" summary.

## Second amendment (owner-directed operational correction, July 25, 2026)

A known environment fact makes the plan above unworkable as a single turn:
this Codex CLI runner cannot bind `localhost` or obtain a browser backend.
Item 4 of the "For the next actor" list above — "Verify every acceptance
criterion in §8 with real `npm test`/`npm run build` runs and live browser
checks at 1440×900, 390×844, and 320px" — cannot be done by this turn at
all, for the *entire* section, not just the live-measurement portion. Doing
so in one turn would predictably exhaust budget attempting Playwright/live
measurement/screenshot capture that this environment cannot perform, per
the existing environment-only exception already referenced in item 4 — but
that exception is designed for a single missed check within an otherwise
complete implementation, not for an entire missing measurement-and-decision
phase. §7 is now split across four bounded turns; full detail is in
`docs/phase10-workflow/specs/section-7.md` §0, which is authoritative.
Read it before doing anything.

**The turn this handoff hands to you is Turn A only — the spike, not the
full section.** Concretely, this turn's scope is:

- Build both spike routes (`/dev/phase10-spike-css-world`,
  `/dev/phase10-spike-r3f-world`) and both variants' full feature set per
  spec §2.1/§2.2, including the R3F variant's mesh hover/activation
  synchronization (§3.4).
- Build every test achievable without a live browser or a bound port
  (Vitest/jsdom/RTL component tests for keyboard operability, reduced
  motion, forced-failure branches, and no-JS server-rendered output).
- Build `docs/phase10-spike-section-7/measure-phone.mjs` and
  `measure-desktop.mjs` as retained, unrun tooling (spec §2.3.1/§2.3.2) —
  do not attempt to execute them against a live server.
- Run `npm test`, `npm run build`, `tsc`, and grep/source-read checks. Do
  **not** attempt Playwright, screenshots, filmstrips, or any measured
  value in `DECISION.md`.
- Do **not** apply the §2.5 decision procedure or select CSS vs. R3F — that
  is Turn B's job (a Claude turn, next).
- Do **not** touch any production Observatory file
  (`ObservatoryShell.tsx`, `ChapterOrbit.tsx`, `observatory.module.css`, or
  any new §5 file) — Phase B does not start until Turn B records a
  decision.
- Commit and transition state exactly as your standing prompt's `implement`
  stage already instructs (`stage` → `review`, `role` → `claude_lead`,
  `next_actor` → `claude`) — this is the ordinary transition already
  documented in `docs/PHASE10_AGENT_WORKFLOW.md`; only the scope of the
  work behind it is bounded to the spike.
- In your own handoff doc, state plainly that this turn built the spike
  only, selected no winner, and touched no production file, so the next
  (Claude) turn does not mistake your commit for a completed
  implementation, and does not mistake its own review of it for §7's final
  acceptance.

`PHASE10_STATE.json` is unchanged by this second amendment — it is exactly
where the first amendment left it (`§7` / `implement` /
`codex_implementation` / `ready` / `next_actor: codex`), which is also
exactly Turn A's starting state.
