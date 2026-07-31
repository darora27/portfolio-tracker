# Phase 10 §15 handoff: claude-lead (specify) → codex-implementation

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

Confirmed the `roadmap_numbering_conflict` blocking the prior specify turn is
resolved (Devan's repair commit `fb4bb01`: no renumbering, both colliding
sections marked CUT) and re-verified directly against `PHASE10.md` that
exactly one `## §15.` heading exists. Re-counted `OWNER_FEEDBACK_LEDGER.md`'s
board live (18 open/designed rows, unchanged from §14's own count) and
confirmed this section is the landing turn rule 2 requires — it closes eight
rows by construction. Invoked the `portfolio-ux` skill and applied
`DESIGN_GATE.md`. Read the live source directly (not from memory or the
architecture doc alone): `MissionControlRoomContent.tsx`, `MissionControl.tsx`,
`PlanetDetail.tsx`, `mission-control-panels.ts`, `dashboard-data.ts`, and the
signatures of every dashboard/history component the architecture names.

Wrote `docs/phase10-workflow/design-proofs/section-15.md`,
`docs/phase10-workflow/specs/section-15.md`, and
`docs/phase10-workflow/acceptance/section-15.json` (21 criteria, validated).
No application source touched — commit is docs-only.

## Evidence

- Candidate commit: none yet — this turn is specify-only, no implementation
  candidate exists.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-15.json` —
  `node scripts/phase10-acceptance.mjs check docs/phase10-workflow/acceptance/section-15.json`
  passes; all 21 criteria `not_run` (spec-time state, expected).
- Tests: not re-run this turn (no application source changed). Last
  independently confirmed green at HEAD `739049dbb72c0ba426ed668c24ae65442d62beaf`
  by the §14 accept turn: 118/118 files, 631/632 tests, 1 intentional skip.
- Build: not re-run this turn. Last independently confirmed at the same HEAD:
  exit 0, 18/18 routes.
- Spec / review doc: `docs/phase10-workflow/specs/section-15.md`,
  `docs/phase10-workflow/design-proofs/section-15.md`.
- Inherited red: none.

## For the next actor

Implement `docs/phase10-workflow/specs/section-15.md` in the order it's
written (§4 STRIP → §5 ORBITS → §6 HOLDINGS → §7 RETURNS → §8 MIX → §9 RISK →
§10 ACTIVITY → §11 footer/cuts → §2 the three doors → §12 type ramp → §13
mobile). Three things to read closely before writing code:

1. **§2 is the highest-risk section.** The three Chart Room doors
   (`HOLDINGS` row, `ORBITS` ring/blip, `FULL ANALYSIS ▸`) must resolve to
   `/stock/<ticker>` in **private mode only**. Public/`/share` mode keeps its
   exact pre-existing destinations unchanged. `PRV-01` and `VIS-08` are both
   critical-risk and exist specifically to catch a public-mode leak to the
   owner-gated route — verify this yourself with a live public-mode capture
   before marking it `pass`, not just by reading the conditional you wrote.
2. **§0's design-proof precedent on reuse.** Every dashboard/history
   component the architecture names (`ConcentrationMeter`, `CompositionDonut`,
   `ExcessReturns`, `WinnersLosers`, `DrawdownChart`, `DailyReturnsChart`,
   `CompositionOverTimeChart`, `HoldingsPerformanceChart`, `HoldingRiskTable`,
   `MetricDisclosure`) is a Tailwind/Recharts component in a different visual
   language than the dark orrery room. Reuse their **data and pure functions**
   (confirmed already on `DashboardData` or one call away via
   `getHistoryData()`); render new observatory-grammar markup, not their JSX.
   This is not "inventing a new component" under the architecture's "no new
   parts" rule — it is the same reuse-math-not-JSX pattern §14 was explicitly
   authorized to use for `/stock/[ticker]`.
3. **§2.3's test-debt correction.** `OrreryWorld.test.tsx` currently asserts
   `FULL ANALYSIS ▸`'s href contains `station=manifest` — that assertion
   covers the pre-Chart-Room destination and must be updated to the new
   private-mode `/stock/<ticker>` destination (plus a public-mode variant
   asserting the old destination is retained). This is expected test-debt
   correction, not a regression to avoid touching.

Every criterion in the ledger needs real evidence — no
`expect(source).toContain(...)` for rendered behavior. Fill only
`implementer` results; leave `reviewer` untouched.

## Route after this handoff

- Section: `§15`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`

## Decision needed (only if status = blocked)

N/A — not blocked.
