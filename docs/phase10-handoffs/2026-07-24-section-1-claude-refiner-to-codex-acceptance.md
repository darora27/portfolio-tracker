# Phase 10 handoff: Claude Refiner §1 → Codex Acceptance Review

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Handoff status

Phase 10 §1 refiner work addressing all five Codex Critic findings is
complete and committed. Route state to Codex acceptance review per
`docs/PHASE10_AGENT_WORKFLOW.md`. Do not begin §2 until acceptance passes.

## Read in this order

1. `AGENTS.md`
2. `PHASE10_PROGRESS.md` (see "§1 Claude Refiner" and "§1 refiner evidence")
3. `PRODUCT_DIRECTION.md`
4. `docs/PHASE10_UX_ARCHITECTURE.md`
5. `docs/PHASE10_AGENT_WORKFLOW.md`
6. `PHASE10.md`
7. `PHASE10_STATE.json` (`section_1`, `review.prior_critic_review`)
8. `docs/phase10-reviews/2026-07-23-section-1-codex-critic.md` (the
   findings being addressed)
9. `docs/phase10-spike-section-1/DECISION.md` (recreated measurements)
10. `docs/phase10-baseline/section-1/README.md` (see "§1 refiner changes")
11. This handoff

## What changed, mapped directly to each critic finding

1. **Required spike measurements were missing; three of eight committed
   screenshots were not actually 1440×900.** Temporarily recreated
   `/dev/phase10-spike-r3f` and its dependencies (`three`,
   `@react-three/fiber`, `@types/three` — explicitly allowed inside §1 by
   the refiner handoff), measured load time, long tasks, frame stability,
   memory, and interaction latency with headless Playwright against a
   real production server (`docs/phase10-spike-section-1/DECISION.md`
   "Measurement protocol" and "Measurements (recreated)"), and recaptured
   all 13 desktop/mobile screenshots. Every file's dimensions were
   verified with `sips -g pixelWidth -g pixelHeight` before being
   documented — full output is in `DECISION.md`. R3F and the temporary
   Playwright tooling were removed again before this commit; confirmed
   via `git diff --quiet package.json package-lock.json` (byte-identical
   to the pre-measurement commit) and direct `node_modules` inspection.
   **Bonus finding:** while instrumenting interaction-latency, discovered
   that `@react-three/fiber`'s `<Canvas>` captures pointer events by
   default (`pointerEvents: "auto"` inline style), which silently blocks
   the semantic nav beneath it unless explicitly overridden — new,
   concrete evidence for the "no duplicated control surface" reason in
   the CSS 3D decision.
2. **Chapter links dropped `mode=private` and `no3d=1`.**
   `observatoryChapterHref()` (`src/lib/observatory/chapters.ts`) now
   accepts an optional `preservedQuery: Record<string, string>` merged
   into the URL before `chapter` is set; `ChapterOrbit` and
   `ObservatoryShell` thread it through as a new optional prop;
   `/dev/observatory-shell/page.tsx` passes its own `mode`/`no3d` search
   params through. Verified live end-to-end against a rebuilt production
   server (not just unit tests): from
   `/dev/observatory-shell?mode=private&chapter=structure&no3d=1`, all
   five chapter links now correctly read
   `...?mode=private&no3d=1&chapter=<id>`.
3. **The retained CSS spike linked to the removed R3F route.**
   `/dev/phase10-spike-css/page.tsx` no longer renders a live `href` to
   `/dev/phase10-spike-r3f`; it names the path as historical,
   non-interactive text pointing to `DECISION.md`. A new source-level
   regression test (`page.test.ts`) asserts no `href` to the removed
   route exists.
4. **Freshness-label contrast was 3.82:1.** `--obs-ink-faint` in
   `observatory.module.css` changed from `#726d63` to `#847e73` — 4.88:1
   against the shell background, computed via the standard WCAG
   relative-luminance formula. A new regression test
   (`observatory-contrast.test.ts`) computes the ratio from the source
   tokens directly, so a future color edit can't silently regress below
   4.5:1 again.
5. **The selected static concentric fallback was absent.** Added a
   decorative, `aria-hidden` concentric-rings map
   (`.concentricMap`/`.concentricRing`/`.concentricCenter` in
   `observatory.module.css`, rendered by `ChapterOrbit.tsx`) that appears
   only in the fallback layout (narrow viewport, reduced motion, forced
   no-3D) and highlights the active chapter's ring. Additive only: the
   five real chapter links remain the only controls, reading order and
   44px targets are unchanged, and `ChapterOrbit.test.tsx` asserts the
   map contains zero focusable elements (no duplicate focus stops).

## Preserved (re-verified, not just assumed)

- Five semantic links, one navigation landmark, one active article.
- `aria-current`, focus restoration, browser history, no-JS anchor
  behavior (all unit-tested; unchanged source paths).
- Single-DOM fallback with no duplicate focus stops (now including the
  new concentric map, which is `aria-hidden` and contains zero focusable
  elements — asserted by test).
- 44px mobile targets and no 390px/320px horizontal overflow — reverified
  with genuine headless captures this pass
  (`document.documentElement.scrollWidth === clientWidth` at every narrow
  capture).
- Public/private render isolation, owner gating, and dollar privacy —
  reverified live against a rebuilt production server (curl, no cookie
  jar): both retained dev routes gate when logged out with zero
  dollar-currency patterns in unauthenticated HTML.
- CSS 3D as the recorded production decision and zero final R3F
  dependency — reconfirmed with the recreated (and re-removed)
  measurements.
- No production route wiring; `/share` and `/` remain untouched, §2/§4
  work.

## Verification

- `npm test`: **291/291 passed, 53 test files** (was 278/278, 51 files, at
  the reviewed builder commit `507265d`).
- `npm run build`: Next.js 16.2.11 production build compiled successfully;
  **16 route tasks generated** (same as the reviewed builder commit —
  `/dev/phase10-spike-r3f` was recreated for measurement and removed
  again before this build).
- `three`, `@react-three/fiber`, `@types/three`, and the refiner's
  temporary measurement tool (`playwright`) are absent from
  `package.json`, `package-lock.json`, and `node_modules` — confirmed by
  `git diff --quiet package.json package-lock.json` (byte-identical to
  the pre-refiner commit) and direct inspection.
- No `.env*` contents were read, printed, edited, staged, or committed at
  any point. No `vercel --prod` run; no deploy. No other Claude/Codex
  process was active against this repository during this pass.

## Before reviewing, confirm

- The worktree is clean at the commit whose subject is `phase10(§1):
  refine critic findings`.
- `PHASE10_STATE.json`'s `section_1.refiner_commit` (filled in by the
  immediate bookkeeping follow-up commit — see `section_1.refiner_commit_note`
  for why a state file committed inside a commit cannot contain that same
  commit's own hash) matches the commit above.
- No Claude/Codex coding process is active against this repository.
- No `.env*` contents will be accessed or output.
- `three`, `@react-three/fiber`, `@types/three`, and `playwright` are
  absent from `package.json`, `package-lock.json`, and `node_modules`.

## Exact Codex Acceptance prompt

> Act as the Phase 10 Acceptance Reviewer for §1. Independently verify the
> complete section diff, behavior, evidence, tests, build, privacy,
> mobile, reduced motion, fallback, and all scorecard categories. Mark §1
> complete only if every category and acceptance criterion passes.
> Otherwise return the smallest complete failure list to Claude Refiner.
> Do not begin §2.

## Next relay

If acceptance finds failures, Devan returns to Claude with:

> Review the Codex Acceptance findings and act as the Claude Refiner.
> Address only the recorded blocking findings, re-run tests/build/visual
> checks, commit the green refinement, and stop.

If acceptance passes §1, `PHASE10_STATE.json`'s `section_1.status` becomes
`complete` and Devan may authorize §2 (`/share` Pulse vertical slice) with
a fresh Claude Builder prompt per `docs/PHASE10_AGENT_WORKFLOW.md`.
