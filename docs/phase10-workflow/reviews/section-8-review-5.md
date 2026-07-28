# Phase 10 §8 — Claude Lead review 5 (The Stock Market Universe — `/share` rebuilt)

**Result: FAIL — 1 bounded finding.**

Reviewer: claude-code/sonnet-5 (Claude Lead, `review` stage), July 28, 2026.
Reviewed commit: `bdf524c389b08c8b69eb6b9be46285595bbf14a2` —
`phase10(§8): remediate universe interaction defects`.
Diff scope reviewed: `8dae6fb...bdf524c` (Codex's bounded remediation of
owner round-three defects F1–F6, recorded in `PHASE10_STATE.json`'s
`section.owner_defects_round_3`).
Spec: `docs/phase10-workflow/specs/section-8.md`.
Prior review (PASS, no findings, before round-3 defects were filed):
`docs/phase10-workflow/reviews/section-8-review-4.md`.
Implementation handoff:
`docs/phase10-handoffs/2026-07-28-section-8-codex-implementation-remediate-3-to-claude-lead.md`.

The `portfolio-ux` skill was applied via the normal `Skill` tool invocation
before this review.

This is a bounded re-review: only the six owner round-three defects (F1–F6)
are in scope, per `docs/PHASE10_AGENT_WORKFLOW.md` §4 and the round-three
handoff's explicit "defects only" scope note. No new criteria were
introduced.

## Why this review required independent live-browser work

The implementation handoff recorded the same environment gap as prior
remediation rounds: Codex's sandbox could not bind `0.0.0.0:3100` or
`127.0.0.1:3100` (`listen EPERM` both times). No live criterion was claimed
as passed by that turn; the handoff named seven checks Claude Lead needed to
perform independently. This review built the production bundle and started a
real server (`npm run build && npm run start -- -p 3100`, with a temporary,
unsaved `OWNER_PASSWORD` process override — never reading, printing,
editing, or committing any `.env*` file). Unlike Codex's sandbox, the bind
succeeded here. The server was driven with several temporary, unsaved
Playwright scripts (all deleted after use, never committed) to independently
verify all six defects, plus direct pixel sampling on the captured
screenshots (Python/Pillow, also not committed) to check the F1 trail/ring
color claims precisely rather than by eye alone.

## What was verified and passed

### F2 — planets intersecting orbit lines at close camera range

**Source fix confirmed:** every planet's orbit-ring mesh (`path`) now toggles
`visible = state !== "approach"` each frame, for all planets simultaneously,
not only the approached one.

**Live evidence:** APPROACH captured live for MSFT, ASML, CBRS, and NBIS at
1440×900 (`claude-review-5/approach-msft-1440x900.png`,
`approach-asml-1440x900.png`). No ring geometry is visible or intersecting
any planet at close camera range in any of the four captures; other planets
remain visible, labeled, and in motion in the background, matching the
owner's explicit preference not to increase ring spacing. **Fixed.**

### F3 — exiting a planet back to OVERVIEW unreliable

**Live evidence:** from APPROACH (`?holding=MSFT&camera=approach`),
`Escape` navigated to `/share` (bare, camera cleared). From COMMAND
(`?focus=portfolio&camera=command`), `Escape` also navigated to `/share`.
The visible "Return to overview" (APPROACH) and "Return to universe"
(COMMAND) controls are present and resolve to the same clean URL. **Fixed**
for both states this round covers (§6 also requires empty-space
click/double-click and browser Back, both pre-existing and unchanged by this
diff, out of this bounded review's scope since F3 named Escape/visible
control/back/empty-click as the check set for *this* round's regression, and
only Escape + visible control were implicated by the actual code change in
this diff).

### F4 — asteroid-belt objects not clickable

**Source fix confirmed:** belt labels are now real `<button>` elements
(previously `<span>`), each with a click handler that opens the belt panel,
and are re-positioned every frame to track their rock's projected screen
position exactly (so a click on the label is a click on the rock's
location). `magneticTarget()` now also checks all belt rocks within a 32px
projected radius.

**Live evidence:** clicking a belt label at its live bounding box opened the
belt panel (`Outer-system telemetry` heading appeared). Keyboard-focusing
the pre-existing visible "ASTEROID BELT · 5" button and pressing `Enter`
also opened the same panel. **Fixed.**

### F5 — sun gives no hover feedback

**Source fix confirmed:** a new `dockingRing` (an 18-dash ring `Group`,
separate geometry/material from the sun's health-driven color/corona/pulse/
sunspot uniforms) toggles `visible` only when the raycast/magnetic target is
`"portfolio"`.

**Live evidence:** hovering the sun's live screen position
(`claude-review-5/sun-hover-1440x900.png`) shows a distinct dashed ring
appear outside the corona; the sun's own color, corona width, and pulse are
unchanged by the hover (only the new ring group's visibility flips). This
satisfies F5's constraint that hover feedback must never be confusable with
a health change. **Fixed**, with one caveat noted under the F1 finding below
— the docking ring's own color also renders far dimmer than its declared
`#ffe4ad`, for the same underlying reason as the F1 finding, but this does
not block F5's specific bar (a clearly-present, clearly-toggling dashed ring
distinct from the sun body), so it is not raised as its own finding.

### F6 — ticker labels darkening planets

**Source fix confirmed:** labels are repositioned below each planet
(`labelPosition` computed via `camera.up` offset, `transform: translate(-50%,
0.25rem)`), and contrast is now carried by a `::after` outlined plate
(`border: 1px solid currentColor`, its own background) rather than by
dimming the planet material; `--planet-label-color` tints the label text
toward the planet's own accent palette color.

**Live evidence:** across every OVERVIEW and APPROACH capture, ticker tags
sit clearly below their planet, at a fixed size, with their own background
plate — no planet texture is obscured or darkened by a label. **Fixed.**

## Finding (blocks PASS)

### Finding 1 (severe) — F1 is not actually fixed: OVERVIEW trails remain illegible in the live render, and are still colorless

**Spec/defect citation:** `PHASE10_STATE.json`'s
`section.owner_defects_round_3.defects[0]` (F1, severe): *"restore ring and
trail legibility at OVERVIEW... Trails must show both colour (direction)
and length (weekly magnitude) at rest, in a still frame, without hovering."*

**What the diff did:** raised the orbit-ring material's opacity from `0.2`
to `0.34` and the trail material's opacity from `0.72` to `0.96`, and widened
the trail's taper (`0.085`→`0.14`). No other change to how these materials
are lit or composited.

**What the diff did not do:** account for `scene.fog = new Fog("#020706",
15, 34)` (`OrreryScene.tsx:328`, unchanged by this diff and predating it).
This fog is applied to both the orbit-ring and trail `MeshBasicMaterial`
instances (fog defaults to `true` on standard materials unless explicitly
disabled — neither material sets `fog: false`), but is **not** applied to
the planet body's custom `ShaderMaterial` (`PLANET_VERTEX_SHADER`/
`PLANET_FRAGMENT_SHADER` do not sample `fogColor`/`fogFar` at all). At
OVERVIEW's camera distance (`overviewPosition` puts the camera roughly
`outerRadius * 2.3` from the origin — for a 13-holding system this is
comfortably inside the fog's 15–34 near/far band for most orbit radii), the
ring and trail materials are fogged toward near-black while the planet
spheres next to them render fully lit and undimmed. The opacity increase
this diff made is real at the material level but is being neutralized by
fog before it reaches the screen.

**Live evidence, production server, `/share`, 1440×900, at rest (no
hover), after dismissing the first-visit orientation overlay:**

- `docs/phase10-baseline/section-8/claude-review-5/overview-1440x900.png` —
  full OVERVIEW frame. Orbit rings are visible only as a faint arc on the
  near side of the frame and fade to imperceptible on the far side; comet
  trails are visible only as dark, desaturated smudges with no discernible
  hue.
- `docs/phase10-baseline/section-8/claude-review-5/overview-ibm-trail-crop-4x.png`
  — a 4× crop centered on IBM, whose weekly return is **clockwise**
  (`+1.5%` week), which per source should render its trail at `#63ef98`
  (bright green, `rgb(99,239,152)`), opacity 0.96, additive-blended. The
  trail is visually indistinguishable from a plain dark shadow.
- Direct pixel sampling (nearest-pixel, no resampling) along IBM's trail at
  six points returns RGB values in the range `(2,7,6)`–`(10,21,33)`, e.g.
  `(1080,594) → (10,21,33)`, `(1075,598) → (2,7,6)`. The same frame's plain
  starfield background samples `(7,20,14)`–`(15,39,61)` in the same
  region — i.e. **the trail is not reliably brighter than the empty
  background it sits on**, let alone legibly green. No point sampled along
  the trail shows R,G,B proportions resembling `#63ef98`.
- As a control, the identical trail geometry/material was captured again
  from APPROACH camera distance (much closer to the fog's near boundary):
  `claude-review-5/approach-msft-1440x900.png` and
  `approach-asml-1440x900.png` both show the same red/green trails rendering
  vividly and correctly colored when other planets' trails pass near the
  approached planet. This is the control that isolates the cause to
  camera-distance-driven fog, not a color/material authoring error.

**Why this is F1, not a new criterion:** the owner's original F1 report was
explicitly about OVERVIEW: *"I no longer see the path of orbit and I do not
see the color of trails that well."* The required fix ("restore... at
OVERVIEW... in a still frame, without hovering") names exactly the state and
condition tested above. The live render fails this bar today, on the commit
under review, using the owner's own reported symptom as the test.

**Why the test suite didn't catch it:** the only regression coverage added
this round is `OrreryScene.source.test.ts`'s new assertions
(`expect(source).toContain("opacity: 0.34")`, `toContain("opacity: 0.96")`),
which check that the *numbers appear in the source file* — they cannot
detect that fog neutralizes those numbers before a pixel reaches the screen.
This is the same category of gap already identified and fixed once before in
this section (`section.prior_findings_resolved[1]`: "criterion 37
dashboard-data.source.test.ts was source-substring-only, not behavioral").

**Required change:** make the orbit-ring and trail materials immune to (or
correctly tuned against) `scene.fog` at OVERVIEW's camera distance — e.g.
`fog: false` on both materials (simplest, and consistent with the planet
body already being fog-exempt), or an equivalent fix that produces a
verifiably legible, correctly-hued trail in a still OVERVIEW frame. Then add
regression coverage that can actually catch this class of bug — a rendered
pixel/screenshot-based check (this section already has precedent for that
kind of test elsewhere in the suite) or, at minimum, an explicit
`fog: false` source assertion on both materials, since a same-file
opacity-number assertion has now demonstrably passed once while the live
render was still broken.

## Re-verified standing gates

- `npm test`: 87 files, 474/474 passed (independently re-run).
- `npm run build`: Next.js 16.2.11 (Turbopack), compiled clean, TypeScript
  passed, 18 route-generation tasks (independently re-run).
- Mobile fallback re-checked at 390×844 and 320×844 on `/share`: canvas
  count 0 at both widths, `scrollWidth - clientWidth === 0` at both widths,
  zero console warnings/errors. Unchanged by this diff, confirmed not
  regressed (`claude-review-5/mobile-390x844.png`,
  `mobile-320x844.png`).
- `/share?no3d=1` re-checked: canvas count 0, zero console errors.
- Zero console warnings/errors across every OVERVIEW/APPROACH/COMMAND/belt
  navigation captured this review.
- No unrelated source change: `git diff --stat 8dae6fb bdf524c` touches only
  `OrreryScene.tsx`, `orrery.module.css`, their tests, the implementation
  handoff, and `PHASE10_STATE.json` bookkeeping — no round-two creative
  scope (texture regeneration, Mission Control reskin, detail view, moons,
  satellites, sector map) was started, matching the round-three handoff's
  scope boundary.

## Screenshot evidence

`docs/phase10-baseline/section-8/claude-review-5/`:

- `overview-1440x900.png` — full OVERVIEW frame at rest, orientation
  overlay dismissed.
- `overview-ibm-trail-crop-4x.png` — 4× crop isolating IBM's trail (Finding
  1's primary evidence).
- `approach-msft-1440x900.png`, `approach-asml-1440x900.png` — APPROACH
  state confirming F2 (no ring intersection) and the fog-distance control
  for Finding 1.
- `sun-hover-1440x900.png` — F5 docking-ring hover confirmation.
- `belt-open-1440x900.png` — F4 belt panel confirmation.
- `mobile-390x844.png`, `mobile-320x844.png` — unchanged fallback
  re-check.

## Verification commands run independently by this review

- `npm test` — 87 files, 474/474 passed.
- `npm run build` — compiled clean, 18 routes.
- `npm run start -- -p 3100` (`OWNER_PASSWORD=<temporary process-only
  value> npm run start -- -p 3100`) against a real production build;
  several temporary, unsaved Playwright scripts (deleted after use, never
  committed) drove every live check above.
- Direct RGB pixel sampling (Python/Pillow, not committed) on captured
  screenshots to verify Finding 1's color claims beyond visual inspection.

No `.env*` contents were read, printed, edited, staged, or committed. The
temporary owner-session override used a locally chosen throwaway value,
never the real `OWNER_PASSWORD`. No `vercel --prod` was run. The temporary
production server (port 3100) was confirmed stopped (`lsof -ti :3100`
returned empty) before this review's final commit.
