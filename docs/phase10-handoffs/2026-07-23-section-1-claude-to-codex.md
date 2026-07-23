# Phase 10 handoff: Claude §1 → Codex Critic

Prepared July 23, 2026 by `claude-code/sonnet-5`.

## Handoff status

Phase 10 §1 builder work is complete and committed. Route state to the
read-only Codex Critic per `docs/PHASE10_AGENT_WORKFLOW.md`. Do not begin §2
until the critic (and refiner, if needed) accept §1.

## Read in this order

1. `AGENTS.md`
2. `PHASE10_PROGRESS.md`
3. `PRODUCT_DIRECTION.md`
4. `docs/PHASE10_UX_ARCHITECTURE.md`
5. `docs/PHASE10_AGENT_WORKFLOW.md`
6. `PHASE10.md`
7. `PHASE10_STATE.json`
8. `docs/phase10-spike-section-1/DECISION.md`
9. `docs/phase10-baseline/section-1/README.md`
10. This handoff

## What Claude built

- **Technical spike** — isolated, owner-gated, non-production routes
  comparing CSS 3D (`/dev/phase10-spike-css`, kept in the tree as the
  durable evidence artifact) against bounded React Three Fiber
  (`/dev/phase10-spike-r3f`, built, measured, then removed). Decision: CSS
  3D — recorded with real `next build` bundle measurements
  (~232 KB gzip R3F-specific cost vs. ~0 KB for CSS) in
  `docs/phase10-spike-section-1/DECISION.md`.
- **Production Observatory shell** — `src/lib/observatory/chapters.ts` and
  `src/components/observatory/{ObservatoryShell,ChapterOrbit,ChapterFocusManager}.tsx`
  (+ `observatory.module.css`). Five chapters (Pulse, Forces, Structure,
  Timeline, Lab) named per `PRODUCT_DIRECTION.md`; URL-addressable
  (`?chapter=<id>`); one semantic `<nav>` whose real anchors are
  CSS-transformed into an orbit (wide/motion-ok) or the static concentric
  fallback (narrow/reduced-motion/forced) — never a duplicate control set;
  focus restoration on chapter change; a freshness slot; a public-only
  read-only badge; a private-only owner slot.
- **Preview route** — `src/app/dev/observatory-shell/page.tsx`, owner-gated,
  exercises both modes with clearly-labeled placeholder content (no
  portfolio data). The shell is **not** wired into `/share` or `/` — that is
  §2/§4's job per `PHASE10.md`; §1 deliberately did not widen scope to do
  it here.
- **Tests** — 5 new files, +39 tests (278/278 total, up from 239/46 at §0),
  covering URL state, keyboard operability, reduced-motion/no-3D fallback
  parity (a CSS-source invariant test, since jsdom doesn't evaluate real
  `@media` rules), and public/private mode isolation (including a defensive
  test that public mode never renders owner content even if passed one).

## Known limitation to weigh in review

**390×844 / 320px screenshots were not captured live.** This session's
browser automation environment enforced a hard minimum window width
(~614–991 CSS px depending on tab) that could not be resized below
regardless of the requested target. Mitigations, documented in
`docs/phase10-baseline/section-1/README.md`:

- A real 614×667 capture, below the shell's 767px breakpoint, showing the
  fallback triggering organically (not just via the forced-fallback query
  param) — this is the same code path 390/320 would hit, since there is no
  separate breakpoint between them.
- Forced-fallback (`?no3d=1`) screenshots at 1440×900 showing the identical
  fallback markup independent of viewport.
- `observatory-fallback.test.ts`, which asserts the reduced-motion media
  query and the forced-no-3D attribute selector are wired to the identical
  set of CSS classes.
- No claim of a 390px/320px screenshot is made anywhere in the evidence
  report or `PHASE10_STATE.json` — this is recorded as a limitation, not
  worked around silently.

The critic should judge whether this evidence is sufficient for a
not-yet-production-mounted shell, or whether it should block/require a
refiner pass to obtain a genuine 390/320px capture by another means.

## Before reviewing, confirm

- The worktree is clean at the commit whose subject is `phase10(§1): CSS 3D
  technical spike and production Observatory shell`.
- No Claude/Codex coding process is active against this repository.
- No `.env*` contents will be accessed or output.
- `three`, `@react-three/fiber`, and `@types/three` are absent from
  `package.json`, `package-lock.json`, and `node_modules`.

## Exact Codex Critic prompt

> You are the read-only Phase 10 Critic for §1. Read the Phase 10 product,
> UX, workflow, specification, selected direction, handoff state, builder
> diff, tests, and screenshots. Do not edit implementation files. Evaluate
> all six scorecard categories and every §1 acceptance criterion. Verify
> desktop/mobile evidence and distinguish facts from taste. Record PASS/FAIL
> with bounded actionable evidence, update state to Claude Refiner or Codex
> acceptance as appropriate, then stop.

## Next relay

If the critic finds failures, Devan returns to Claude with:

> Review the Codex Critic's Phase 10 §1 findings and act as the Claude
> Refiner. Address only the recorded blocking findings, re-run tests/build/
> visual checks, commit the green refinement, and stop.

If the critic passes §1 without required changes, Devan returns to Codex
with:

> Act as the Phase 10 Acceptance Reviewer for §1. Independently verify the
> complete section diff, behavior, evidence, tests, build, and privacy.
> Mark §1 complete only if every scorecard category and acceptance
> criterion passes, then stop. Do not begin §2.
