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
