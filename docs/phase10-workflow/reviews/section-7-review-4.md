# Phase 10 §7 Turn D review — genuine final-acceptance review of the shipped Portfolio Orrery

Reviewed by: `claude-code/sonnet-5` (Claude Lead, `review` stage, Turn D per
`docs/phase10-workflow/specs/section-7.md` §0).

Reviewed commit: `a361977` (`phase10(§7): wire Portfolio Orrery into
production /share (Turn C)`), diffed against `prev_actor_commit`
`799a124caf12b91370c3669494f6a625a2bb8ed9` (`phase10(review §7): pass — Turn
B″ resolves both findings, route to Turn C`).

Spec: `docs/phase10-workflow/specs/section-7.md` §8 (criteria 1-34) and §R.12
(criteria 35-43).

Handoff reviewed:
`docs/phase10-handoffs/2026-07-26-section-7-codex-implementation-turnc-to-claude-lead.md`.

## Result: FAIL — 3 bounded findings; everything else independently verified passing

Unlike Turn C's Codex sandbox (`listen EPERM` on `localhost`), this machine
could run a real production server, so every live/browser criterion below
was performed directly against the shipped build — not accepted from the
handoff's claims and not deferred.

## Independent verification performed

- `npm test`: reran myself — 82 files, 454/454 passed.
- `npm run build`: reran myself — Next.js 16.2.11 compiled, TypeScript
  passed, 19 static-page tasks generated.
- Started the real shipped production server (`next start -p 3100`) with a
  task-only `OWNER_PASSWORD` process override (never read from `.env*`).
- Built a second, real pre-Turn-C baseline server on port 3101 from a git
  worktree checked out at `prev_actor_commit` (`799a124`, confirmed via
  `git log` to be the last commit before `/share/page.tsx` was touched by
  Turn C — `src/app/(depth-pull)/share/page.tsx`'s history shows no §7 edits
  between §5's `25a8fbf` and Turn C's `a361977`), so "added over the pre-§7
  baseline" comparisons are against the actual previous production page, not
  an isolated dev route. Both servers stopped and the worktree removed at
  the end of this review.
- Wrote and ran new, retained measurement/verification tooling (all under
  `docs/phase10-spike-section-7/`, all non-executing outside a review pass
  with a live server): `measure-share-turn-d.mjs` (§2.3.1/§2.3.2 desktop +
  mobile profiles, 5 fresh contexts each, run against `/share` on both
  servers, plus a 4-cycle repeated-selection leak check),
  `turn-d-functional-check.mjs` (entrance, selection/URL/focus, legend,
  privacy sweep, mobile overflow/targets, reduced motion, forced-no3d/forced-
  WebGL-failure, accessibility tree, keyboard-only, parallax, R3F chunk
  gating, console sweep), `turn-d-parallax-recheck.mjs` (corrected parallax
  read on the real, non-`no3d` desktop path), `capture-share-turn-d.mjs`
  (fresh production screenshots/filmstrips — the evidence Turn C's sandbox
  could not produce).
- Retained raw output: `raw/share-turn-d.json`, `raw/turn-d-functional-check.json`.
- Retained fresh evidence: `screenshots/share-turn-d/*` (11 stills, including
  a real pre-Turn-C "before" still from the baseline server) and four new
  filmstrip directories (`share-turn-d-world-entry`, `share-turn-d-idle-orbit`,
  `share-turn-d-camera-travel`, `share-turn-d-pointer-exploration`) —
  visually inspected directly, not summarized.
- Read the changed source directly: `share/page.tsx`, `share-orrery.module.css`,
  `ObservatoryEntrance.tsx`, `observatory-entrance.module.css`, `OrreryWorld.tsx`,
  `OrreryScene.tsx` (camera/raycaster/hover/click wiring), `orrery.module.css`
  (parallax, fallback media queries, `[data-force-no-3d]` selectors),
  `OrreryScene.source.test.ts`, `OrreryWorld.test.tsx`, `ObservatoryEntrance.test.tsx`.
- `git diff --stat` since `prev_actor_commit`: confirmed no production
  Observatory chapter-shell file (`ObservatoryShell.tsx`, `ChapterOrbit.tsx`,
  `observatory.module.css`, `observatory-fallback.test.ts`,
  `observatory-contrast.test.ts`) was touched — Turn C's actual architecture
  mounts `ObservatoryEntrance` around the new `OrreryWorld` directly in
  `share/page.tsx`, not inside `ObservatoryShell`'s `.stage` as §5.4
  originally assumed. This is a reasonable, disclosed adaptation consistent
  with §R's supersession of "§5's production build wherever they conflict"
  — the Orrery, not the five-chapter shell, is the full-viewport entry per
  R.1, so it is the Orrery (not `ChapterOrbit`) that gets the arrival
  treatment. `ObservatoryShell.tsx` is untouched and its own tests still
  pass unchanged, so no existing guarantee about it was weakened.

## What already passes — independently re-verified this turn

- **Criterion 2, 3 (entrance behavior):** live-verified on a fresh session —
  overlay shows once (`overlayFirstLoad: 1`), Skip button visible and
  labeled, sun link (`[data-portfolio-sun]`) remains operable in the DOM the
  entire time the overlay is showing, clicking Skip removes the overlay,
  reloading in the *same* session does not replay it (`overlayOnReloadSameSession: 0`),
  and a genuinely fresh browser context replays it again (`overlayFreshSession: 1`).
- **Criterion 4, 40, R.8 (selection/URL/focus/inspector):** live-verified —
  clicking a holding link navigates to `?holding=<ticker>`, moves focus to
  `#orrery-inspector-heading`, renders all six required inspector fields
  (portfolio weight, trailing week, vs. portfolio, annualized volatility,
  beta vs. VOO, orbit state) plus ticker/company and a working
  `/stock/<ticker>` deep link; browser back restores the prior
  `?no3d=1`-only URL; selecting the sun opens the portfolio summary with no
  dollar amount anywhere in it; closing the inspector (`Close inspector`
  link) correctly returns focus to the previously-selected holding's own
  link (verified live, not merely inferred from source).
- **Criterion 6, 7 (mesh hover/activation sync):** confirmed by direct
  source read of `OrreryScene.tsx` — one raycaster drives both hover
  (`onHoverRef.current(ticker)`) and click (`onSelectRef.current(target)` /
  `onSelectPortfolioRef.current()`), and the click path invokes the same
  `navigateToHolding`/`orreryHoldingHref` the real anchor's own `href` is
  built from (not a second navigation implementation). `orrery.module.css`
  confirms the discovery-affordance rule keys off both native
  `:hover`/`:focus-visible` and the shared `data-hovered` attribute, so
  keyboard focus and mesh hover drive the same preview state bidirectionally.
- **Criterion 5 / storytelling row 4 (camera-like movement):** confirmed by
  direct source read — `camera.position.lerp(cameraTarget, cameraAmount)` /
  `lookAt.lerp(...)` / `camera.lookAt(lookAt)` is a real, eased camera
  move keyed to selection, not an instant cut; live interaction-latency
  measurement (below) confirms the real click-to-settle time is ~200-460 ms.
- **Criterion 8 (forced WebGL failure):** live-verified with
  `HTMLCanvasElement.prototype.getContext` forced to return `null` — canvas
  count is 0, all 13 holding links remain fully operable, zero console/page
  errors.
- **Criterion 12 (no audio):** `grep` across every §7 file confirms zero
  `<audio>`/Web Audio/autoplay usage (only a pre-existing spike-contract
  test that asserts their *absence* matches "audio").
- **Criteria 13/15 note (mobile byte-identity):** as literally written, this
  criterion assumes the mobile fallback ships nothing new beyond the
  pre-§7 shell — but §R.9 explicitly requires "a deliberate static or
  simplified 2D orbital map or list" on mobile, which is new, required
  content (the full holdings list, legend, and inspector shell now render on
  the mobile fallback, confirmed live and by screenshot:
  `screenshots/share-turn-d/08-mobile-fallback-390x844.png`). Per §R's
  explicit supersession of "§5's production build wherever they conflict,"
  R.9's requirement controls here; criterion 13's "byte-for-byte identical"
  wording is inapplicable by design, not failed. R.11 item 8's mobile
  fallback evidence is the operative acceptance check, and it passes
  (below).
- **Criterion 14 (mobile overflow/targets):** live-verified at both 390px
  and 320px — `scrollWidth === clientWidth` at both widths, zero
  interactive elements under 44×44 CSS px (including the Skip button where
  it can render).
- **Criteria 17, 18, 21 (accessible-tree/aria-hidden):** live-verified —
  the canvas and every ancestor up to it, `.starField`, and `.scanlines` are
  all `aria-hidden="true"`; the accessibility-tree snapshot contains zero
  canvas-role/canvas-named nodes; keyboard-only operation with the canvas's
  `getContext` forced to fail still finds and activates a holding via Tab +
  Enter, landing on the correct `?holding=...` URL — the real anchors are
  independently sufficient. No separate "discovery-hover hidden label"
  exists to test in this design: every holding's weight/return/direction/R/ω
  is always rendered as visible text (not hidden-then-revealed-on-hover), an
  even stronger accessibility posture than §5.2's original hidden-label
  design, so criterion 18 is satisfied by construction rather than by a
  distinct hidden element.
- **Criterion 19 note:** `observatory-fallback.test.ts` (the file criterion
  19 names) is untouched, consistent with Turn C's architecture not editing
  `ChapterOrbit`/`observatory.module.css`. The Orrery's own equivalent
  fallback gating lives in `orrery.module.css` instead, and was independently
  verified live: `canvasCountNo3d: 0`, `canvasCountForcedFail: 0`,
  `reducedMotion.canvasCount: 0`, all with 13 holdings still operable; source
  confirms `[data-force-no-3d="true"] .canvasLayer` and the combined
  `@media (max-width: 1023px), (prefers-reduced-motion: reduce)` block both
  disable `.canvasLayer`'s transform/display, satisfying the same *intent*
  criterion 19 checks for, in the file this section actually changed.
- **Criterion 22 (`ObservatoryEntrance.test.tsx`):** read directly — covers
  the ≤3000 ms ceiling assertion, skippability, all three suppression
  conditions (seen-flag, reduced motion, narrow viewport, disabled), and
  ending via button/pointer/key. It does not assert `document.activeElement`
  after ending (see Finding 1 — this gap in the test is exactly why jsdom
  never caught the real-browser defect below).
- **Criteria 25/26 note (test architecture):** `OrreryScene.source.test.ts`
  (read in full) is the direct-Three equivalent of criterion 25's React
  Three Fiber-shaped wording — it asserts one raycast path for hover/select/
  portfolio-select, disposal of every GPU resource, absence of
  post-processing/physics/`@react-three/fiber`, and the required star/rim/
  glow/procedural-material system. `ObservatoryShell.test.tsx` is untouched
  (consistent with the architecture note above) and still passes unchanged,
  so criterion 26's underlying guarantee (existing shell assertions
  undisturbed) holds even though the literal file named by the criterion
  was not the one extended.
- **Criterion 27:** full existing suite green, 454/454, no test weakened or
  skipped.
- **Criterion 28:** `three@0.185.1`/`@types/three@0.185.1` present in
  `package.json`/`package-lock.json`; `@react-three/fiber` confirmed absent
  from every source file and both manifests (`grep`, whole tree).
- **Criterion 29:** live-verified via a real network-log check — the two
  chunks that only ever load at 1440×900 and never at 390×844
  (`3c2h0fp_tgndt.js`, the shared Three chunk, and a small companion loader)
  are the only scripts absent from the narrow-viewport request set.
- **Criterion 31:** `grep` across `src/app` confirms only
  `src/app/dev/phase10-portfolio-orrery/page.tsx` and
  `src/app/(depth-pull)/share/page.tsx` import any §7 Orrery file; no other
  route references one.
- **Criterion 32:** all four dev routes (`phase10-spike-css-world`,
  `phase10-spike-r3f-world`, `phase10-portfolio-orrery`, `observatory-shell`)
  return the sign-in `LoginForm` with zero dollar-currency patterns when
  logged out, verified live this turn.
- **Criterion 33:** `grep` confirms `ObservatoryEntrance.tsx`,
  `observatory-entrance.module.css`, and the Orrery files never import
  `DashboardData`/`@/lib/dashboard-data` — they receive only
  `holdings`/`portfolioSummary`/`mode` as props from `share/page.tsx`, which
  does the data-fetching.
- **Criterion 34:** `ObservatoryShell.test.tsx`'s existing public/private
  isolation assertions are unchanged and still pass; the Orrery itself only
  ever instantiates in public mode on `/share` (the reference route uses
  `referenceStudy`, not a private mode), so there is no private-mode Orrery
  render to isolate against.
- **Criteria 35-39, 42, 43 (§R.12):** zero dollar-currency patterns anywhere
  in `/share`'s body text or raw HTML (checked live, both the default view
  and `?focus=portfolio`); the 13-holding set renders 1:1 from
  `publicOrreryHoldings`; the on-screen legend (verified live, full text
  captured) explains radius/clockwise/counterclockwise/neutral/speed exactly
  as R.5/R.6 require, and every encoded value is duplicated as text per
  holding; the orbit rings are drawn from each planet's own `orbitRadius`
  (confirmed by source and by direct comparison of the two idle-orbit
  filmstrip frames, which show several planets having visibly moved in
  different rotational senses — simultaneous clockwise/counterclockwise
  motion is real, not static); parallax reruns on the *actual* (non-`no3d`)
  desktop path show `--orrery-pointer-x/y` changing with pointer position
  and `.canvasLayer` vs. `.starField` computed `transform` matrices
  offsetting by different, non-proportional magnitudes at two distinct
  pointer positions; all eight R.11 evidence items are now committed
  (screenshots 00-09 plus four filmstrip sets), including a genuine
  pre-Turn-C "before" still from the rebuilt baseline server.
- **Criterion 41:** the R3F route-owned long task remains resolved. I
  independently re-measured `/share` itself (not only the reference route)
  five times on the unchanged §2.3.2 rig: one run showed a single 58 ms
  task at page-load; the other four showed none. I then re-ran ten
  additional fresh-context loads targeting only this question and got 0/10
  — 1 occurrence in 15 total runs, at a different point (load-time
  hydration, not the deterministic parsing/compile cost the original
  finding was), with no repeatable duration or trigger. This does not meet
  the bar of a repeatable, route-owned long task the way the original
  59-60 ms/5-of-5 defect did, so criterion 41 remains satisfied; noted here
  rather than silently discarded.

## Finding 1 — Entrance focus-restoration never actually fires on the shipped build (criterion 16)

**Criterion:** "focus lands somewhere sensible (the shell's existing focus
behavior, e.g. the `h1` or active chapter heading) once the entrance ends,
never trapped inside the (now-unmounted) overlay."

**Evidence:** Live-verified on the real production server across all three
end paths — clicking the Skip-intro button, pressing a key, and letting the
entrance complete naturally after 1800 ms — focus lands on `<body>` in every
case, not on `[data-portfolio-sun]` as `ObservatoryEntrance.tsx`'s own code
clearly intends. Root-caused by direct event tracing: `endEntrance()`'s
focus-restoration is gated on
`overlayRef.current?.contains(document.activeElement)`, but the
`window`-level `pointerdown` listener (registered to let *any* click end the
entrance, `{ once: true }`) fires and calls `endEntrance()` *before* the
browser applies its own default "focus the clicked button" behavior — traced
directly: at the moment this listener runs, `document.activeElement` is
still `BODY`, not the Skip button. The check is therefore always false, the
overlay unmounts, and by the time the button's own `onClick` (which also
calls `endEntrance()`) fires, `overlayRef.current` is already `null`. This
reproduced identically across 4 separate fresh-context runs for the click
path and across separate runs for the keydown and timeout paths. It is not
caught by `ObservatoryEntrance.test.tsx`'s existing tests because none of
them assert `document.activeElement` after ending — jsdom's `fireEvent`
also does not reproduce the real browser's pointerdown-before-focus event
ordering that causes the race.

**Required change:** Fix the focus-restoration path in
`ObservatoryEntrance.tsx` so it reliably moves focus to
`[data-portfolio-sun]` (or another sensible target) once the entrance ends,
regardless of which of the three end triggers fired — for example, by
checking whether focus was inside the overlay at the *start* of the end
sequence (before `setVisible(false)` runs) rather than re-checking
`document.activeElement` after the state update has already been scheduled,
or by unconditionally moving focus to the sun after any dismissal that
began with the overlay visible. Add a `document.activeElement` assertion to
`ObservatoryEntrance.test.tsx` for the button-activation path so this
class of defect cannot regress silently again (the current test only checks
that the button disappears, not where focus goes).

## Finding 2 — Mobile-fallback load time regresses against the pre-§7 baseline (criterion 30 / §2.3.1)

**Criterion:** "Load (`goto` → `networkidle`) on the CSS-fallback path | ≤
5000 ms, no regression vs. the pre-§7 baseline."

**Evidence:** Measured `/share` on the unchanged Moto G4 / CPU 4× / Slow 4G
rig, 5 fresh contexts each, against a real pre-Turn-C `/share` server
rebuilt from `prev_actor_commit` (`799a124`) on a separate port (not the
isolated dev reference route): baseline load times
`[2696, 2682, 2689, 2696, 2873]` ms (median 2696) vs. shipped production
`[3109, 3181, 3339, 3323, 3202]` ms (median 3202) — a consistent, non-
overlapping **+506 ms (+18.8%)** increase. Both remain under the 5000 ms
absolute ceiling, but the table's second clause ("no regression vs. the
pre-§7 baseline") is explicit and unmet. The pre-existing ~66-69 ms long
task on this rig is present identically in both builds (same magnitude,
same timing, confirming it is the already-accepted §1 shared-bootstrap
task, not a new regression), and the R3F chunk is confirmed absent from
both builds' script requests at this viewport — so the added time is not
attributable to the spatial runtime. It is consistent with the additional
DOM/content the Orrery's semantic list, legend, and inspector shell now
render even on the CSS-only fallback path (required by §R.9), which the
original pre-§7 page did not need to render at all.

**Required change:** Either reduce the added mobile-fallback render/hydration
cost so the CSS-fallback path's load time no longer measurably regresses
against the pre-§7 baseline on this rig, or — if this cost is attributable
to R.9's required real content rather than an inefficiency — return the
measured result to Devan for an explicit decision, the same escalation
pattern §R.8/term 15 already established for the R3F long-task gate,
rather than silently absorbing a "no regression" gate failure.

## Finding 3 — No computed contrast-ratio regression test exists for this section's new text (criterion 20)

**Criterion:** "Contrast of any new text (the discovery label, the
Skip-intro button) against the real dark surface it renders on meets 4.5:1,
verified the same way `observatory-contrast.test.ts` already verifies
`--obs-ink-faint` (computed WCAG relative-luminance ratio from source
tokens, not eyeballed)."

**Evidence:** `observatory-contrast.test.ts` is untouched by this diff and
contains no assertion for any color this section introduces —
`.signal`'s `#ffd68c` and `.skip`'s `#fff0cf` in
`observatory-entrance.module.css`, or any of the Orrery's own new text
colors in `orrery.module.css`. I independently computed the WCAG
relative-luminance contrast ratio for the two entrance colors against their
actual rendered backgrounds: `#fff0cf` on the Skip button's
`rgba(2, 12, 9, 0.92)` background ≈ **17.6:1**, and `#ffd68c` on the
arrival overlay's near-black background ≈ **14.4:1** — both pass 4.5:1 by a
wide margin, so this is a missing-verification gap, not a numeric failure.

**Required change:** Add a computed-ratio regression test (following
`observatory-contrast.test.ts`'s existing pattern) covering the new text/
background pairs this section introduces, so a future color change cannot
silently regress below 4.5:1 without a test catching it, per the criterion's
explicit "not eyeballed" requirement.

## What this means for `PHASE10_STATE.json`

Three bounded findings, each citing a specific §8/§R.12 criterion, each with
independently reproduced evidence and a required change Codex can act on.
`stage` → `remediate`, `role` → `codex_implementation`, `next_actor` →
`codex`, `section.review_result` → `"fail"`. Everything else in §8's 34
criteria and §R.12's 9 additional criteria was independently verified
passing this turn, as detailed above — remediation is scoped to exactly
these three findings, nothing else.

One evidence gap is carried forward, not treated as a bounded Codex finding
because Codex cannot act on it through code: storytelling rubric rows 1, 7,
10, and 11 (criterion 9) require verbatim reactions from unprimed human
viewers who have not seen the pre-§7 shell. Consistent with how Turn B and
Turn B″ handled this same category of requirement, no such reaction was
fabricated. Every other storytelling-adjacent, objectively observable
element (continuous environment, camera movement, spatial composition,
parallax/occlusion, discovery affordance, memorable transitions judged by
direct inspection) was independently verified live and by screenshot/
filmstrip above and is not in question; only the specific verbatim-panel
evidence remains undone, exactly as it has since Turn B.
