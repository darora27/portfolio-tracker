# Phase 10 Agent Workflow

Status: active from §2 onward. §0 and §1 used an earlier Builder → Critic
→ Refiner → Acceptance sequence, preserved as history in
`PHASE10_STATE.json`'s `legacy` key, `docs/phase10-reviews/`, and
`docs/phase10-handoffs/`. Do not follow that older sequence for any new
work.

Full implementation-ready detail for this workflow — schema, prompt
files, runners, acceptance tests — lives in `docs/phase10-workflow/`,
specified in `docs/phase10-workflow/IMPLEMENTATION_SPEC.md`. This document
is the durable, human-readable summary `AGENTS.md` points agents to before
Phase 10 work.

Applies after: Devan records the Phase 10 visual-direction selection
(already done — see `PRODUCT_DIRECTION.md` and `PHASE10_STATE.json`).

## 1. Operating principles

- One coding agent process may access this repository at a time, enforced
  by `PHASE10_LOCK` at the repo root.
- Work one `PHASE10.md` section at a time, in order.
- A section is a vertical product slice, not a role-specific partial
  change.
- Security, privacy, financial correctness, accessibility, and green
  verification are release gates.
- Claude and Codex have different, fixed jobs. Roles never reassign — a
  blocked reviewer never silently becomes the implementer, or vice versa.
- The durable repository state (`PHASE10_STATE.json`, git history,
  committed docs) — not chat history or a resume prompt — is the source
  of truth.
- A turn may be triggered directly by Devan or serially by the bounded
  `scripts/phase10-relay.sh`. The relay reads only validated
  `PHASE10_STATE.json` fields and Git state; it never reads agent prose,
  retries, sleeps, commits, edits files, changes roles, or runs agents
  concurrently. Each agent still performs its own preflight checks and
  records its own outcome as its last action.
- Stop safely when state is surprising. Do not "repair" an unexpected
  dirty worktree, bypass a failed test, or guess at an ambiguous failure
  to keep the relay moving. An ambiguous outcome is `blocked`, not a
  guess.

## 2. Roles

Two fixed roles, one CLI each:

1. **Claude Lead** (`claude-code`, run via
   `scripts/phase10-claude-lead.sh`) — product and technical lead.
   Decides what each section accomplishes; writes precise requirements
   and acceptance criteria (`specify`); reviews Codex's implementation
   against those criteria only — bounded review, no unrelated audits, no
   bonus findings (`review`); accepts a passing implementation and
   initializes the next section (`accept`).
2. **Codex Implementation** (`codex`, run via
   `scripts/phase10-codex-implementation.sh`) — implementation lead.
   Implements to Claude's spec, runs tests/build/mobile/browser checks
   (`implement`); fixes only the bounded findings Claude raised in
   review, nothing more (`remediate`).

Cycle per section: Claude specifies → Codex implements → Claude reviews →
[Codex remediates → Claude re-reviews]\* → Claude accepts → next section
initialized. The bracketed remediate/re-review loop repeats only while
Claude's review returns bounded findings; a review with zero findings
goes straight to accept.

## 3. Required sequence and the state machine

Every implementation section follows `PHASE10_STATE.json`'s state
machine, defined in full in `docs/phase10-workflow/IMPLEMENTATION_SPEC.md`
§3. In summary:

| stage | role | who acts | produces |
|---|---|---|---|
| `specify` | `claude_lead` | Claude | section spec + acceptance criteria doc, committed |
| `implement` | `codex_implementation` | Codex | implementation to spec, tests/build green, committed |
| `review` | `claude_lead` | Claude | PASS (→ `accept`) or bounded findings (→ `remediate`) |
| `remediate` | `codex_implementation` | Codex | fixes to findings only, tests/build green, committed |
| `accept` | `claude_lead` | Claude | acceptance record, committed; next section initialized to `specify` |

No section advances while `status` is anything other than `ready` at the
`accept` stage's completion. No stage may be skipped except the
documented `review`→`accept` skip when a review has zero findings.

## 4. Bounded review discipline

Claude's `review` stage evaluates the implementation against the
*specific acceptance criteria Claude itself wrote in the `specify`
stage* — it does not introduce new criteria, unrelated taste findings, or
expand scope. Findings must cite the specific acceptance criterion they
fail. Every finding recorded is one Codex will be asked to fix in
`remediate` — do not record advisory or optional findings.

## 5. Durable machine-readable handoff

`PHASE10_STATE.json` (schema_version 2) is the machine-readable handoff.
Full schema, allowed values, invariants, and a worked example are in
`docs/phase10-workflow/IMPLEMENTATION_SPEC.md` §3. The complete
`schema_version: 1` history for §0 and §1 is preserved under the file's
`legacy` key — never delete it.

## 6. Standing prompts and one-command runners

Each role's complete standing instructions — including its own preflight
checks (STOP, lock, clean tree, retry/handoff discipline) and per-stage
behavior — live in:

- `docs/phase10-workflow/prompts/claude-lead.md`
- `docs/phase10-workflow/prompts/codex-implementation.md`

Devan runs exactly one of two commands to take a turn:

- `./scripts/phase10-claude-lead.sh`
- `./scripts/phase10-codex-implementation.sh`

Both scripts do nothing but acquire `PHASE10_LOCK`, invoke the fixed CLI
non-interactively with the fixed prompt file, and release the lock on
exit via a trap — they never parse output or make decisions. Full detail:
`docs/phase10-workflow/IMPLEMENTATION_SPEC.md` §7.

For serial unattended handoffs across a bounded number of turns, Devan may
instead run:

```bash
./scripts/phase10-relay.sh --max-turns 6
```

The relay selects only the runner named by validated `next_actor`, verifies a
clean tree and a real commit/state transition after every turn, and stops on
`STOP`, `blocked`, `complete`, `next_actor: devan`, a non-zero runner exit,
missing progress, a stale lock, or the turn limit. Full operating detail:
`docs/phase10-workflow/RELAY.md`.

## 7. Retry and failure discipline

- Zero retries are automatic. Neither fixed runner nor the bounded relay
  retries or sleeps. The relay's next iteration is a new state-authorized
  workflow turn, not a retry of the prior turn.
- At most one manual retry per turn: if a turn ends ambiguously (process
  crash, non-zero exit with no state update, or an unclear result),
  Devan may run the same one-command runner a second time. The agent's
  own preflight checks the handoff directory for a same-day, same-section
  attempt already blocked and treats a second consecutive attempt as the
  authorized retry; a third consecutive attempt at the same section is
  refused by the agent itself, which writes a `blocked` handoff instead
  of proceeding.
- Any ambiguous failure is `blocked`, never guessed. Rate limits are not
  detected by parsing CLI output; if a turn's outcome is unclear, it is
  `blocked` and Devan is told to check plainly.

## 8. Verification and commit discipline

- Builder-equivalent (`specify`, `implement`, `remediate`) commits use
  `phase10(§N): <summary>`.
- Review-only (`review`, `accept`) commits that change no implementation
  source use `phase10(review §N): <summary>`.
- Tests and production build must be green before every implementation
  commit.
- A section's final accepted commit is recorded in `PHASE10_STATE.json`.
- Before/after screenshot paths are recorded for every UI-bearing section
  per `PHASE10.md`'s acceptance dimensions.
- No section starts from an uncommitted previous section.
- The completing actor never writes its own commit's hash into
  `PHASE10_STATE.json` (a commit cannot contain its own hash). The next
  actor records the previous actor's commit hash as the first part of
  its own turn, using `git log -1 --format=%H` against the clean tree it
  started from, folded into that same turn's eventual commit.

## 9. Manual fallback

Manual operation remains possible at all times:

1. Devan (or anyone with repo access) checks `STOP`, `PHASE10_LOCK`,
   `PHASE10_STATE.json`, and a clean worktree by hand.
2. Devan runs the named role's runner script.
3. Devan verifies the state transition and repository status after the
   agent exits.
4. Devan runs the next role's runner only after the previous process has
   fully exited and the lock is released.

The same schema and bounded-review discipline apply; manual operation
does not waive any gate.

The relay is optional. A user can return to these manual steps after any relay
stop without migrating or repairing state.

## 10. Superseded

This document replaces the Builder → Critic → Refiner → Acceptance
workflow that governed Phase 10 §0 and §1. That original content remains
readable via `git log -p -- docs/PHASE10_AGENT_WORKFLOW.md` and is
summarized under `PHASE10_STATE.json`'s `legacy` key. `scripts/agent-relay.sh`
(the Phase 9 convenience loop this document previously audited) is
likewise superseded for Phase 10 work by the two fixed-agent runners in
§6, but is left in place untouched — deleting it is out of this
document's scope.
