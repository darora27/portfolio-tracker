# Prompt for ChatGPT — design the Phase 10 Claude ↔ Codex handoff workflow

## Who I am and how to write for me

I'm Devan. I am not technical. macOS, default Terminal (zsh); I run every
command myself by copy-paste. The repo is at
`/Users/devanarora/Desktop/portfolio-tracker`. Give me exact commands and
complete file contents — no placeholders, no "adapt this to your setup," no
concepts I have to translate myself.

## What this is

`portfolio-tracker` is my private Next.js + TypeScript + Supabase portfolio
app. Phase 10 (a UI overhaul, worked in numbered sections §0, §1, §2…) is in
progress. Two coding-agent CLIs are installed and authenticated on my
machine: Claude Code CLI (`claude`) and OpenAI Codex CLI (`codex`). Until
now I've manually copy-pasted prompts between them. You will design a safe,
**semi-automated** handoff workflow: each turn is one command I run — no
hand-written prompts, and NOT a silent background loop.

## Current repo state (ground truth, verified today — design against this, don't assume)

- `AGENTS.md` at repo root. Codex reads it natively; Claude Code is pointed
  to it by one line in `CLAUDE.md` (keep that mechanism; do not duplicate
  protocol content into `CLAUDE.md`). It currently contains:
  1. A block fenced by `<!-- BEGIN:nextjs-agent-rules -->` /
     `<!-- END:nextjs-agent-rules -->` (a Next.js version warning). Preserve
     it verbatim at the top of any rewrite.
  2. A "Multi-agent protocol (Phase 10)" section whose still-valid rules
     must survive your rewrite: read `PHASE10_PROGRESS.md`,
     `PRODUCT_DIRECTION.md`, `docs/PHASE10_UX_ARCHITECTURE.md`,
     `PHASE10.md`, and `PHASE10_STATE.json` before Phase 10 work; sections
     in order; one commit per section (`phase10(§N): <summary>`);
     `npm test` and `npm run build` green before every commit; append
     tool/model name to completed checklist items; never run alongside
     another agent; never `vercel --prod`; never print/edit/stage/commit
     `.env*` contents; new routes owner-gated by default; leave the repo
     green and committed before stopping for any reason.
- `PHASE10_STATE.json` at repo root, currently `schema_version: 1`, with
  `current_section: "§1"`, `status: "complete"`, `next_agent: "devan"`.
  §0 and §1 are accepted and committed (§1 via a documented owner-approved
  exception). §2 is unstarted, awaiting my instruction. The v1 file has
  grown sprawling per-section blobs — your v2 schema may be much leaner,
  but the file stays at the same path, keeps a `schema_version` field, and
  the §0/§1 historical records must be preserved (e.g. moved under a
  `legacy` key), never deleted.
- `docs/phase10-handoffs/` — dated handoff docs named
  `YYYY-MM-DD-section-N-<from>-to-<to>[-qualifier].md`. Keep the location
  and naming convention.
- `docs/PHASE10_AGENT_WORKFLOW.md` describes the OLD workflow (Claude
  Builder → Codex Critic → Claude Refiner → Codex Acceptance). The role
  division below replaces it from §2 onward. Your plan must update or
  supersede that doc so the two never conflict — a stale doc contradicting
  `AGENTS.md` is exactly how agents go wrong.
- Old role names (`builder`, `critic`, `refiner`, `codex_acceptance`)
  appear throughout §0/§1 history and state. Leave them as history; the
  new schema uses only the new roles.

## Role division (decided — do not relitigate, do not swap)

1. **Claude Code — product & technical lead.** Decides what each section
   should accomplish; writes precise requirements + acceptance criteria;
   reviews Codex's implementation against those criteria only — bounded
   review, no unrelated audits, no bonus findings; accepts, or returns a
   specific bounded remediation list.
2. **Codex — implementation lead.** Implements to Claude's spec; runs
   tests, build, and mobile/browser checks; fixes only the bounded findings
   Claude raises; never expands scope or self-assigns work.

Cycle: Claude specifies → Codex implements → Claude reviews → Codex
refines → Claude accepts → next section. (Yes, this reverses the old
builder/critic assignment. That's decided.)

## Hard safety constraints (non-negotiable)

These came out of an earlier review of a naive version of this workflow.
If any recommendation of yours conflicts with one, the constraint wins.

1. **No simultaneous repo access.** A lock file at repo root recording
   owner, ISO timestamp, and task must be acquired before either agent
   starts and released when it finishes or fails.
2. **Clean tree before start.** `git status --porcelain` must print
   nothing before any agent starts. Never start an agent on a dirty tree.
3. **No orchestrator auto-commits.** The acting agent commits its own
   work, and only after its own tests/build pass.
4. **No free-text failure parsing.** Never detect "rate limited" by
   parsing CLI output — too fragile. Any ambiguous failure = BLOCKED:
   stop and tell me. No guessing, no auto-retry on ambiguity.
5. **Roles never reassign.** A blocked reviewer never silently becomes
   the implementer, or vice versa. Role-per-task is fixed. If the assigned
   agent can't proceed, the task waits for me.
6. **Max 1 automatic retry** per task, then mark blocked and stop cleanly.
7. **No sleep loops.** No fixed-interval retries pretending to know quota
   reset times. Resume is manual/semi-manual (I run the next command, or a
   RESUME file).
8. **Agents record their own outcomes.** Each agent updates
   `PHASE10_STATE.json` and writes its own handoff doc itself, as its last
   action before exiting — never an orchestrator script parsing
   transcripts to guess what happened.
9. **STOP file.** If a STOP file exists at repo root, no agent may start
   new work. Checking for it is every agent's first action.
10. **Verify real CLI syntax before assuming flags.** You cannot run
    commands on my machine, so your FIRST reply must ask me to run and
    paste back the exact `--help` / `--version` output you need (for
    `claude`, `codex`, and any non-interactive subcommands you intend to
    use). Until you've seen it, mark any command that assumes specific
    flags as UNVERIFIED. Do not invent flags.

Two design traps you must handle deliberately, not by accident:

- Lock/STOP/RESUME files at repo root will appear in
  `git status --porcelain` and break the clean-tree check unless handled —
  e.g. add those exact filenames to `.gitignore` and define the check
  order (STOP → lock → clean tree → read state).
- A commit cannot contain its own hash. The repo's history worked around
  this with follow-up bookkeeping commits; your v2 schema should choose
  something cleaner (e.g. the next actor records the previous actor's
  commit hash).

**"Semi-automated" means:** I trigger every turn by running one command;
that command invokes the right CLI non-interactively with a standing role
prompt stored as a file in the repo (not something I compose each time);
the agent itself performs the preflight checks as the first part of its own
prompt — not a separate wrapper script that makes decisions. Small dumb
helpers (e.g. a script that only creates/removes the lock file) are fine;
anything that interprets agent output or decides control flow is not.

## Deliverables (in this order)

1. Final `AGENTS.md` — full content, preserving the nextjs-agent-rules
   block and the still-valid old rules, with the new role split and
   constraints baked in.
2. `PHASE10_STATE.json` v2 — field list, allowed values for
   role/status/next-actor as a small explicit state machine, a migration
   note preserving §0/§1 history, and one fully worked example showing a
   mid-§2 state.
3. The per-turn runbook — the exact plain-language steps and copy-paste
   commands I run each time it's an agent's turn, including the standing
   prompt file content for each role (with preflight checks written into
   the prompt), and what I do when a turn ends accepted, needs-remediation,
   or BLOCKED.
4. A `docs/phase10-handoffs/` template matching the dated naming
   convention.
5. Risks and failure modes of your own design, each with its mitigation.
6. The cleanest next step: kicking off §2 under the new workflow.
7. Anything you're unsure of, flagged explicitly — especially CLI
   syntax — instead of guessed.

## Output rules

- Complete file contents in copy-paste code blocks; exact commands using
  the real path `/Users/devanarora/Desktop/portfolio-tracker`; zsh/macOS.
- No placeholders I must fill in. If you need information, ask for it as a
  numbered "run this, paste the output" list.
- Flag every assumption.

Start now with Step 0: the exact commands you need me to run and paste
back. Wait for my reply before finalizing anything that depends on it.
After I paste the output, give me the setup steps in order.
