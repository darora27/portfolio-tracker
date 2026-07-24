# Phase 10 §5 handoff: claude-lead (specify) → codex-implementation (implement)

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

- Read `AGENTS.md`, `PHASE10_PROGRESS.md`, `PRODUCT_DIRECTION.md`,
  `docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`, and
  `PHASE10.md` per the standing prompt.
- Invoked the `portfolio-ux` skill before writing the spec (this section
  changes user-facing UI).
- Surveyed the current codebase (financial math functions, current metric
  display, design tokens, disclosure/focus patterns, test conventions, and
  the public/private data boundary for these metrics) to ground the spec in
  what actually exists rather than inventing new conventions. Notably
  confirmed: no alpha computation exists anywhere in source (§5's own gate
  excludes it); no `aria-expanded` usage exists yet anywhere in the
  codebase (this section is the first); `LabChapter.tsx` already contains a
  hand-written, single-metric prototype of exactly this content shape for
  TWR, which this section generalizes into a reusable primitive; all eight
  metrics are today fully public at full precision via the legacy
  `RiskPanel` (no gating exists there yet) — §5 is the section that
  introduces the public/owner-only distinction as a real constraint, not
  one already enforced.
- Wrote `docs/phase10-workflow/specs/section-5.md`: a complete
  `MetricExplanation` content model and per-metric builder functions for
  all eight core metrics (exact copy, formatting, and status/limitations
  rules specified per metric — no placeholders), a reusable `MetricExplain`
  disclosure component design (inline disclosure, not a popover/bottom-sheet
  — rationale recorded in the spec), and file-level wiring instructions into
  `LabChapter` (TWR, XIRR) and `StructureChapter` (HHI) only, with
  Beta/Sharpe/Sortino/Volatility/Max-drawdown's live UI wiring explicitly
  deferred to §6 (which already assigns "Add explainability from §5" in its
  own Work list) — content models and tests for all eight are still
  required this section, only their UI mount point is deferred.
- Updated `PHASE10_STATE.json`: `stage` → `implement`, `role` →
  `codex_implementation`, `next_actor` → `codex`, `section.spec_doc` set,
  `verification.tests/build.status` remain `not_run`, `prev_actor_commit`/
  `last_green_commit` corrected to the actual prior HEAD
  (`3c90409f3c74248faae9a98952f190e43660edb7` — the handoff-doc-only commit
  that followed §4's accept commit; the state file's previous
  `prev_actor_commit` value was one commit stale).
- Ran `node scripts/phase10-validate-state.mjs` — exit 0.
- Made no implementation-source changes; touched only the new spec doc and
  `PHASE10_STATE.json`.

## Evidence

- Commit: `4e91f75` — `phase10(§5): specify metric explainability primitive and core metrics`
- Tests: not run this turn (spec-only commit touches no implementation
  source; §5's Bounded Review Discipline rule exempts spec/review-only
  commits from the pre-commit green-suite requirement)
- Build: not run this turn (same reason)
- Screenshots: none — no UI-bearing change this turn (spec-only)
- Spec doc: `docs/phase10-workflow/specs/section-5.md`

## For the next actor

`PHASE10_STATE.json` now has `current_section: "§5"`, `stage: "implement"`,
`role: "codex_implementation"`, `next_actor: "codex"`. Codex Implementation
should read `docs/phase10-workflow/specs/section-5.md` in full and implement
exactly what it specifies:

1. `src/lib/observatory/metric-explanations.ts` — the `MetricExplanation`
   type and eight builder functions (§2/§3 of the spec), each with exact
   specified copy/formatting/status rules, plus
   `src/lib/observatory/metric-explanations.test.ts` covering every
   documented fixture (normal + null/short-history edge case per metric,
   the shared content-schema assertion, and the banned-advisory-language
   check).
2. `src/components/observatory/MetricExplain.tsx` +
   `metric-explain.module.css` — the reusable inline-disclosure primitive
   (§4), plus `src/components/observatory/MetricExplain.test.tsx`.
3. Wire it into `LabChapter.tsx` (TWR + XIRR, new `xirrPct`/`basePath`/
   `preservedQuery`/`explainOpenId` props, replacing the existing static
   `<dl>`) and `StructureChapter.tsx` (HHI, same new prop additions), each
   with a new dedicated test file (neither has one today).
4. Thread `resolveExplainParam(searchParams.explain)` through
   `src/app/(depth-pull)/share/page.tsx` and `src/app/(depth-pull)/page.tsx`,
   gated to the metric's home chapter per §5 of the spec, and extend those
   pages' existing tests.
5. Capture the required before/after evidence (§8 of the spec) under
   `docs/phase10-baseline/section-5/README.md`, including the deferred-item
   note and the inline-disclosure design-decision note.

`npm test` and `npm run build` must be green before Codex's implementation
commit (`phase10(§5): <summary>`). After that commit, `PHASE10_STATE.json`
moves to `stage: "review"`, `role: "claude_lead"`, `next_actor: "claude"` —
Codex's own standing prompt covers that transition; this handoff does not
restate it.

## Decision needed (only if status = blocked)

Not applicable — status is `ready`.
