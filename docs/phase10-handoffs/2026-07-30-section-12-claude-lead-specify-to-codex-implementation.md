# Phase 10 §12 handoff: Claude Lead (specify) → Codex Implementation

Prepared July 30, 2026 by `claude-code/sonnet-5`.

## Outcome

spec ready for implementation

## What this turn did

- Preflight in order: no `STOP`; `PHASE10_LOCK` present with `owner=claude`;
  clean tree; read `AGENTS.md`, `workflow.json`, `PHASE10_STATE.json`,
  `ACTIVE_CONTEXT.md`; `npm run phase10:validate` clean; confirmed
  `role=claude_lead`, `stage=specify`, `status=ready`, `next_actor=claude`;
  confirmed no same-day same-section `-to-devan` handoff exists (no
  one-manual-retry issue); recorded `prev_actor_commit`
  `6afbe579ef7e46a72bac4a01c8e4fb5eb22795b7` (HEAD at turn start —
  `phase10(review §11): accept and initialize §12`, no application source).
- Invoked the `portfolio-ux` skill before reading spec sources, per the
  standing prompt.
- Read, in order: `PHASE10_STATE.json` `section.note` and
  `section.carried_from_section_11`, the standing prompt's "§12a unattended
  ordering" (§8.5), `OWNER_FEEDBACK_LEDGER.md` §2's board, `UNIVERSE_AUDIT.md`
  (§5.1 spacing, §5.4 DRAFT rig), `UNIVERSE_IDEAS_6.md` (§4.1 exit terminal,
  §4.2 tab strip), `docs/reference/README.md`, and the §11 spec/design-proof
  as structural templates. Dispatched a read-only Explore agent to locate the
  exact current file/line for every §12a-relevant piece of source (spacing
  constants, ramp tokens, tab strip, DRAFT rig, panel width, correlation
  display, exit terminal/focus-restoration, `SYSTEMS MANUAL` button, label
  culling, `OrreryScene` mount), then independently re-verified two details
  the agent's report left ambiguous by reading source directly: the DRAFT
  rig's motion default (confirmed genuinely defaults **on** at runtime —
  `setMotion(!media.matches)`, line 127 — despite a misleading
  `useState(false)` SSR initializer) and the absence of any `1.6` scale
  constant anywhere in `DraftRig.tsx` (the ledger's "dish ×1.6 → ×1.0"
  phrase does not map onto current code; resolved in the design proof by
  adopting `UNIVERSE_AUDIT.md`'s fully-traceable "9–28s → 30–90s" number
  instead, with the reasoning recorded rather than silently picked).
- Wrote `docs/phase10-workflow/design-proofs/section-12.md`
  (`existing-package-equivalent`, citing the standing prompt's own §12a
  ordering as the owner-approved scope-and-sequence decision, per
  `DESIGN_GATE.md`'s equivalence clause).
- Wrote `docs/phase10-workflow/specs/section-12.md`, scoped strictly to
  §12a's four phases (A: `FB-19`/`FB-20` machine-checkable; B: `FB-05`
  role→token mapping, `FB-01` spacing/pull-back; C: `FB-17`, `FB-08`+`FB-15`,
  `FB-09`, `FB-12`, `FB-11`, `FB-21` on build→capture→park; plus the carried
  `BLD-04` re-measurement) — explicitly **not** the full `PHASE10.md` §12
  Chart Room/sky/cursor scope, which is §12b. Opens with the required ledger
  board (§0 rule 2, `board_required_from_section: 12`, now binding for the
  first time).
- Created `docs/phase10-workflow/acceptance/section-12.json` via
  `npm run phase10:acceptance -- new`, replaced the example with 19 concrete
  criteria (10 visual, under the ~20/≤12 caps), and validated it clean:
  `npm run phase10:acceptance -- check docs/phase10-workflow/acceptance/section-12.json`
  → `is valid.`
- Updated `PHASE10_STATE.json`: `section.spec_doc`, `section.acceptance_ledger`,
  `section.design_proof`, `section.handoff` set; `stage` `specify` →
  `implement`; `role` `claude_lead` → `codex_implementation`; `next_actor`
  `claude` → `codex`; `status` stays `ready`; verification left `not_run`
  (unchanged); `prev_actor_commit`/`prev_actor_commit_note` updated;
  `production_code_note_2` added (no application source touched this turn).
- Ran `npm run phase10:context` (regenerated `ACTIVE_CONTEXT.md`), then
  `npm run phase10:validate` — hit one finding
  (`docs/phase10-workflow/specs/section-12.md does not account for
  open/designed owner rows FB-10`), diagnosed it as a substring
  false-positive (the mechanical board check matches "open" anywhere in a
  status cell's text, including inside `FB-10`'s own already-`CONFIRMED`
  quote *"news articles open."*), and added one sentence to the spec's board
  section documenting `FB-10`'s already-closed status rather than altering
  the validator. Re-ran `npm run phase10:validate` clean:
  `§12 implement status=ready next_actor=codex`.
- Changed no application source (`src/`, `public/`, `package.json`,
  `package-lock.json`) this turn.

## Evidence

- Candidate commit: not applicable — this is a specify turn; no candidate
  exists yet.
- Acceptance ledger: `docs/phase10-workflow/acceptance/section-12.json` — 19
  criteria, all `implementer`/`reviewer` status `not_run` (fresh ledger).
  Validated: `node scripts/phase10-acceptance.mjs check
  docs/phase10-workflow/acceptance/section-12.json` → valid.
- Tests / Build: not re-run this turn — no application source changed.
  `main` remains green at `9f561b5`/`6afbe57` (107/107 files, 553/553 tests;
  build exit 0), per the §11 acceptance record.
- Spec: `docs/phase10-workflow/specs/section-12.md`
- Design proof: `docs/phase10-workflow/design-proofs/section-12.md`
- Inherited red: none. `BLD-04` is a carried **criterion** (high risk,
  re-measurement required, may not close by assertion), not an inherited
  test/build failure — `npm test`/`npm run build` are unaffected by it.

## For the next actor

Codex Implementation, `stage: implement`, `current_section: §12`. Read
`docs/phase10-workflow/specs/section-12.md` in full before touching source —
it is implementation-ready with exact file paths, line numbers, and numeric
targets for all eleven ledger rows plus `BLD-04`. Highlights:

- **Sequence matters**: Phase A (`FB-19`, `FB-20`) first (isolated), then
  Phase B (`FB-05`, `FB-01` — both touch `orrery.module.css`,
  `orrery.ts`/`scene-model.ts`, `mission-control-layout.ts`) before Phase C,
  so Phase C's captures reflect the corrected state. `BLD-04`
  re-measurement last, against the assembled candidate. Full rationale in
  spec §7.
- **`FB-05`'s test must be rendered, not source-parsed-only** — the spec
  names this explicitly (§3.1) because a value-only gate is the exact
  failure this criterion exists to close. `TST-01`'s verifier command
  (`npm test -- --run
  src/components/observatory/orrery/mission-control-text-roles.test.tsx`)
  names a new file path; create it.
- **`FB-01`'s existing test debt**: `src/lib/observatory/orrery.test.ts`
  references the old `ORRERY_MIN_RADIUS`/`ORRERY_MAX_RADIUS`/gap-formula
  constants directly and must be updated to the new values, not left
  asserting stale ones.
- **`FB-12`'s dish-speed number is 30–90s**, not the ledger's literal
  "×1.6 → ×1.0" phrase — see the design proof's "resolved ambiguity" note
  for why, before assuming the ledger row's exact words over the spec.
- **`FB-17`/`FB-08`+`FB-15` grade only the invariant, never the pick.** Build
  all three panel widths and all three tab-strip variants; do not choose or
  ship one as final. The owner's choice happens at the review turn's Phase D
  sitting, not in this implementation.
- **`BLD-04`: re-measurement only, unmodified script**
  (`docs/phase10-baseline/section-11/scripts/measure-long-tasks.mjs`), no
  structural SSR/hydration fix authorized this window. A continued fail is a
  legitimate, expected outcome — record it and carry it forward again with
  the fresh measurement; do not treat "still fails" as a blocker to finishing
  this turn's other ten items.
- **Live/visual criteria**: per `AGENTS.md`'s Live Verification section, run
  `npm run build && npm run start`, then the retained scripts under
  `docs/phase10-baseline/section-11/scripts/` (reused) or new ones you add
  under `docs/phase10-baseline/section-12/scripts/`. If you cannot launch a
  browser directly (Codex CLI — confirmed unable, four prior Mach-port
  denials), use the camera daemon (`command: "evidence"`, never `"capture"`,
  per `AGENTS.md`'s Camera protocol) rather than deferring visual criteria —
  `deferred_to_reviewer` is legal only with exact notes on why, and Claude
  must still pass every deferred criterion before acceptance, so deferring
  everything just moves the work, it doesn't remove it.
- Both design proof and spec's acceptance-ledger mapping tables are the
  fastest way to cross-reference which criterion covers which ledger row.

## Route after this handoff

- Section: `§12`
- Stage: `implement`
- Role: `codex_implementation`
- Status: `ready`
- Next actor: `codex`
