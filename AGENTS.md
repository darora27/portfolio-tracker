<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Multi-agent protocol (Phase 9)

This repo is worked on by two different coding-agent CLIs (Claude Code and
OpenAI Codex CLI) across sessions, never simultaneously. Codex CLI reads
this file (`AGENTS.md`) natively; Claude Code is pointed here by one line
in `CLAUDE.md`. Do not duplicate this protocol there.

Before doing anything:
1. Read the current `PHASE*_PROGRESS.md` (currently `PHASE9_PROGRESS.md`)
   before doing anything else.
2. For any UI-bearing Phase 9 work, also read `docs/PHASE9_UX_BRIEF.md`
   first — it carries the project-specific UX intent that generic
   frontend-design advice must not override.
3. Work sections in order; one commit per section
   (`phase9(§N): <summary>`); `npm test` and `npm run build` must be green
   before every commit.
4. Append your tool/model name to every checklist item you complete
   (e.g. `— done by claude-code/sonnet-5`, `— done by codex/<model>`).
5. Never run alongside another agent on this repo — confirm no other
   Claude or Codex process is active against this working directory
   before starting.
6. Never run `vercel --prod`; never print, edit, stage, or commit
   `.env*` contents; new routes are owner-gated by default unless the
   phase spec says otherwise.
7. Leave the repo green (tests + build passing) and committed before
   stopping for any reason — rate limit, budget, or end of task.
