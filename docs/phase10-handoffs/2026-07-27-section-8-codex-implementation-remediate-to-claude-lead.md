# Phase 10 §8 remediation handoff: codex-implementation → claude-lead

Prepared July 27, 2026 by `codex/gpt-5`.

## Outcome

Both bounded §8 review findings are remediated and ready for Claude Lead
re-review. The desktop flat fallback is restored for forced no-3D and reduced
motion, and criterion 37 now has a fixture-driven behavioral test.

## Bounded changes

- Split the narrow-viewport fallback rules from reduced-motion rules so reduced
  motion hides only the WebGL layer and motion, not Mission Control, the systems
  manual, or the asteroid-belt control — done by codex/gpt-5.
- Added explicit desktop restoration of `.semanticMap` for
  `[data-force-no-3d="true"]` and `prefers-reduced-motion: reduce`, reversing
  the desktop screen-reader clip while preserving the ordinary full-motion
  desktop path — done by codex/gpt-5.
- Replaced source-string-only coverage with a behavioral
  `getDashboardData()` fixture that mocks the Supabase and Finnhub calls,
  constructs current prices plus a synthetic prior snapshot, and asserts both
  the hand-computed `dayReturn` and sticky prior-snapshot `orreryBelt` result —
  done by codex/gpt-5.
- Left all behavior and files outside Claude Lead's two recorded findings
  unchanged — done by codex/gpt-5.

## Verification

- Focused tests:
  `npx vitest run src/lib/dashboard-data.source.test.ts src/app/dev/phase10-portfolio-orrery/OrreryWorld.test.tsx`
  — 2 files, 11/11 tests passed — done by codex/gpt-5.
- `npm test`: 85 files, 467/467 tests passed — done by codex/gpt-5.
- `npm run build`: Next.js 16.2.11 compiled successfully, TypeScript passed,
  and all 19 route tasks generated — done by codex/gpt-5.
- A local Next.js server started successfully on `127.0.0.1:3100`, but the
  Codex browser runtime reported no available browser backend. No live-browser
  result or screenshot is claimed for this turn — done by codex/gpt-5.
- No dependency, route, authentication, financial-math, privacy,
  package-manifest, texture, or environment-file change was made — done by
  codex/gpt-5.

## Required Claude Lead live re-review

At a real 1440×900 viewport, independently verify:

1. `/share?no3d=1` shows the semantic holdings list, sun link, belt control,
   and systems-manual control; each is operable.
2. `/share` with `prefers-reduced-motion: reduce` shows the same flat
   presentation and controls.
3. `/share?focus=portfolio&camera=command` with reduced motion keeps Mission
   Control visible and operable.
4. The ordinary full-motion desktop route still uses the visually hidden
   semantic list until it receives keyboard focus.

## State transition

- `current_section: "§8"` — done by codex/gpt-5.
- `stage: "review"` — done by codex/gpt-5.
- `role: "claude_lead"` — done by codex/gpt-5.
- `next_actor: "claude"` — done by codex/gpt-5.
- `status: "ready"` — done by codex/gpt-5.
- `prev_actor_commit: "8a50c1a46ffaedf2a7c52a5b7b7542b4e2c2ce10"`
  (Claude Lead's prior review commit) — done by codex/gpt-5.
- `section.remediation_commits` contains the required placeholder for Claude
  Lead to replace with this remediation commit hash from its clean starting
  HEAD — done by codex/gpt-5.
