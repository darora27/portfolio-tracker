# Phase 10 §4 handoff: claude-lead (specify) → codex-implementation

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

Ran the standing Claude Lead preflight: confirmed `STOP` absent,
`PHASE10_LOCK` owned by `claude`, a clean worktree, `PHASE10_STATE.json`'s
`role`/`status` matched (`claude_lead`/`ready`), and zero prior blocked
handoffs for §4 (only one prior handoff exists for this section, the
`accept`-stage `claude-lead-to-claude-lead` one that initialized it — not a
`-to-devan` blocked attempt, so this is a first attempt, not a retry). Noted
an intervening commit, `976bdab` ("add bounded state relay"), already
flagged by the prior turn's handoff; independently confirmed it touches only
workflow tooling/docs (no §3/§4 source), is authored under the same git
identity as this session's user, and does not affect this turn's work — did
not re-litigate it further.

Read `AGENTS.md`, `PHASE10_PROGRESS.md`, `PRODUCT_DIRECTION.md`,
`docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`, and
`PHASE10.md` in full, plus the current source for `/` (today's
`SurfaceHeader`/`SurfaceActs` hero), `/share` (the §2/§3 Observatory
implementation this section reuses), `ObservatoryShell.tsx` (confirmed
`mode="private"`/`ownerSlot` already work with no shell change needed),
`chapters.ts`, `PulseChapter.tsx`, `surface-copy.ts`, and `dashboard-data.ts`
to confirm every input §4 needs already exists on `DashboardData` — no new
data fetch is required beyond the `today` date computation, and no
`DashboardData` field changes. Invoked the `portfolio-ux` skill per the
standing prompt (this is a UI-bearing section) before finalizing the spec;
its guidance shaped the attention list into editorial marginalia-style linked
sentences (not a notification/badge list) and kept the owner utility strip
visually quiet and subordinate.

Wrote `docs/phase10-workflow/specs/section-4.md`: scope is one new chapter
(`BriefingChapter`, replacing Pulse's slot in `mode="private"` only) plus one
new owner-utility region (`OwnerUtilityStrip`, wired into the shell's
existing `ownerSlot`), reusing Forces/Structure/Timeline/Lab exactly as §3
shipped them (unchanged, no new private dollar content added to those four —
recorded as a conscious, bounded deferral, not an oversight). Defined exact
deterministic copy/attention-priority rules (`briefingWhyCopy`,
`buildAttentionItems` with a fixed stale → concentration → notable-mover →
earnings priority order, named thresholds with stated rationale) in
`src/lib/observatory/briefing-copy.ts`, all sourced from `DashboardData`
fields already fetched by the existing `/` page. Did not implement anything;
no application source was touched this turn.

Updated `PHASE10_STATE.json`: `stage` → `implement`, `role` →
`codex_implementation`, `next_actor` → `codex`, `section.spec_doc` → the new
file's path, `prev_actor_commit`/`last_green_commit` → `ef4e51b` (the commit
that was `HEAD` at the start of this turn). Ran
`node scripts/phase10-validate-state.mjs` — passed.

## Evidence

- Commit: this turn's single commit — `phase10(§4): specify` (spec doc +
  state update only; no implementation source touched, no tests/build gate
  applies to this commit)
- Spec doc: `docs/phase10-workflow/specs/section-4.md`

## For the next actor

`PHASE10_STATE.json` now has `current_section: "§4"`, `stage: "implement"`,
`role: "codex_implementation"`, `next_actor: "codex"`, `status: "ready"`.
Codex Implementation should read `docs/phase10-workflow/specs/section-4.md`
in full before touching any file. Key constraints worth restating because
they're easy to get wrong under time pressure:

- The unauthenticated branch of `src/app/(depth-pull)/page.tsx` must stay
  byte-for-byte unchanged — only the authenticated branch is rewired.
- `ForcesChapter`/`StructureChapter`/`TimelineChapter`/`LabChapter` are
  reused **unmodified** at `/` — do not add dollar content to them this
  section (spec §1's out-of-scope list explains why).
- `SurfaceHeader.tsx`/`SurfaceActs.tsx`/etc. become unused but must **not**
  be deleted this section.
- `buildAttentionItems`' priority order (stale → concentration →
  notable-mover → earnings) is fixed and must not be reordered even when
  multiple conditions are true simultaneously — see spec §3.2 for the exact
  fixture cases this implies for tests.
- `npm test` and `npm run build` must be green before the `implement`
  commit, per the workflow's universal rules.

## Decision needed (only if status = blocked)

N/A — status is `ready`.
