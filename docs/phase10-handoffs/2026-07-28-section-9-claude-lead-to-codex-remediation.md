# Phase 10 §9 handoff: Claude Lead (`review`) → Codex Implementation (`remediate`)

Prepared July 28, 2026 by `claude-code/opus-5`.

## Outcome

Review returned **6 bounded findings**. `/share` — the section's primary
route — returns HTTP 500 on every request in the production build, so the
section cannot pass and no live evidence could be captured at review.

## What this turn did

- Preflight clean: no `STOP`; `PHASE10_LOCK` present with `owner=claude`;
  `git status --porcelain` empty; state at `role: claude_lead` /
  `stage: review` / `status: ready`; no prior same-day `-to-devan` handoff for
  §9, so the retry budget was intact.
- Invoked the `portfolio-ux` project skill via the `Skill` tool (not the
  fallback path) before review, applied beneath the spec's authority order. It
  produced no new criteria and no advisory findings.
- Re-ran `npm test` and `npm run build` independently — both green.
- Served that same build with `npx next start -p 3100` and probed the real
  routes with curl and headless chromium. `/share` returns 500.
- Audited the full diff `77c74b3..bc1b79c` against the 66 acceptance criteria
  in `docs/phase10-workflow/specs/section-9.md`.
- Wrote `docs/phase10-workflow/reviews/section-9-review.md` and retained
  `docs/phase10-baseline/section-9/claude-review/`.
- Changed no application source.

## Evidence

- Reviewed commit: `bc1b79c97a9487174f389430a6f5fc8447ebde05` —
  `phase10(§9): craft the universe operations layer`
- Tests: `npm test` — 94 test files, 496/496 passed.
- Build: `npm run build` — Next.js 16.2.11, TypeScript clean, 18
  static-generation tasks, 24 route entries.
- Live routes: `/share` → **500**, `/` → 200 (sign-in form only),
  `/dashboard` → 200. Raw capture:
  `docs/phase10-baseline/section-9/claude-review/raw-route-status.txt`,
  screenshot `share-1440x900-FAILS.png`.
- Review doc: `docs/phase10-workflow/reviews/section-9-review.md`

Green tests and a green build did not catch F1: vitest imports the modules
directly, where the server/client component boundary does not exist, and
`/share` is a dynamic route so the build never prerenders it.

## For the next actor

`PHASE10_STATE.json` now reads `stage: remediate`, `role:
codex_implementation`, `next_actor: codex`, `status: ready`, with the six
findings in `section.findings`. Fix **only** those findings.

- **F1 is the gate.** `MissionControl.tsx` gained `"use client"` this section
  while the server component `UniverseRoute.tsx` still imports the runtime
  value `MISSION_CONTROL_PANELS` from it and calls `.some(...)` on it. Move
  that constant and `MissionControlPanelId` into a shared non-`"use client"`
  module both sides import, and add coverage that would catch a 500 on
  `/share`. Nothing else in the section can be confirmed until this renders.
- **F2** — remove the hard-coded `points="0,71 80,66 160,69 240,57 320,52"`
  benchmark polyline in `PlanetDetail.tsx`; use the real same-period VOO
  series or render the toggle unavailable.
- **F3** — `scripts/measure-long-tasks.mjs` does not parse
  (`node --check` → `SyntaxError` at line 42). Fix it, then commit the five
  fresh-context raw runs and the raw RGB output.
- **F4** — make the criterion-52 sun test vary hover/focus so it can fail.
- **F5** — add a distinctive share-count canary to
  `share/page.test.tsx`.
- **F6** — after F1, capture and commit the full §12 evidence set.

The review doc also lists the criteria that passed on inspection (textures and
byte ladder, the public trade-log contract, computed contrast, dialog and
plot-linkage accessibility, the pure scene model and its assertions, the
source-guard replacements, and news failure degradation) so the remediation
round does not redo settled work. Several of those remain contingent on F1
before they can also be confirmed live.

Do not widen scope: the out-of-scope list in the spec's §2.2 still stands,
including the D1 rule that trail/orbit sign→colour and sign→direction mapping
must not be touched.

## Decision needed (only if status = blocked)

Not applicable — `status` is `ready` and the findings are all actionable by
Codex Implementation without an owner decision.
