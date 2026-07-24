# Phase 10 Handoff Workflow — Implementation Specification

Status: specification only. Nothing in this document has been implemented,
no application code changed, no state migrated, and Phase 10 §2 has not
begun. This document tells Codex exactly what to build to satisfy
`docs/phase10-workflow/DESIGN_BRIEF.md`. Every decision below is final for
this pass — do not relitigate role division, retry policy, or file
locations while implementing; if something here is genuinely ambiguous or
contradicts a hard constraint, stop and report it rather than guessing (see
§14).

Author: Claude Code, product and technical lead for this bootstrap pass.
Written against repo state at the commit immediately preceding this file's
own commit (`git log -1 --format=%H` before this file was added).

## 0. Verified CLI facts this spec relies on

These were confirmed before writing this spec (by the task that requested
it, and independently re-confirmed by running `claude --version`,
`claude --help`, `codex --version`, `codex --help`, and `codex exec --help`
directly in this repo's shell before drafting §6–§7 below). Do not
re-verify; if a future Codex/Claude version changes these, that is a
reason to revise this spec, not to guess around it.

- Claude Code CLI version `2.1.218`.
- Non-interactive execution: `claude --print` (alias `-p`).
- Claude supports `--model <alias-or-full-name>` and
  `--permission-mode auto`.
- Claude's `--help` documents its prompt as a single positional CLI
  argument (`Arguments: prompt Your prompt`); it does not document stdin
  input for `--print` the way Codex documents it for `exec`. This spec
  therefore passes the prompt as a quoted positional argument
  (`"$(cat file)"`), not via stdin, to avoid relying on unconfirmed
  behavior.
- Codex CLI version `0.145.0`.
- Non-interactive execution: `codex exec`.
- `codex exec`'s `--help` explicitly documents: "Initial instructions for
  the agent. If not provided as an argument (or if `-` is used),
  instructions are read from stdin." This spec uses `codex exec - < file`.
- Codex supports `-C`/`--cd <DIR>` (working root) and
  `-s workspace-write` (sandbox mode; other values are `read-only` and
  `danger-full-access` — this spec never uses `danger-full-access`).
- Codex supports `--add-dir <DIR>`. The runner adds only this repository's
  `.git` directory because Codex's managed `workspace-write` profile otherwise
  leaves Git metadata read-only and prevents the agent's required final
  commit. This is narrower than full-disk access and leaves the rest of the
  sandbox unchanged.
- Codex is authenticated using ChatGPT (not an API key) on this machine.
- Codex's `-a`/`--ask-for-approval` has a `never` value, documented as
  "Never ask for user approval. Execution failures are immediately
  returned to the model." This is the only approval policy that makes
  sense for a fully non-interactive `codex exec` run (there is no
  terminal user to answer an approval prompt); this spec uses
  `-a never` paired with `-s workspace-write`, never
  `--dangerously-bypass-approvals-and-sandbox`.

## 1. Hard-constraint traceability

Every numbered constraint in `docs/phase10-workflow/DESIGN_BRIEF.md`
("Hard safety constraints") and both named design traps, mapped to where
this spec resolves them. Codex should treat this table as a checklist
while implementing — if an implementation choice would violate the row's
constraint, that implementation choice is wrong regardless of what else
this spec says.

| # | Constraint | Resolved by |
|---|---|---|
| 1 | No simultaneous repo access | `PHASE10_LOCK` acquired by the runner script before either CLI starts, released by a trap on exit/INT/TERM. §7. |
| 2 | Clean tree before start | The **agent itself** checks `git status --porcelain` as preflight step 3 in its own standing prompt (not the wrapper) — matches the brief's "the agent itself performs the preflight checks." §6. |
| 3 | No orchestrator auto-commits | Runner scripts contain no `git commit` invocation anywhere (verified by acceptance test §10.10). Only the agent commits, and only after its own tests/build pass. §7, §10. |
| 4 | No free-text failure parsing | Runner scripts never read or branch on CLI stdout/stderr; they only `tee` it to a local log for Devan to read. Ambiguous outcomes are recorded by the **agent** as `status: blocked`, never guessed by a script. §7, §9.4. |
| 5 | Roles never reassign | Two separate fixed-agent runner scripts, one per role, each invoking only its own CLI with its own prompt file. The state-machine invariant (role must match stage, checked by the validator script) makes an accidental role swap fail loudly. §4, §7, §7.3. |
| 6 | Max 1 automatic retry | Zero retries are automatic by construction (no loops). Each prompt's preflight step 5 caps a turn at one authorized manual retry by checking for a prior same-day, same-section `blocked` handoff before proceeding, and refuses a third attempt. §6, §9.1. |
| 7 | No sleep loops | Runner scripts run the CLI exactly once and exit; no `while`, no `sleep`. §7. |
| 8 | Agents record their own outcomes | Both prompt files' last instructed action in every stage is: update `PHASE10_STATE.json`, write the handoff doc, commit, stop. No wrapper script inspects a transcript. §6. |
| 9 | STOP file | Preflight step 1 in both prompts, and item 1 of the rewritten `AGENTS.md`. §3, §6. |
| 10 | Verify real CLI syntax before assuming flags | §0 above; every flag used in §7 appears verbatim in the `--help` output captured before drafting this spec. |
| Trap A | Lock/STOP/RESUME break clean-tree check | Already handled: `.gitignore` already ignores `/STOP`, `/RESUME`, `/PHASE10_LOCK` (verified — no change needed). Check order is fixed as STOP → lock → clean tree → state, in that order, in both prompts. §6, §8. |
| Trap B | A commit can't contain its own hash | The **completing** actor never writes its own commit's hash. The **next** actor's first repository edit each turn is `git log -1 --format=%H`, recorded as `prev_actor_commit`, folded into that actor's own eventual commit — never a separate bookkeeping commit. §4.4, §6. |

## 2. `AGENTS.md` — final content

Replace the entire current file with the following. The
`<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->`
block is preserved byte-for-byte from the current file. The "Multi-agent
protocol" section keeps every still-valid rule from the current file
(read progress before starting; sections in order; one commit per section;
tests/build green before every commit; append tool/model name to
checklist items; never run alongside another agent; never `vercel --prod`;
never touch `.env*`; new routes owner-gated by default; leave the repo
green and committed before stopping) and adds the STOP/lock check and a
pointer to the new §2-onward workflow.

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Multi-agent protocol (Phase 10)

This repo is worked on by two different coding-agent CLIs (Claude Code and
OpenAI Codex CLI) across sessions, never simultaneously. Codex CLI reads
this file (`AGENTS.md`) natively; Claude Code is pointed here by one line
in `CLAUDE.md`. Do not duplicate this protocol there.

Before doing anything:
1. Check that `STOP` does not exist at the repo root. If it does, stop
   immediately — do not read further files, do not touch git, do not
   touch `PHASE10_STATE.json`.
2. Read the current `PHASE10_PROGRESS.md` before doing anything else.
3. For any Phase 10 work, also read `PRODUCT_DIRECTION.md`,
   `docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`,
   `PHASE10.md`, and `PHASE10_STATE.json`. These carry the selected product
   direction and role-specific workflow that generic frontend advice must not
   override.
4. From Phase 10 §2 onward, follow the Claude-lead / Codex-implementation
   workflow in `docs/PHASE10_AGENT_WORKFLOW.md` and the standing prompt
   files in `docs/phase10-workflow/prompts/`. §0 and §1 used an earlier
   Builder/Critic/Refiner/Acceptance workflow, preserved as history in
   `PHASE10_STATE.json`'s `legacy` key and in `docs/phase10-reviews/` —
   do not follow that older sequence for §2 onward.
5. Work sections in order; one commit per section
   (`phase10(§N): <summary>`); `npm test` and `npm run build` must be green
   before every commit.
6. Append your tool/model name to every checklist item you complete
   (e.g. `— done by claude-code/sonnet-5`, `— done by codex/<model>`).
7. Never run alongside another agent on this repo — confirm no other
   Claude or Codex process is active against this working directory, and
   confirm `PHASE10_LOCK` is absent (or already owned by you) before
   starting.
8. Never run `vercel --prod`; never print, edit, stage, or commit
   `.env*` contents; new routes are owner-gated by default unless the
   phase spec says otherwise.
9. Leave the repo green (tests + build passing) and committed before
   stopping for any reason — rate limit, budget, or end of task.
```

## 3. `PHASE10_STATE.json` v2 — schema, state machine, migration

### 3.1 Field list

Top-level fields, in this order:

| Field | Type | Meaning |
|---|---|---|
| `schema_version` | `2` (const) | Schema version. |
| `phase` | `10` (const) | Unchanged. |
| `current_section` | string, `"§2"`–`"§13"` | The `PHASE10.md` section currently active. |
| `role` | enum | Which agent type acts next: `claude_lead` \| `codex_implementation`. |
| `stage` | enum | Which specific behavior applies next: `specify` \| `implement` \| `review` \| `remediate` \| `accept`. |
| `status` | enum | `ready` \| `blocked` \| `complete`. |
| `next_actor` | enum | `claude` \| `codex` \| `devan`. |
| `selected_direction` | object | Unchanged shape from v1 (`name`, `recorded_by`, `recorded_at`, `structural_base`, `retained_parts`, `combined_parts`) — still binding for every future section, carried forward verbatim. |
| `section` | object | The current section's minimal live record (see §3.2). |
| `sections_history` | array | One minimal finalized record per completed section (see §3.2). |
| `prev_actor_commit` | string (40-char lowercase hex sha) \| `null` | The commit hash of the actor who acted immediately before the current turn. Recorded by the *incoming* actor, never by the actor whose commit it names (Trap B, §1). |
| `last_green_commit` | string (sha) \| `null` | The commit hash of the most recent commit where `npm test` and `npm run build` were both independently verified green. |
| `verification` | object | `{ tests: {command, status, summary, finished_at}, build: {command, status, summary, finished_at} }`. `status` ∈ `not_run` \| `pass` \| `fail`. Reset to `not_run` at the start of each new section; filled in by whichever actor last ran the checks. |
| `stop_reason` | string \| `null` | Non-null only when `status` is `blocked`. Plain-language, specific — not a code. |
| `updated_at` | ISO-8601 string | Set by whichever actor last wrote the file. |
| `legacy` | object | The **complete, unmodified** `schema_version: 1` document as it exists today, nested verbatim under this key. Never edited, never trimmed. |

### 3.2 `section` and `sections_history` shapes

```json
"section": {
  "id": "§2",
  "title": "`/share` Pulse vertical slice",
  "spec_doc": null,
  "implementation_commit": null,
  "review_result": null,
  "findings": [],
  "remediation_commits": [],
  "accepted_commit": null,
  "accepted_at": null
}
```

`findings` entries, when present, use the same shape the old
`docs/PHASE10_AGENT_WORKFLOW.md` §4 critic-report format already used
(kept unchanged — it was already good):

```json
{
  "category": "hierarchy",
  "criterion": "one dominant first-layer message",
  "evidence": "...",
  "impact": "...",
  "required_change": "...",
  "verification": "..."
}
```

`sections_history` entries (this is what keeps the schema lean — no
sprawling remediation-round blobs going forward):

```json
{
  "id": "§2",
  "status": "complete",
  "accepted_commit": "<40-char sha>",
  "note": "Optional one-line pointer to anything unusual (e.g. an owner exception like §1's), or omit the key entirely if there is nothing unusual to say."
}
```

### 3.3 Allowed values and the state-machine transition table

Roles: `claude_lead`, `codex_implementation`. Stages: `specify`,
`implement`, `review`, `remediate`, `accept`. Statuses: `ready`, `blocked`,
`complete`. Next actors: `claude`, `codex`, `devan`.

| From (`stage`, `role`) | Actor does | Outcome A | Outcome B |
|---|---|---|---|
| `specify`, `claude_lead` | Write the section spec | → `implement`, `codex_implementation`, `next_actor: codex` | (blocked: dirty tree / retry exhausted / conflict) → `status: blocked`, `next_actor: devan` |
| `implement`, `codex_implementation` | Build to spec | → `review`, `claude_lead`, `next_actor: claude` | → `blocked`, `next_actor: devan` |
| `review`, `claude_lead` | Check implementation against spec only | Zero findings → `accept`, `claude_lead`, `next_actor: claude` | Bounded findings → `remediate`, `codex_implementation`, `next_actor: codex` |
| `remediate`, `codex_implementation` | Fix only the bounded findings | → `review`, `claude_lead`, `next_actor: claude` (loops back for re-review, never straight to `accept`) | Finding conflicts with a higher-priority rule → `blocked`, `next_actor: devan` |
| `accept`, `claude_lead` | Confirm review passed, tests/build green, accept | Not `§13` → increment `current_section`, reset `section`, → `specify`, `claude_lead`, `next_actor: claude`, `status: ready` | Is `§13` → `status: complete`, `next_actor: devan`, stage stays `accept` (terminal) |

Every row that does not explicitly say `blocked` still may become `blocked`
if the acting agent's own preflight (STOP present, dirty tree, retry
budget exhausted, role/stage mismatch) fails before any section work
starts — see §6.

### 3.4 Invariants

- `role` must match `stage` per the table's role column exactly.
- When `status` is `ready`, `next_actor` must match the table's outcome
  column for the current `(stage, role)` and `stop_reason` must be `null`.
- When `status` is `blocked`, `next_actor` must be `devan` and
  `stop_reason` must be a non-empty string.
- When `status` is `complete`, `current_section` must be `"§13"` and
  `next_actor` must be `devan`.
- `prev_actor_commit` and `last_green_commit`, when non-null, must be
  40-character lowercase hex strings (real git SHAs, not descriptions).
- `legacy` must always be present and must never be modified after the
  one-time migration in §3.5.
- These invariants are mechanically checked by
  `scripts/phase10-validate-state.mjs` (§7.3) — every stage's last action
  before committing includes running it and getting exit 0.

### 3.5 Migration procedure (run once, by Codex, before touching anything else)

1. Confirm the current file is still exactly what was read for this spec
   (`git status --porcelain` empty; `PHASE10_STATE.json`'s `schema_version`
   is `1`).
2. Run this Node snippet (no new dependency; run via
   `node -e "$(cat <<'EOF' ... EOF)"` or a temporary `.mjs` file deleted
   immediately after running — it is a one-time migration, not a permanent
   repo script):

```js
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const legacy = JSON.parse(readFileSync("PHASE10_STATE.json", "utf8"));
if (legacy.schema_version !== 1) throw new Error("already migrated");

const prevCommit = execSync("git log -1 --format=%H").toString().trim();

const v2 = {
  schema_version: 2,
  phase: 10,
  current_section: "§2",
  role: "claude_lead",
  stage: "specify",
  status: "ready",
  next_actor: "claude",
  selected_direction: legacy.selected_direction,
  section: {
    id: "§2",
    title: "`/share` Pulse vertical slice",
    spec_doc: null,
    implementation_commit: null,
    review_result: null,
    findings: [],
    remediation_commits: [],
    accepted_commit: null,
    accepted_at: null,
  },
  sections_history: [
    {
      id: "§0",
      status: "complete",
      accepted_commit: "0e71fc3a6bbbc64f0382c7642f9dfcb5212bd950",
      note: "Baseline only, no production UI changed. Full history: legacy.section_0.",
    },
    {
      id: "§1",
      status: "complete",
      accepted_commit: legacy.section_1.accepted_reviewed_commit,
      note: "Accepted under a documented, non-generalizing owner exception to the absolute long-task gate. Full history: legacy.section_1.",
    },
  ],
  prev_actor_commit: prevCommit,
  last_green_commit: legacy.last_green_commit,
  verification: {
    tests: { command: "npm test", status: "not_run", summary: null, finished_at: null },
    build: { command: "npm run build", status: "not_run", summary: null, finished_at: null },
  },
  stop_reason: null,
  updated_at: new Date().toISOString(),
  legacy,
};

writeFileSync("PHASE10_STATE.json", JSON.stringify(v2, null, 2) + "\n");
```

3. Run `node scripts/phase10-validate-state.mjs` (§7.3) and confirm exit 0.
4. Diff `legacy` in the new file against the pre-migration file with a
   byte-for-byte / deep-equal check (e.g.
   `node -e "const a=require('./PHASE10_STATE.json').legacy; const b=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(JSON.stringify(a)===JSON.stringify(b))"`
   fed the pre-migration file's content, or simply `git show HEAD:PHASE10_STATE.json`
   piped into a `deepEqual`) — must print `true` before committing. This is
   acceptance test §10.8.
5. Commit `PHASE10_STATE.json` together with every other file this spec
   describes, in the single commit this spec's parent task authorizes
   (see §13).

### 3.6 Worked example — actual real migration target (§2, `specify`, not yet started)

This is not illustrative — this is the literal, correct value of every
non-`legacy` field immediately after migration, before any §2 work has
happened (`legacy` is omitted here only for length; it is the complete
current file verbatim, per §3.5):

```json
{
  "schema_version": 2,
  "phase": 10,
  "current_section": "§2",
  "role": "claude_lead",
  "stage": "specify",
  "status": "ready",
  "next_actor": "claude",
  "selected_direction": {
    "name": "Field Journal",
    "recorded_by": "Devan",
    "recorded_at": "2026-07-23T22:22:12Z",
    "structural_base": "Field Journal",
    "retained_parts": [
      "Field Journal editorial market-relative lead",
      "Field Journal observation-plate chapter stack",
      "Field Journal evidence marginalia",
      "Field Journal annotated divergence ribbon"
    ],
    "combined_parts": [
      "Night Orbit orbital chapter navigation",
      "Night Orbit selected-body inspector",
      "Night Orbit static concentric fallback"
    ]
  },
  "section": {
    "id": "§2",
    "title": "`/share` Pulse vertical slice",
    "spec_doc": null,
    "implementation_commit": null,
    "review_result": null,
    "findings": [],
    "remediation_commits": [],
    "accepted_commit": null,
    "accepted_at": null
  },
  "sections_history": [
    {
      "id": "§0",
      "status": "complete",
      "accepted_commit": "0e71fc3a6bbbc64f0382c7642f9dfcb5212bd950",
      "note": "Baseline only, no production UI changed. Full history: legacy.section_0."
    },
    {
      "id": "§1",
      "status": "complete",
      "accepted_commit": "f8001ada9187faff7838c1b45fc52409c06eea0c",
      "note": "Accepted under a documented, non-generalizing owner exception to the absolute long-task gate. Full history: legacy.section_1."
    }
  ],
  "prev_actor_commit": "<the real HEAD sha at migration time, from `git log -1 --format=%H`>",
  "last_green_commit": "f8001ada9187faff7838c1b45fc52409c06eea0c",
  "verification": {
    "tests": { "command": "npm test", "status": "not_run", "summary": null, "finished_at": null },
    "build": { "command": "npm run build", "status": "not_run", "summary": null, "finished_at": null }
  },
  "stop_reason": null,
  "updated_at": "<migration timestamp, ISO-8601>",
  "legacy": { "...": "the complete current PHASE10_STATE.json, byte-for-byte, unmodified" }
}
```

The one field this spec cannot fill in literally is `prev_actor_commit`
and `updated_at` — those depend on the exact moment Codex runs the
migration, which has not happened yet. Every other field above is a final
decision, not a placeholder.

### 3.7 Worked example — illustrative only (schema documentation, mid-§2, `review` stage)

This second example is purely to document how the schema looks once a
section is actually underway — it is **not** written to the repository by
this spec, and must not be confused with §3.6's real target. It shows the
state right after Codex finished `implement` and handed back to Claude for
`review`:

```json
{
  "schema_version": 2,
  "phase": 10,
  "current_section": "§2",
  "role": "claude_lead",
  "stage": "review",
  "status": "ready",
  "next_actor": "claude",
  "section": {
    "id": "§2",
    "title": "`/share` Pulse vertical slice",
    "spec_doc": "docs/phase10-workflow/specs/section-2.md",
    "implementation_commit": "3a9f1c2b4e5d6a7b8c9d0e1f2a3b4c5d6e7f8091",
    "review_result": null,
    "findings": [],
    "remediation_commits": [],
    "accepted_commit": null,
    "accepted_at": null
  },
  "prev_actor_commit": "3a9f1c2b4e5d6a7b8c9d0e1f2a3b4c5d6e7f8091",
  "last_green_commit": "3a9f1c2b4e5d6a7b8c9d0e1f2a3b4c5d6e7f8091",
  "verification": {
    "tests": { "command": "npm test", "status": "pass", "summary": "327/327 passed, 58 files", "finished_at": "2026-07-25T14:02:00Z" },
    "build": { "command": "npm run build", "status": "pass", "summary": "Next.js 16.2.11 compiled, 16 route tasks", "finished_at": "2026-07-25T14:03:10Z" }
  },
  "stop_reason": null,
  "updated_at": "2026-07-25T14:05:00Z"
}
```

## 4. `docs/PHASE10_AGENT_WORKFLOW.md` — full replacement content

The current file describes the §0/§1 Builder→Critic→Refiner→Acceptance
workflow. Replace its entire content with the following (this is the
document that supersedes it — the old content remains recoverable via
`git log`/`git show` on this file's history; it is not duplicated inline
here).

```markdown
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
- Every turn is triggered by Devan running exactly one command. There is
  no background loop, no sleep-and-retry, and no orchestrator that reads
  agent output and decides what happens next. Each agent performs its own
  preflight checks and records its own outcome as its last action.
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

## 7. Retry and failure discipline

- Zero retries are automatic. Neither runner script loops or sleeps.
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

## 10. Superseded

This document replaces the Builder → Critic → Refiner → Acceptance
workflow that governed Phase 10 §0 and §1. That original content remains
readable via `git log -p -- docs/PHASE10_AGENT_WORKFLOW.md` and is
summarized under `PHASE10_STATE.json`'s `legacy` key. `scripts/agent-relay.sh`
(the Phase 9 convenience loop this document previously audited) is
likewise superseded for Phase 10 work by the two fixed-agent runners in
§6, but is left in place untouched — deleting it is out of this
document's scope.
```

## 5. Standing prompt files — full content

Create both files exactly as follows. Each is self-contained: it performs
its own preflight, reads state to determine its own stage, executes the
matching behavior, and records its own outcome. Neither file is ever
edited per-turn — they are reused verbatim every time.

### 5.1 `docs/phase10-workflow/prompts/claude-lead.md`

```markdown
# Phase 10 — Claude Lead standing prompt

You are Claude Code acting as the Phase 10 product and technical lead for
whichever section is currently active. This prompt is fixed and reused
for every Claude Lead turn — your first job is to read the durable
repository state and figure out exactly what this turn is for. Do not
assume you already know; a prior turn may have changed things.

## 0. Preflight (do this before anything else, in this order)

1. Check that `STOP` does not exist at the repo root. If it exists, stop
   immediately: do not read further files, do not touch git, do not
   touch `PHASE10_STATE.json`. Report to the terminal that STOP is
   present and exit.
2. Check `PHASE10_LOCK`. It should exist with `owner=claude` (the runner
   script that invoked you created it). If it is missing, or its owner
   is not `claude`, stop and report the discrepancy — do not create or
   edit the lock file yourself; that is the runner script's job.
3. Run `git status --porcelain`. It must be empty. If it is not, do not
   attempt to clean, stash, commit, or discard anything yourself. Stop,
   set `PHASE10_STATE.json`'s `status` to `blocked` with a `stop_reason`
   describing exactly what `git status --porcelain` showed, commit only
   that state-file change with
   `phase10(review §<current_section>): blocked on dirty worktree`, write
   a handoff doc to Devan per `docs/phase10-handoffs/TEMPLATE.md`, and
   stop.
4. Read `PHASE10_STATE.json`. Confirm `role` is `claude_lead` and
   `status` is `ready`. If not, this is not your turn — stop and report
   the mismatch without changing anything.
5. Retry discipline: run `date -u +%Y-%m-%d` and list
   `docs/phase10-handoffs/` for files matching today's date, the current
   `current_section`, and a `-to-devan` target (blocked handoffs always
   go to Devan per the naming convention). If two or more such files
   already exist for this exact `current_section`, this would be a third
   consecutive attempt — stop immediately, do not attempt the work, write
   one more handoff doc explaining that the retry budget (one authorized
   manual retry) is exhausted, and set `status` to `blocked` with
   `stop_reason` naming this. Otherwise proceed.
6. Read `AGENTS.md`, `PHASE10_PROGRESS.md`, `PRODUCT_DIRECTION.md`,
   `docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`,
   and `PHASE10.md`.
7. Run `git log -1 --format=%H` and record that hash as
   `prev_actor_commit` in `PHASE10_STATE.json` in your working copy — this
   records the PRIOR actor's commit, never your own (you do not have your
   own commit's hash yet and must never try to write it into the commit
   that creates it). Do not commit this edit by itself; fold it into your
   stage's one commit at the end of this turn.

## 1. Determine your stage

`PHASE10_STATE.json`'s `stage` field tells you which of the three Claude
Lead behaviors below applies. `current_section` tells you which
`PHASE10.md` section you are working.

### If `stage` is `specify`

- Read `PHASE10.md`'s section for `current_section`, `PRODUCT_DIRECTION.md`,
  and `docs/PHASE10_UX_ARCHITECTURE.md` for this route/chapter's job.
- Write a complete, implementation-ready specification for this section
  at `docs/phase10-workflow/specs/section-<N>.md`: exact scope (the
  smallest complete vertical slice), exact acceptance criteria per
  `PHASE10.md`'s seven dimensions (Behavioral, Visual, Mobile,
  Accessibility, Tests, Build, Privacy) restated as concrete, checkable
  requirements for THIS section specifically — not the generic template.
  Make every requirement explicit; no placeholders.
- Do not implement anything yourself. Do not touch application source.
- Update `PHASE10_STATE.json`: `stage` → `implement`, `role` →
  `codex_implementation`, `next_actor` → `codex`, `status` stays `ready`,
  `section.spec_doc` → the new file's path, reset
  `verification.tests.status` / `verification.build.status` to
  `not_run`.
- Run `node scripts/phase10-validate-state.mjs` and fix anything it
  reports before committing.
- Commit the spec doc and state update together:
  `phase10(§N): specify <short description>`.
- Write the handoff doc
  `docs/phase10-handoffs/<date>-section-N-claude-lead-to-codex-implementation.md`
  using `docs/phase10-handoffs/TEMPLATE.md`.
- Stop. Do not proceed to any other stage in this turn.

### If `stage` is `review`

- Read `section.spec_doc` for `current_section` and the complete diff
  since `prev_actor_commit`.
- Independently verify Codex's implementation against ONLY the
  acceptance criteria in that spec doc — run `npm test` and
  `npm run build` yourself; check the specific behavioral, visual,
  mobile, accessibility, and privacy criteria the spec states. Do not
  introduce new criteria, unrelated findings, or personal taste not
  grounded in the spec or `PRODUCT_DIRECTION.md`'s binding rules
  (privacy, financial correctness, security).
- If every criterion passes: write a short review doc recording PASS at
  `docs/phase10-workflow/reviews/section-<N>-review.md`, update
  `PHASE10_STATE.json` (`stage` → `accept`, `role` stays `claude_lead`,
  `next_actor` → `claude`, `section.review_result` → `"pass"`), run the
  validator, commit with `phase10(review §N): pass, no findings`, write
  the handoff doc, and stop. (You reach the `accept` stage on your NEXT
  invocation — do not chain stages within one turn.)
- If any criterion fails: write a bounded findings list (only failed
  criteria, each citing the exact spec requirement, the evidence, and the
  required change — no optional or advisory findings) into
  `section.findings` and the same review doc, update
  `PHASE10_STATE.json` (`stage` → `remediate`, `role` →
  `codex_implementation`, `next_actor` → `codex`,
  `section.review_result` → `"fail"`), run the validator, commit with
  `phase10(review §N): fail with N bounded findings`, write the handoff
  doc, and stop.

### If `stage` is `accept`

- Read the latest review doc's result for `current_section`. It must be
  `pass` — check the actual latest review doc, not an assumption (a
  `remediate` round means the most recent review doc, not the first one,
  is authoritative).
- Confirm `npm test` and `npm run build` are green right now, on the
  current commit.
- Append an acceptance record to the section's review doc (or a new
  `docs/phase10-workflow/reviews/section-<N>-accepted.md`) noting the
  accepted commit — recorded via `git log -1 --format=%H`, per Trap B in
  §1 of `docs/phase10-workflow/IMPLEMENTATION_SPEC.md`; never your own
  not-yet-created commit's hash.
- Move the current section's minimal record into
  `PHASE10_STATE.json`'s `sections_history` array (`id`, `status:
  "complete"`, `accepted_commit`, optional `note`).
- If `current_section` is `§13`: set `status` → `complete`, `next_actor`
  → `devan`, and stop — Phase 10 is done; do not start any new section.
- Otherwise: increment `current_section` to the next `PHASE10.md` section
  number, reset `section` to a fresh empty record for it (per §3.2's
  shape), reset `verification` to `not_run`, set `stage` → `specify`,
  `role` → `claude_lead`, `next_actor` → `claude`, `status` → `ready`. Do
  NOT do any work on the new section yourself — initializing its state is
  the full extent of this turn.
- Run the validator, fix anything it reports.
- Commit with `phase10(§N): accept and initialize §<N+1>`.
- Write the handoff doc.
- Stop.

## 2. Universal rules for every stage

- Never run alongside another agent; you already confirmed the lock in
  preflight — do not release or edit `PHASE10_LOCK` yourself, the runner
  script does that.
- Never run `vercel --prod`; never read, print, edit, stage, or commit
  `.env*` contents.
- New routes are owner-gated by default unless the section's spec says
  otherwise, per `PRODUCT_DIRECTION.md`'s decision hierarchy.
- `npm test` and `npm run build` must be green before any commit that
  touches implementation source (not applicable to pure spec/review-only
  commits, which touch no implementation source).
- Append your tool/model name to every checklist item you complete in any
  doc that uses checklist format.
- Before your final commit each turn, run
  `node scripts/phase10-validate-state.mjs` and confirm it exits 0.
- Leave the repo green and fully committed before stopping, for any
  reason — including rate limit, budget, or an unexpected blocker. Never
  leave a half-finished edit uncommitted; either finish and commit, or
  revert your own uncommitted changes and record `blocked` state instead.
- If you hit anything not covered here — a conflict between this prompt
  and `PRODUCT_DIRECTION.md`, an ambiguous state, a test failure you
  can't attribute — do not guess. Set `status` to `blocked`, write
  `stop_reason`, write a handoff doc to Devan, commit, and stop.
```

### 5.2 `docs/phase10-workflow/prompts/codex-implementation.md`

```markdown
# Phase 10 — Codex Implementation standing prompt

You are OpenAI Codex acting as the Phase 10 implementation lead for
whichever section is currently active. This prompt is fixed and reused
for every Codex Implementation turn — your first job is to read the
durable repository state and figure out exactly what this turn is for.

## 0. Preflight (do this before anything else, in this order)

1. Check that `STOP` does not exist at the repo root. If it exists, stop
   immediately without reading further or touching git or state, and
   report that STOP is present.
2. Check `PHASE10_LOCK`. It should exist with `owner=codex` (the runner
   script that invoked you created it). If missing or owned by someone
   else, stop and report the discrepancy — do not touch the lock file
   yourself.
3. Run `git status --porcelain`. It must be empty. If not, do not clean,
   stash, commit, or discard anything. Stop, set `PHASE10_STATE.json`'s
   `status` to `blocked` with a `stop_reason` naming exactly what
   `git status --porcelain` showed, commit only that state change with
   `phase10(review §<current_section>): blocked on dirty worktree`, write
   a handoff doc to Devan, and stop.
4. Read `PHASE10_STATE.json`. Confirm `role` is `codex_implementation`
   and `status` is `ready`. If not, this is not your turn — stop and
   report the mismatch without changing anything.
5. Retry discipline: run `date -u +%Y-%m-%d` and list
   `docs/phase10-handoffs/` for files matching today's date, the current
   `current_section`, and a `-to-devan` target. Two or more such files
   for this exact `current_section` means this would be a third
   consecutive attempt — stop immediately without attempting the work,
   write a handoff doc stating the retry budget is exhausted, and set
   `status` to `blocked`. Otherwise proceed.
6. Read `AGENTS.md`, `PHASE10_PROGRESS.md`, `PRODUCT_DIRECTION.md`,
   `docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`,
   `PHASE10.md`, and the current section's spec doc at
   `section.spec_doc` in `PHASE10_STATE.json`.
7. Run `git log -1 --format=%H` and record that hash as
   `prev_actor_commit` in `PHASE10_STATE.json` in your working copy —
   this records the PRIOR actor's (Claude's) commit, never your own. Do
   not commit this edit by itself; fold it into your stage's one commit
   at the end of this turn.

## 1. Determine your stage

### If `stage` is `implement`

- Implement exactly the scope in `section.spec_doc` — the smallest
  complete vertical slice it describes. Do not add scope it does not ask
  for, and do not skip anything it does ask for.
- Add or update tests and, for UI-bearing sections, capture the
  before/after screenshots the spec requires at the exact viewports it
  names.
- Run `npm test` and `npm run build`; both must be green before you
  commit.
- Update `PHASE10_STATE.json`: `stage` → `review`, `role` →
  `claude_lead`, `next_actor` → `claude`, `status` stays `ready`,
  `verification.tests` / `verification.build` filled in with your real
  results. Leave `section.implementation_commit` for the next actor to
  fill in via `git log -1` on its own turn — do not write your own
  commit's hash.
- Run `node scripts/phase10-validate-state.mjs` and fix anything it
  reports before committing.
- Commit implementation and state together:
  `phase10(§N): <short description of the slice>`.
- Write the handoff doc
  `docs/phase10-handoffs/<date>-section-N-codex-implementation-to-claude-lead.md`.
- Stop.

### If `stage` is `remediate`

- Read the latest review doc's findings (`section.findings`) for
  `current_section`. Fix ONLY those bounded findings — do not expand
  scope, do not self-assign additional work, do not touch passing
  behavior the review did not flag.
- If a finding conflicts with security, financial correctness, privacy,
  or `PRODUCT_DIRECTION.md`'s decision hierarchy, or requires scope the
  spec doc did not authorize: do not guess or resolve it yourself. Set
  `status` to `blocked`, write `stop_reason` describing the conflict
  precisely, write a handoff doc to Devan, commit only that state change,
  and stop.
- Otherwise: fix every finding, re-run `npm test` and `npm run build`
  (both green before commit), update `PHASE10_STATE.json` (`stage` →
  `review`, `role` → `claude_lead`, `next_actor` → `claude`, `status`
  stays `ready`, `section.remediation_commits` appended with a
  placeholder note to be hash-filled by the next actor), run the
  validator, commit with
  `phase10(§N): remediate <short description>`, write the handoff doc,
  and stop.

## 2. Universal rules for every stage

- Never run alongside another agent; the lock is already held by you per
  preflight — do not release or edit `PHASE10_LOCK` yourself.
- Never run `vercel --prod`; never read, print, edit, stage, or commit
  `.env*` contents.
- New routes are owner-gated by default unless the section's spec says
  otherwise.
- `npm test` and `npm run build` must be green before any commit that
  touches implementation source.
- Append your tool/model name to every checklist item you complete.
- Before your final commit each turn, run
  `node scripts/phase10-validate-state.mjs` and confirm it exits 0.
- Leave the repo green and fully committed before stopping, for any
  reason. Never leave a half-finished edit uncommitted — finish and
  commit, or revert your own uncommitted changes and record `blocked`
  instead.
- If you hit anything not covered here, do not guess. Set `status` to
  `blocked`, write `stop_reason`, write a handoff doc, commit, and stop.
```

## 6. Runner scripts and the state validator

### 6.1 `scripts/phase10-claude-lead.sh`

```bash
#!/usr/bin/env bash
# Phase 10 fixed-agent one-command runner — Claude Lead.
#
# This script is deliberately dumb: it acquires the repo lock, invokes
# exactly one CLI with the fixed standing prompt file, and releases the
# lock on exit. It never reads PHASE10_STATE.json, never parses CLI
# output, never retries, and never commits anything. All of that is the
# agent's own job, instructed inside the prompt file it is given.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

LOCK_FILE="PHASE10_LOCK"
PROMPT_FILE="docs/phase10-workflow/prompts/claude-lead.md"
CLAUDE_MODEL="${PHASE10_CLAUDE_MODEL:-sonnet}"
LOG_DIR="$HOME/.phase10-workflow-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-claude-lead.log"

if [ -e "$LOCK_FILE" ]; then
  echo "PHASE10_LOCK already exists. Another turn may be in progress, or a"
  echo "previous run did not clean up. Contents:"
  cat "$LOCK_FILE"
  echo "If you are certain no agent is running, remove PHASE10_LOCK by hand"
  echo "and re-run this script."
  exit 1
fi

cat > "$LOCK_FILE" <<LOCKEOF
owner=claude
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
task=phase10-claude-lead-turn
LOCKEOF

release_lock() {
  rm -f "$LOCK_FILE"
}
trap release_lock EXIT INT TERM

echo "Starting Claude Lead turn. Log: $LOG_FILE"
claude --print --model "$CLAUDE_MODEL" --permission-mode auto -- \
  "$(cat "$PROMPT_FILE")" 2>&1 | tee "$LOG_FILE"

echo ""
echo "Claude Lead turn finished. Run 'git log -1' and check"
echo "PHASE10_STATE.json's status/stage/next_actor to see what happened."
echo "If status is 'blocked', read stop_reason and the newest file in"
echo "docs/phase10-handoffs/ before doing anything else."
```

### 6.2 `scripts/phase10-codex-implementation.sh`

```bash
#!/usr/bin/env bash
# Phase 10 fixed-agent one-command runner — Codex Implementation.
#
# Same discipline as scripts/phase10-claude-lead.sh: lock, invoke,
# unlock. No parsing, no retries, no commits from this script.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

LOCK_FILE="PHASE10_LOCK"
PROMPT_FILE="docs/phase10-workflow/prompts/codex-implementation.md"
CODEX_MODEL="${PHASE10_CODEX_MODEL:-}"
GIT_DIR="$(pwd)/.git"
LOG_DIR="$HOME/.phase10-workflow-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-codex-implementation.log"

if [ -e "$LOCK_FILE" ]; then
  echo "PHASE10_LOCK already exists. Another turn may be in progress, or a"
  echo "previous run did not clean up. Contents:"
  cat "$LOCK_FILE"
  echo "If you are certain no agent is running, remove PHASE10_LOCK by hand"
  echo "and re-run this script."
  exit 1
fi

cat > "$LOCK_FILE" <<LOCKEOF
owner=codex
timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
task=phase10-codex-implementation-turn
LOCKEOF

release_lock() {
  rm -f "$LOCK_FILE"
}
trap release_lock EXIT INT TERM

echo "Starting Codex Implementation turn. Log: $LOG_FILE"
if [ -n "$CODEX_MODEL" ]; then
  codex -a never exec -C "$(pwd)" -s workspace-write --add-dir "$GIT_DIR" \
    -m "$CODEX_MODEL" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
else
  codex -a never exec -C "$(pwd)" -s workspace-write --add-dir "$GIT_DIR" - \
    < "$PROMPT_FILE" 2>&1 | tee "$LOG_FILE"
fi

echo ""
echo "Codex Implementation turn finished. Run 'git log -1' and check"
echo "PHASE10_STATE.json's status/stage/next_actor to see what happened."
echo "If status is 'blocked', read stop_reason and the newest file in"
echo "docs/phase10-handoffs/ before doing anything else."
```

Both scripts must be created executable (`chmod +x`).

### 6.3 `scripts/phase10-validate-state.mjs`

No new dependency. Both prompt files call this as their last check before
committing; it is also acceptance test §9.5/§9.6.

```js
#!/usr/bin/env node
// Validates PHASE10_STATE.json against the Phase 10 v2 schema and its
// cross-field invariants (docs/phase10-workflow/IMPLEMENTATION_SPEC.md
// §3). No dependencies. Exit 0 = valid, exit 1 = invalid (prints every
// violation found, does not stop at the first one).
import { readFileSync } from "node:fs";

const STAGE_TO_ROLE = {
  specify: "claude_lead",
  review: "claude_lead",
  accept: "claude_lead",
  implement: "codex_implementation",
  remediate: "codex_implementation",
};
const STAGE_TO_NEXT_ACTOR = {
  specify: "claude",
  review: "claude",
  accept: "claude",
  implement: "codex",
  remediate: "codex",
};
const SHA = /^[0-9a-f]{40}$/;

const errors = [];
function require_(cond, msg) {
  if (!cond) errors.push(msg);
}

let state;
try {
  state = JSON.parse(readFileSync("PHASE10_STATE.json", "utf8"));
} catch (e) {
  console.error(`PHASE10_STATE.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

require_(state.schema_version === 2, "schema_version must be 2");
require_(state.phase === 10, "phase must be 10");
require_(/^§(1[0-3]|[2-9])$/.test(state.current_section), `current_section "${state.current_section}" is not §2-§13`);
require_(["claude_lead", "codex_implementation"].includes(state.role), `role "${state.role}" invalid`);
require_(["specify", "implement", "review", "remediate", "accept"].includes(state.stage), `stage "${state.stage}" invalid`);
require_(["ready", "blocked", "complete"].includes(state.status), `status "${state.status}" invalid`);
require_(["claude", "codex", "devan"].includes(state.next_actor), `next_actor "${state.next_actor}" invalid`);

if (state.stage in STAGE_TO_ROLE) {
  require_(state.role === STAGE_TO_ROLE[state.stage], `stage "${state.stage}" requires role "${STAGE_TO_ROLE[state.stage]}", got "${state.role}"`);
  if (state.status === "ready") {
    require_(state.next_actor === STAGE_TO_NEXT_ACTOR[state.stage], `stage "${state.stage}" with status ready requires next_actor "${STAGE_TO_NEXT_ACTOR[state.stage]}", got "${state.next_actor}"`);
  }
}
if (state.status === "blocked") {
  require_(state.next_actor === "devan", `status blocked requires next_actor "devan"`);
  require_(typeof state.stop_reason === "string" && state.stop_reason.length > 0, "status blocked requires a non-empty stop_reason");
}
if (state.status === "ready") {
  require_(state.stop_reason === null, "status ready requires stop_reason to be null");
}
if (state.status === "complete") {
  require_(state.current_section === "§13", "status complete requires current_section §13");
  require_(state.next_actor === "devan", "status complete requires next_actor devan");
}
for (const hash of [state.prev_actor_commit, state.last_green_commit]) {
  require_(hash === null || SHA.test(hash), `commit hash "${hash}" is not null or a 40-char lowercase hex sha`);
}
require_(state.legacy && typeof state.legacy === "object", "legacy key must be present as an object");
require_(Array.isArray(state.sections_history), "sections_history must be an array");
require_(state.section && typeof state.section === "object", "section must be an object");

if (errors.length) {
  console.error(`PHASE10_STATE.json failed validation (${errors.length} issue(s)):`);
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log("PHASE10_STATE.json is valid.");
process.exit(0);
```

## 7. Supporting file changes

### 7.1 `.gitignore`

No change needed. `/STOP`, `/RESUME`, and `/PHASE10_LOCK` are already
present under "Phase 10 agent-control files" (verified directly before
writing this spec). This design deliberately does not use a `RESUME`
file — every turn is triggered by running the correct one-command runner
directly, which is simpler and equally satisfies "semi-automated." The
`RESUME` entry stays reserved in `.gitignore` for optional future use but
nothing in this spec writes to it. Runner-script logs are written outside
the repo (`$HOME/.phase10-workflow-logs/`), so no log-related `.gitignore`
entry is needed either.

### 7.2 `PHASE10_PROGRESS.md`

Do not rewrite its §0/§1 history. Append one short new section at the end:

```markdown
## From §2 onward

Phase 10 §2 onward uses the Claude-lead / Codex-implementation workflow
defined in `docs/PHASE10_AGENT_WORKFLOW.md` (rewritten for this) and
implemented per `docs/phase10-workflow/IMPLEMENTATION_SPEC.md`. Live status
is `PHASE10_STATE.json`; per-section specs and reviews are under
`docs/phase10-workflow/specs/` and `docs/phase10-workflow/reviews/`; turn
handoffs are under `docs/phase10-handoffs/`. This file is no longer the
per-checklist-item ledger for §2+ — read `PHASE10_STATE.json` and the
latest handoff doc for current status instead.
```

### 7.3 `scripts/agent-relay.sh`

Leave untouched. It predates Phase 10's lock/STOP/state discipline and is
superseded for Phase 10 work by §6's two runner scripts, but removing or
editing it is out of scope for this spec.

## 8. Handoff template and naming convention

### 8.1 Naming convention

`docs/phase10-handoffs/YYYY-MM-DD-section-N-<from>-to-<to>[-qualifier].md`

- `<from>`, `<to>` ∈ `claude-lead`, `codex-implementation`, `devan`.
  `devan` appears only as a `<to>` (blocked handoffs), never as `<from>`.
- `[-qualifier]` is optional free-form kebab-case (e.g. `-blocked`,
  `-remediation-2`), matching the precedent already set by the §0/§1
  handoff docs.
- §0/§1 handoff docs keep their existing old-style role names
  (`claude-refiner`, `codex-acceptance`, etc.) — do not rename history.
  §2 onward uses only `claude-lead` / `codex-implementation` / `devan`.
- The retry-discipline check in both prompts (§5, preflight step 5)
  depends on this convention exactly: it looks for
  `docs/phase10-handoffs/<today>-section-<N>-*-to-devan*.md`.

### 8.2 `docs/phase10-handoffs/TEMPLATE.md`

```markdown
# Phase 10 §N handoff: <from-role> → <to-role>[, qualifier]

Prepared <Month DD, YYYY> by `<tool/model, e.g. claude-code/sonnet-5 or codex/<model>>`.

## Outcome

<One of: spec ready for implementation | implementation ready for review |
review passed, no findings | review returned N bounded findings |
remediation complete, ready for re-review | section accepted, next section
initialized | blocked — see Decision needed>

## What this turn did

<Concrete summary: files touched, commit(s) made, tests/build result.>

## Evidence

- Commit: `<hash>` — `<subject>`
- Tests: `<npm test summary>`
- Build: `<npm run build summary>`
- Screenshots (if UI-bearing): `<paths>`
- Spec / review doc: `<path>`

## For the next actor

<Exactly what the next actor needs to do, referencing PHASE10_STATE.json's
current stage/role/next_actor fields — do not restate the whole protocol,
just the section-specific context.>

## Decision needed (only if status = blocked)

<Precise blocker, options, and why this turn could not resolve it itself.>
```

## 9. Acceptance tests for the workflow itself

These test the workflow machinery — not `PHASE10.md` §2's product
acceptance criteria, which come later. Codex must satisfy every one of
these before this spec is considered correctly implemented, and should
record how each was checked in its own commit/handoff.

1. **STOP respected.** Create a `STOP` file, run
   `./scripts/phase10-claude-lead.sh`. Confirm: the underlying `claude`
   invocation itself reports STOP and takes no other action;
   `PHASE10_STATE.json` is unchanged; no commit is made. Remove `STOP`
   afterward.
2. **Lock contention.** Manually create `PHASE10_LOCK` with
   `owner=codex`. Run `./scripts/phase10-claude-lead.sh`. Confirm the
   script exits 1 immediately, prints the existing lock's contents,
   never invokes `claude`, and does not overwrite or remove the existing
   lock file. Remove the manual lock afterward.
3. **Lock always released.** Run a full turn to completion; confirm
   `PHASE10_LOCK` is absent afterward. Separately, start a turn and send
   `SIGINT` (Ctrl-C) partway through; confirm `PHASE10_LOCK` is still
   removed (the `trap ... EXIT INT TERM` fired).
4. **Dirty tree caught by the agent, not the wrapper.** Make an
   uncommitted change to any file, run either runner. Confirm the
   *agent* (via its preflight, not the shell script) detects the dirty
   tree, sets `status: blocked` with a `stop_reason` naming the dirty
   file(s), writes a handoff doc, and does not stash/commit/discard the
   pre-existing change itself. Clean up the test change afterward.
5. **Schema validity.** `node scripts/phase10-validate-state.mjs` exits 0
   against the post-migration file (§3.6's real target).
6. **Invariant coverage.** Hand-construct at least one deliberately
   invalid `PHASE10_STATE.json` for each invariant in §3.4 (e.g.
   `status: "blocked"` with `next_actor: "claude"`) and confirm the
   validator reports it and exits 1 for each case, without needing to
   run it against the real file.
7. **No self-referencing commit hash.** Once real §2 turns exist, for
   every commit that sets `prev_actor_commit`, confirm
   `git show <that commit>:PHASE10_STATE.json`'s `prev_actor_commit`
   value is never equal to `<that commit>`'s own hash.
8. **Legacy preserved exactly.** After migration,
   `PHASE10_STATE.json`'s `legacy` key deep-equals the pre-migration
   file's full content, field for field (see §3.5 step 4 for the exact
   check).
9. **Retry ceiling enforced.** Manually create two same-day
   `docs/phase10-handoffs/<today>-section-<N>-*-to-devan*.md` files
   (blocked qualifier), then run the runner for the role that would act
   next. Confirm the agent's preflight step 5 refuses the section work
   and writes a third handoff explaining the retry budget is exhausted,
   without attempting any section-level work. Remove the test handoff
   files afterward.
10. **No commits from the wrapper.** `grep -n 'git commit' scripts/phase10-claude-lead.sh scripts/phase10-codex-implementation.sh` returns nothing.
11. **No output parsing in the wrapper.** Confirm neither runner script
    branches (`if`/`case`) on the captured stdout/stderr of the `claude`
    or `codex` invocation — the only thing done with that output is
    `tee`ing it to a log file.
12. **Handoff naming convention.** Every file written under
    `docs/phase10-handoffs/` by a real §2+ turn matches
    `^\d{4}-\d{2}-\d{2}-section-\d+-(claude-lead|codex-implementation)-to-(claude-lead|codex-implementation|devan)(-[a-z0-9-]+)?\.md$`.
13. **§2 initialization readiness (this task's specific deliverable).**
    Immediately after migration and before any §2 work: `current_section`
    is `"§2"`, `role` is `"claude_lead"`, `stage` is `"specify"`,
    `status` is `"ready"`, `next_actor` is `"claude"`, `section.spec_doc`
    is `null`, and no file exists yet under
    `docs/phase10-workflow/specs/`.
14. **Repo-wide green.** `npm test` and `npm run build` both pass at the
    commit that introduces every file this spec describes.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| An agent crashes mid-turn after editing files but before committing, leaving a dirty tree for the next invocation. | The *next* turn's preflight step 3 (either role) catches this as an ordinary dirty-tree block — it does not try to guess what the crashed turn intended; it reports the exact `git status --porcelain` output and stops for Devan. |
| Devan retries a failed turn more than the intended one time by running the script repeatedly without reading the handoff doc in between. | The handoff-file-counting retry check (§5, §9.9) is a durable, file-based signal independent of how many times Devan physically runs the command — a third same-day attempt is refused by the agent itself regardless of wrapper-level retry counting. |
| `codex exec -s workspace-write -a never` blocks a command that genuinely needs network access (e.g. an ad-hoc package install) mid-section, since there is no interactive approver. | The command fails and is returned to Codex per `-a never`'s documented behavior; Codex cannot silently escalate. If a section genuinely needs an install, that is scope the `specify` stage should have anticipated in the spec doc, or Devan runs that one step by hand before the next `implement` turn. This is treated as acceptable friction, not a bug — it is exactly what "no broad danger/full-access flags" is protecting against. |
| The two standing prompt files drift out of sync with this spec or with `docs/PHASE10_AGENT_WORKFLOW.md` over time (someone hand-edits one but not the others). | All three point at each other explicitly and at `IMPLEMENTATION_SPEC.md` as the source of truth; §9's acceptance tests re-verify the *behavior* the prompts produce, not just their text, so drift is caught functionally even if not diffed. |
| A future Phase 10 section's spec doc is written vaguely enough that Claude's bounded review has nothing concrete to check against, defeating "bounded review discipline." | §5.1's `specify` stage instructs "concrete, checkable requirements... not the generic template" — this is a discipline requirement on the agent, not something the schema can force; if a review turn finds the spec too vague to review against, that itself is a legitimate `blocked` outcome per the "ambiguous → blocked, never guess" rule. |
| `--permission-mode auto` (Claude) or `-a never -s workspace-write` (Codex) is more or less permissive than Devan expects, letting an agent take an action Devan would have wanted to approve first. | Both are the least-surprising non-interactive choice given the confirmed flag set (§0) and match this exact session's own operating mode; flagged explicitly in §11 as a choice Devan should confirm once before first use, not assumed silently. |
| The `sections_history` array grows unboundedly readable but large over 11 more sections (§2–§13), reintroducing some of v1's sprawl at a smaller scale. | Each entry is capped to four short fields (`id`, `status`, `accepted_commit`, optional one-line `note`) by design — even at 13 entries this is a few dozen lines, nothing like v1's per-round remediation blobs. |
| Two people (Devan on two machines, or Devan and a future collaborator) start the wrapper script at nearly the same instant, racing the lock-file check. | Acceptable residual risk for this single-operator, semi-automated design: the check-then-create in §6.1/§6.2 has a small TOCTOU window but Devan is the only person who ever runs these commands, one at a time, by hand — this is explicitly not a concurrent-systems design. |

## 11. File manifest — exactly what Codex creates or edits

Nothing outside this list. No application code, no `PHASE10.md` change,
no `.env*` access.

| Path | Action |
|---|---|
| `AGENTS.md` | Replace with §2's content |
| `PHASE10_STATE.json` | Migrate to v2 per §3.5 |
| `docs/PHASE10_AGENT_WORKFLOW.md` | Replace with §4's content |
| `PHASE10_PROGRESS.md` | Append §7.2's short section (no other edits) |
| `docs/phase10-workflow/prompts/claude-lead.md` | Create, §5.1's content |
| `docs/phase10-workflow/prompts/codex-implementation.md` | Create, §5.2's content |
| `scripts/phase10-claude-lead.sh` | Create executable, §6.1's content |
| `scripts/phase10-codex-implementation.sh` | Create executable, §6.2's content |
| `scripts/phase10-validate-state.mjs` | Create, §6.3's content |
| `docs/phase10-handoffs/TEMPLATE.md` | Create, §8.2's content |

The one-time migration snippet in §3.5 is run directly (`node -e` or a
temp file deleted right after), not left behind as a permanent script.

## 12. Next step — kicking off §2

After Codex implements this spec exactly (all of §11's files, migration
run, §9's acceptance tests passing, `npm test` and `npm run build`
green, everything committed per the parent task's commit instructions),
the very next command Devan runs to actually start Phase 10 §2 is:

```
./scripts/phase10-claude-lead.sh
```

That turn will read `PHASE10_STATE.json` (`stage: "specify"`), write
`docs/phase10-workflow/specs/section-2.md` against `PHASE10.md`'s §2 job
("`/share` Pulse vertical slice"), and hand off to Codex. Nothing about
§2's actual content is decided by this spec — that is Claude Lead's job
on that first real turn, not this bootstrap pass's.

## 13. Flagged assumptions and open questions for Devan

None of these block implementing this spec — they are choices made for
concreteness that Devan may want to revisit before or after the first
real turn:

1. **Claude model pin.** `scripts/phase10-claude-lead.sh` defaults to
   `--model sonnet` (overridable via `PHASE10_CLAUDE_MODEL` env var).
   This was not specified by Devan; it was chosen for consistency with
   this bootstrap session. Confirm or change before first use.
2. **Codex model default.** `scripts/phase10-codex-implementation.sh`
   passes no `-m` flag by default (overridable via `PHASE10_CODEX_MODEL`),
   letting Codex use its own configured default, since no specific model
   name was confirmed as part of this task's verified CLI facts.
3. **No `RESUME` file mechanism.** This design uses direct one-command
   invocation instead, per §7.1. If Devan specifically wanted a
   `RESUME`-file-triggered flow, that would need a different design.
4. **`-a never` for Codex.** Chosen as the only sandboxed, non-interactive,
   non-`danger-full-access` approval policy that doesn't hang waiting for
   an approver that doesn't exist. If a section's implementation work
   turns out to routinely need something workspace-write can't do, that
   will surface as a `blocked` turn, not a silent failure — treat the
   first such block as a signal to revisit this choice, not as this
   design being wrong.
5. **Retry-ceiling mechanism lives in the agent's own preflight
   (grepping `docs/phase10-handoffs/`), not in the wrapper script.** This
   was a deliberate reading of the design brief's "the agent itself
   performs the preflight checks... not a separate wrapper script that
   makes decisions" — an alternative, stricter reading would put a
   mechanical attempt-counter in the wrapper instead. This spec's choice
   keeps the wrapper genuinely dumb at the cost of the retry check being
   only as reliable as the agent's own file-listing step.
6. **§2's actual product content is entirely undecided by this spec**,
   deliberately — per this task's explicit instruction not to begin §2
   work.
