# Phase 10 §7 handoff: Claude Lead → Codex Implementation, remediate

Prepared July 25, 2026 by `claude/fable-5` (cowork, owner-directed).

## Outcome

**Review returned 3 bounded findings — FAIL, no winner.** Neither spike
variant was selected. The remediation target has been replaced by the
owner-defined **Portfolio Orrery**, and this handoff explicitly authorizes
that scope.

## What this turn did

Completed Turn B (spike evaluation and decision) from the retained live
measurements, screenshots, filmstrips, and computed-style reads captured
against a real production server. No production application code and no
dependency changed.

- Wrote `docs/phase10-spike-section-7/DECISION.md` — full §2.3.1/§2.3.2
  measured tables for all three routes, the pointer-parallax comparison, the
  eleven-row §2.4 assessment, and the §2.5 procedure terminating at Step 1
  with **no selection**.
- Wrote `docs/phase10-workflow/reviews/section-7-review.md` — 3 bounded
  findings.
- Wrote `docs/phase10-baseline/section-7/README.md` — evidence index.
- Updated `PRODUCT_DIRECTION.md`, `PHASE10.md` §7,
  `docs/PHASE10_UX_ARCHITECTURE.md` §3.1 and §8, and
  `docs/phase10-workflow/specs/section-7.md` (new normative **§R**)
  consistently with the Orrery decision.
- Preserved and committed every piece of §7 evidence that was uncommitted at
  the start of the turn: `raw/desktop-scene.json`, `raw/mobile-fallback.json`,
  `capture-evidence.mjs`, the corrected `measure-desktop.mjs`, 11 × 1440×900
  screenshots, and 6 `.webm` recordings. Nothing was reset, cleaned, or
  discarded.

## Evidence

- Reviewed commit: `2f78b1b` — `phase10(§7): implement spatial spike routes and tooling (Phase A)`
- Decision: `docs/phase10-spike-section-7/DECISION.md`
- Review: `docs/phase10-workflow/reviews/section-7-review.md`
- Evidence index: `docs/phase10-baseline/section-7/README.md`
- Raw: `docs/phase10-spike-section-7/raw/{desktop-scene,mobile-fallback}.json`,
  `docs/phase10-baseline/section-7/capture-report.json`
- Validator: `node scripts/phase10-validate-state.mjs` — exit 0, PASS
- Tests: `npm test` — **427/429 across 77 files, 2 failing.** Both are in
  `src/components/surface/CountUpSettle.test.tsx` (pre-existing, non-§7) and
  are a reproducible sandbox CPU-contention artifact: the file passes 4/4 in
  isolation with those two tests at 1886 ms and 1890 ms against their own
  hard-coded 2000 ms `waitFor` timeout. Zero files under `src/` changed this
  turn. Turn A recorded 429/429 at the same source commit.
- Build: `npm run build` — **could not complete in this environment.**
  `next/font/google` needs a live Google Fonts fetch and this sandbox blocks
  `fonts.googleapis.com` (direct `fetch` → `fetch failed`); Turbopack reports
  three "Failed to fetch … from Google Fonts" errors and stalls with no
  `BUILD_ID`. Pre-existing open §13 condition, not caused by this turn.
- Commit gate: the standing prompt requires green tests and build only before
  commits touching implementation source. This is a pure
  review/documentation/evidence commit. **You must confirm both green on the
  owner's machine before your remediation commit.**

## The three findings, in the order you must address them

### 1. R3F reliability + missing parallax — **do this first**

- **59–60 ms route-owned long task**, one per run, 5 of 5 desktop runs
  (1440×900, CPU 2×). The pre-§7 baseline and the CSS variant each produce
  **zero** on the identical rig, so this is route-owned, not the shared
  bootstrap task §1 documented. Start times 131–147 ms sit inside the
  evaluation window of the lazily requested R3F chunks (`3imkzi2f4gq5q.js`,
  234,117 B; `0dcit9joezcnw.js`, 1,153 B).
- Attempt **real optimisation**: chunk splitting, deferring scene construction
  past first paint, yielding scene setup across frames, reducing initial
  geometry/material work.
- **Do not weaken, redefine, or baseline-subtract the 50 ms gate.** If one
  bounded optimisation round cannot bring the route-owned task under it, stop
  and return the measured result to Devan for an explicit decision. **Do not
  silently select CSS.**
- **Pointer parallax is entirely missing** on the R3F path — not blocked by
  canvas pointer capture, simply absent:
  `grep -rn "pointermove" src/app/dev/phase10-spike-r3f-world/` returns
  nothing, while `CssWorld.tsx:37` attaches it. Implement it, satisfying
  §2.4 row 6's different-magnitude two-layer offset.

### 2. Storytelling gate failed by both variants

Devan rejected both first viewports as production candidates. CSS "reads as a
clean dashboard placed on an infinite perspective grid… its ellipses have no
apparent meaning." R3F "reads as low-quality generic spheres. The moving
bodies do not have an understandable portfolio purpose." §2.4's "failed by
both" rule fired. **Neither variant may be selected, and CSS must not be
selected merely because it passed the technical gate.**

### 3. Portfolio Orrery scope — authorized, build this

`docs/phase10-workflow/specs/section-7.md` **§R** is normative and complete.
You do not need a further scope decision. In brief:

- `/share` opens with a genuinely full-viewport portfolio solar system.
- **Sun = the portfolio as a whole.** Never leads with or publicly reveals
  total account dollar value. Activating it opens the portfolio-level summary
  (composition, return, market-relative context).
- **Planets = actual public-safe holdings**, one each — not chapters.
- **Radius = portfolio weight**, perceptually sensible and clamped; small
  holdings stay visible and selectable, larger positions clearly larger.
- **Direction = trailing weekly performance**: positive clockwise, negative
  counterclockwise, unavailable/flat a neutral **explicitly labelled**
  behaviour.
- **Speed = monotonic in |weekly % change|**, clamped, deterministic,
  unit-tested, explained by an on-screen legend. Direction and speed can never
  be the only accessible representation of performance.
- **Orbital paths are the planets' real trajectories.** No unexplained
  ellipses or decorative geometric marks — this is the specific defect that
  failed both prototypes.
- **Hover/focus/select stabilises a planet** and opens a semantic holding
  inspector: ticker and company, portfolio weight, weekly return,
  portfolio-relative context, public-safe analytics, link to deeper stock
  info. URL-restorable, works with browser back/forward.
- **R3F visually dominant on desktop**; semantic DOM the accessible source of
  truth; CSS shell the no-WebGL/reduced-motion fallback.
- **Deliberate visual system** replacing placeholder spheres: procedurally
  varied planet materials, emissive sun, atmospheric rim lighting, meaningful
  orbital paths, depth, restrained bloom, coherent star field.
- **Art direction "portfolio command observatory"**: dark outer space, 1980s
  CRT phosphor green and amber, restrained scanlines, neon telemetry glow,
  analog-future HUD framing, retrofuturist control-room typography. Polished
  first, playful second. Translate the broad qualities of classic space-opera
  control panels, atomic-age futurism, and analog time-bureaucracy — copy no
  protected logos, characters, props, or exact compositions.
- **Existing routes stay intact.** Dashboard, Research, History, Trades,
  Compare, and stock routes are untouched; the accepted five-chapter content
  remains reachable in the semantic layer. The Orrery is the entry point, not
  a replacement.
- **Mobile** = deliberate static or simplified 2D orbital map/list. **Reduced
  motion** freezes orbital movement. Keyboard/screen-reader users get a
  synchronised semantic holding list and inspector. **No essential
  information may exist only in WebGL, motion, colour, speed, or direction.**
- **All public/private and no-dollar privacy rules preserved.** No owner-only
  holding data reaches `/share`.

New acceptance criteria 35–43 are in §R.12. Required visual evidence (eight
items, including simultaneous clockwise/counterclockwise motion and camera
movement to the selected holding) is in §R.11.

## For the next actor

`PHASE10_STATE.json` is at `current_section: §7`, `stage: remediate`,
`role: codex_implementation`, `status: ready`, `next_actor: codex`. Spec §0's
new **Turn B′** subsection describes this turn.

1. Do **not** re-run the spike, re-apply §2.5, or try to pick a winner from the
   two rejected prototypes.
2. Findings in order: engineering first (long task + parallax), then §R.
3. Build in an owner-gated `/dev/*` route exactly as Phase A's routes are
   gated. Production wiring into `/share` is still Turn C and does not begin
   here.
4. `three@0.185.1`, `@react-three/fiber@9.6.1`, `@types/three@0.185.1` remain
   in `node_modules` from Turn A's `--no-save` install; `package.json` and
   `package-lock.json` are still untouched. Do not run `npm ci` or anything
   that would reinstall from a clean lockfile and remove them. Adding them to
   the manifests for real is Turn C's step, after the remediation is reviewed.
5. `npm test` and `npm run build` green before committing; one commit,
   `phase10(§7): <summary>`; then `stage` → `review`, `role` →
   `claude_lead`, `next_actor` → `claude`.

## Name collision — resolve before you build

`src/components/surface/PortfolioOrrery.tsx` **already exists.** It is a Phase
9 surface-tier *decorative* CSS-3D component (its own comment: "this
decorative layer is never the only representation of this data"), used by
`SurfaceActs.tsx` and `/dev/surface-scratch`, whose `weights` prop varies form
scale for looks only. It is **not** the §7 Portfolio Orrery and is out of
§7's scope — do not rename, repurpose, or delete it. Give the new spatial
scene a distinct component name (e.g. `OrreryScene`, `ShareOrrery`), or record
an explicit decision about how the two relate.

## Notes

- The §2.3.2 interaction-latency row is **invalid as instrumented** —
  `clickChapterAndSettle` appends a fixed 900 ms wait, so the untouched pre-§7
  baseline fails the ≤900 ms threshold too (970–992 ms). It was used to pass,
  fail, and score nothing. If you touch `measure-desktop.mjs`, measure
  click → focus → settle directly instead of appending a fixed wait. See
  `DECISION.md` §3.2.
- Three corrections were applied to `measure-desktop.mjs` before this turn's
  run (focus predicate, transition-frame sampling window, leak-cycle start
  chapter). All are recorded in `DECISION.md` §1.1; the corrected script is
  committed.
- `.claude/settings.local.json` (machine-local Claude Code permissions, not
  project state) was untracked and unignored; it is now listed in
  `.gitignore` so the worktree can be left clean without committing a local
  settings file.
