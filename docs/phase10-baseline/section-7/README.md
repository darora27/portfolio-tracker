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
`docs/phase10-workflow/specs/section-7.md` §R.9 and will be added here.
