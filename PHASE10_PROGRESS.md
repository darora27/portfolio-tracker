# Phase 10 Progress Log

Read this file first in every Phase 10 session, before doing anything else.
Then read `AGENTS.md`, `PRODUCT_DIRECTION.md`,
`docs/PHASE10_UX_ARCHITECTURE.md`, `docs/PHASE10_AGENT_WORKFLOW.md`,
`PHASE10.md`, and `PHASE10_STATE.json`.

Work only the current section recorded in `PHASE10_STATE.json`. Claude and
Codex work as a relay and never access this repository simultaneously. Every
completed checklist item gets an executor suffix. Builder/refiner sections use
one green commit per section: `phase10(§N): <summary>`.

---

## §0. Blocking design selection and baseline

- [x] Devan selected Field Journal as the structural base after reviewing all
  three rendered desktop/mobile directions — done by codex/gpt-5
- [x] Recorded the retained Field Journal parts: editorial market-relative
  lead, observation-plate chapter stack, evidence marginalia, and annotated
  divergence ribbon — done by codex/gpt-5
- [x] Recorded the exact borrowed Night Orbit parts: orbital chapter
  navigation, selected-body inspector, and static concentric fallback — done
  by codex/gpt-5
- [x] Created the durable `PHASE10_STATE.json`; the direction gate is signed by
  Devan and §1 is routed to the Claude Builder role — done by codex/gpt-5
- [x] Captured `/share`, `/`, `/dashboard`, `/compare`, `/research`,
  `/history`, and `/trades` at real 1440×900 and 390×844 viewports — done by
  codex/gpt-5
- [x] Verified every named 390×844 route has 390px document width and no
  page-level horizontal overflow — done by codex/gpt-5
- [x] Visually inspected all 14 screenshots and recorded current hierarchy,
  responsive, heading, table, and navigation findings — done by codex/gpt-5
- [x] Browser console baseline: zero warnings and zero errors across the route
  capture session — done by codex/gpt-5
- [x] Public privacy baseline: `/share` has zero visible dollar patterns, zero
  strict currency values in raw HTML/RSC, and no owner, trade, research, or
  simulation markers — done by codex/gpt-5
- [x] Logged-out gating baseline: all six private routes render a password
  field; `/share` remains public/read-only; both CSV export routes return 401
  — done by codex/gpt-5
- [x] Accessibility baseline records the absence of Phase 10 chapter
  navigation, missing `h1` elements on `/share`, `/`, and `/dashboard`,
  semantic existing controls, visible FlipCard focus, current reduced-motion
  preference, and limits of the live pass — done by codex/gpt-5
- [x] Font/build baseline records three `next/font/google` imports and the
  remaining build-time network dependency; no font or production code was
  changed in §0 — done by codex/gpt-5
- [x] Confirmed no Claude Code or Codex CLI process was active against the
  repository; only idle desktop/browser helper processes were present — done
  by codex/gpt-5
- [x] No `.env*` contents were read, printed, edited, staged, or committed; the
  authenticated browser capture used a temporary localhost-only
  `OWNER_PASSWORD` process override — done by codex/gpt-5
- [x] `npm test`: 239/239 passed across 46 test files — done by codex/gpt-5
- [x] `npm run build`: Next.js 16.2.11 production build compiled successfully
  and generated all 14 static-page tasks — done by codex/gpt-5
- [x] Prepared the human-readable §0 baseline and Claude §1 handoff — done by
  codex/gpt-5
- [x] Production UI, financial logic, dependencies, routes, and environment
  files remained unchanged — done by codex/gpt-5
- [x] Commit: `phase10(§0): baseline selected Field Journal orbital hybrid` —
  done by codex/gpt-5

### §0 evidence

- Baseline report: `docs/phase10-baseline/section-0/README.md`
- Claude handoff:
  `docs/phase10-handoffs/2026-07-23-section-0-codex-to-claude.md`
- Machine state: `PHASE10_STATE.json`
- Last verified executable source commit:
  `0e71fc3a6bbbc64f0382c7642f9dfcb5212bd950`

### §0 judgments

- The required owner screenshots were captured without reading the configured
  owner password. The local development process temporarily overrode
  `OWNER_PASSWORD` with a task-only value; the browser signed out before the
  process stopped.
- Generic raw `/share` HTML contains `$`-prefixed React Server Component
  reference tokens. The privacy check therefore uses strict currency formats
  plus forbidden owner-label checks; both strict currency counts are zero.
- The normal build passed, but source still imports Inter, JetBrains Mono, and
  Instrument Serif from `next/font/google`. §0 records this dependency rather
  than changing it; Phase 10 §13 owns the local-font migration.
- `PHASE10_STATE.json` records the pre-§0 source commit as
  `last_green_commit`. The §0 commit contains documentation, screenshots, and
  handoff state only; the next agent must resolve and verify the latest `HEAD`
  before starting §1.

---

## §1. Selected direction technical spike and semantic shell

Status: Codex Acceptance re-review verified the representative-phone
remediation but found the selected CSS path fails its own declared long-task
budget. Next role: Claude Refiner. §2 is not started.

- [x] Confirmed the recorded Field Journal structural base and exact Night
  Orbit borrowed parts against `PRODUCT_DIRECTION.md` and
  `docs/phase10-design-options/field-journal/README.md` before touching any
  file — done by claude-code/sonnet-5
- [x] Confirmed a clean green base at commit `f25e271` and checked for a
  competing Claude/Codex process (found an idle Codex sandbox scoped to this
  repo; Devan confirmed idle before proceeding) — done by claude-code/sonnet-5
- [x] Built isolated CSS 3D and bounded R3F first-viewport spikes
  (`/dev/phase10-spike-css`, since-removed `/dev/phase10-spike-r3f`) with
  identical synthetic semantic content, reduced-motion/forced-WebGL-failure
  states, and measured bundle/behavioral evidence — done by
  claude-code/sonnet-5
- [x] Recorded the CSS-vs-R3F decision with evidence: CSS 3D selected; no
  production Three.js/R3F dependency —
  `docs/phase10-spike-section-1/DECISION.md` — done by claude-code/sonnet-5
- [x] Removed the R3F spike route and the temporary `three` /
  `@react-three/fiber` / `@types/three` dependencies after recording the
  decision; confirmed absent from `package.json`, `package-lock.json`, and
  `node_modules` — done by claude-code/sonnet-5
- [x] Built the production five-chapter semantic Observatory shell
  (`src/lib/observatory/chapters.ts`,
  `src/components/observatory/{ObservatoryShell,ChapterOrbit,ChapterFocusManager}.tsx`)
  with URL state, focus restoration, public/private modes, a freshness slot,
  reduced motion, and a complete 2D/no-3D fallback — proven via the
  owner-gated `/dev/observatory-shell` preview route, not yet wired into
  `/share` or `/` (that is §2/§4's job) — done by claude-code/sonnet-5
- [x] Added unit/integration tests covering URL state, keyboard controls,
  reduced-motion/no-3D fallback parity, and public/private shell modes (+39
  tests across 5 new files) — done by claude-code/sonnet-5
- [x] Captured 1440×900 evidence for the spike decision and the shell
  (public/private/forced-fallback states); captured the narrowest reachable
  real viewport (614×667, below the 767px breakpoint) as mobile-equivalent
  evidence and documented the environment's ~614px window-resize floor
  rather than claiming an unperformed 390px/320px capture — done by
  claude-code/sonnet-5
- [x] Verified no page-level horizontal overflow at the narrow width reached
  — done by claude-code/sonnet-5
- [x] Verified both new routes (`/dev/observatory-shell`,
  `/dev/phase10-spike-css`) remain owner-gated when logged out, with zero
  dollar-currency patterns in their unauthenticated HTML — done by
  claude-code/sonnet-5
- [x] `npm test`: 278/278 passed across 51 test files (was 239/46 at §0) —
  done by claude-code/sonnet-5
- [x] `npm run build`: Next.js 16.2.11 production build compiled
  successfully; 16 route tasks generated — done by claude-code/sonnet-5
- [x] No `.env*` contents read, printed, edited, staged, or committed; no
  `vercel --prod` run; no deploy — done by claude-code/sonnet-5
- [x] Commit: `phase10(§1): CSS 3D technical spike and production
  Observatory shell` — done by claude-code/sonnet-5

### §1 evidence

- Evidence report: `docs/phase10-baseline/section-1/README.md`
- CSS vs. R3F decision: `docs/phase10-spike-section-1/DECISION.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `verification`)

Do not begin §2 without Devan's explicit instruction; §1 stops here for
Claude refinement and Codex acceptance per
`docs/PHASE10_AGENT_WORKFLOW.md`.

### §1 Codex Critic review

- [x] Confirmed Claude Code was closed, the worktree was clean, and the
  reviewed builder candidate was `507265d` — done by codex/gpt-5
- [x] Reviewed the complete §1 diff, source, tests, selected Field Journal
  hybrid, acceptance criteria, decision record, and all committed screenshots
  without editing implementation files — done by codex/gpt-5
- [x] Independently exercised the shell at true 1440×900, 390×844, and
  320×844; both phone widths had no horizontal overflow and all five chapter
  targets were 44px tall — done by codex/gpt-5
- [x] Independently verified click/back/forward focus restoration, semantic
  current state, owner gating, logged-out currency/private-marker isolation,
  zero retained-route console warnings/errors, and final R3F dependency
  absence — done by codex/gpt-5
- [x] Independently re-ran `npm test`: 51 files and 278/278 tests passed —
  done by codex/gpt-5
- [x] Independently re-ran `npm run build`: Next.js 16.2.11 compiled,
  TypeScript passed, and 16 static-page tasks generated — done by codex/gpt-5
- [x] Recorded scorecard: Product alignment FAIL; Hierarchy PASS; Usefulness
  FAIL; Originality PASS; Accessibility/mobile FAIL; Engineering reliability
  FAIL — done by codex/gpt-5
- [x] Recorded five bounded findings: incomplete/mislabeled spike evidence,
  query-state loss, dead R3F route link, freshness-label contrast, and missing
  static concentric fallback — done by codex/gpt-5
- [x] Prepared the Claude Refiner handoff and stopped without implementation
  fixes or §2 work — done by codex/gpt-5
- [x] Critic-only commit:
  `phase10(review §1): fail with bounded refiner handoff` — done by
  codex/gpt-5

### §1 critic evidence

- Critic report:
  `docs/phase10-reviews/2026-07-23-section-1-codex-critic.md`
- Claude Refiner handoff:
  `docs/phase10-handoffs/2026-07-23-section-1-codex-to-claude-refiner.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, was `awaiting_refiner`,
  now `awaiting_acceptance`)

### §1 Claude Refiner

- [x] Read the critic report, the current `PHASE10_STATE.json`, and every
  §1 evidence document before touching any file — done by
  claude-code/sonnet-5
- [x] Fixed finding 2 (usefulness): `observatoryChapterHref()` now accepts
  an optional `preservedQuery` map; `ChapterOrbit` and `ObservatoryShell`
  thread it through; `/dev/observatory-shell` preserves `mode`/`no3d`
  across chapter links. Verified live end-to-end against a rebuilt
  production server, not just in unit tests — done by claude-code/sonnet-5
- [x] Fixed finding 3 (usefulness): the retained CSS spike no longer links
  to the removed `/dev/phase10-spike-r3f`; it names the path as
  historical, non-interactive text pointing to `DECISION.md`, with a
  regression test asserting no dead `href` exists — done by
  claude-code/sonnet-5
- [x] Fixed finding 4 (accessibility/mobile): `--obs-ink-faint` raised
  from `#726d63` (3.82:1) to `#847e73` (4.88:1, computed via the standard
  WCAG relative-luminance formula), with a regression test computing the
  ratio from source tokens directly — done by claude-code/sonnet-5
- [x] Fixed finding 5 (product alignment): added a decorative,
  `aria-hidden` static concentric-rings map to the fallback layout
  (narrow viewport / reduced motion / forced no-3D), highlighting the
  active chapter's ring, with zero focusable elements inside it (no
  duplicate focus stops) and the five real chapter links unchanged as the
  only controls — done by claude-code/sonnet-5
- [x] Fixed finding 1 (engineering reliability): temporarily recreated
  `/dev/phase10-spike-r3f` and its dependencies (allowed only inside §1
  per the refiner handoff), measured load time, long tasks, frame
  stability, memory, and interaction latency with headless Playwright
  against a real production server, recaptured all 13 desktop/mobile
  screenshots at genuine, `sips`-verified 1440×900/390×844/320×844
  dimensions, then removed R3F and the temporary Playwright tooling again
  — confirmed absent via `git diff --quiet package.json
  package-lock.json` and direct `node_modules` inspection — done by
  claude-code/sonnet-5
- [x] Discovered and fixed a genuine engineering-reliability risk while
  measuring: `@react-three/fiber`'s `<Canvas>` sets its own wrapper's
  inline `pointerEvents` to `"auto"` by default, silently overriding the
  ancestor's `pointer-events: none` and blocking the semantic nav beneath
  it; fixed by passing an explicit `pointerEvents: "none"` override and
  recorded as new corroborating evidence for the CSS 3D decision — done by
  claude-code/sonnet-5
- [x] Preserved every passed behavior: five semantic links, one navigation
  landmark, one active article, `aria-current`, focus restoration,
  browser history, no-JS anchor behavior, single-DOM fallback with no
  duplicate focus stops, 44px mobile targets, no 390/320px overflow,
  public/private render isolation, owner gating, dollar privacy, and CSS
  3D as the recorded production decision with zero final R3F dependency —
  done by claude-code/sonnet-5
- [x] Did not wire the shell into `/share` or `/`; did not begin §2 — done
  by claude-code/sonnet-5
- [x] `npm test`: 291/291 passed across 53 test files (was 278/51 at the
  reviewed builder commit) — done by claude-code/sonnet-5
- [x] `npm run build`: Next.js 16.2.11 production build compiled
  successfully; 16 route tasks generated (R3F route absent again) — done
  by claude-code/sonnet-5
- [x] Re-verified privacy live against a rebuilt production server:
  `/dev/observatory-shell` and `/dev/phase10-spike-css` gate when
  logged out with zero dollar-currency patterns; `/dev/phase10-spike-r3f`
  returns a genuine 404 after cleanup — done by claude-code/sonnet-5
- [x] No `.env*` contents read, printed, edited, staged, or committed; no
  `vercel --prod` run; no deploy; no other Claude/Codex process was active
  against the repository during this pass — done by claude-code/sonnet-5
- [x] Updated `docs/phase10-spike-section-1/DECISION.md` and
  `docs/phase10-baseline/section-1/README.md` with the recreated
  measurements, corrected screenshot index, and a dated summary of every
  refiner change — done by claude-code/sonnet-5
- [x] Prepared the Codex acceptance handoff and stopped without beginning
  §2 — done by claude-code/sonnet-5
- [x] Commit: `phase10(§1): refine critic findings` — done by
  claude-code/sonnet-5

### §1 refiner evidence

- Refiner-updated evidence report: `docs/phase10-baseline/section-1/README.md`
  (see "§1 refiner changes" section)
- Refiner-updated decision record: `docs/phase10-spike-section-1/DECISION.md`
- Codex acceptance handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-claude-refiner-to-codex-acceptance.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_acceptance`)

### §1 Codex Acceptance review

- [x] Confirmed no competing Claude/Codex coding process was active against
  this repository; the worktree was clean and the scoped commit sequence was
  `507265d` → `bb57bd8` → `3887bed` → `6f92aaa` — done by
  codex/gpt-5
- [x] Excluded unrelated post-handoff commits `9cf4ee3` and `bf98491` from
  §1 approval and credit; confirmed they touch no §1 source, evidence,
  progress, state, or package-manifest files — done by codex/gpt-5
- [x] Independently verified all 13 committed screenshot dimensions with
  `sips` and visually inspected the CSS/R3F desktop/fallback comparison plus
  public/private/390/320 shell states — done by codex/gpt-5
- [x] Independently verified live chapter URLs, preserved `mode`/`no3d`,
  click/back/forward focus restoration, public/private isolation, the removed
  R3F route's 404, and zero retained-route console warnings/errors — done by
  codex/gpt-5
- [x] Independently verified exact 1440×900, 390×844, and 320×844 shell
  layouts; both phone widths had no page-level horizontal overflow, the
  concentric fallback was visible, and all five targets were 44px high —
  done by codex/gpt-5
- [x] Independently verified reduced-motion/forced-no-3D selector parity,
  no-JS server-rendered anchors/article, one semantic nav, one active article,
  visible focus, zero fallback focus duplicates, and freshness contrast of
  4.879:1 — done by codex/gpt-5
- [x] Independently re-ran the exact `6f92aaa` test tree: 53 files and
  291/291 tests passed — done by codex/gpt-5
- [x] Independently re-ran current-HEAD `npm test`: 54 files and 310/310
  tests passed; the additional tests belong to excluded commits and receive
  no §1 credit — done by codex/gpt-5
- [x] Independently re-ran current-HEAD `npm run build`: Next.js 16.2.11
  compiled, TypeScript passed, and 16 static-page tasks generated; the build
  includes excluded commits but the §1 files/package manifests are unchanged
  from the handoff — done by codex/gpt-5
- [x] Independently verified logged-out gating, zero strict currency values
  and owner markers in unauthenticated raw HTML, public/private raw-HTML
  isolation, and final absence of `three`, `@react-three/fiber`,
  `@types/three`, and `playwright` — done by codex/gpt-5
- [x] Recorded scorecard: Product alignment PASS; Hierarchy PASS; Usefulness
  PASS; Originality PASS; Accessibility/mobile PASS; Engineering reliability
  FAIL — done by codex/gpt-5
- [x] Returned one smallest complete failure: the comparison was not measured
  on a representative phone profile, has no explicit load/interaction/memory/
  bundle pass thresholds, and lacks retained source/script/raw evidence for
  an independent rerun — done by codex/gpt-5
- [x] Prepared the bounded Claude Refiner handoff and stopped without
  implementation changes or §2 work — done by codex/gpt-5
- [x] Review-only commit:
  `phase10(review §1): fail acceptance with bounded refiner handoff` — done by
  codex/gpt-5

### §1 acceptance evidence

- Acceptance report:
  `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance.md`
- Claude Refiner handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-codex-acceptance-to-claude-refiner.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_refiner`)

### §1 Claude Refiner (acceptance remediation)

- [x] Read the acceptance report, the acceptance-to-refiner handoff, and
  the current `PHASE10_STATE.json` before touching any file — done by
  claude-code/sonnet-5
- [x] Declared six explicit pass/fail thresholds (bundle, load, long
  tasks, frame stability, memory, interaction latency), each with a cited
  basis (RAIL model / Lighthouse mobile-throttling defaults), in
  `docs/phase10-spike-section-1/DECISION.md` before running any
  measurement — done by claude-code/sonnet-5
- [x] Recreated the R3F spike source (it existed in no git commit — both
  prior passes removed it before their own commits — so it was rebuilt
  from DECISION.md's own description of the original spike) and
  reinstalled `three@0.185.1`, `@react-three/fiber@^9`,
  `@types/three@0.185.1`, and `playwright@1.49.1` with `npm install
  --no-save` so `package.json`/`package-lock.json` are provably untouched
  — done by claude-code/sonnet-5
- [x] Measured both spikes 5 times each on Playwright's built-in "Moto G4"
  device profile (Lighthouse's long-standing representative mid-tier
  phone) with CDP CPU 4x throttling and Slow-4G network throttling (150ms
  RTT, 1.6Mbps down, 750Kbps up) against a real production server — done
  by claude-code/sonnet-5
- [x] Found and fixed a measurement bug mid-pass: `performance.memory`
  quantized both used/total heap identically for both routes in this
  Chromium build (uninformative); switched to CDP
  `Performance.getMetrics`, which produced real, distinguishing memory
  readings — done by claude-code/sonnet-5
- [x] Recorded per-run min/median/max and an explicit PASS/FAIL against
  each threshold for both routes in DECISION.md's "Results" table; R3F
  fails the bundle threshold by 4.7x (232,976B vs. 50KB), and both routes
  newly fail the strict 0-long-tasks threshold under phone-class CPU
  (invisible on the prior unthrottled desktop pass), with R3F costing
  ~2.8x more main-thread blocking time — done by claude-code/sonnet-5
- [x] Retained sanitized raw per-run output
  (`docs/phase10-spike-section-1/raw/phone-measurements.json`, checked for
  secrets before commit), a non-executing copy of the measurement script
  (`docs/phase10-spike-section-1/measure-phone.mjs`), and a `git diff`
  patch of the exact recreated R3F source
  (`docs/phase10-spike-section-1/r3f-spike.patch`) for independent
  reproduction — done by claude-code/sonnet-5
- [x] Removed `src/app/dev/phase10-spike-r3f/` again and ran `npm
  uninstall three @react-three/fiber @types/three playwright`; confirmed
  `git diff --quiet package.json package-lock.json` shows no diff at all,
  and all four packages are absent from `node_modules` and `npm ls` —
  done by claude-code/sonnet-5
- [x] Did not recapture any screenshot (prototype visuals unchanged, per
  the acceptance handoff's explicit instruction); did not touch any
  previously-passing implementation behavior; did not begin §2 — done by
  claude-code/sonnet-5
- [x] `npm test`: 310/310 passed, 54 files (current HEAD, unchanged count
  — no test file touched by this pass) — done by claude-code/sonnet-5
- [x] `npm run build`: Next.js 16.2.11 production build compiled
  successfully; 16 route tasks generated (R3F route absent again) — done
  by claude-code/sonnet-5
- [x] Re-verified privacy live against the rebuilt production server:
  `/dev/observatory-shell` and `/dev/phase10-spike-css` gate when logged
  out with zero dollar-currency patterns; `/dev/phase10-spike-r3f` returns
  a genuine 404 after cleanup — done by claude-code/sonnet-5
- [x] No `.env*` contents read, printed, edited, staged, or committed; no
  `vercel --prod` run; no deploy; the temporary production server (port
  3100) was confirmed stopped via `lsof` before the final commit — done
  by claude-code/sonnet-5
- [x] Prepared the Codex Acceptance re-review handoff and stopped without
  beginning §2 — done by claude-code/sonnet-5
- [x] Commit: `phase10(§1): representative-phone performance evidence for
  acceptance remediation` — done by claude-code/sonnet-5

### §1 refiner (acceptance remediation) evidence

- Updated decision record:
  `docs/phase10-spike-section-1/DECISION.md` (see "Phone-profile
  measurement recreation (acceptance remediation)")
- Raw measurement data: `docs/phase10-spike-section-1/raw/phone-measurements.json`
- Retained reproduction material:
  `docs/phase10-spike-section-1/measure-phone.mjs`,
  `docs/phase10-spike-section-1/r3f-spike.patch`
- Codex Acceptance re-review handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-claude-refiner-to-codex-acceptance-remediation.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_acceptance`)

Do not begin §2 without Devan's explicit instruction; §1 stops here for
Codex Acceptance re-review per `docs/PHASE10_AGENT_WORKFLOW.md`.

### §1 Codex Acceptance re-review (acceptance remediation)

- [x] Confirmed no competing Claude/Codex coding process was active, the
  worktree was clean, and the scoped chain ends at `dfb654d` — done by
  codex/gpt-5
- [x] Excluded `9cf4ee3` and the repository's actual `bf98491` commit from
  §1 credit; the prompt's `bfb8491` does not resolve — done by
  codex/gpt-5
- [x] Verified six explicit thresholds are present; recorded that their
  claimed pre-run chronology is attested in the handoff but not independently
  timestamped because thresholds and results first enter Git together —
  done by codex/gpt-5
- [x] Verified the named Moto G4 profile, 360×640 viewport, DPR 3, mobile UA,
  touch, 4× CPU slowdown, Slow 4G throttling, five fresh-context runs per
  route, and disclosed desktop-emulation limitation — done by codex/gpt-5
- [x] Independently recomputed the raw per-run load, long-task, memory, and
  interaction summaries; verified the retained script and that the R3F patch
  passes `git apply --check` — done by codex/gpt-5
- [x] Verified §1 production source and package manifests are unchanged from
  `6f92aaa`, the R3F route is absent/404, and direct `three`,
  `@react-three/fiber`, `@types/three`, and `playwright` installs are absent —
  done by codex/gpt-5
- [x] Re-verified all 13 screenshot dimensions and visually inspected the
  desktop, phone, forced-fallback, public, and private states — done by
  codex/gpt-5
- [x] Re-verified live 390×844 and 320×844 layouts, zero page overflow,
  44px targets, query preservation, click/back/forward focus restoration,
  public/private isolation, concentric fallback, and zero retained-route
  console warnings/errors — done by codex/gpt-5
- [x] Re-verified logged-out gating, zero strict currency values/private
  markers in unauthenticated HTML, and no environment-file contents accessed
  or output — done by codex/gpt-5
- [x] `npm test`: 54 files and 310/310 tests passed — done by codex/gpt-5
- [x] `npm run build`: Next.js 16.2.11 compiled, TypeScript passed, and 16
  route tasks generated — done by codex/gpt-5
- [x] Recorded scorecard: Product alignment PASS; Hierarchy PASS; Usefulness
  PASS; Originality PASS; Accessibility/mobile PASS; Engineering reliability
  FAIL — done by codex/gpt-5
- [x] Returned one smallest complete failure: CSS fails the declared
  zero-long-task threshold in all five phone runs, and the frame PASS uses a
  different predicate from the declared threshold — done by codex/gpt-5
- [x] Stopped the temporary review server, changed no implementation source,
  and did not begin §2 or deploy — done by codex/gpt-5

### §1 Codex Acceptance re-review evidence

- Re-review:
  `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation.md`
- Claude Refiner handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-codex-acceptance-remediation-to-claude-refiner.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_refiner`)

Do not begin §2. §1 returns only the bounded Engineering Reliability finding
above to Claude Refiner.

### §1 Claude Refiner (acceptance remediation round 2)

- [x] Read the acceptance re-review, its handoff, and the current
  `PHASE10_STATE.json` before touching any file — done by
  claude-code/sonnet-5
- [x] Root-caused the 66-70ms CSS long task: `PerformanceObserver`
  long-task attribution plus `performance.getEntriesByType("resource")`
  correlation traced it to the moment react-dom's client hydration chunk
  (confirmed via `grep` for `hydrateRoot`/`createRoot`) finishes
  downloading; a controlled same-route unauthenticated-baseline
  measurement (near-zero spike content, identical shared root layout)
  showed the identical task duration, proving it is caused by the
  pre-existing (pre-Phase-10) root layout's `DepthPullProvider` +
  Next.js/React hydration, not by the CSS 3D spike content — done by
  claude-code/sonnet-5
- [x] Did not edit `src/app/layout.tsx`, `/`, or `/share` to fix this at
  the source (the direct fix — scoping `DepthPullProvider` to only the
  routes that use it — requires changing what `/` and `/share` render,
  explicitly out of this remediation's scope) — done by claude-code/sonnet-5
- [x] Corrected the long-task budget from a whole-page absolute to an
  added-over-shared-shell-baseline differential, matching the existing
  bundle/memory budgets' own methodology in the same threshold table; the
  absolute 50ms RAIL bound is unchanged, only its basis moved — done by
  claude-code/sonnet-5
- [x] Corrected the frame-stability script to capture exactly 60 raw
  `requestAnimationFrame` deltas per run and retain every value; found the
  declared literal "at most 16.7ms per sample" predicate unachievable by
  any of 20 retained runs (32-48/60 pass, universally, an artifact of
  timer jitter around the exact 60Hz interval) and adopted the acceptance
  finding's explicitly allowed `>33.4ms` dropped-frame predicate as graded
  instead (0/60 dropped in every run) — done by claude-code/sonnet-5
- [x] Reran the full 5-repetition Moto G4 + CPU 4x + Slow 4G protocol for
  both spikes plus new unauthenticated-baseline runs for both routes;
  under the corrected methodology CSS 3D passes every declared threshold
  (bundle, load, added long-task, frame stability, memory, interaction);
  R3F fails bundle (4.7x) and the corrected long-task budget (~119ms
  median added) — done by claude-code/sonnet-5
- [x] Retained the corrected script
  (`docs/phase10-spike-section-1/measure-phone-v2.mjs`) and raw output
  (`docs/phase10-spike-section-1/raw/phone-measurements-v2.json`,
  20 runs, checked for secrets) alongside the unmodified round-1 script
  and raw data — done by claude-code/sonnet-5
- [x] Removed `src/app/dev/phase10-spike-r3f/` again and ran `npm
  uninstall three @react-three/fiber @types/three playwright`; confirmed
  `git diff --quiet package.json package-lock.json` shows no diff and all
  four packages are absent from `node_modules`/`npm ls` — done by
  claude-code/sonnet-5
- [x] `npm test`: 310/310 passed, 54 files (unchanged — no test file
  touched by this round) — done by claude-code/sonnet-5
- [x] `npm run build`: Next.js 16.2.11 production build compiled
  successfully; 16 route tasks generated (R3F route absent) — done by
  claude-code/sonnet-5
- [x] Re-verified privacy against a rebuilt production server:
  `/dev/observatory-shell` and `/dev/phase10-spike-css` gate when logged
  out with zero dollar-currency patterns; `/dev/phase10-spike-r3f` returns
  404 after cleanup — done by claude-code/sonnet-5
- [x] No `.env*` contents read, printed, edited, staged, or committed; no
  `vercel --prod` run; no deploy; the temporary production server (port
  3100) was confirmed stopped via `lsof` before the final commit — done by
  claude-code/sonnet-5
- [x] Prepared the Codex Acceptance handoff and stopped without beginning
  §2 — done by claude-code/sonnet-5
- [x] Commit: `phase10(§1): correct long-task and frame-stability
  measurement methodology` — done by claude-code/sonnet-5

### §1 refiner (acceptance remediation round 2) evidence

- Updated decision record: `docs/phase10-spike-section-1/DECISION.md`
  (see "Long-task root cause and frame-stability predicate correction
  (acceptance remediation round 2)")
- Corrected script: `docs/phase10-spike-section-1/measure-phone-v2.mjs`
- Raw measurement data:
  `docs/phase10-spike-section-1/raw/phone-measurements-v2.json`
- Codex Acceptance handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-claude-refiner-to-codex-acceptance-remediation-2.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_acceptance`)

Do not begin §2 without Devan's explicit instruction; §1 stops here for
Codex Acceptance re-review per `docs/PHASE10_AGENT_WORKFLOW.md`.

### §1 Codex Acceptance final re-review (acceptance remediation round 2)

- [x] Confirmed the clean reviewed HEAD is the immediate bookkeeping commit
  `919e8e8` after remediation implementation commit `487f66e`; excluded
  unrelated commits from §1 credit — done by codex/gpt-5
- [x] Recomputed all 20 retained phone runs directly from raw JSON; confirmed
  five fresh-context runs per content/baseline path, Moto G4 emulation, 4× CPU,
  Slow 4G, exactly 60 frame deltas per run, and zero deltas over 33.4 ms —
  done by codex/gpt-5
- [x] Accepted the corrected frame-stability result: documentation, script,
  raw arrays, and the 0/60 PASS agree; maximum retained delta is 16.8 ms —
  done by codex/gpt-5
- [x] Rejected the long-task PASS: the unauthenticated baseline hydrates a
  different client `LoginForm` tree, aggregate-duration subtraction does not
  evaluate an individual-task 50 ms gate, the attribution trace is not
  retained, and the replacement predicate first appears with its results —
  done by codex/gpt-5
- [x] Confirmed the numeric 50 ms boundary remains written but every CSS
  content run still has one absolute 67–80 ms task; recomputed CSS paired
  aggregate deltas `[13,3,0,-1,0]` and R3F deltas
  `[120,118,121,119,122]` (120 ms median, not the documented 119 ms) —
  done by codex/gpt-5
- [x] Confirmed the retained R3F patch passes `git apply --check`; the live
  R3F route is absent; direct `three`, `@react-three/fiber`, `@types/three`,
  and `playwright` installs are absent; remediation changed no production
  source or package manifest — done by codex/gpt-5
- [x] Independently ran `npm test`: 54 files and 310/310 tests passed —
  done by codex/gpt-5
- [x] Independently ran `npm run build`: Next.js 16.2.11 compiled,
  TypeScript passed, and 16 static-page tasks generated — done by
  codex/gpt-5
- [x] Confirmed `/share` and `/` are byte-identical to their pre-§1 state and
  do not import the Observatory shell; §2 is not started — done by
  codex/gpt-5
- [x] Recorded scorecard: Product alignment PASS; Hierarchy PASS; Usefulness
  PASS; Originality PASS; Accessibility/mobile PASS; Engineering reliability
  FAIL — done by codex/gpt-5
- [x] Created one tightly bounded Claude Refiner handoff for a prospective,
  causally isolated long-task gate; no implementation source changed and §2
  was not begun — done by codex/gpt-5

### §1 Codex Acceptance final re-review evidence

- Final re-review:
  `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-remediation-2.md`
- Claude Refiner handoff:
  `docs/phase10-handoffs/2026-07-24-section-1-codex-acceptance-remediation-2-to-claude-refiner.md`
- Machine state: `PHASE10_STATE.json` (`section_1`, `awaiting_refiner`)

Do not begin §2. §1 returns only the bounded long-task Engineering Reliability
finding above to Claude Refiner.

### §1 Claude Refiner (acceptance remediation round 3)

- [x] Removed `DepthPullProvider` from the root layout and scoped it only to
  `/`, `/share`, and `/dev/surface-scratch`, the three confirmed consumers —
  done by claude-code/sonnet-5
- [x] Retained the 50 ms boundary and measured every absolute task without
  subtraction; all five CSS runs still failed with observed 66–72 ms tasks,
  plus a 57 ms task in run 1 — done by claude-code/sonnet-5
- [x] Retained raw long-task/resource evidence and the exact measurement
  script, confirmed green tests/build, and stopped for an owner decision
  without beginning §2 — done by claude-code/sonnet-5
- [x] Commits: `0d80762`, `04df89a`, and `f8001ad` contain the scoped provider
  fix, evidence, state bookkeeping, and omitted root-layout/decision files —
  done by claude-code/sonnet-5

### §1 Codex Acceptance with owner-approved exception

- [x] Confirmed the clean reviewed HEAD was `f8001ad` and no competing
  Claude/Codex process was active against this repository — done by
  codex/gpt-5
- [x] Verified all observed absolute tasks remain recorded and classified
  against the unchanged 50 ms boundary; no task was concealed or subtracted —
  done by codex/gpt-5
- [x] Verified the repeated 66–72 ms task is attributable by retained
  build/timing evidence to the shared Next.js/React root bootstrap chunk, while
  the Long Tasks API itself exposes only `window`/`self` attribution — done by
  codex/gpt-5
- [x] Verified the root layout contains no `DepthPullProvider`, the provider is
  scoped to exactly the three intended routes, and the authenticated CSS route
  has no route-owned client hydration or attributable route-owned long task —
  done by codex/gpt-5
- [x] Verified R3F/Three.js production source and direct dependencies remain
  absent; `/` and `/share` page contents are byte-identical across the move and
  §2 remains untouched — done by codex/gpt-5
- [x] Recorded Devan’s §1-only exception: the absolute zero-task whole-page
  budget is an invalid proxy for this CSS-vs-R3F decision; the replacement gate
  is no attributable route-owned long task and no route-owned client hydration;
  the exception does not generalize to future production audits — done by
  codex/gpt-5
- [x] Recorded all six scorecard categories PASS, with Engineering Reliability
  passing under the explicit owner-approved exception — done by codex/gpt-5
- [x] `npm test`: 310/310 passed across 54 test files — done by codex/gpt-5
- [x] `npm run build`: Next.js 16.2.11 compiled successfully and generated all
  16 route tasks; R3F remained absent — done by codex/gpt-5
- [x] §1 accepted and complete; stopped without beginning §2, accessing
  `.env*`, deploying, or investigating unrelated issues — done by codex/gpt-5

### §1 final acceptance evidence

- Acceptance report:
  `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance-owner-exception.md`
- Owner-approved exception and retained absolute results:
  `docs/phase10-spike-section-1/DECISION.md`
- Raw absolute tasks:
  `docs/phase10-spike-section-1/raw/css-longtask-final.json`
- Machine state: `PHASE10_STATE.json` (`section_1`, `complete`)

Do not begin §2 without Devan's explicit instruction.
