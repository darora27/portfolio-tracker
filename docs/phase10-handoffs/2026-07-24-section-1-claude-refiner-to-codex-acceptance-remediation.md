# Phase 10 handoff: Claude Refiner (acceptance remediation) → Codex Acceptance

Prepared July 24, 2026 by `claude-code/sonnet-5`.

## Handoff status

Addressed the single bounded engineering-reliability finding from Codex
Acceptance's July 24 review. Scope is §1 only. §2 has not started.

Acceptance finding addressed:
`docs/phase10-reviews/2026-07-24-section-1-codex-acceptance.md`, "Blocking
finding" #1.

Prior handoff (Codex Acceptance → Claude Refiner):
`docs/phase10-handoffs/2026-07-24-section-1-codex-acceptance-to-claude-refiner.md`

## What changed

Only `docs/phase10-spike-section-1/DECISION.md`, this handoff,
`PHASE10_STATE.json`, and `PHASE10_PROGRESS.md` are new/changed in the
tracked tree, plus three new retained evidence files. No implementation
source file (`src/`) differs from the reviewed acceptance commit `6f92aaa`
— the R3F spike source was recreated on disk for measurement and removed
again before this commit, exactly as both prior passes did.

New retained files:

- `docs/phase10-spike-section-1/raw/phone-measurements.json` — sanitized
  raw per-run measurement output (5 repetitions × 2 routes), checked for
  secrets before commit.
- `docs/phase10-spike-section-1/measure-phone.mjs` — a non-executing copy
  of the measurement script (the working copy was deleted after use).
- `docs/phase10-spike-section-1/r3f-spike.patch` — a `git diff` patch of
  the exact recreated R3F spike source, so it's reproducible without
  living in the committed application tree.

## What was done, and how it maps to the finding's required change

The finding required, in order:

1. **Declare concrete pass/fail thresholds before measuring.** Six
   thresholds (bundle, load, long tasks, frame stability, memory,
   interaction latency) are declared in DECISION.md's new "Thresholds,
   declared before this run" table, each with a cited basis (RAIL model /
   Lighthouse mobile-throttling defaults), written before the phone-profile
   run was executed.
2. **Rerun every metric on a documented representative phone environment.**
   Used Playwright's built-in `"Moto G4"` device descriptor (Lighthouse's
   long-standing default representative mid-tier Android phone) plus CDP
   CPU 4x throttling and Slow-4G network throttling (150ms RTT, 1.6Mbps
   down, 750Kbps up) — fully named and documented in DECISION.md's "Representative
   phone profile" table, including the residual disclosed limitation
   (emulated on desktop Chromium, not a physical device).
3. **Record per-run/summarized values with sample counts and a result
   against each threshold.** 5 repetitions per route; min/median/max
   recorded per metric in DECISION.md's "Results" table with an explicit
   PASS/FAIL per cell.
4. **Retain sanitized raw output plus sufficient reproduction material,
   without importing R3F into production or leaving its dependencies
   installed.** Done — see "New retained files" above and DECISION.md's
   "Reproduction material retained for independent review" section for the
   exact independent-rerun procedure. `three`, `@react-three/fiber`,
   `@types/three`, and `playwright` were installed with `npm install
   --no-save` this pass specifically so `package.json`/`package-lock.json`
   are provably untouched (`git diff --quiet` shows no diff at all, not
   merely a byte-identical revert).

## A methodology correction found and fixed during this pass

The first phone-profile run showed `performance.memory` reporting an
identical, uninformative `10,000,000` B for both routes — this Chromium
build quantizes `totalJSHeapSize` the same way it quantizes
`usedJSHeapSize` (previously documented, desktop pass). Switched to CDP
`Performance.getMetrics` for the memory reading, which produced real,
distinguishing values (CSS ~4.77MB total heap vs. R3F ~9.34MB median).
Documented in DECISION.md as a reusable finding for any future
phone-profile measurement in this repository.

## A new, honest finding this pass surfaced

Under phone-class CPU throttling (invisible on the prior unthrottled
desktop pass), both routes now show nonzero long-task time during load —
CSS ~68ms median, R3F ~189ms median — so both fail the strict "0 tasks
>50ms" threshold. This doesn't change the CSS 3D decision (R3F still costs
~2.8x more main-thread blocking time, corroborating the same direction as
the bundle-cost finding) but is reported plainly rather than hidden, per
`docs/PHASE10_AGENT_WORKFLOW.md`'s "never claim a check that was not
performed" rule and its inverse: never omit an inconvenient one that was.

## Passing work preserved, not touched

- All four previously-passing functional fixes (query preservation,
  dead-link removal, freshness contrast, static concentric fallback).
- All 13 previously-verified screenshots — not recaptured; prototype
  visuals did not change, only the runtime measurement method, per the
  prior handoff's explicit instruction not to recapture unless visuals
  change.
- Five semantic links, navigation landmark, focus restoration, browser
  history, public/private isolation, owner gating, 44px targets, no
  390/320 overflow — unchanged.
- Commits `9cf4ee3` and `bf98491` remain unrelated, outside §1 scope, not
  modified or credited.

## Verification run this pass

- `npm test`: 310/310 passed, 54 files (current HEAD, includes the two
  unrelated commits; unchanged from Codex Acceptance's own current-HEAD
  count — no test file was touched by this pass).
- `npm run build`: Next.js 16.2.11, TypeScript passed, 16 static-page
  tasks generated, R3F route absent.
- `npm ls three @react-three/fiber @types/three playwright --depth=0`:
  empty. `git diff --quiet package.json package-lock.json`: no diff.
- Logged-out `/dev/observatory-shell` and `/dev/phase10-spike-css` render
  the sign-in form; `/dev/phase10-spike-r3f` returns 404; zero
  `$<digits>.<digits>` patterns in either retained route's unauthenticated
  HTML.
- No `.env*` file read, printed, edited, staged, or committed. No
  `vercel --prod` run, no deploy. Temporary production server (port 3100)
  confirmed stopped via `lsof` before this commit.

## Not done (out of scope for this remediation)

- §2 was not started.
- `/share` and `/` were not wired to the Observatory shell (§2/§4's job).
- No screenshot was recaptured (visuals unchanged).
- Commits `9cf4ee3` and `bf98491` were not modified, reverted, or credited.

## Exact Codex Acceptance prompt

> You are the Phase 10 Acceptance Reviewer for §1, re-reviewing after
> bounded remediation. Read
> `docs/phase10-reviews/2026-07-24-section-1-codex-acceptance.md` (your own
> prior finding), this handoff, and the updated
> `docs/phase10-spike-section-1/DECISION.md`. Independently verify the
> representative-phone measurement evidence: the declared thresholds, the
> named phone profile and throttling, the per-run/summarized results with
> sample counts, and that the retained raw output and reproduction material
> (`docs/phase10-spike-section-1/raw/phone-measurements.json`,
> `measure-phone.mjs`, `r3f-spike.patch`) are sufficient for an independent
> rerun. Confirm `three`, `@react-three/fiber`, `@types/three`, and
> `playwright` remain absent from the production package/build. Re-verify
> the four previously-passing functional findings were not regressed. Do
> not implement fixes. Mark §1 complete only if every scorecard category
> and acceptance criterion now passes; otherwise record the smallest
> complete failure list and route back to Claude Refiner. Do not begin §2.
