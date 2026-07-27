# Phase 10 §8 handoff: claude_lead (specify) → codex_implementation (implement)

Prepared July 27, 2026 by `claude-code/sonnet-5`.

## Outcome

Spec ready for implementation.

## What this turn did

Ran the `specify`-stage turn for §8, "The Stock Market Universe — `/share`
rebuilt." Read `UNIVERSE_DIRECTION.md` (owner brief), `UNIVERSE_IDEAS.md`
(accepted creative response with its inline corrections),
`docs/reference/README.md` (visual references and their cautions), and
`PHASE10.md` §8, in that authority order. Applied the `portfolio-ux` skill.
Surveyed the current, accepted `/share` and Portfolio Orrery implementation in
detail (`src/components/observatory/orrery/*`, `src/lib/observatory/orrery.ts`,
`src/lib/dashboard-data.ts`, `share/page.tsx`) to ground every scope claim,
function signature, and file path in the real codebase rather than the
brief's own architectural assumptions — notably correcting the premise that
the production Orrery runs on React Three Fiber (it is raw three.js by tested
architectural decision; no `@react-three/fiber`/`@react-three/drei` dependency
exists) and confirming several data inputs the brief's proposals need
(`data.twr7d`, `data.dailyChangePct`, `data.allTimeHigh.pct`,
`positionRows[].dayPct`) are already computed, already TWR-consistent where
required, and already public-safe.

Wrote `docs/phase10-workflow/specs/section-8.md`: exact scope (in/out), six
explicit design decisions resolving ambiguities the brief left open against
the current code (notably: "the dashboard the sun opens" cannot literally be
the owner-gated `/dashboard`, so it is a new public "Mission Control" overlay
reusing the five already-accepted, already privacy-tested chapter components
verbatim), new/extended pure encoding functions with exact signatures and
hand-computable test fixtures (orbit-radius-by-rank, axial spin, health
scalar, sunspot intensity, belt hysteresis), the camera/lock-on/sun/texture-
pipeline/Mission-Control/systems-manual/first-visit-orientation design, and
acceptance criteria restated per `PHASE10.md` §8's exact eight named
dimensions (Behavioral, Visual, Desktop-first scope, Accessibility, Financial
honesty, Tests, Build, Privacy).

No implementation was done; no `src/` file was touched. Updated
`PHASE10_STATE.json`: `stage` → `implement`, `role` → `codex_implementation`,
`next_actor` → `codex`, `section.spec_doc` set to the new spec's path,
`prev_actor_commit` corrected to the current HEAD (`f59e835`, which postdates
the state file's stale prior value by three owner commits recording the
Stock Market Universe direction change).

## Evidence

- Commit: (this turn's own commit — hash not yet known at write time, per the
  non-self-referential rule)
- Tests: not run this turn (spec-only; no implementation source changed)
- Build: not run this turn (spec-only; no implementation source changed)
- Spec doc: `docs/phase10-workflow/specs/section-8.md`
- Validator: `node scripts/phase10-validate-state.mjs` — exit 0

## For the next actor

`PHASE10_STATE.json` now has `current_section: "§8"`, `stage: "implement"`,
`role: "codex_implementation"`, `status: "ready"`, `next_actor: "codex"`. The
next Codex Implementation turn must read `docs/phase10-workflow/specs/section-8.md`
in full before touching any file — it is long and deliberately exhaustive
(exact new file list in its §15, exact pure-function signatures in §3, exact
acceptance criteria in §14). Two things worth flagging directly: (1) §1 and §0
correct a premise in `PRODUCT_DIRECTION.md`/`PHASE10.md` §7 — the runtime to
extend is raw three.js, not React Three Fiber; do not add
`@react-three/fiber`/`@react-three/drei` as a new dependency. (2) §8.4/design
decision 2.6 requires the per-ticker texture pipeline's *committed output* to
be build-time-network-free; if no interactive image-generation path is
available in the implementing environment, use the specified deterministic
procedural fallback rather than blocking on asset generation. Sequence the
work as `UNIVERSE_IDEAS.md` §14 and this spec's own ordering suggest (layout/
camera/trails/labels with placeholder spheres first, then lock-on/rendezvous/
panel, then the sun, then the texture pipeline in parallel, then belt/manual/
first-visit orientation last) — but the section is graded as one complete
vertical slice; the sequencing is implementation guidance, not a checkpoint
structure.
