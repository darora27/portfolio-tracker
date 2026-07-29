<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Live Verification

- Verification runs by **executing retained scripts with `node`**, not
  through any agent's built-in browser tool.
- **"No browser is available", an empty `[]` device list, or any "no
  backend" response from an agent's browser surface is a limit of that
  agent's tooling — it is NOT grounds for marking a live criterion
  deferred, blocked, or unverifiable.** Fall back to the retained scripts
  below instead of stopping.
- This host launches Chromium fine. Verified 2026-07-29: `131.0.6778.33`,
  screenshot captured, pixel read matched expected value. Playwright is at
  `~/Library/Caches/ms-playwright/`.
- Running a repository file as a command is not substituting a browser
  controller. It is permitted and expected.
- Run procedure: `npm run build && npm run start`, then
  `node docs/phase10-baseline/<section>/scripts/<name>.mjs`, then read the
  final machine-readable line. Never measure against `next dev` — HMR and
  on-demand compilation invalidate the sub-50ms route long-task rule.

# Multi-agent protocol (Phase 10)

This repo is worked on by two different coding-agent CLIs (Claude Code and
OpenAI Codex CLI) across sessions, never simultaneously. Codex CLI reads
this file (`AGENTS.md`) natively; Claude Code is pointed here by one line
in `CLAUDE.md`. Do not duplicate this protocol there.

Before doing anything:
1. Check that `STOP` does not exist at the repo root. If it does, stop
   immediately — do not read further files, do not touch git, do not
   touch `PHASE10_STATE.json`.
2. Read `docs/phase10-workflow/workflow.json`, `PHASE10_STATE.json`, and the
   generated `docs/phase10-workflow/ACTIVE_CONTEXT.md`. Run
   `npm run phase10:validate` before changing Phase 10 files; stale generated
   context or protocol drift is a hard stop.
3. Read the current section specification, direction documents, handoff, and
   relevant product/UX source sections named by `ACTIVE_CONTEXT.md`.
   `PHASE10_PROGRESS.md`, the full historical direction/architecture docs, and
   `docs/phase10-workflow/IMPLEMENTATION_SPEC.md` are history/on-demand
   evidence, not recurring prompt payload.
4. From Phase 10 §2 onward, follow the Claude-lead / Codex-implementation
   workflow in `docs/PHASE10_AGENT_WORKFLOW.md` and the standing prompt
   files in `docs/phase10-workflow/prompts/`. §0 and §1 used an earlier
   Builder/Critic/Refiner/Acceptance workflow, preserved as history in
   `PHASE10_STATE.json`'s `legacy` key and in `docs/phase10-reviews/` —
   do not follow that older sequence for §2 onward.
   Devan may invoke those fixed runners manually or through the bounded
   state-driven `scripts/phase10-relay.sh`; the relay never changes roles,
   parses agent prose, retries, commits, or runs agents concurrently.
5. Work sections in order. Implementation/remediation candidates use
   `phase10(§N): <summary>` and must pass `npm test` plus `npm run build`.
   Review/workflow-only commits use the documented review/workflow prefixes
   and must not conceal a known red gate.
6. Append your tool/model name to every checklist item you complete
   (e.g. `— done by claude-code/sonnet-5`, `— done by codex/<model>`).
7. Never run alongside another agent on this repo — confirm no other
   Claude or Codex process is active against this working directory, and
   confirm `PHASE10_LOCK` is absent (or already owned by you) before
   starting.
8. Never run `vercel --prod`; never print, edit, stage, or commit
   `.env*` contents; new routes are owner-gated by default unless the
   phase spec says otherwise.
9. Leave the repo fully committed before stopping. Leave tests/build green
   unless `ACTIVE_CONTEXT.md` names a current, owner-approved, time-boxed
   inherited-red exception; in that case do not add failures, record the exact
   unchanged failure set, and close it in the owning section.
