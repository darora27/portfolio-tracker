# Phase 10 §14 handoff: claude_lead (specify) → codex_implementation

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

Wrote the §14 design proof, specification, and acceptance ledger for "The
Chart Room, stage one — the page" (`PHASE10.md` §14). No application source
was touched, per the specify-stage rule. Files written:

- `docs/phase10-workflow/design-proofs/section-14.md`
- `docs/phase10-workflow/specs/section-14.md`
- `docs/phase10-workflow/acceptance/section-14.json` (20 criteria, 11
  visual/browser-kind — validated by `node scripts/phase10-acceptance.mjs
  check`)

**Scope is stage one only** — the page itself, reachable at the existing
owner-gated route `/stock/[ticker]`. Stage two (a HOLDINGS row click, an
ORBITS ring/blip click, `FULL ANALYSIS ▸`) is `PHASE10.md` §15's work by
the roadmap's own explicit text and is out of scope here; do not build it.

**Architectural finding this turn made, not in the source documents:**
`src/app/stock/[ticker]/page.tsx` already exists — owner-gated, session-
checked, `robots:{index:false}`, never linked from `/share`, backed by
`src/lib/stock-data.ts`'s `getStockDetailData`. This is the pre-existing
per-ticker infrastructure the Chart Room should **extend**, not a new
route to build. The spec's §2/§3 name the exact fields already available
and the new fields to add.

**The four "reused" dashboard components** (`CorrelationHeatmap`,
`ContributionChart`, `BetaTable`, `HoldingRiskTable`) are reused at the
**math/data layer** (`correlationMatrix`, `perHoldingRisk`,
`computeBenchmarkComparison`, `drawdown`, `annualizedVolatility`,
`buildHoldingsPerformance`), not the JSX layer — their whole-portfolio
table/chart presentation doesn't match the mock's SVG-based single-ticker
benches. The spec's §6 names exactly which existing function backs each
bench.

**Ledger board (rule 2):** 18 rows are open/designed board-wide — far past
the five-row landing-section threshold. Unlike §13, this section does not
resolve that by landing debt; it cites the owner's already-on-record
override (`PHASE10.md` §14's own prose plus the FB-13 quote plus owner
ruling commit `f392a049`), which explicitly promotes this one new-build
item ahead of the Mission Control debt pile in writing. See the spec's §0
for the full disposition table — every FB row implemented in §13 but still
open on the ledger (FB-01/02/05/17/23/24/25/26) is "not this section,
awaiting Devan's own sentence"; the seven Mission Control rows are
"scheduled §15."

## Evidence

- Candidate commit: not applicable — this is a specify turn, no
  implementation candidate yet.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-14.json` —
  all 20 criteria at `implementer.status: not_run`, `reviewer.status:
  not_run`.
- Tests / Build: not run this turn (no source changed); `main` reconfirmed
  green — `git diff --name-only 33789eebeb170c1c60a833b5d963bbadbb64f2f7
  HEAD -- src/ public/ package.json package-lock.json scripts/` is empty.
- Spec / design proof: `docs/phase10-workflow/specs/section-14.md`,
  `docs/phase10-workflow/design-proofs/section-14.md`.

## For the next actor

Implement in the spec's own order: §2 (confirm the route/privacy
inheritance, no new route), §3 (extend `StockDetailData` and add the two
new pure-function files — write their unit tests first, TDD), §4 (header
strip), §5 (the graph and its five overlays), §6 (the six benches, one
subsection each, each naming its exact reused function), §7 (the
`CHART_ROOM_TEXT_ROLES` map, mirroring `MISSION_CONTROL_TEXT_ROLES`'s
pattern exactly), §8 (390px collapse). Fill only `implementer` results in
the acceptance ledger with retained evidence — no `VIS-*`/`MOB-*`/`ACC-*`
criterion may be marked `pass` from source reading alone; every one needs a
real capture or a rendered computed-style test, per `AGENTS.md`'s
visual-truth rule. Two things worth flagging explicitly:

- **§5's DEPTH overlay vs §6.3's DEPTH bench are two different
  computations** (a running-peak transform of the currently-displayed
  curve vs `drawdown()` on the raw since-buy return series) — do not
  implement one and alias it as the other.
- **§6.1's window choice (full-history vs since-buy `dailyReturns`) is left
  to your judgment** since neither the mock nor any owner sentence
  specifies it — record which you picked and why in the handoff back.

Run `npm test` and `npm run build` before committing the implementation
candidate (`TST-02`/`BLD-01`), matching the spec's global gates. Re-check
whether `single_provider_mode` is still active before starting — the spec
states it's unchanged from §13 but does not assume it live at
implementation time.

## Route after this handoff

- Section: `§14`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`

## Decision needed (only if status = blocked)

Not applicable — status is `ready`.
