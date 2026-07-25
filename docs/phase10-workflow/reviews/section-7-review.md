# Phase 10 §7 — Turn B review (spike evaluation and decision)

**Result: FAIL — no winner. 3 bounded findings.**

Reviewer: claude/fable-5 (Claude Lead, `review` stage), July 25, 2026.
Reviewed commit: `2f78b1b` — `phase10(§7): implement spatial spike routes and
tooling (Phase A)`.
Spec: `docs/phase10-workflow/specs/section-7.md` (this is **Turn B** per §0 —
an intermediate review of the *spike*, not §7's final acceptance review).
Decision record: `docs/phase10-spike-section-7/DECISION.md`.
Evidence: `docs/phase10-baseline/section-7/README.md`.

The `portfolio-ux` skill was applied via its documented fallback (direct read
of `.claude/skills/portfolio-ux/SKILL.md`) — skill discovery does not surface
project-local skills in this runner.

## Scope of this review

Per spec §8, Turn B verifies acceptance item 1 (the Phase A decision record)
and the spike-scoped subset of §2.3/§2.4/§2.5. Items 2–34 concern a Phase B
production build that does not exist yet and were not evaluated.

## What was verified

- Both spike routes built, measured live on both declared rigs (Moto G4 /
  CPU 4× / Slow 4G, and 1440×900 / CPU 2×), 5 fresh contexts per route,
  against a real production server.
- Screenshots (11 × 1440×900, dimension-verified), six `.webm` recordings, and
  live computed-style pointer/depth/travel reads captured and retained.
- Step 1 mandatory gates applied to both variants.
- §2.4's eleven storytelling rows evaluated, with unperformed human-reaction
  rows recorded as unperformed rather than invented.

Full measured tables are in `DECISION.md` §§2–5 and are not duplicated here.

## Findings

### Finding 1 — Storytelling gate failed by both variants (owner decision)

- **Category:** product alignment / visual
- **Criterion:** spec §2.4 (all eleven rows; "a row failed by **both**
  variants means neither may be selected as-built"), and `PHASE10.md` §7
  Section gate 2 ("a technically clean but non-immersive result fails §7
  regardless of which runtime was selected").
- **Evidence:** Devan reviewed both idle 1440×900 first viewports and rejected
  both as production candidates. CSS "reads as a clean dashboard placed on an
  infinite perspective grid, rather than a detailed spatial world. Its
  ellipses have no apparent meaning." R3F "reads as low-quality generic
  spheres. The moving bodies do not have an understandable portfolio purpose."
  The reviewer's independent read of
  `docs/phase10-baseline/section-7/screenshots/css-world-idle.png` and
  `r3f-world-idle.png` corroborates both descriptions
  (`DECISION.md` §5.2). Rows failed by both: 1, 2, 6, 8, 10.
- **Required change:** replace the target with the owner-defined **Portfolio
  Orrery** (Finding 3). Neither existing variant may be selected, and CSS
  must **not** be selected merely because it passed the technical gate.

### Finding 2 — R3F fails the reliability gate with a route-owned long task, and ships no pointer parallax

- **Category:** engineering reliability
- **Criterion:** spec §2.3.2 ("Long tasks during load and during one
  chapter-travel transition, added over the pre-§7 desktop baseline: 0 tasks
  > 50 ms of added time") and §2.4 row 6 (pointer parallax offsetting at least
  two layers by different magnitudes).
- **Evidence:**
  - **Long task:** 59, 60, 60, 59, 59 ms — one per run, 5 of 5 runs, on
    `/dev/phase10-spike-r3f-world`. The pre-§7 baseline and the CSS variant
    each produce **zero** long tasks on the identical rig, in all five runs, so
    this is route-owned, not the shared bootstrap task §1 documented. Start
    times (131–147 ms) sit inside the evaluation window of the two lazily
    requested R3F chunks (`3imkzi2f4gq5q.js`, 234,117 B;
    `0dcit9joezcnw.js`, 1,153 B). Raw:
    `docs/phase10-spike-section-7/raw/desktop-scene.json`.
  - **Parallax:** `--parallax-x`/`--parallax-y` read `0` and `.atmosphere` /
    `.orbitCamera` transforms are byte-identical at all four measured pointer
    positions on the R3F route
    (`docs/phase10-baseline/section-7/capture-report.json`). Source confirms
    the cause is omission, not canvas pointer capture:
    `grep -rn "pointermove" src/app/dev/phase10-spike-r3f-world/` returns
    nothing, while `CssWorld.tsx:37` attaches the listener.
- **Required change:** one bounded optimisation round on the long task,
  attempting a real fix (chunk splitting, deferred scene construction,
  yielding scene setup across frames, smaller initial geometry/material work)
  — **the 50 ms gate is not to be weakened, redefined, or replaced with a
  baseline-subtracted proxy.** Implement pointer parallax on the R3F path. If
  the route-owned task cannot be brought under 50 ms after that one round,
  return the measured result to Devan for an explicit decision; do **not**
  silently select CSS.

### Finding 3 — Remediation target replaced: the Portfolio Orrery is authorized

- **Category:** product alignment (scope authorization, not a defect in Turn A's
  work)
- **Criterion:** `PRODUCT_DIRECTION.md` design principle 3 ("Make
  dimensionality structural — every body, plane, or node must map to a
  destination or data concept"), `PHASE10.md` §7 purpose, and the owner
  decision recorded July 25, 2026.
- **Evidence:** the failure mode both variants share is that their spatial
  objects carry no portfolio information — the ellipses have no referent and
  the spheres have no purpose. This is precisely principle 3's "if it can be
  removed without changing navigation or comprehension, it is decoration."
- **Required change:** implement the Portfolio Orrery as specified in
  `docs/phase10-workflow/specs/section-7.md` §R (normative), summarised in
  `PRODUCT_DIRECTION.md`, `PHASE10.md` §7, and
  `docs/PHASE10_UX_ARCHITECTURE.md` §3.1. **This finding explicitly authorizes
  that scope** — Codex does not need a further scope decision to build it.
  In outline: full-viewport solar system at `/share`; sun = the portfolio
  (never leading with or revealing total account dollar value publicly);
  planets = actual public-safe holdings; radius = clamped portfolio weight;
  orbit direction = trailing weekly performance sign; orbital speed monotonic
  in |weekly % change| with clamps, deterministic, tested, and legended;
  orbital paths = the planets' real trajectories (no unexplained ellipses);
  hover/focus/select stabilises a planet and opens a URL-restorable semantic
  holding inspector; R3F visually dominant on desktop with the semantic DOM as
  accessible source of truth and the CSS shell as the
  no-WebGL/reduced-motion fallback; deliberate art direction ("portfolio
  command observatory"); mobile a deliberate static/simplified 2D orbital
  map/list; reduced motion freezes orbital movement; every privacy and
  no-public-dollar rule preserved; no essential information exists only in
  WebGL, motion, colour, speed, or direction.

## Recorded honestly, not scored away

- **The interaction-latency row (§2.3.2) is invalid as instrumented.**
  `clickChapterAndSettle` appends a fixed 900 ms wait, so the unmodified
  pre-§7 baseline also fails the ≤900 ms threshold (970–992 ms). The row was
  used to pass, fail, and score nothing. Excluding the fixed wait, real
  focus-to-settle is 70–92 ms (baseline), 94–120 ms (CSS), 75–106 ms (R3F).
  See `DECISION.md` §3.2.
- **Human-reaction rows 1, 7, 10 and the y-n10.com row 11 were not run with a
  second independent viewer or a live side-by-side session.** No reaction was
  fabricated. The owner's rejection makes a second viewer unnecessary *for
  selection* — there is no candidate left to select — but it does not convert
  an unperformed session into a recorded one.
- **CSS passed every measured reliability row** (added initial JS −828 B,
  load 528 ms median vs 610 ms baseline, zero long tasks, zero dropped
  frames, 100% of transition frames within budget, heap ≈ baseline). It is
  still not selected, for the reason in Finding 1.
- **R3F's non-failing rows also passed:** lazy chunk 229.8 KB (≤260 KB) and
  0 B of the initial bundle; zero chunk requests at phone width; heap +3.0 MB
  (≤40 MB); leak check across 20 transitions plateaus with max +2.55 MB growth
  (≤10 MB).

## Three corrections applied to `measure-desktop.mjs` before the run

Recorded rather than silently applied; the corrected script is committed.
(1) the focus predicate used strict equality against a heading whose text also
contains the chapter number, so it could never match; (2) the transition RAF
sample started after the window it measured had elapsed, always yielding an
empty array; (3) the R3F leak cycle started on the already-active chapter,
where a click is a no-op. See `DECISION.md` §1.1.

## Repository hygiene

`.claude/settings.local.json` (a machine-local Claude Code permission
allowlist, not project state) was untracked and not ignored. It is now listed
in `.gitignore` so the worktree can be left clean without committing a
local settings file. No other non-§7 file was touched.

## Verification

This turn ran in a Linux sandbox, not on the machine where Turn A ran. Two
of the three commands are affected by that, and both are reported as measured
rather than as assumed-green.

- `node scripts/phase10-validate-state.mjs` — **exit 0, PASS.**
- `npm test` — **427 of 429 passing across 77 files; 2 failing.** Both
  failures are in `src/components/surface/CountUpSettle.test.tsx`, a
  pre-existing non-§7 component test unrelated to anything this turn touched.
  They are a CPU-contention artifact of this sandbox, and reproducibly so:
  the same file passes **4/4 in isolation**, with those two tests taking
  1886 ms and 1890 ms against their own hard-coded 2000 ms `waitFor` timeout.
  Under full-suite parallelism in this environment they cross that margin;
  under it on the owner's machine (Turn A, same source commit) the suite
  recorded 429/429. **Zero files under `src/` changed this turn**
  (`git status --porcelain -- src/` is empty), so no source change can be
  responsible.
- `npm run build` — **could not complete in this environment.**
  `src/app/layout.tsx` still imports Inter, JetBrains Mono, and Instrument
  Serif from `next/font/google`, which requires a live Google Fonts fetch at
  build time. This sandbox's network policy blocks
  `https://fonts.googleapis.com` (verified directly: a plain `fetch` to it
  returns `fetch failed`), so Turbopack reports "Failed to fetch `Inter` /
  `JetBrains Mono` / `Instrument Serif` from Google Fonts" and stalls; no
  `BUILD_ID` is produced. This is the already-documented pre-existing
  condition — `PRODUCT_DIRECTION.md`'s "No production build depends on a live
  Google Fonts fetch" is an open §13 success measure, and
  `PHASE10_STATE.json`'s legacy record notes the same font-network behaviour
  from §0/§1. It is not caused by this turn, which changed no source, no
  config, and no dependency. The last recorded green build is Turn A's, at the
  same source commit.
- **Commit gate:** the standing prompt requires green tests and build only
  "before any commit that touches implementation source (not applicable to
  pure spec/review-only commits, which touch no implementation source)". This
  is a pure review/documentation/evidence commit, so the gate does not apply.
  Codex must still confirm both green on the owner's machine before its own
  remediation commit.
- No production application code or dependency changed this turn:
  `src/` is untouched, and `git diff --quiet package.json package-lock.json`
  reports no diff (`three`/`@react-three/fiber`/`@types/three` remain
  `--no-save` in `node_modules` only, for the remediation round).

## Name collision to resolve before building

`src/components/surface/PortfolioOrrery.tsx` **already exists** — a Phase 9
surface-tier decorative CSS-3D component ("this decorative layer is never the
only representation of this data"), used by `SurfaceActs.tsx` and
`/dev/surface-scratch`, whose `weights` prop varies form scale for looks only.
It is **not** the §7 Portfolio Orrery and is out of §7's scope: do not rename,
repurpose, or delete it. The new spatial scene needs a distinct component name
(for example `OrreryScene` or `ShareOrrery`), or an explicit, recorded
decision about how the two relate.

## State routing

`PHASE10_STATE.json` → `current_section: §7`, `stage: remediate`,
`role: codex_implementation`, `status: ready`, `next_actor: codex`.
This is the spec §0 Turn B "neither variant passes" outcome path, unchanged:
bounded spike remediation, not a full-section failure.

Handoff:
`docs/phase10-handoffs/2026-07-25-section-7-claude-lead-to-codex-implementation-remediate.md`
