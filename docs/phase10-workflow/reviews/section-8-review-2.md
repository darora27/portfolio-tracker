# Phase 10 §8 — Claude Lead review 2 (The Stock Market Universe — `/share` rebuilt)

**Result: PASS — no findings.**

Reviewer: claude-code/sonnet-5 (Claude Lead, `review` stage), July 27, 2026.
Reviewed commit: `d992510c0e6b3b3c3d3cf1dff053c195a1c10ce5` —
`phase10(§8): remediate owner universe feedback`.
Diff scope reviewed: `e50ca25...d992510` (one commit).
Spec: `docs/phase10-workflow/specs/section-8.md`.
Prior review (FAIL, 2 findings): `docs/phase10-workflow/reviews/section-8-review.md`.
Prior remediation commit (fixed both findings, unverified live at handoff time):
`3c53630` — `phase10(§8): remediate desktop fallback and data coverage`.
Owner-directed turn between remediations: `e50ca25` — recorded live-review
feedback (A1–D2), the rocket-cursor decision (C1), and the Mission Control
identity-split decision (C2).
Implementation handoff:
`docs/phase10-handoffs/2026-07-27-section-8-codex-owner-feedback-remediation-to-claude-lead.md`.

The `portfolio-ux` skill was applied via the normal `Skill` tool invocation
before this review (already-established review-time checklist: screenshots,
hierarchy, overflow, target sizes, keyboard operation, reduced motion/fallback,
privacy, tests, build).

## Scope of this review

Per `docs/PHASE10_AGENT_WORKFLOW.md`'s bounded-review discipline, this review
evaluates only:

1. The two findings from `section-8-review.md`, carried forward unverified
   per `PHASE10_STATE.json`'s `owner_feedback.carried_forward_unverified`:
   the `?no3d=1`/reduced-motion desktop blank-page bug, and criterion 37's
   fixture-based behavioral test.
2. The six bounded owner-feedback items recorded in
   `PHASE10_STATE.json`'s `owner_feedback` block: A2 (overlap), A3 (arrival
   isolation), B1 (orbit speed), B2 (textures), C1 (rocket cursor replaces
   lock-on), C2 (Mission Control by viewer identity).
3. A2's and C2's underlying changes touch orbit geometry and Mission
   Control's content pipeline closely enough to the existing §14 Build
   criterion 43 (50ms long-task gate) and Desktop-first criteria 19–22 that
   both were re-verified live rather than assumed unaffected.

D1 (green trail on a losing holding) and D2 ("website is confusing") remain
explicitly unactioned per the owner's own instruction recorded in `e50ca25` —
this review does not reopen them. A1 (reticle lock-on runaway) is superseded
by C1's replacement, not independently re-checked.

## Why this review required independent live-browser work

The implementation handoff recorded the same environment gap as the prior
review's remediation: `npm run start` could not bind `127.0.0.1:3100`
(`listen EPERM`) and the prescribed in-app browser runtime returned "No
browser is available" in Codex's sandbox. This review built and started a
real production server (`npm run build && PORT=3100 npm run start`, and once
with a temporary, unsaved `OWNER_PASSWORD` process override to test
authenticated behavior without ever reading `.env*`) and independently
exercised the implementation with a temporary, unsaved Playwright script
against it — deleted after use, never committed.

## What was verified and passed

### Carried-forward finding 1 — `?no3d=1` / reduced-motion desktop blank page

- Source: `orrery.module.css` now scopes the fallback-unclip rule to
  `[data-force-no-3d="true"] .semanticMap` inside the existing
  `@media (min-width: 1024px)` block (line 805), and adds a separate
  `@media (min-width: 1024px) and (prefers-reduced-motion: reduce)` rule
  (line 1013) — replacing the single combined
  `(max-width: 1023px), (prefers-reduced-motion: reduce)` selector the prior
  review found broken for the desktop-no3d and desktop-reduced-motion cases.
  `.manualButton`/`.beltButton`/`.missionControl` hiding is now scoped only
  to the `max-width: 1023px` query — no longer combined with reduced motion.
- Live, 1440×900, real production server:
  - `/share?no3d=1`: `.semanticMap` computed `clip: auto`, rendered width
    336px (previously stuck at `clip: rect(0,0,0,0)`, 0×0). Manual button
    visible.
  - `/share` with `prefers-reduced-motion: reduce` emulated: `.semanticMap`
    computed `clip: auto`, width 336px. Manual button and belt button both
    visible.
- **Fixed**, confirmed live in both states this review's prior pass found
  blank.

### Carried-forward finding 2 — criterion 37 fixture coverage

- `src/lib/dashboard-data.source.test.ts` now contains a real behavioral test
  (`"populates dayReturn and derives sticky belt membership from prior
  snapshot rows"`) that mocks every Supabase call `getDashboardData` makes,
  builds a synthetic prior-snapshot fixture (9 tickers, explicit prior and
  current prices), calls the real `getDashboardData()`, and asserts against
  hand-computed values.
- Independently re-derived the arithmetic: `dayReturn` for ticker `NEW`
  (current 3.8, prior close 3.5) → `3.8/3.5 − 1`, matching the test's
  assertion exactly. Belt hysteresis: prior-snapshot top-8 by weight is
  `P1..P7 + OLD` (`OLD` value 4 > `NEW` value 3 at the prior snapshot); at
  today's prices `NEW` (3.8) nominally outranks `OLD` (3.7), but `OLD` was
  already a planet and its today-weight (≈2.93%) stays within the 0.5%
  hysteresis band of the boundary (≈3.00%), so it is retained; `NEW` was not
  previously a planet and its weight does not clear the boundary by more
  than the band, so it stays in the belt. This matches the test's asserted
  `{ planetTickers: [P1..P7, OLD], beltTickers: [NEW] }` exactly — the test
  is not just present, its expected values are independently correct.
- **Fixed.**

### A2 — planet overlap

- `ORRERY_RING_SPACING = ORRERY_MAX_RADIUS * 2 + ORRERY_PLANET_CLEARANCE`
  (= 2.02), i.e. strictly greater than the sum of two maximum-radius planet
  diameters at adjacent ranks — a structural, not tuned, non-overlap
  guarantee. Covered by an existing unit test
  ("keeps adjacent maximum-size planet surfaces physically separated").
- Confirmed the rendering path assigns `rank = index + 1` over `holdings`
  as passed into `OrreryScene`, and traced that prop back to
  `OrreryWorld.tsx`'s `planets` array, which is built by mapping
  `orreryBelt.planetTickers` (itself weight-descending sorted by
  `resolveBeltMembership`) — not raw trade/array order. This closes the
  root cause the spec's §0/§5 flagged (index-keyed placement drifting from
  weight rank).
- **Fixed.**

### A3 — arrival surface isolation

- Live, logged out, default `/share` (no query params): page text contains
  none of "Pulse"/"Forces"/"Structure"/"Timeline"/"Lab"; the Mission Control
  overlay is not rendered/visible; exactly one canvas element (the Orrery).
  The solar system is alone on arrival, as required.
- **Fixed.**

### B1 — orbital speed

- `ORRERY_MIN_ANGULAR_SPEED`/`ORRERY_MAX_ANGULAR_SPEED` are `0.012`/`0.055`
  (previously `0.08`/`0.32`, per the handoff's own description) — the
  weekly-return-to-speed encoding and its clamp behavior are otherwise
  unchanged; existing monotonicity/clamp tests still cover the same
  function.
- **Fixed.**

### B2 — planet textures

- 8 ticker-keyed KTX2 texture sets (`base`/`emissive`/`normal`) exist under
  `public/textures/planets/`, generated from committed per-ticker source art
  (`assets/planet-textures/source/*.png`) via `scripts/generate-planet-textures.mjs`,
  which falls back to a deterministic ticker-seeded procedural generator
  (`hashTicker`) if no source PNG is present — matching design decision 2.6's
  offline/committed-output requirement.
- Visually inspected all 8 source images directly. Each is thematically
  distinct and evokes its company's actual business (ASML: precision
  lithography-like radial light patterns; CBRS: green circuit-board/AI
  motif; COST: warehouse/bulk-goods city grid; GOOG: colorful, richly
  networked landmasses; IBM: blue striped mainframe city; INTC: industrial
  chip-fab city with amber glow; MSFT: cloud city; NBIS: fiery
  neural-plasma world). No logo or wordmark is reproduced in any of the
  eight images.
- **Fixed.**

### C1 — rocket cursor replaces reticle lock-on

- `grep` for `reticle`/`lockOn`/`lock-on`/`stabiliz` in `OrreryScene.tsx`
  returns nothing — the prior stabilization/reticle mechanism is gone.
  `rocketCursor`/`rocketFlight`/`ROCKET_FLIGHT_MS` implement a full-motion
  pointer that flies to a clicked planet's live screen position.
- Live keyboard check, 1440×900, logged out: `Tab` reaches a real semantic
  `<a href="/share?holding=ASML&camera=approach">` link (not a synthetic
  focus trap); `Enter` navigates to it; after navigation, focus lands on
  `#orrery-inspector-heading`. Keyboard/screen-reader operation does not
  depend on the rocket or any reticle.
- **Fixed.**

### C2 — Mission Control by viewer identity

- Source: `share/page.tsx` defaults `missionControlContent` to
  `PublicMissionControlContent`; it is only replaced with the dynamically
  imported `OwnerMissionControlContent` when `portfolioSelected &&
  authenticated`, where `authenticated` is derived from
  `isValidSession(cookieStore.get(SESSION_COOKIE_NAME)?.value,
  process.env.OWNER_PASSWORD)` — fails closed (unauthenticated) if
  `OWNER_PASSWORD` is unset.
- Live, logged out, `/share?focus=portfolio&station=dashboard`: rendered
  text is percentage-only ("TWR −6.7%", "TODAY −0.8%", "TRAILING WEEK
  −1.4%", "VS. VOO −7.2%", volatility, top-2 weight) — zero dollar amounts
  in the rendered text. (A raw-HTML `/\$[0-9]/` grep does match, but every
  hit is an RSC-serialization token like `$1`/`$0:f:0:1:0` — the same known
  false-positive documented since the §0 baseline, not a rendered currency
  figure; confirmed by inspecting the actual surrounding text of every
  match.)
- Live, authenticated via a temporary local-only `OWNER_PASSWORD` override
  (no `.env*` contents read), same URL: rendered text includes "TOTAL VALUE
  $24,207.47", "INVESTED $26,692.23", "GAIN / LOSS −$2,484.76", full
  dashboard prose — the real owner dashboard, correctly gated behind a
  valid session.
- **Fixed.**

### Re-verified (not owner-feedback items themselves, but adjacent to this
turn's changes and part of the standing §14 gate)

- **Criterion 43 (50ms long-task gate):** 1440×900, CPU 2× throttle
  (`Emulation.setCPUThrottlingRate`), `PerformanceObserver('longtask')`,
  default `/share`. First pass against a freshly started server showed two
  62–63ms tasks in run 1 only; two subsequent full 5-fresh-context passes
  against the now-warm server showed zero long tasks in all 10 runs. This
  matches the established distinction elsewhere in this project's history
  between a one-time server/route bootstrap cost and a route-owned cost —
  the gate holds.
- **Criteria 19/20 (mobile zero-canvas, zero-overflow):** live at 390×844
  and 320×844, `document.querySelectorAll("canvas").length === 0` and
  `scrollWidth === clientWidth` at both widths.
- `npm test`: 86 files, 465/465 passed.
- `npm run build`: Next.js 16.2.11 (Turbopack), compiled clean, 18 routes
  generated.

## Findings

None.

## Verification commands run independently by this review

- `npm test` — 86 files, 465/465 passed.
- `npm run build` — compiled clean, 18 routes.
- `PORT=3100 npm run start` against a real production build; a temporary,
  unsaved Playwright script (deleted after use) drove all live checks above.
- `stat`-equivalent texture inspection via direct `ls`/`du` (not re-run
  against the byte budget table this turn — unchanged files from the prior
  review's already-recorded 24-file/261,415-byte total, which remains under
  the declared ≤300,000/≤24,000 budgets).

No `.env*` contents were read, printed, edited, staged, or committed. The
temporary owner-session override used a locally chosen throwaway value, never
the real `OWNER_PASSWORD`. No `vercel --prod` was run.
