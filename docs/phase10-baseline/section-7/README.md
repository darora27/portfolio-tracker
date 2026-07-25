# Phase 10 §7 — Phase A spike evidence

Captured July 25, 2026 by claude/fable-5 (Claude Lead, Turn B) against a real
production server at `http://localhost:3100`, using
`docs/phase10-spike-section-7/capture-evidence.mjs`.

The decision this evidence supports is
`docs/phase10-spike-section-7/DECISION.md` — **FAIL / no winner**. The
architecture rationale is in `docs/phase10-workflow/specs/section-7.md` §3;
neither is restated here.

## Screenshots — 1440×900, dimension-verified

Every file below was checked to be exactly 1440×900 before being documented.

| File | What it shows |
|---|---|
| `screenshots/pre-s7-baseline-idle.png` | Pre-§7 `ObservatoryShell` (`/dev/observatory-shell?mode=public`) — the "before" |
| `screenshots/css-world-idle.png` | CSS variant, idle first viewport |
| `screenshots/css-world-entrance-mid.png` | CSS variant, mid-entrance |
| `screenshots/css-world-settled-timeline.png` | CSS variant, settled on a new chapter after travel |
| `screenshots/css-world-discovery-idle.png` | CSS variant, non-active body at rest |
| `screenshots/css-world-discovery-hover.png` | CSS variant, same body hovered (discovery affordance revealed) |
| `screenshots/r3f-world-idle.png` | R3F variant, idle first viewport |
| `screenshots/r3f-world-entrance-mid.png` | R3F variant, mid-entrance |
| `screenshots/r3f-world-settled-timeline.png` | R3F variant, settled on a new chapter after travel |
| `screenshots/r3f-world-discovery-idle.png` | R3F variant, non-active body at rest |
| `screenshots/r3f-world-discovery-hover.png` | R3F variant, same body hovered |

## Recordings

Real `.webm` screen recordings, not screenshot filmstrips — §10's "do not
claim a recording was captured when only a screenshot pair exists" caveat does
not apply.

| File | Coverage |
|---|---|
| `filmstrips/css-world-world-entry/world-entry.webm` | CSS — cold load through entrance completion |
| `filmstrips/css-world-pointer-exploration/pointer-exploration.webm` | CSS — continuous pointer movement (parallax + discovery hover) |
| `filmstrips/css-world-chapter-travel/chapter-travel.webm` | CSS — one full chapter-travel transition, click to settle |
| `filmstrips/r3f-world-world-entry/world-entry.webm` | R3F — cold load through entrance completion |
| `filmstrips/r3f-world-pointer-exploration/pointer-exploration.webm` | R3F — continuous pointer movement (records the *absence* of parallax) |
| `filmstrips/r3f-world-chapter-travel/chapter-travel.webm` | R3F — one full chapter-travel transition, click to settle |

## Machine-readable capture report

`capture-report.json` holds, per variant:

- **`pointerReads`** — live computed `--parallax-x/y`, `.atmosphere`
  transform, `.orbitCamera` `matrix3d`, and all five body rects at four
  distinct pointer positions. This is the direct evidence that **CSS has
  pointer parallax and R3F has none** (every R3F read is identical at every
  position; `src/app/dev/phase10-spike-r3f-world/` contains no `pointermove`
  listener).
- **`chapterTravelSequence`** — before/mid/after `.orbitCamera` matrices for
  three consecutive chapter changes, plus `atmosphereUnchangedNode`
  confirming the background node is never torn down between chapters.
- **`depthLayers`** — computed position, `z-index`, transform, and rect for the
  atmosphere, camera, canvas stage (R3F only), and content plate, proving the
  simultaneous depth layers §2.4 row 5 requires.
- **`discoveryHoverOpacity`** — the hover affordance's revealed state.

## Console

No console warnings or errors were surfaced by the capture run on either
route.

## Not captured this turn

Stated so nothing here is read as more complete than it is:

- 390×844 and 320px stills of the two spike routes. The mobile *rig*
  (`measure-phone.mjs`, Moto G4 / CPU 4× / Slow 4G) ran and passed every
  declared row; the mobile *stills* were not taken.
- A second independent unprimed viewer's reactions (§2.4 rows 1, 7, 10).
- A live side-by-side session against `https://y-n10.com/` (§2.4 row 11).
- Production before/after evidence — no Phase B production build exists yet,
  so items 10 and 15 of the spec's acceptance list remain open for the
  remediation round.

The remediation round's own required visual evidence (solar-system entry,
multiple differently sized planets, simultaneous clockwise/counterclockwise
motion, planet focus/selection, camera movement to the selected holding, the
holding inspector, reduced-motion and mobile fallbacks) is specified in
`docs/phase10-workflow/specs/section-7.md` §R.9 and is captured in the next
section.

---

## Turn B′ review evidence — the Portfolio Orrery (July 25, 2026)

Captured by claude-code/sonnet-5 (Claude Lead, `review` stage) against a real
production server at `http://localhost:3100`, authenticated with a
task-only `OWNER_PASSWORD` process override (never read from `.env*`), using
`docs/phase10-spike-section-7/capture-orrery-evidence.mjs`. This is the
required Claude live review the Turn B′ handoff (`docs/phase10-handoffs/
2026-07-25-section-7-codex-implementation-remediate-to-claude-lead.md`)
could not perform itself (the implementation runner's sandbox could not bind
`localhost:3100`).

All eight R.11 items, at `/dev/phase10-portfolio-orrery`:

| # | Item | Evidence |
|---|---|---|
| 1 | Initial solar-system entry | `screenshots/orrery-turn-bprime/01-initial-solar-system-entry.png`, plus `filmstrips/orrery-idle-orbit/` (8 frames, 350 ms apart) |
| 2 | Multiple differently sized planets | `screenshots/orrery-turn-bprime/02-multiple-differently-sized-planets.png` — radii visibly range 0.34–0.86 (semantic `R`/`ω` values printed per holding) |
| 3 | Simultaneous clockwise and counterclockwise motion | `filmstrips/orrery-idle-orbit/` — comparing `frame-00` to `frame-06` (2.1 s later), holdings with positive weekly return (e.g. NBIS, CBRS) visibly advance clockwise while holdings with negative return (e.g. INTC, GOOG) visibly advance counterclockwise in the same sequence; COST (neutral/unavailable) does not move |
| 4 | Planet focus and selection | `screenshots/orrery-turn-bprime/04-planet-focus.png` (`:focus-visible` outline on ASML's semantic control) |
| 5 | Camera movement to the selected holding | `filmstrips/orrery-camera-travel/` (8 frames, 100 ms apart, from pre-click through settle) — the sun and planets visibly enlarge and reframe toward ASML; `screenshots/orrery-turn-bprime/05-camera-moved-to-selected-holding.png` is the settled end state |
| 6 | The holding inspector | `screenshots/orrery-turn-bprime/06-holding-inspector.png` (ASML: ticker/company, weight, weekly return, vs. portfolio, volatility, beta, orbit state, deep link) and `10-sun-selected-portfolio-summary.png` (portfolio-level summary opened from the sun) |
| 7 | The reduced-motion fallback | `screenshots/orrery-turn-bprime/07-reduced-motion-fallback.png` — `canvas` count is 0; semantic legend/sun/holding list render as a static reflowed page |
| 8 | The mobile fallback | `screenshots/orrery-turn-bprime/08-mobile-fallback-390x844.png` and `08b-mobile-fallback-320px.png` — deliberate reflowed list, no cropped desktop scene, `canvas` count 0, zero horizontal overflow at both widths |

Also captured: `09-forced-no3d.png` (`?no3d=1`, `canvas` count 0).

### Additional live verification (not screenshot evidence)

- **Parallax, `/dev/phase10-portfolio-orrery`:** `--orrery-pointer-x/-y`
  read four distinct non-zero values at four pointer positions; `.starField`
  and `.canvasLayer` move at different magnitudes (`-7px/-5px` vs.
  `13px/9px` multipliers).
- **Parallax, `/dev/phase10-spike-r3f-world` (criterion 42):** verified with
  `docs/phase10-spike-section-7/verify-r3f-parallax.mjs`. At `(200, 200)`,
  `.atmosphere` reads `matrix(1, 0, 0, 1, 2.5277, 1.389)` and `.canvasStage`
  reads `matrix(1, 0, 0, 1, -5.0554, -2.778)` — two layers, opposite sign,
  different magnitude. At `(1240, 700)` both invert consistently. This
  closes the "entirely missing pointer parallax" half of Finding 2 from the
  Turn B review.
- **URL state / back-forward:** selecting ASML sets
  `?holding=ASML`; `goBack()` restores the bare route; `goForward()`
  restores `?holding=ASML`; selecting the sun sets `?focus=portfolio`.
- **Privacy:** zero `$[0-9,]+\.[0-9]{2}` matches in unauthenticated HTML,
  authenticated HTML, or the sun-selected page's full HTML; zero
  `shares`/`costBasis`/`totalCost`/`totalValue` tokens in the authenticated
  HTML; unauthenticated request returns the sign-in form (`getDashboardData`
  is never called per the owner gate, confirmed by source and by
  `page.test.tsx`).
- **Console:** zero console errors or page errors across every captured
  route/viewport/mode combination this turn.
- **Accessibility (320px):** zero links under 44px tall.

### R3F long-task re-measurement (criterion 41) — still failing

`docs/phase10-spike-section-7/measure-desktop-turn-bprime.mjs` (an unmodified
copy of `measure-desktop.mjs` except its output path) was re-run against the
same 1440×900 / CPU 2× rig, 5 fresh contexts per route. Raw output:
`docs/phase10-spike-section-7/raw/desktop-scene-turn-bprime.json`.

| Route | Long tasks (5 runs, ms) | Over 50 ms |
|---|---|---|
| baseline (pre-§7) | `[]`, `[]`, `[]`, `[]`, `[]` | 0/5 |
| CSS (`phase10-spike-css-world`) | `[]`, `[]`, `[]`, `[]`, `[]` | 0/5 |
| R3F (`phase10-spike-r3f-world`, remediated) | `[59]`, `[59]`, `[60]`, `[59]`, `[59]` | **5/5** |

This is byte-for-byte the same result the Turn B review recorded before
remediation (`59, 60, 60, 59, 59`). The described optimisation round (removed
the `THREE` namespace import, reused camera vectors, `icosahedronGeometry`
detail `1`→`0`, `dpr={1}`, deferred the lazy scene request across two paint
frames) changed *when* the R3F chunk is requested and evaluated, not the
duration of the task once it runs — consistent with the cost being
dominated by parsing/executing the ~234 KB three.js/R3F chunk and
initializing the WebGL context and shader compilation, not by anything the
optimisation round touched. See the review doc for what this means for
Turn B′'s outcome.
